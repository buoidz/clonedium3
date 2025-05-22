import type { User } from "@clerk/backend"
import { auth, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id, 
    username: user.username,
    imageUrl: user.imageUrl,
  }
}

export const postRouter = createTRPCRouter({
  getLatest: publicProcedure.query(async ({ ctx }) => {
    // const post = await ctx.db.post.findFirst({
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const users = (
      await (await clerkClient()).users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).data.map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.username) 
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
      };
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji().min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
    const authorId = ctx.currentUser.id;

    const post = await ctx.db.post.create({
      data: {
        authorId,
        content: input.content,
      },
    });

    return post;
  }),
});
