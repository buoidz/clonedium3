import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";

type CreatePostWizardProps = {
  registerPostHandler: (handler: () => void) => void;
  setCanPost: (canPost: boolean) => void;
};

export const CreatePostWizard = ({ registerPostHandler, setCanPost }: CreatePostWizardProps) => {
  const { user, isSignedIn } = useUser();

  const [input, setInput] = useState({
    title: "",
    content: "",
  });

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { data: availableTags = [] } = api.tag.getAll.useQuery(); // Assumes `getAll` returns { id, name }[]

  const utils = api.useUtils();

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const postMutation = api.post.create.useMutation({
    onSuccess: () => {
      setInput({ title: "", content: "" });
      setSelectedTagIds([]);
      void utils.post.getLatest.invalidate();

      toast.success("Post published!", {
        position: "top-center",
      });
    },
    onError: (e) => {
      console.error("Post creation error:", e);

      setInput({ title: "", content: "" });

      const contentError = e.data?.zodError?.fieldErrors.content?.[0];
      const titleError = e.data?.zodError?.fieldErrors.title?.[0];

      if (contentError) {
        toast.error(contentError);
      } else if (titleError) {
        toast.error(titleError);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!isSignedIn || !user) return null;

  const handlePost = () => {
    if (input.title && input.content && selectedTagIds.length > 0) {
      postMutation.mutate({
        title: input.title,
        content: input.content,
        tagIds: selectedTagIds,
      });
    }
  };

  useEffect(() => {
    const valid = input.title.length > 0 && input.content.length > 0 && selectedTagIds.length > 0;
    setCanPost(valid);
  }, [input, selectedTagIds, setCanPost]);

  useEffect(() => {
    registerPostHandler(handlePost);
  }, [handlePost, registerPostHandler]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput((prev) => ({ ...prev, title: e.target.value }));
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }  
  };


  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput({ ...input, content: e.target.value });
    
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  };

  return (
    <div className="flex flex-col flex-grow justify-between px-80 py-10 w-full gap-3">
      <div className="flex flex-col flex-grow">
        <textarea
          ref={titleRef}
          placeholder="Title"
          className="rounded bg-transparent p-2 text-5xl text-black placeholder-gray-400 outline-0"
          value={input.title}
          onChange={handleTitleChange}
          disabled={postMutation.isPending}
          rows={1}
        />
        <textarea
          ref={contentRef}
          placeholder="Type some emojis!"
          className="rounded bg-transparent p-2 text-2xl text-black placeholder-gray-400 outline-0"
          value={input.content}
          onChange={handleContentChange}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              e.preventDefault();
              handlePost();
            }
          }}
          disabled={postMutation.isPending}
        />
      </div>

      <div>
        <p className="mb-2 text-gray-600 text-sm">Select relevant tags for your post:</p>

        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() =>
                  setSelectedTagIds((prev) =>
                    isSelected
                      ? prev.filter((id) => id !== tag.id)
                      : [...prev, tag.id],
                  )
                }
                className={`rounded-full border px-3 py-1 text-sm ${
                  isSelected
                    ? "border-white bg-white text-black"
                    : "border-gray-500 bg-gray-700 text-white"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {postMutation.isPending && (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};