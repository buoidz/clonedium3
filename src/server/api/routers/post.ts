import { auth, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters
import { filterUserForClient } from "~/server/helper/filterUserForClient";
import type { Post } from "@prisma/client";

type PostWithCount = Post & { _count: { likes: number; comments: number } };

const addUserDataToPosts = async (posts: PostWithCount[]) => {
  const users = (
    await (await clerkClient()).users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).data.map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author?.username) 
      throw new TRPCError({ 
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found"
      });

    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
      _count: post._count,
    };
  });
}

// Create a new ratelimiter, that allows 3 requests per 1 minute
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({
  getLatest: publicProcedure.query(async ({ ctx }) => {
    // const post = await ctx.db.post.findFirst({
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return addUserDataToPosts(posts);
  }),

  getPostByUserId: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) =>
      ctx.db.post.findMany({
        where: {
          authorId: input.userId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }).then(addUserDataToPosts),
    ),

  getPostById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ 
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          likes: ctx.currentUser ? {
            where: {
              userId: ctx.currentUser.id,
            },
            select: {
              id: true,
            },
          } : false,
        },
      });

      if (!post) throw new TRPCError ({ code: "NOT_FOUND" });

      const postWithUserData = (await addUserDataToPosts([post]))[0];

      if (!postWithUserData) {
        throw new TRPCError ({ code: "INTERNAL_SERVER_ERROR", message: "Failed to process post data" });
      }
      
      return {
        ...postWithUserData,
        isLikedByUser: ctx.currentUser ? post.likes.length > 0 : false,
      };    
    }),

  toggleLike: publicProcedure
  .input(z.object({ 
    postId: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {

      if (!ctx.currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to like posts",
        });
      }

      const existingLike = await ctx.db.like.findUnique({
        where: {
          postId_userId: {
            postId: input.postId,
            userId: ctx.currentUser.id,
          },
        },
      });

      if (existingLike) {
        await ctx.db.like.delete({
          where: {
            id: existingLike.id,
          },
        });
        return { liked: false };
      } else {
        await ctx.db.like.create({
          data: {
            postId: input.postId,
            userId: ctx.currentUser.id,
          },
        });
        return { liked: true };
      }
    }),

  getPostByTag: publicProcedure
    .input(z.object({ tagName: z.string() }))
    .query(async ({ ctx, input }) => {
      // const post = await ctx.db.post.findFirst({
      const postTags = await ctx.db.postTag.findMany({
        where: {
          tag: {
            name: input.tagName,
          },
        },
        include: {
          post: {
            include: {
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
            },
          }
        },
        orderBy: { 
          post: {
            createdAt: "desc",
          },
         },
        take: 100,
      });

    const posts = postTags.map((pt) => pt.post);

    return addUserDataToPosts(posts);
  }),


  create: privateProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100), 
        content: z.string().emoji("Only emoji are allowed!").min(1).max(280),
        tagIds: z.array(z.string().min(1).max(100)),
      })
    )
    .mutation(async ({ ctx, input }) => {
    const authorId = ctx.currentUser.id;

    const { success } = await ratelimit.limit(authorId);

    if (!success) throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
    });

    const post = await ctx.db.post.create({
      data: {
        title: input.title,
        content: input.content,
        authorId,
      },
    });

    await ctx.db.postTag.createMany({
      data: input.tagIds.map((tagId: string) => ({
        postId: post.id,
        tagId,
      })),
    });

    return post;
  }),
});
