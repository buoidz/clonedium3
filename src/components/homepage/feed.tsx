import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
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

  console.log("------------------");
  console.log(activeTab);

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
      
      // {/* Follow suggestions */}
      // {/* <div className="px-6 py-4">
      //   <div className="mx-auto max-w-2xl">
      //     <div className="flex items-center gap-2 text-sm text-gray-500">
      //       <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      //       </svg>
      //       <span>Because you follow <strong>Data Science</strong></span>
      //     </div>  
      //   </div>
      // </div> */}

  );
};