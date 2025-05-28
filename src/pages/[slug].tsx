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
import { PostView } from "~/components/postview";

const ProfileFeed = (props: {userId: string}) => {
  const { data, isLoading } = api.post.getPostByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage/>;

  if (!data || data.length === 0) return <div>User has not posted</div>

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};


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
        <div className="relative h-48 bg-slate-600">
          <Image 
            src={data.imageUrl} 
            alt={`${data.username ?? ""}'s profile picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          /> 
          <div className="h-[192px]"></div>
          <div className="p-4 pt-[80px] text-2xl font-bold">{`@${data.username ?? ""}`}</div>
          <div className="border-b border-slate-400 w-full"></div>
          <ProfileFeed userId={data.id}/>
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
