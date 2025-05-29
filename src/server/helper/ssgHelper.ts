import { createServerSideHelpers } from '@trpc/react-query/server';
import { db } from '~/server/db';
import SuperJSON from "superjson";
import { appRouter } from "~/server/api/root";

export const generateSSGHelper = () => {
  const helper = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUser: null },
    transformer: SuperJSON,
  });

  return helper;
}