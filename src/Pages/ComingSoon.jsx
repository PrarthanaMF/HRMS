import React from "react";
import PageHeader from "../Components/Common/PageHeader";

import Icon from "../Components/Common/Icon";
/*
 * A named landing page for a module that has a place in the navigation but no screens yet.
 * Without it the link would quietly bounce back to the dashboard, which reads as a broken link.
 */
export default function ComingSoon({ title, icon = "fa-solid fa-screwdriver-wrench", description, points = [] }) {
  return (
    <div className="text-slate-900">
      <div className="w-full">
        <PageHeader icon={icon} title={title} description={description} />

        <section className="glass-panel rise rounded-2xl p-10 text-center" style={{ "--i": 1 }}>
          <span aria-hidden="true" className="gradient-brand mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl text-white shadow-[0_10px_24px_-10px_rgb(8_26_46/0.9)]">
            <Icon className={icon} />
          </span>
          <h2 className="mt-3 text-base font-semibold text-slate-800">{title} is not ready yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            This module is in the navigation so the structure is in place, but its screens have not been built.
          </p>

          {points.length > 0 && (
            <ul className="mx-auto mt-4 max-w-md space-y-1.5 text-left">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs text-slate-600">
                  <Icon aria-hidden="true" className="fa-regular fa-circle-dot mt-0.5 text-[10px] text-[#1f4e6b]" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
