import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";

import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { PostCard } from "~/components/homepage/postcard";
import { generateSSGHelper } from "~/server/helper/ssgHelper";
import { TopNav } from "~/components/homepage/topnav";
import { NavigationTabs } from "~/components/homepage/navigationTab";
import { Feed } from "~/components/homepage/feed";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SidebarProfile } from "~/components/profile/sidebarProfile";
import { NavTabProfile } from "~/components/profile/navTabProfile";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostCard {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<string | null>(null); // Move state up

  const { data: tabs } = api.tag.getAll.useQuery();


  useEffect(() => {
    if (tabs?.[0] && tabs.length > 0 && activeTab === null) {
      setActiveTab(tabs[0].name);
    }
  }, [tabs, activeTab]);

  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong!</div>;


  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200">
          <TopNav />
        </div>

        <div className="flex flex-col lg:flex-row">

          <main className="flex-1 lg:pr-4">
            <p className="mx-auto max-w-2xl pt-50 pl-4 font-bold text-5xl text-black">{data.username}</p>
            <NavTabProfile />
            <div className="h-4 lg:h-6"></div>
            <Feed activeTab={activeTab} />
          </main>

          <div className="w-full lg:w-auto">
            <SidebarProfile 
              user={{
              id: data.id,
              username: data.username ?? "anonymous",
              imageUrl: data.imageUrl,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helper = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug != "string") throw new Error("No slug");

  const username = slug.replace("@", "");

  await helper.profile.getUserByUsername.prefetch({ username: slug });

  return {
    props: {
      trpcState: helper.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
