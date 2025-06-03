import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc"; 
import { TRPCError } from "@trpc/server";
import { ratelimit } from "./post";
import { filterUserForClient } from "~/server/helper/filterUserForClient";
import { clerkClient } from "@clerk/nextjs/server";
import { type Comment } from "@prisma/client";


type CommentWithUser = Comment;

const addUserDataToComments = async (comments: CommentWithUser[]) => {
  const users = (
    await (await clerkClient()).users.getUserList({
      userId: comments.map((comment) => comment.userId),
      limit: 100,
    })
  ).data.map(filterUserForClient);

  return comments.map((comment) => {
    const user = users.find((user) => user.id === comment.userId);

    if (!user?.username) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User for comment not found",
      });
    }

    return {
      ...comment,
      user: {
        ...user,
        username: user.username,
      },
    };
  });
};

export const commentRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(1000),
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser.id;

      const { success } = await ratelimit.limit(authorId);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const comment = await ctx.db.comment.create({
        data: {
          content: input.content,
          postId: input.postId,
          userId: authorId,
        },
      });

      return comment;
    }),

    getByPostId: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const comments = await ctx.db.comment.findMany({
        where: { postId: input.postId },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
        
    return addUserDataToComments(comments);
    }),
});
