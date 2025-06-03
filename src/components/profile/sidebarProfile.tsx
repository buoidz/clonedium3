import Image from "next/image";


type ProfileUser = {
  id: string;
  username: string;
  imageUrl: string;
};

export const SidebarProfile = ({ user }: { user: ProfileUser }) => {
  return (
    <aside className="w-115 border-l border-gray-200 px-6 py-8 bg-white flex-shrink-0 h-full">
      <div className="sticky top-8 px-5">
        <Image
          src={user.imageUrl}
          alt="Profile"
          width={80}
          height={80}
          className="rounded-full mb-2"
        />
        <p className="text-2xl font-bold text-black">@{user.username}</p>
      </div>
    </aside>
  );
};