import type { User } from "@clerk/backend"
import { auth, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helper/filterUserForClient";


export const profileRouter = createTRPCRouter({
    getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
        const result = await (await clerkClient()).users.getUserList({
            username: [input.username],
        });

        const [user] = result.data;

        if (!user) {
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message: "User not found",
            });
        }

        return filterUserForClient(user);
    }),
});
