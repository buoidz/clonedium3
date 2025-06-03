import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

export const TopNav = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return <div>No user info</div>;

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-2.5">
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

          {/* Search Bar */}
          <div className="relative flex-1 mx-4 max-w-xl gap-2">
          <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full bg-gray-100 px-4 py-2 pl-10 text-sm text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />
        
          <span className="absolute left-3 top-2.5 text-gray-500">
            <Search size={20} strokeWidth={1.5} />
          </span>
        </div>
      </div>


      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/new-story")}
          className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          Write
        </button>
        <div className="relative" ref={dropdownRef}>
          <div className="cursor-pointer" onClick={() => setOpen((prev) => !prev)}>
            <Image
              src={user.imageUrl}
              alt="Profile"
              width={36}
              height={36}
              className="h-8 w-8 rounded-full cursor-pointer"
            />
          </div>
          {open && (
            <div className="absolute right-0 mt-2 w-32 rounded bg-white p-2 shadow-md">
              <button
                onClick={() => router.push(`/@${user.username}`)}
                className="w-full rounded px-2 py-1 text-left text-sm text-black hover:bg-gray-100"
              >
                Profile
              </button>
              <SignOutButton>
                <button className="w-full rounded px-2 py-1 text-left text-sm text-black hover:bg-gray-100">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          )}
        </div>

        </div>
      </div>
    </header>
  );
};
