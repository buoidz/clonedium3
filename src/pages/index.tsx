import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PostView } from "~/components/postview";

import { api, type RouterOutputs } from "~/utils/api";

const CreatePostWizard = () => {
  const { user, isSignedIn } = useUser();

  const [input, setInput] = useState("");

  const utils = api.useUtils();

  const postMutation = api.post.create.useMutation({
    onSuccess: () => {
      setInput(""); 
      utils.post.getLatest.invalidate(); 
    },
    onError: (e) => {
      setInput("");
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.")
      }
    }
  });


  if (!isSignedIn || !user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image 
        src={user.imageUrl} 
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        width={56} 
        height={56}
        />
      <input 
        placeholder="Type some emojis!" 
        className="grow bg-transparent outline-0"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            e.preventDefault();
            if (input !== "") {
              postMutation.mutate({ content: input })
            }
          }
        }}
        disabled={postMutation.isPending}
      />
      {input !== "" && (
        <button 
          onClick={() => postMutation.mutate({ content: input })}
          disabled={postMutation.isPending}
        >
          Post
        </button>
      )}
      {postMutation.isPending && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20}/>
        </div>)}
    </div>
    );

  
}


const Feed = () => {
  const { data, isLoading: postsLoading} = api.post.getLatest.useQuery();

if (postsLoading) return <LoadingPage/>;

if (!data) return <div>Something went wrong!</div>

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => 
        <PostView {...fullPost} key={fullPost.post.id} />
      )}
    </div>
  );

}

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn} = useUser();

  // Start fetching asap
  void api.post.getLatest.useQuery();

  if (!userLoaded) return <div/>;

  return (
    <PageLayout>
      <div className="border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed/>
    </PageLayout>
  );
}
