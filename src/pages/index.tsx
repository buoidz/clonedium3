import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LoadingPage, LoadingSpinner } from "~/components/loading";

import { api, type RouterOutputs } from "~/utils/api";
import { UserDbSync } from "~/components/userDbSyncs";
import { Feed } from "~/components/homepage/feed";
import { Sidebar } from "~/components/homepage/sidebar";
import { NavigationTabs } from "~/components/homepage/navigationTab";
import { TopNav } from "~/components/homepage/topnav";
import Link from "next/link";


const LandingHero = ({ isSignedIn }: { isSignedIn: boolean }) => {
  if (isSignedIn) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-6 py-5">
        <div className="flex w-full items-center justify-between  px-30">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo/medium_logo.png"
                alt="Medium logo"
                width={110}
                height={110}
                // className="h-6 w-26"
              />
            </Link>
          </div>
          <SignInButton>
            <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
              Sign In
            </button>
          </SignInButton>
        </div>
      </header>
      <div className="border border-slate-400 text-black bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-12 px-4 py-4 md:flex-row">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-8xl leading-[1.0] font-normal tracking-tight">
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
    </>
  );
};


export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<string | null>(null); // Move state up

  const { data: tabs } = api.tag.getAll.useQuery();


  useEffect(() => {
    if (tabs?.[0] && tabs.length > 0 && activeTab === null) {
      setActiveTab(tabs[0].name);
    }
  }, [tabs, activeTab]);

  // Start fetching asap
  void api.post.getLatest.useQuery();

  if (!userLoaded) return <div />;

  return (
    <div className="min-h-screen bg-white">

      {isSignedIn ? (
        <>
          <div className="border-b border-gray-200">
            <TopNav />
            <UserDbSync />
          </div>
          <div className="flex flex-col lg:flex-row">
            <main className="flex-1 lg:pr-4">
              <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="h-4 lg:h-6"></div>
              <Feed activeTab={activeTab} />
            </main>

            <div className="w-full lg:w-auto">
              <Sidebar />
            </div>
          </div>
        </>
      ) : (
        <div className="border-b border-gray-200">
          <LandingHero isSignedIn={!!isSignedIn} />
        </div>
      )}
    </div>
  );
}
