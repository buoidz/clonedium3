import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PostCard } from "~/components/homepage/postcard";
import { NavigationTabs } from "./navigationTab";

type FeedProps = {
  activeTab: string | null;
};
export const Feed = ({ activeTab }: FeedProps) => {
  const { data, isLoading: postsLoading } = api.post.getPostByTag.useQuery(
    { tagName: activeTab ?? "" },
    { enabled: !!activeTab }, // prevent firing with null
  );


  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong! No posts!</div>;

  return (
      <div className="mx-auto max-w-2xl bg-white">
        <div className="divide-y divide-gray-100">
          {data.map((fullPost) => (
            <PostCard key={fullPost.post.id} {...fullPost} />
          ))}
        </div>
      </div>
  );
};