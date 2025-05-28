import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";

import { createServerSideHelpers } from '@trpc/react-query/server';
import { db } from '~/server/db';
import SuperJSON from "superjson";
import { appRouter } from "~/server/api/root";
import { PageLayout } from "~/components/layout";
import Image from "next/image";




const ProfilePage: NextPage<{ username: string }> = ({ username }) => {

  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  })

  console.log(username);

  if (isLoading) return <LoadingPage/>;

  if (!data) return <div>Something went wrong!</div>

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="=border-b h-48 border-slate-400 bg-slate-600">
          <Image 
            src={data.imageUrl} 
            alt={`${data.username ?? ""}'s profile picture`}
            width={64}
            height={64}
            className="-mb-8"
          />
          <div>{data.username}</div>
        </div>
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const helper = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUser: null },
    transformer: SuperJSON,
  });

  const slug = context.params?.slug;

  if (typeof slug != "string") throw new Error ("No slug");

  const username = slug.replace("@", "");

  helper.profile.getUserByUsername.prefetch({ username: slug});


  return {
    props: {
      trpcState: helper.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"};
};

export default ProfilePage;
