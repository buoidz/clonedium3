import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";

export const tagRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.db.tag.findMany({
      take: 100,
    });

    return tags;
  }),

  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.create({
          data: {
              name: input.name,
          },
      });

      return tag;
    }),

  addPostTagById: publicProcedure
    .input(z.object({     
      postId: z.string(),
      tagId: z.string(), 
    }))
    .mutation(async ({ ctx, input }) => {
      const postTag = await ctx.db.postTag.create({
          data: {
            postId: input.postId,
            tagId: input.tagId,
          },
      });

      return postTag;
    }),

});