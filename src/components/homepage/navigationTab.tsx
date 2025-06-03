import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";


type NavigationTabsProps = {
  activeTab: string | null;
  setActiveTab: (tabName: string) => void;
};

export const NavigationTabs = ({ activeTab, setActiveTab }: NavigationTabsProps) => {
  const { data: tabs, isLoading: tabsLoading } = api.tag.getAll.useQuery();

  useEffect(() => {
    if (tabs?.[0] && tabs.length > 0 && activeTab === null) {
      setActiveTab(tabs[0].name);
    }
  }, [tabs, activeTab, setActiveTab]);

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

  // const tagMutation = api.tag.create.useMutation({
  //   onSuccess: () => {
  //     setInput({ name: "" });
  //     void utils.post.getLatest.invalidate();
  //   },
  //   onError: (e) => {
  //     console.error("Tag creation error:", e);

  //     setInput({ name: "" });

  //     const nameError = e.data?.zodError?.fieldErrors.name?.[0];

  //     if (nameError) {
  //       toast.error(nameError);
  //     } else {
  //       toast.error("Failed to add tag! Please try again later.")
  //     }
  //   }
  // });

  if (tabsLoading) return <LoadingPage />;

  if (!tabs) return <div>Something went wrong! No tabs!</div>;

  return (
    <div
      className="mx-auto max-w-2xl border-b border-gray-200 pt-8 bg-white"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="flex h-14 items-center text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex flex-1 gap-8 overflow-x-auto px-4"
        >
          {/* <button 
            onClick={() => 
              tagMutation.mutate({ 
                name: input.name, 
              })
            }
            aria-label="Add new tag"
            className="relative flex h-14 items-center whitespace-nowrap text-sm text-gray-500 hover:text-gray-700"
          >
            <PlusIcon className="h-6 w-6" />
          </button>     */}

          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)} // 🔥
              className={`relative flex h-14 items-center text-sm whitespace-nowrap ${
                activeTab === tab.name
                  ? "text-gray-900 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:bg-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="flex h-14 items-center text-gray-500 hover:text-gray-800"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};