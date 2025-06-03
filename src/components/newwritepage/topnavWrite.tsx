import { SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";


type TopNavProps = {
  onPost?: () => void;
  canPost?: boolean;
};
export const TopNavWrite = ({ onPost, canPost }: TopNavProps) => {
  const { user } = useUser();


  return (
    <header className="sticky top-0 z-50 w-full px-50 py-2.5">
      <div className="flex w-full items-center justify-between">
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


      {/* Actions */}
      <div className="flex items-center gap-4">
          <button 
            onClick={onPost} 
            disabled={!canPost}
            className={`rounded-full  px-2.5 py-0.5 text-sm text-white 
              ${canPost ? 'bg-green-700 hover:bg-green-800' : 'bg-green-300 cursor-not-allowed'}
            `}
          >
            Publish
          </button>
          <div className="relative group">
            <Image
              src={user?.imageUrl || "/default-avatar.png"}
              alt="Profile"
              width={36}
              height={36}
              className="h-8 w-8 rounded-full cursor-pointer"
            />
            {/* Dropdown on hover */}
            <div className="absolute right-0 mt-2 hidden w-32 rounded bg-white p-2 shadow-md group-hover:block">
              <SignOutButton>
                <button className="w-full rounded px-2 py-1 text-left text-sm text-black hover:bg-gray-100">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
