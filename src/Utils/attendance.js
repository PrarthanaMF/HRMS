// Presentation helpers only: no attendance, eligibility, or payroll calculations.

export const ATTENDANCE_STATUS = {
  P: {
    label: "Present",
    shortLabel: "P",
    dotClass: "bg-emerald-500",
    cellClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  A: {
    label: "Absent",
    shortLabel: "A",
    dotClass: "bg-red-600",
    cellClass: "border-red-200 bg-red-50 text-red-700",
  },

  UL: {
    label: "Unapproved Leave",
    shortLabel: "UL",
    dotClass: "bg-red-500",
    cellClass: "border-red-200 bg-red-50 text-red-700",
  },

  WO: {
    label: "Weekly Off",
    shortLabel: "WO",
    dotClass: "bg-sky-400",
    cellClass: "border-sky-200 bg-sky-50 text-sky-700",
  },

  AFD: {
    label: "Alert for Deduction",
    shortLabel: "P",
    dotClass: "bg-orange-500",
    cellClass: "border-orange-200 bg-orange-50 text-orange-700",
  },

  G: {
    label: "Grace",
    shortLabel: "G",
    dotClass: "bg-indigo-700",
    cellClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },

  WOP: {
    label: "Present in Weekly Off",
    shortLabel: "WOP",
    dotClass: "bg-teal-500",
    cellClass: "border-teal-200 bg-teal-50 text-teal-700",
  },

  CL: {
    label: "Approved Leave (CL)",
    shortLabel: "CL",
    dotClass: "bg-rose-500",
    cellClass: "border-rose-200 bg-rose-50 text-rose-700",
  },

  SL: {
    label: "Approved Leave (SL)",
    shortLabel: "SL",
    dotClass: "bg-pink-500",
    cellClass: "border-pink-200 bg-pink-50 text-pink-700",
  },

  HD: {
    label: "Half Day",
    shortLabel: "HD",
    dotClass: "bg-amber-400",
    cellClass: "border-amber-200 bg-amber-50 text-amber-700",
  },

  WFH: {
    label: "Work From Home",
    shortLabel: "WFH",
    dotClass: "bg-violet-500",
    cellClass: "border-violet-200 bg-violet-50 text-violet-700",
  },

  HP: {
    label: "Present on Holiday",
    shortLabel: "HP",
    dotClass: "bg-green-400",
    cellClass: "border-green-200 bg-green-50 text-green-700",
  },


  H: {
    label: "Holiday",
    shortLabel: "H",
    dotClass: "bg-sky-400",
    cellClass: "border-sky-200 bg-sky-50 text-sky-700",
  },

  CO: {
    label: "Approved Leave (Comp Off)",
    shortLabel: "CO",
    dotClass: "bg-violet-400",
    cellClass: "border-violet-200 bg-violet-50 text-violet-700",
  },

  MPI: {
    label: "Missed Punch In",
    shortLabel: "MPI",
    dotClass: "bg-purple-600",
    cellClass: "border-purple-200 bg-purple-50 text-purple-700",
  },

  MPO: {
    label: "Missed Punch Out",
    shortLabel: "MPO",
    dotClass: "bg-fuchsia-500",
    cellClass: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  },
};

// Public report vocabulary; legacy device codes are resolved below.
Object.assign(ATTENDANCE_STATUS, {
  AL: { label: "Approved Leave", shortLabel: "AL", dotClass: "bg-slate-500", cellClass: "border-slate-300 bg-slate-100 text-slate-700" },
  L: { label: "Approved Leave", shortLabel: "L", dotClass: "bg-slate-500", cellClass: "border-slate-300 bg-slate-100 text-slate-700" },
  // Backend codes (see the backend's docs/API.md, "Day status codes")
  HOP: { label: "Present On Holiday", shortLabel: "HOP", dotClass: "bg-green-400", cellClass: "border-green-200 bg-green-50 text-green-700" },
  IP: { label: "In Progress", shortLabel: "IP", dotClass: "bg-blue-400", cellClass: "border-blue-200 bg-blue-50 text-blue-700" },
  LC: { label: "Late Entry", shortLabel: "LC", markerClass: "bg-orange-600", dotClass: "bg-orange-600", cellClass: "border-orange-200 bg-orange-50 text-orange-700" },
  EL: { label: "Early Leaving", shortLabel: "EL", markerClass: "bg-sky-600", dotClass: "bg-sky-600", cellClass: "border-sky-200 bg-sky-50 text-sky-700" },
  LE: { label: "Late Entry & Early Leaving", shortLabel: "LE", markerClass: "bg-violet-600", dotClass: "bg-violet-600", cellClass: "border-violet-200 bg-violet-50 text-violet-700" },
});
ATTENDANCE_STATUS.WO.label = "Week Off";
ATTENDANCE_STATUS.WOP.label = "Present On Week Off";

export const LEGEND_GROUPS = [
  { title: "Discipline", items: [["LC", "Late Entry"], ["EL", "Early Leaving"], ["LE", "Late Entry & Early Leaving"]] },
  { title: "Present", items: [["P", "Present"], ["HD", "Half Day"], ["WOP", "Present On Week Off"], ["HOP", "Present On Holiday"], ["WFH", "Work From Home"], ["IP", "In Progress (today)"]] },
  { title: "Off Days", items: [["H", "Holiday"], ["WO", "Week Off"]] },
  { title: "Leave", items: [["AL", "Approved Leave"], ["CO", "Comp Off"], ["UL", "Unapproved Leave"]] },
];
export const LEGEND_ITEMS = [...new Map(LEGEND_GROUPS.flatMap(group => group.items)).entries()];

const pad = (value) => String(value).padStart(2, "0");

export const normalizeDate = (date) => {
  const value = date instanceof Date ? new Date(date) : new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  value.setHours(0, 0, 0, 0);

  return value;
};

export const isValidDateKey = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const toDateKey = (date) => {
  const d = normalizeDate(date);

  if (!d) {
    return "";
  }

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const fromDateKey = (key) => {
  if (!isValidDateKey(key)) {
    return null;
  }

  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
};

export const addDays = (date, amount) => {
  const value = normalizeDate(date);

  if (!value) {
    return null;
  }

  value.setDate(value.getDate() + amount);

  return value;
};

export const getMonthRange = (date = new Date()) => ({
  start: new Date(date.getFullYear(), date.getMonth(), 1),

  end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
});

export const getDatesBetween = (start, end) => {
  const dates = [];

  let cursor = normalizeDate(start);

  const last = normalizeDate(end);

  if (!cursor || !last || cursor > last) {
    return dates;
  }

  while (cursor <= last) {
    dates.push(new Date(cursor));

    cursor = addDays(cursor, 1);
  }

  return dates;
};

export const isFullMonthRange = (start, end) => {
  const month = getMonthRange(start);

  return (
    toDateKey(start) === toDateKey(month.start) &&
    toDateKey(end) === toDateKey(month.end)
  );
};

const shiftDateToMonth = (date, amount) => {
  const first = new Date(date.getFullYear(), date.getMonth() + amount, 1);

  const lastDay = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0,
  ).getDate();

  return new Date(
    first.getFullYear(),
    first.getMonth(),
    Math.min(date.getDate(), lastDay),
  );
};

export const shiftDateRangeByMonths = (start, end, amount) => {
  if (isFullMonthRange(start, end)) {
    return getMonthRange(
      new Date(start.getFullYear(), start.getMonth() + amount, 1),
    );
  }

  return {
    start: shiftDateToMonth(start, amount),

    end: shiftDateToMonth(end, amount),
  };
};

// ============================================================
// FORMATTING
// ============================================================

export const formatMonthYear = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

export const formatDayLabel = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

export const formatWeekdayShort = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);

export const formatPeriodRange = (start, end) => {
  const startText = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(start);

  const endText = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(end);

  return `${startText} – ${endText}`;
};

export const formatRangeTitle = (start, end) =>
  isFullMonthRange(start, end)
    ? formatMonthYear(start)
    : formatPeriodRange(start, end);

export const formatMinutes = (minutes) => {
  if (minutes == null) {
    return "--";
  }

  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
};

export const REQUEST_TYPES = {
  LEAVE: "LEAVE",

  MISSED_PUNCH: "MISSED_PUNCH",

  WFH: "WFH",
};

export const REQUEST_STATUS = {
  PENDING: "PENDING",

  APPROVED: "APPROVED",

  REJECTED: "REJECTED",
};

export const to12HourTime = (value) => {
  if (!value || value === "--") {
    return "--";
  }

  if (/AM|PM/i.test(value)) {
    return value;
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const suffix = hours >= 12 ? "PM" : "AM";

  const hour = hours % 12 || 12;

  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )} ${suffix}`;
};

export const timeToMinutes = (value) => {
  const match = typeof value === "string"
    ? /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(value.trim())
    : null;
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3]?.toUpperCase();
  if (minutes > 59 || (suffix ? hours < 1 || hours > 12 : hours > 23)) return null;
  if (suffix === "PM" && hours !== 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

