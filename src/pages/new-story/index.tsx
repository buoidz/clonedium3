import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

import { api } from "~/utils/api";
import { TopNavWrite } from "~/components/newwritepage/topnavWrite";
import { CreatePostWizard } from "~/components/newwritepage/postWizard";



export default function Home() {
  const { isLoaded: userLoaded } = useUser();
  const createPostRef = useRef<() => void>(() => {});
  const [canPost, setCanPost] = useState(false);

  const registerPostHandler = (handler: () => void) => {
    createPostRef.current = handler;
  };

  // Start fetching asap
  void api.post.getLatest.useQuery();

  if (!userLoaded) return <div />;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavWrite 
        onPost={() => createPostRef.current?.()} 
        canPost={canPost} 
      />
      <CreatePostWizard 
        registerPostHandler={registerPostHandler} 
        setCanPost={setCanPost}
      />
    </div>
  );
}
