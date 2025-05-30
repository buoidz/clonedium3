import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PostView } from "~/components/postview";
import { ChevronLeft, ChevronRight } from "lucide-react";


import { api, type RouterOutputs } from "~/utils/api";
import { UserDbSync } from "~/components/userDbSyncs";

const CreatePostWizard = () => {
  const { user, isSignedIn } = useUser();

  const [input, setInput] = useState("");

  const utils = api.useUtils();

  const postMutation = api.post.create.useMutation({
    onSuccess: () => {
      setInput(""); 
      void utils.post.getLatest.invalidate(); 
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
};

const HeroSection = ({ isSignedIn }: { isSignedIn: boolean }) => {
  if (isSignedIn) return null;

  return (
    <div className="border-b border-slate-400 text-black" style={{ backgroundColor: '#f7f4ed' }}>
      <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-2xl">
          <h1 className="mb-6 text-8xl font-normal leading-[1.0] tracking-tight">
            Human stories & ideas
          </h1>
          <p className="mb-8 text-xl">
            A place to read, write, and deepen your understanding
          </p>
          <SignInButton>
            <button className="rounded-full bg-gray-900 px-12 py-3 text-lg font-medium text-white hover:bg-gray-800">
              Start reading
            </button>
          </SignInButton>
        </div>
        <img
          alt="Brand image"
          src="https://miro.medium.com/v2/format:webp/4*SdjkdS98aKH76I8eD0_qjw.png"
          width={460}
          height={600}
          loading="eager"
          className="w-full max-w-md object-contain"
        />
      </div>
    </div>
  );
};

const NavigationTabs = () => {

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };



  const tabs = [
    { name: "For you", active: true },
    { name: "Following", active: false },
    { name: "Featured", badge: "New", active: false },
    { name: "Science", active: false },
    { name: "Health", active: false },
    { name: "Python", active: false },
    { name: "Cryptocurrency", active: false },
  ];

  return (
    <div className="mx-auto max-w-2xl border-b border-gray-200 pt-8" style={{ backgroundColor: '#f7f4ed' }}>
      <div className="flex items-center justify-between gap-2">
        {/* Left Arrow */}
        <button onClick={() => scroll("left")} className="flex h-14 items-center text-gray-500 hover:text-gray-800  ">
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div ref={scrollRef} className="no-scrollbar flex flex-1 justify-center gap-8 overflow-x-auto pl-6">          
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`relative flex h-14 items-center whitespace-nowrap text-sm ${
                tab.active 
                  ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gray-900" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
              {tab.badge && (
                <span className="ml-2 rounded bg-green-600 px-2 py-0.5 text-xs text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button onClick={() => scroll("right")} className="flex h-14 items-center text-gray-500 hover:text-gray-800">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};





const Feed = () => {
  const { data, isLoading: postsLoading} = api.post.getLatest.useQuery();

  if (postsLoading) return <LoadingPage/>;

  if (!data) return <div>Something went wrong!</div>

  return (
    <div style={{ backgroundColor: '#f7f4ed' }}>
      <NavigationTabs/>

      {/* Follow suggestions */}
      <div className="px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Because you follow <strong>Data Science</strong></span>
          </div>  
        </div>
      </div>

      {/* Posts */}
      <div className="mx-auto max-w-2xl divide-y divide-gray-200">
        {data.map((fullPost) => (
          <article key={fullPost.post.id} className="px-6 py-8">
            <div className="mx-auto max-w-2xl">
              <PostView {...fullPost} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const Sidebar = () => {
  return (
    <aside className="w-115 border-l border-gray-200 px-6 py-8" style={{ backgroundColor: '#f7f4ed' }}>
      <div className="sticky top-8 space-y-8">
        {/* Staff Picks */}
        <div>
          <h3 className="mb-4 text-base font-medium text-gray-900">Staff Picks</h3>
          <div className="space-y-4">
            {[
              { title: "In The Memoirist", author: "Joshua Samuel Brown", verified: true },
              { title: "Confessions of a Sweatshop Inspector", date: "May 23" },
              { title: "In The Medium Blog", author: "Medium Staff" },
              { title: "It happened on Medium: April 2025", date: "May 20" },
              { title: "The Tyranny of Thirty", author: "Jason Shen", verified: true, date: "May 15" }
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 h-5 w-5 rounded bg-gray-300"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {item.author && (
                      <>
                        <span>{item.title}</span>
                        <span>by {item.author}</span>
                        {item.verified && (
                          <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 hover:text-gray-700 cursor-pointer">
                    {item.author ? "Article Title Here" : item.title}
                  </h4>
                  {item.date && (
                    <div className="mt-1 flex items-center gap-1">
                      <svg className="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link href="#" className="mt-4 block text-sm text-green-600 hover:text-green-700">
            See the full list
          </Link>
        </div>

        {/* Recommended topics */}
        <div>
          <h3 className="mb-4 text-base font-medium text-gray-900">Recommended topics</h3>
          <div className="flex flex-wrap gap-2">
            {["Relationships", "Politics", "Money", "Psychology", "Software Development", "Life", "Business"].map((topic) => (
              <span
                key={topic}
                className="cursor-pointer rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                {topic}
              </span>
            ))}
          </div>
          <Link href="#" className="mt-4 block text-sm text-green-600 hover:text-green-700">
            See more topics
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn} = useUser();

  // Start fetching asap
  void api.post.getLatest.useQuery();

  if (!userLoaded) return <div/>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f4ed' }}>
      <div className="border-b border-slate-400 p-4">
        <UserDbSync /> 

        {!isSignedIn && (
          <div className="flex justify-center text-black">
            <SignInButton />
          </div>
        )}
        {/* {isSignedIn && <CreatePostWizard />} */}
        {isSignedIn && (
          <div className="flex justify-center text-black">
            <SignOutButton />
          </div>
        )}
      </div>
      <HeroSection isSignedIn={!!isSignedIn} />
      
      <div className="flex flex-col lg:flex-row">
        <main className="flex-1">
          <Feed />
        </main>

        {isSignedIn && (
          <div className="w-full lg:w-auto">
            <Sidebar />
          </div>
        )}
      </div>  
    </div>
  );
}
