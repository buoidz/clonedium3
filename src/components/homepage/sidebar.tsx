import Link from "next/link";


export const Sidebar = () => {
  return (
    <aside className="w-115 border-l border-gray-200 px-6 py-8 bg-white">
      <div className="sticky top-8 space-y-8">
        {/* Staff Picks */}
        <div>
          <h3 className="mb-4 text-base font-medium text-gray-900">
            Staff Picks
          </h3>
          <div className="space-y-4">
            {[
              {
                title: "In The Memoirist",
                author: "Joshua Samuel Brown",
                verified: true,
              },
              { title: "Confessions of a Sweatshop Inspector", date: "May 23" },
              { title: "In The Medium Blog", author: "Medium Staff" },
              { title: "It happened on Medium: April 2025", date: "May 20" },
              {
                title: "The Tyranny of Thirty",
                author: "Jason Shen",
                verified: true,
                date: "May 15",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 h-5 w-5 rounded bg-gray-300"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {item.author && (
                      <>
                        <span>{item.title}</span>
                        <span>by {item.author}</span>
                        {item.verified && (
                          <svg
                            className="h-3 w-3 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </>
                    )}
                  </div>
                  <h4 className="cursor-pointer text-sm font-medium text-gray-900 hover:text-gray-700">
                    {item.author ? "Article Title Here" : item.title}
                  </h4>
                  {item.date && (
                    <div className="mt-1 flex items-center gap-1">
                      <svg
                        className="h-3 w-3 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/"
            className="mt-4 block text-sm text-green-600 hover:text-green-700"
          >
            See the full list
          </Link>
        </div>

        {/* Recommended topics */}
        <div>
          <h3 className="mb-4 text-base font-medium text-gray-900">
            Recommended topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Relationships",
              "Politics",
              "Money",
              "Psychology",
              "Software Development",
              "Life",
              "Business",
            ].map((topic) => (
              <span
                key={topic}
                className="cursor-pointer rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700"
              >
                {topic}
              </span>
            ))}
          </div>
          <Link
            href="/"
            className="mt-4 block text-sm text-green-600 hover:text-green-700"
          >
            See more topics
          </Link>
        </div>
      </div>
    </aside>
  );
};