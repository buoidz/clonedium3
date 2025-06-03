import Link from "next/link";


export const Sidebar = () => {
  return (
    <aside className="w-115 border-l border-gray-200 px-6 py-8 bg-white flex-shrink-0 h-full">
      <div className="sticky top-8 space-y-8">
        {/* Staff Picks */}
        <div>
          <h3 className="mb-4 text-base font-medium text-gray-900">
            Staff Picks
          </h3>
      
          <Link
            href="/"
            className="mt-4 block text-sm text-gray-500 hover:underline"
          >
            See the full list
          </Link>
        </div>

        {/* Recommended topics */}
        <div>
          <h3 className="mb-4 text-base font-medium text-gray-900">
            Recommended topics
          </h3>
          <Link
            href="/"
            className="mt-4 block text-sm text-gray-500 hover:underline"
          >
            See more topics
          </Link>
        </div>
      </div>
    </aside>
  );
};