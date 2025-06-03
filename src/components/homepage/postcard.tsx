import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api, type RouterOutputs } from "~/utils/api";
import { Bookmark, Heart, MessageCircle, MoreVertical } from "lucide-react";

dayjs.extend(relativeTime);


type PostWithUser = RouterOutputs["post"]["getPostByTag"][number];

export const PostCard = (props: PostWithUser) => {
  const { post, author } = props;
  
  // Preview is everything rightnow
  const preview = post.content;
  
  return (
    <article className="group cursor-pointer border-b border-gray-100 py-8 transition-all duration-200">
      <div className="flex items-start justify-between gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="flex items-center gap-2 mb-3">
            <Link href={`/@${author.username}`} className="flex items-center gap-2 hover:text-gray-900 ">
              <Image
                src={author.imageUrl}
                className="h-5 w-5 rounded border border-gray-200"
                alt={`@${author.username}`}
                width={20}
                height={20}
              />
              <span className="text-sm font-medium text-gray-700">
                {author.username}
              </span>
            </Link>
          </div>

          {/* Post Content */}
          <Link href={`/post/${post.id}`} className="block">
            <div className="space-y-2">
              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors line-clamp-2">
                {post.title}
              </h2>
              
              {/* Preview Text */}
              {preview && (
                <p className="text-gray-600 leading-relaxed line-clamp-2">
                  {preview}
                </p>
              )}
            </div>
          </Link>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <time className="text-sm text-gray-500">
                {dayjs(post.createdAt).fromNow()}
              </time>

              <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                <Heart className="w-4 h-4" />
                <span>{post._count?.likes ?? 10000}</span>
              </button>
              
              <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>{post._count?.comments ?? 10000}</span>
              </button>
              
            </div>



            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-full transition-colors">
                <Bookmark className="w-4 h-4 text-gray-500" />
              </button>
              
              <button className="p-1.5 rounded-full transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image Placeholder */}
        <div className="hidden sm:block w-32 h-20 bg-gray-200 rounded flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
};