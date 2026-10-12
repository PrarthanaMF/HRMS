import React from "react";
import { useSelector } from "react-redux";

import ProfileCard from "../../Common/ProfileCard";
import NotificationBell from "../../Common/NotificationBell";

const HomeHeader = ({ onMenuClick }) => {
  const user = useSelector((state) => state.auth.value);

  const firstName = user?.name ? user.name.split(" ")[0] : "User";

  return (
    <div className="sticky top-0 z-50 flex h-16 items-center justify-between gap-3 overflow-visible bg-white px-4 shadow md:px-5">
      {/* ================= DESKTOP ================= */}
      <div className="hidden w-full items-center gap-4 md:grid md:grid-cols-3">
        {/* LEFT */}
        <div className="min-w-0">
          <h3 className="truncate whitespace-nowrap text-[14px] font-bold">
            Welcome back, {firstName} 👏
          </h3>

          <p className="truncate text-[10px] text-gray-400">
            Here is what's happening in your organization today.
          </p>
        </div>

        {/* CENTER */}
        <div className="flex justify-center">
          <div className="flex w-full max-w-md items-center rounded border border-gray-300 px-2 py-1">
            <label htmlFor="search" className="cursor-pointer">
              <i className="fa-solid fa-magnifying-glass mr-2.5 text-[14px] font-normal text-slate-700/90" />
            </label>

            <input
              id="search"
              type="text"
              placeholder="Search employees, modules, documents"
              className="h-full w-full border-0 bg-transparent text-[12px] outline-0"
            />

            <span className="ml-2 whitespace-nowrap rounded border border-gray-200 px-1.5 text-[12px] text-gray-600">
              Ctrl+/
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-5">
          <NotificationBell />

          <button
            type="button"
            className="cursor-pointer"
            aria-label="Toggle theme"
          >
            <i className="fa-regular fa-moon text-[16px] text-gray-600" />
          </button>

          <ProfileCard />
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="flex w-full items-center justify-between gap-2.5 md:hidden">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#062139] text-white shadow-sm transition hover:bg-[#0a2f52]"
          >
            <i className="fa-solid fa-bars text-[14px]" />
          </button>

          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-bold leading-tight text-slate-800">
              Hi, {firstName} 👋
            </h3>

            <p className="truncate text-[9.5px] leading-tight text-gray-400">
              Welcome back
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-3">
          <NotificationBell />

          <button
            type="button"
            className="cursor-pointer"
            aria-label="Toggle theme"
          >
            <i className="fa-regular fa-moon text-[15px] text-gray-600" />
          </button>

          <ProfileCard />
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
