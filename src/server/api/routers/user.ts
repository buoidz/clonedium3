import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const clerkUser = await (await clerkClient()).users.getUser(input.userId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        const firstName = clerkUser.firstName ?? null;
        const lastName = clerkUser.lastName ?? null;
        
        if (!email) {
          throw new Error("User must have an email address");
        }

        const user = await ctx.db.user.upsert({
            where: { id: input.userId },
            update: {
            email,
            firstName,
            lastName,
            },
            create: {
            id: input.userId,
            email,
            firstName,
            lastName,
            },
        });

        return user;
    }),
});