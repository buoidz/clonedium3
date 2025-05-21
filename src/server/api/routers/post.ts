import type { User } from "@clerk/backend"
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id, 
    username: user.username,
    imageUrl: user.imageUrl,
  }
}

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
        },
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    // const post = await ctx.db.post.findFirst({
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const users = (
      await (await clerkClient()).users.getUserList({
        userId: posts.map((post: {authorId: String}) => post.authorId),
        limit: 100,
      })
    ).data.map(filterUserForClient);

    return posts.map((post: {authorId: String}) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.username) 
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found"
        });

      return {
        post,
        author,
      };
    });
  }),
});
