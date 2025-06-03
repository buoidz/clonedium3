import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";
import Link from "next/link"; 

import Image from "next/image";
import { generateSSGHelper } from "~/server/helper/ssgHelper";
import { TopNav } from "~/components/homepage/topnav";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Heart, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useRef, useState } from "react";


dayjs.extend(relativeTime);

interface PostHeaderProps {
  post: {
    title: string;
    createdAt: Date;
    content: string;
  };
  author: {
    username: string;
    imageUrl: string;
  };
}

const PostHeader = ({ post, author }: PostHeaderProps) => {
  const readTime = Math.max(1, Math.ceil(post.content.split(' ').length / 100));

  return (
    <header className="w-full max-w-2xl">
      <h1 className="text-5xl font-bold mb-4 py-8">{post.title}</h1>
      
      <div className="mb-8 flex items-center gap-10">
        <div className="flex items-center gap-5">
          <Link href={`/@${author.username}`}>
            <Image
              src={author.imageUrl}
              className="h-8 w-8 rounded-full"
              alt={`@${author.username}`}
              width={32}
              height={32}
            />
          </Link>
          <Link href={`/@${author.username}`}>
            <span className="font-medium text-black hover:underline">
              {author.username}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{readTime} min read</span>
          <span>·</span>
          <time className="text-sm text-gray-500">
            {dayjs(post.createdAt).fromNow()}
          </time>
        </div>
      </div>
    </header>
  );
};


interface PostActionsProps {
  postId: string;
  post: {
    _count?: {
      likes?: number;
      comments?: number;
    };
  };
  isLikedByUser: boolean;
}

const PostActions = ({ postId, post, isLikedByUser }: PostActionsProps)  => {
  // Get tRPC context for invalidating queries
  const ctx = api.useUtils();

  const toggleLikeMutation = api.post.toggleLike.useMutation({
    onSuccess: () => {
      void ctx.post.getPostById.invalidate({ id: postId });
    },
    onError: (e) => {
      console.error("Tag creation error:", e);

      if (e.data?.code === "UNAUTHORIZED") {
        console.log("User needs to log in to like posts.");
        toast.error("User needs to log in to like posts.");
      }
    }
  });

  const handleLikeClick = () => {
    if (toggleLikeMutation.isPending) return;
    
    toggleLikeMutation.mutate({
      postId: postId,
    });
  };

  const handleCommentClick = () => {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };


  return (
    <div className="flex px-3 py-3 gap-8 border-b border-t border-gray-100">
      <button 
        onClick={handleLikeClick}
        disabled={toggleLikeMutation.isPending}
        className={`flex items-center gap-1 transition-colors ${
          isLikedByUser 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-500 hover:text-black'
        } ${toggleLikeMutation.isPending ? 'opacity-50' : ''}`}
      >
        <Heart 
          className={`w-4 h-4 ${isLikedByUser ? 'fill-current' : ''}`} 
        />
        <span>{post._count?.likes ?? 0}</span>
      </button>
      
      <button 
        onClick={handleCommentClick}
        className="flex items-center gap-1 text-gray-500 hover:text-black"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{post._count?.comments ?? 0}</span>
      </button>
    </div>
  );
};

interface PostContentProps {
  content: string;
}

const PostContent = ({ content }: PostContentProps) => {
  return (
    <div className="pt-10 w-full max-w-2xl">
      <div className="text-2xl leading-relaxed">
        {content}
      </div>
    </div>
  );
};

const PostView: NextPage<{ id: string }> = ({ id }) =>  {
  const { data, isLoading } = api.post.getPostById.useQuery({
    id,
  });

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong!</div>;

  const { post, author, isLikedByUser } = data;

  return (
    // <PostCard {...data} />
    <main className="flex justify-center px-5 py-10 text-black">
      <div className="w-full max-w-2xl">
        <PostHeader post={post} author={author} />

        <PostActions postId={id} post={post} isLikedByUser={isLikedByUser}/>
        
        <PostContent content={post.content} />

        <CommentsSection author={author} postId={id} />
      </div>
    </main>
  );
}

// Add this new component for the comments section
interface CommentsProps {
  author: {
    username: string;
    imageUrl: string;
  };
  postId: string;
}

const CommentsSection = ({ author, postId }: CommentsProps) => {

  const [input, setInput] = useState({ content: "" });
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const utils = api.useUtils();

  const { data: comments, isLoading } = api.comment.getByPostId.useQuery({ postId });
  

  const postMutation = api.comment.create.useMutation({
    onSuccess: () => {
      setInput({ content: "" });
      void utils.comment.getByPostId.invalidate();

      toast.success("Response posted!", {
        position: "top-center",
      });
    },
    onError: (e) => {
      console.error("Response error:", e);
      setInput({ content: "" });

      const contentError = e.data?.zodError?.fieldErrors.content?.[0];
      if (contentError) {
        toast.error(contentError);
      } else {
        toast.error("Failed to response! Please try again later.");
      }
    },
  });

  const cancelComment = () => {
    setInput({ content: "" });
  };
  

  const handleComment = () => {
    if (input.content.trim()) {
      postMutation.mutate({ content: input.content, postId });
    }
  };


  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput((prev) => ({ ...prev, content: e.target.value }));
    
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  };

  return (
    <section id="comments-section" 
      className="w-full mt-16 pt-8 border-t border-gray-200"
      >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl mb-6">Responses</h2>
        <div className="flex items-center gap-4 py-3">
          <Image
            src={author.imageUrl}
            className="h-8 w-8 rounded-full"
            alt={`@${author.username}`}
            width={32}
            height={32}
          />
          <span className="text-black hover:underline">
            {author.username}
          </span>
        </div>

        <div className="mb-8 pb-10 border-b border-gray-100">
          <div className="relative bg-gray-100 rounded-lg ">
            <textarea
              placeholder="What are your thoughts?"
              className="w-full p-4 resize-none focus:outline-none"
              value={input.content}
              onChange={handleContentChange}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  // handleComment();
                }
              }}
              rows={3}
            />
            <div className="flex justify-end p-3 gap-2">
              <button 
                className="px-3 py-1 text-sm bg-transparent"
                onClick={cancelComment}
              >
                Cancel
              </button>
              <button 
                className="px-3 py-1 text-sm rounded-3xl bg-black text-white"
                onClick={handleComment}
              >
                Respond
              </button>
            </div>
          </div>
        </div>

        <div className="">
          {isLoading && (
            <LoadingSpinner />
          )}

          {!isLoading && comments && comments.length === 0 && (
            <div className="text-gray-500 text-center">No comments yet. Be the first to comment!</div>
          )}

          {!isLoading &&
            comments?.map((comment) => (
              <div key={comment.id} className="flex flex-col py-6 border-b border-gray-100 items-start gap-4">
                <div className="flex items-center gap-4">
                  <Link href={`/@${author.username}`}>
                    <Image
                      src={comment.user.imageUrl}
                      alt={comment.user.username}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                  </Link>
                  <Link href={`/@${author.username}`} className="flex flex-col">
                    <span className="text-black hover:underline cursor-pointer">
                      {comment.user.username}
                    </span>
                    <time className="text-sm text-gray-500">
                      {dayjs(comment.createdAt).fromNow()}
                    </time>
                  </Link>
                </div>
                <p className="text-black whitespace-pre-wrap">{comment.content}</p>

              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200">
          <TopNav />
        </div>
        <PostView id={id} />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helper = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id != "string") throw new Error("No id");

  await helper.post.getPostById.prefetch({ id });

  return {
    props: {
      trpcState: helper.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
