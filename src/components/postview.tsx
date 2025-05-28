import Image from "next/image";
import Link from "next/link";


import { api, type RouterOutputs } from "~/utils/api";

type PostWithUser =  RouterOutputs["post"]["getLatest"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props
  return (
    <div key={post.id} className="flex border-b gap-3 border-slate-400 p-4">
      <Image 
        src={author.imageUrl} 
        className="h-14 w-14 rounded-full" 
        alt="`@${author.username} `" 
        width={56} height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
        </div>
        <Link href={'/post/${post.id}'}>
          <span className="text-2xl">{post.content}</span>
        </Link>
      </div>
    </div>
  )
}