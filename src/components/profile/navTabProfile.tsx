import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";


export const NavTabProfile = () => {


  return (
    <div className="mx-auto max-w-2xl border-b border-gray-200 pt-8 bg-white">
      <div className="flex items-center justify-between gap-2">
        <div className="no-scrollbar flex flex-1 gap-8 overflow-x-auto px-4">
          <span className="relative flex h-14 items-center text-sm whitespace-nowrap text-gray-900 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:bg-gray-900">
            Home
          </span>
          <span className="relative flex h-14 items-center text-sm whitespace-nowrap text-gray-500 hover:text-gray-700">
            About
          </span>
        </div>
      </div>
    </div>
  );
};