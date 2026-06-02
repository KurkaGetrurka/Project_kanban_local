import React from "react";

// App keys and tiny shared utilities
export const STORAGE_KEY = "aesthetic-kanban-board-v5-fixed-timeline-drag";
export const LEGACY_KEYS = [
  "aesthetic-kanban-board-v4-no-tailwind-dark",
  "aesthetic-kanban-board-v3",
  "aesthetic-kanban-board-v2",
  "aesthetic-kanban-board-v1",
];

export const uid = () => Math.random().toString(36).slice(2, 10);
export const cx = (...classes) => classes.filter(Boolean).join(" ");
export const safeStorageGetItem = (key) => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
export const safeStorageSetItem = (key, value) => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

// Board defaults
export const defaultColumns = [
  { id: "todo", title: "Do zrobienia", accent: "from-rose-400 to-pink-500" },
  { id: "doing", title: "W trakcie", accent: "from-amber-400 to-orange-500" },
  { id: "review", title: "Do sprawdzenia", accent: "from-sky-400 to-cyan-500" },
  { id: "done", title: "Gotowe", accent: "from-emerald-400 to-teal-500" },
];

export const defaultDashboardOrder = ["progress", "today", "calendar", "taskProgress", "actions", "timeline"];
export const dashboardLabels = {
  progress: "Post\u0119p projektu",
  today: "Dzisiejsze zadania",
  calendar: "Kalendarz",
  taskProgress: "Post\u0119p zada\u0144",
  actions: "Panel sterowania",
  timeline: "O\u015b czasu zada\u0144",
};
export const dashboardSizeOptions = ["normal", "wide", "large", "full"];
export const dashboardSizeLabels = { normal: "Normalny", wide: "Szerszy", large: "Du\u017cy", full: "Pe\u0142ny" };
export const dashboardSizeClasses = {
  normal: "lg:col-span-2",
  wide: "lg:col-span-3",
  large: "lg:col-span-4",
  full: "lg:col-span-6",
};
export const defaultDashboardSizes = {
  progress: "normal",
  today: "normal",
  calendar: "normal",
  taskProgress: "normal",
  actions: "normal",
  timeline: "normal",
};

function createDefaultTasks() {
  const baseCreatedAt = Date.now();
  return [
    {
      id: uid(),
      columnId: "todo",
      title: "Wprowadzi\u0107 pierwsze zadanie",
      description: "Kliknij kart\u0119, aby uzupe\u0142ni\u0107 szczeg\u00f3\u0142y. Lista podzada\u0144 jest widoczna r\u00f3wnie\u017c na kafelku zadania.",
      labels: [{ id: uid(), text: "start", color: "pink" }],
      dueDate: "2026-06-02",
      priority: "medium",
      subtasks: [
        { id: uid(), text: "Otworzy\u0107 kart\u0119", done: true },
        { id: uid(), text: "Zmieni\u0107 tre\u015b\u0107", done: false },
      ],
      createdAt: baseCreatedAt,
    },
    {
      id: uid(),
      columnId: "doing",
      title: "Dopracowa\u0107 pulpit projektu",
      description: "Uporz\u0105dkowa\u0107 kafelki informacyjne, kalendarz, o\u015b czasu oraz wykres post\u0119pu projektu.",
      labels: [{ id: uid(), text: "projekt", color: "blue" }],
      dueDate: "2026-06-06",
      priority: "high",
      subtasks: [
        { id: uid(), text: "Dostosowa\u0107 mini kalendarz", done: true },
        { id: uid(), text: "Uzupe\u0142ni\u0107 wykres post\u0119pu projektu", done: false },
        { id: uid(), text: "Dopracowa\u0107 o\u015b czasu zada\u0144", done: false },
      ],
      createdAt: baseCreatedAt + 1,
    },
  ];
}
export const defaultTasks = createDefaultTasks();
export const defaultBoardState = {
  columns: defaultColumns,
  tasks: defaultTasks,
  darkMode: true,
  fontScale: 100,
  dashboardOrder: defaultDashboardOrder,
  dashboardSizes: defaultDashboardSizes,
  activeSection: "info",
};

// Visual theme tokens
export const theme = {
  light: {
    app: "bg-[radial-gradient(circle_at_top_left,_#fbcfe8,_transparent_32%),radial-gradient(circle_at_top_right,_#bfdbfe,_transparent_30%),linear-gradient(135deg,_#fff7ed,_#f8fafc_45%,_#eef2ff)] text-slate-900",
    card: "border-white/70 bg-white/70 shadow-slate-200/50",
    cardSolid: "border-white/70 bg-white shadow-slate-200/60",
    subtle: "bg-slate-50 text-slate-500",
    input: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
    inputSolid: "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
    textMuted: "text-slate-500",
    textSoft: "text-slate-400",
    border: "border-slate-200",
    chip: "bg-white/80 ring-slate-100 text-slate-600",
    buttonPrimary: "bg-slate-950 text-white shadow-slate-300",
    buttonSoft: "border-slate-200 bg-white/80 text-slate-700 hover:bg-white",
    emptyDay: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    taskCard: "border-white/70 bg-white shadow-slate-200/70",
    modal: "border-white/70 bg-white",
    overlay: "bg-slate-950/50",
    progressTrack: "bg-slate-100",
    progressCircleTrack: "rgba(148, 163, 184, 0.32)",
    miniTrack: "bg-slate-100/70",
    ringOffset: "ring-offset-white",
    actionPrimary: "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500 text-white shadow-violet-300/40 hover:brightness-110",
    actionSecondary: "border-slate-200 bg-slate-100/80 text-slate-700 hover:bg-slate-200/80",
    hoverSoft: "hover:bg-slate-100/80",
    divider: "border-slate-200",
    imageBorder: "border-slate-200",
    dangerButton: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
    successButton: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    iconDanger: "text-slate-500 hover:bg-rose-50 hover:text-rose-600",
  },
  dark: {
    app: "bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,.20),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_55%,_#18181b)] text-slate-100",
    card: "border-white/10 bg-slate-950/45 shadow-black/30",
    cardSolid: "border-white/10 bg-slate-900 shadow-black/30",
    subtle: "bg-white/5 text-slate-400",
    input: "border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500",
    inputSolid: "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500",
    textMuted: "text-slate-300",
    textSoft: "text-slate-500",
    border: "border-white/10",
    chip: "bg-white/10 ring-white/10 text-slate-200",
    buttonPrimary: "bg-white text-slate-950 shadow-black/30",
    buttonSoft: "border-white/10 bg-white/10 text-slate-100 hover:bg-white/15",
    emptyDay: "bg-white/10 text-slate-300 hover:bg-white/15",
    taskCard: "border-white/10 bg-slate-900 shadow-black/30",
    modal: "border-white/10 bg-slate-950",
    overlay: "bg-slate-950/70",
    progressTrack: "bg-white/10",
    progressCircleTrack: "rgba(139, 92, 246, 0.18)",
    miniTrack: "bg-white/5",
    ringOffset: "ring-offset-slate-950",
    actionPrimary: "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500 text-white shadow-violet-950/40 hover:brightness-110",
    actionSecondary: "border-white/10 bg-slate-800/80 text-slate-100 hover:bg-slate-700/80",
    hoverSoft: "hover:bg-white/10",
    divider: "border-white/10",
    imageBorder: "border-white/10",
    dangerButton: "border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20",
    successButton: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20",
    iconDanger: "text-slate-400 hover:bg-rose-500/15 hover:text-rose-200",
  },
};

// Labels and task priority
export const labelThemes = {
  pink: "bg-pink-100 text-pink-700 ring-pink-200",
  violet: "bg-violet-100 text-violet-700 ring-violet-200",
  blue: "bg-sky-100 text-sky-700 ring-sky-200",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  gray: "bg-slate-100 text-slate-700 ring-slate-200",
};
export const labelThemesDark = {
  pink: "bg-pink-500/15 text-pink-200 ring-pink-400/30",
  violet: "bg-violet-500/15 text-violet-200 ring-violet-400/30",
  blue: "bg-sky-500/15 text-sky-200 ring-sky-400/30",
  green: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
  amber: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  gray: "bg-slate-700/50 text-slate-200 ring-slate-500/40",
};
export const labelSwatches = {
  pink: "bg-gradient-to-br from-pink-300 via-pink-500 to-rose-600 shadow-pink-300/50",
  violet: "bg-gradient-to-br from-violet-300 via-violet-500 to-purple-700 shadow-violet-300/50",
  blue: "bg-gradient-to-br from-sky-300 via-sky-500 to-blue-700 shadow-sky-300/50",
  green: "bg-gradient-to-br from-emerald-300 via-emerald-500 to-teal-700 shadow-emerald-300/50",
  amber: "bg-gradient-to-br from-amber-200 via-amber-400 to-orange-600 shadow-amber-300/50",
  gray: "bg-gradient-to-br from-slate-300 via-slate-500 to-slate-700 shadow-slate-300/50",
};
export const labelSwatchesDark = {
  pink: "bg-gradient-to-br from-pink-300 via-pink-500 to-rose-600 shadow-pink-500/35",
  violet: "bg-gradient-to-br from-violet-300 via-violet-500 to-purple-700 shadow-violet-500/35",
  blue: "bg-gradient-to-br from-sky-300 via-sky-500 to-blue-700 shadow-sky-500/35",
  green: "bg-gradient-to-br from-emerald-300 via-emerald-500 to-teal-700 shadow-emerald-500/35",
  amber: "bg-gradient-to-br from-amber-200 via-amber-400 to-orange-600 shadow-amber-500/35",
  gray: "bg-gradient-to-br from-slate-300 via-slate-500 to-slate-700 shadow-slate-500/35",
};

export const priorityOptions = [
  { id: "low", title: "Niski", light: "bg-emerald-100 text-emerald-700 ring-emerald-200", dark: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30" },
  { id: "medium", title: "\u015aredni", light: "bg-sky-100 text-sky-700 ring-sky-200", dark: "bg-sky-500/15 text-sky-200 ring-sky-400/30" },
  { id: "high", title: "Wysoki", light: "bg-amber-100 text-amber-800 ring-amber-200", dark: "bg-amber-500/15 text-amber-200 ring-amber-400/30" },
  { id: "urgent", title: "Pilny", light: "bg-rose-100 text-rose-700 ring-rose-200", dark: "bg-rose-500/15 text-rose-200 ring-rose-400/30" },
];

export function normalizeTaskPriority(value) {
  return priorityOptions.some((item) => item.id === value) ? value : "medium";
}
export function priorityMeta(priority) {
  return priorityOptions.find((item) => item.id === normalizeTaskPriority(priority)) || priorityOptions[1];
}
export function priorityChipClass(priority, isDark) {
  const meta = priorityMeta(priority);
  return isDark ? meta.dark : meta.light;
}
export function PriorityToggleGroup({ value, onChange, isDark, compact = false }) {
  return (
    <div className={cx("grid w-full grid-cols-2", compact ? "gap-1.5 sm:grid-cols-2" : "gap-2 sm:grid-cols-4") }>
      {priorityOptions.map((priority) => {
        const isActive = normalizeTaskPriority(value) === priority.id;
        return (
          <button
            key={priority.id}
            type="button"
            onClick={() => onChange(priority.id)}
            className={cx(
              "min-w-0 rounded-2xl px-2 py-2 text-center text-[11px] font-black leading-tight ring-1 transition hover:-translate-y-0.5",
              compact ? "min-h-[40px]" : "min-h-[44px]",
              isActive
                ? cx(priorityChipClass(priority.id, isDark), "shadow-sm")
                : isDark
                  ? "bg-white/5 text-slate-300 ring-white/10 hover:bg-white/10 hover:ring-violet-300/35"
                  : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:ring-violet-300"
            )}
            aria-pressed={isActive}
            title={`Ustaw priorytet: ${priority.title}`}
          >
            {priority.title}
          </button>
        );
      })}
    </div>
  );
}

export function normalizeDashboardOrder(order) {
  if (!Array.isArray(order)) return defaultDashboardOrder;
  const known = order.filter((item) => defaultDashboardOrder.includes(item));
  const missing = defaultDashboardOrder.filter((item) => !known.includes(item));
  return [...known, ...missing];
}
export function normalizeDashboardSizes(sizes) {
  return defaultDashboardOrder.reduce((acc, id) => {
    acc[id] = dashboardSizeOptions.includes(sizes?.[id]) ? sizes[id] : defaultDashboardSizes[id];
    return acc;
  }, {});
}
export function normalizeActiveSection(section) {
  return section === "tasks" || section === "help" ? section : "info";
}
export function dashboardSpanClass(size) {
  return dashboardSizeClasses[size] || dashboardSizeClasses.normal;
}
export function reorderDashboardOrder(order, draggedId, targetId, placement = "before") {
  const normalized = normalizeDashboardOrder(order);
  if (draggedId === targetId) return normalized;
  const withoutDragged = normalized.filter((item) => item !== draggedId);
  const targetIndex = withoutDragged.indexOf(targetId);
  if (targetIndex < 0) return normalized;
  withoutDragged.splice(placement === "after" ? targetIndex + 1 : targetIndex, 0, draggedId);
  return normalizeDashboardOrder(withoutDragged);
}
export function clampFontScale(value) {
  return Math.max(85, Math.min(120, Number(value) || 100));
}
export function fontScaleMultiplier(value) {
  return clampFontScale(value) / 100;
}
export function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
// Timeline and calendar helpers
export const timelineViewPresets = {
  week: { label: "Tydzie\u0144", days: 7, unitLabel: "Dni", unit: "day" },
  month: { label: "Miesi\u0105c", days: 31, unitLabel: "Dni miesi\u0105ca", unit: "monthDay" },
  quarter: { label: "Kwarta\u0142", days: 92, unitLabel: "Tygodnie", unit: "week" },
  year: { label: "Rok", days: 365, unitLabel: "Miesi\u0105ce", unit: "month" },
};
export function normalizeTimelineView(value) {
  return timelineViewPresets[value] ? value : "month";
}
export function buildTimelineAxisTicks(start, preset) {
  const ticks = [];
  const base = new Date(start);
  base.setHours(12, 0, 0, 0);

  if (preset.unit === "day") {
    for (let index = 0; index < 7; index += 1) {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      ticks.push({ date, label: date.toLocaleDateString("pl-PL", { weekday: "long" }), sublabel: date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }) });
    }
    return ticks;
  }

  if (preset.unit === "monthDay") {
    for (let index = 0; index < 31; index += 1) {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      ticks.push({ date, label: String(date.getDate()), sublabel: date.toLocaleDateString("pl-PL", { month: "short" }) });
    }
    return ticks;
  }

  if (preset.unit === "week") {
    for (let index = 0; index < 13; index += 1) {
      const date = new Date(base);
      date.setDate(base.getDate() + index * 7);
      ticks.push({ date, label: `T${index + 1}`, sublabel: date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }) });
    }
    return ticks;
  }

  for (let index = 0; index < 12; index += 1) {
    const date = new Date(base);
    date.setMonth(base.getMonth() + index);
    ticks.push({ date, label: date.toLocaleDateString("pl-PL", { month: "short" }), sublabel: String(date.getFullYear()) });
  }
  return ticks;
}
// Core board value helpers
export function snapDateToAxisTicks(date, axisTicks) {
  if (!date || !axisTicks?.length) return date ? dateKey(date) : null;
  const time = date.getTime();
  const nearest = axisTicks.reduce((closest, tick) => {
    const distance = Math.abs(tick.date.getTime() - time);
    return !closest || distance < closest.distance ? { date: tick.date, distance } : closest;
  }, null);
  return nearest?.date ? dateKey(nearest.date) : dateKey(date);
}
export function snapDateToDateTicks(date, dateTicks) {
  if (!date || !dateTicks?.length) return null;
  const time = date.getTime();
  return dateTicks.reduce((closest, tick) => {
    const distance = Math.abs(tick.getTime() - time);
    return !closest || distance < closest.distance ? { date: tick, distance } : closest;
  }, null)?.date || null;
}
export function parseLocalDate(dateString) {
  if (!dateString) return null;
  return new Date(`${dateString}T12:00:00`);
}
export function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export function timelinePointerToDate(clientX, rect, rangeStart, rangeMs, offsetMs = 0) {
  if (!rect || !rangeMs) return null;
  const ratio = clampNumber((clientX - rect.left) / rect.width, 0, 1);
  const minTime = rangeStart.getTime();
  const maxTime = rangeStart.getTime() + rangeMs;
  const date = new Date(clampNumber(minTime + rangeMs * ratio + offsetMs, minTime, maxTime));
  date.setHours(12, 0, 0, 0);
  return date;
}
export function dateFromTimelinePointer(clientX, rect, rangeStart, rangeMs) {
  const date = timelinePointerToDate(clientX, rect, rangeStart, rangeMs);
  return date ? dateKey(date) : null;
}
export function dateFromTimelinePointerWithOffset(clientX, rect, rangeStart, rangeMs, offsetMs = 0) {
  const date = timelinePointerToDate(clientX, rect, rangeStart, rangeMs, offsetMs);
  return date ? dateKey(date) : null;
}
export function dateFromTimelineDragDelta(startClientX, currentClientX, rect, originalDate, rangeStart, rangeMs) {
  if (!rect || !originalDate || !rangeMs) return null;
  const deltaRatio = (currentClientX - startClientX) / rect.width;
  const minTime = rangeStart.getTime();
  const maxTime = rangeStart.getTime() + rangeMs;
  const nextTime = clampNumber(originalDate.getTime() + rangeMs * deltaRatio, minTime, maxTime);
  const date = new Date(nextTime);
  date.setHours(12, 0, 0, 0);
  return dateKey(date);
}
export function formatDate(dateString, options = { day: "2-digit", month: "short" }) {
  const date = parseLocalDate(dateString);
  return date ? date.toLocaleDateString("pl-PL", options) : "";
}
export function progressOf(task) {
  if (!task.subtasks?.length) return 0;
  return Math.round((task.subtasks.filter((item) => item.done).length / task.subtasks.length) * 100);
}
export function monthLabel(date) {
  return date.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
}
export function buildMonthDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, key: dateKey(date), inCurrentMonth: date.getMonth() === month, isToday: dateKey(date) === dateKey(new Date()) };
  });
}
export function taskTitlesForTooltip(tasks) {
  return tasks.map((task) => task.title).join("\n");
}
export function emptyDraft(columnId = "todo") {
  return { id: uid(), columnId, title: "", description: "", labels: [], subtasks: [], dueDate: "", priority: "medium", images: [], createdAt: Date.now() };
}
export function getTaskImages(task) {
  const images = Array.isArray(task?.images) ? task.images : [];
  const legacyImage = task?.image?.dataUrl ? [task.image] : [];
  const merged = [...images, ...legacyImage].filter((image) => image?.dataUrl);
  const seen = new Set();
  return merged.filter((image) => {
    const key = image.id || image.dataUrl;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export function selectOptionStyle(t) {
  return t === theme.dark ? { backgroundColor: "#0f172a", color: "#f8fafc" } : { backgroundColor: "#ffffff", color: "#0f172a" };
}
export function columnForTask(task, columns = defaultColumns) {
  return (Array.isArray(columns) ? columns : defaultColumns).find((column) => column.id === task?.columnId) || defaultColumns[0];
}
export function stageGradientForTask(task, columns = defaultColumns) {
  return columnForTask(task, columns)?.accent || "from-slate-400 to-slate-600";
}
export function stageTitleForTask(task, columns = defaultColumns) {
  return columnForTask(task, columns)?.title || "Bez etapu";
}

// Analytics helpers
export function buildProjectHealthTrend(tasks, columns = defaultColumns) {
  const allTasks = Array.isArray(tasks) ? tasks : [];
  const safeColumns = Array.isArray(columns) && columns.length ? columns : defaultColumns;
  const today = new Date();
  const year = today.getFullYear();
  const months = Array.from({ length: 12 }, (_, monthIndex) => {
    const date = new Date(year, monthIndex, 1);
    date.setHours(12, 0, 0, 0);
    return date;
  });

  return months.map((monthDate) => {
    const periodStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    periodEnd.setHours(23, 59, 59, 999);

    const monthlyTasks = allTasks.filter((task) => {
      const due = parseLocalDate(task.dueDate);
      if (!due) return false;
      due.setHours(12, 0, 0, 0);
      return due >= periodStart && due <= periodEnd;
    });

    const completedTasks = monthlyTasks.filter((task) => task.columnId === "done" || Boolean(task.archivedAt)).length;
    const overdueTasks = monthlyTasks.filter((task) => {
      if (!task.dueDate || task.columnId === "done" || task.archivedAt) return false;
      const due = parseLocalDate(task.dueDate);
      if (!due) return false;
      due.setHours(0, 0, 0, 0);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return due < now;
    }).length;

    const stageCounts = safeColumns.map((column) => ({
      id: column.id,
      title: column.title,
      accent: column.accent,
      count: monthlyTasks.filter((task) => task.columnId === column.id).length,
    }));

    const averageProgress = monthlyTasks.length
      ? Math.round(monthlyTasks.reduce((sum, task) => sum + progressOf(task), 0) / monthlyTasks.length)
      : 0;
    const completedPercent = monthlyTasks.length ? Math.round((completedTasks / monthlyTasks.length) * 100) : 0;
    const overduePenalty = monthlyTasks.length ? Math.min(30, Math.round((overdueTasks / monthlyTasks.length) * 30)) : 0;
    const score = monthlyTasks.length ? clampNumber(Math.round(averageProgress * 0.55 + completedPercent * 0.45 - overduePenalty), 0, 100) : 0;
    const monthNumber = String(monthDate.getMonth() + 1).padStart(2, "0");

    return {
      key: `${year}-${monthNumber}`,
      label: monthDate.toLocaleDateString("pl-PL", { month: "short" }),
      sublabel: String(year),
      score,
      completed: completedTasks,
      overdue: overdueTasks,
      total: monthlyTasks.length,
      stageCounts,
    };
  });
}

export function buildPerformanceStats(tasks, columns) {
  const allTasks = Array.isArray(tasks) ? tasks : [];
  const activeTasks = allTasks.filter((task) => !task.archivedAt);
  const archivedTasks = allTasks.filter((task) => task.archivedAt);
  const doneTasks = allTasks.filter((task) => task.columnId === "done");
  const allSubtasks = allTasks.flatMap((task) => task.subtasks || []);
  const completedSubtasks = allSubtasks.filter((item) => item.done).length;
  const averageProgress = allTasks.length ? Math.round(allTasks.reduce((sum, task) => sum + progressOf(task), 0) / allTasks.length) : 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inSevenDays = new Date(today);
  inSevenDays.setDate(today.getDate() + 7);
  const datedTasks = allTasks.filter((task) => task.dueDate);
  const overdueTasks = datedTasks.filter((task) => {
    const due = parseLocalDate(task.dueDate);
    if (!due) return false;
    due.setHours(0, 0, 0, 0);
    return due < today && task.columnId !== "done" && !task.archivedAt;
  });
  const nextSevenDaysTasks = datedTasks.filter((task) => {
    const due = parseLocalDate(task.dueDate);
    if (!due) return false;
    due.setHours(0, 0, 0, 0);
    return due >= today && due <= inSevenDays && !task.archivedAt;
  });
  const archivedDurations = archivedTasks
    .map((task) => task.createdAt && task.archivedAt ? Math.max(0, Math.round((task.archivedAt - task.createdAt) / 86400000)) : null)
    .filter((value) => value !== null);
  const averageArchiveDays = archivedDurations.length ? Math.round(archivedDurations.reduce((sum, value) => sum + value, 0) / archivedDurations.length) : null;
  const healthTrend = buildProjectHealthTrend(allTasks, columns);
  const columnBreakdown = columns.map((column) => {
    const related = allTasks.filter((task) => task.columnId === column.id);
    const active = related.filter((task) => !task.archivedAt).length;
    const archived = related.filter((task) => task.archivedAt).length;
    const percent = allTasks.length ? Math.round((related.length / allTasks.length) * 100) : 0;
    return { ...column, total: related.length, active, archived, percent };
  });
  const archivedPercent = allTasks.length ? Math.round((archivedTasks.length / allTasks.length) * 100) : 0;
  const donePercent = allTasks.length ? Math.round((doneTasks.length / allTasks.length) * 100) : 0;
  const subtaskPercent = allSubtasks.length ? Math.round((completedSubtasks / allSubtasks.length) * 100) : 0;
  return {
    total: allTasks.length,
    active: activeTasks.length,
    archived: archivedTasks.length,
    archivedPercent,
    done: doneTasks.length,
    donePercent,
    averageProgress,
    subtasks: allSubtasks.length,
    completedSubtasks,
    subtaskPercent,
    overdue: overdueTasks.length,
    nextSevenDays: nextSevenDaysTasks.length,
    averageArchiveDays,
    healthTrend,
    columnBreakdown,
  };
}
// Filtering and search helpers
export function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
export function coerceSearchDate(value) {
  if (!value) return null;
  const date = typeof value === "string" && value.length === 10 && value[4] === "-" && value[7] === "-" ? parseLocalDate(value) : new Date(value);
  return date && !Number.isNaN(date.getTime()) ? date : null;
}
export function startOfSearchDay(value) {
  const date = coerceSearchDate(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}
export function endOfSearchDay(value) {
  const date = coerceSearchDate(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}
export function buildDateSearchVariants(value) {
  const date = coerceSearchDate(value);
  if (!date) return [];
  return [
    dateKey(date),
    date.toLocaleDateString("pl-PL"),
    date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }),
    date.toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" }),
    date.toLocaleDateString("pl-PL", { month: "long", year: "numeric" }),
  ];
}
export function taskMatchesArchiveDateRange(task, dateFilters = {}) {
  const from = startOfSearchDay(dateFilters.from);
  const to = endOfSearchDay(dateFilters.to);
  if (!from && !to) return true;

  const mode = dateFilters.mode || "any";
  const dueDate = task.dueDate ? coerceSearchDate(task.dueDate) : null;
  const archivedDate = task.archivedAt ? coerceSearchDate(task.archivedAt) : null;
  const candidates = mode === "due" ? [dueDate] : mode === "archived" ? [archivedDate] : [dueDate, archivedDate];

  return candidates.some((date) => date && (!from || date >= from) && (!to || date <= to));
}
export function filterArchivedTasks(tasks, query, dateFilters = {}) {
  const search = normalizeSearchText(query);
  return (Array.isArray(tasks) ? tasks : []).filter((task) => {
    const dueDateVariants = buildDateSearchVariants(task.dueDate);
    const archivedDateVariants = buildDateSearchVariants(task.archivedAt);
    const text = normalizeSearchText([
      task.title,
      task.description,
      task.dueDate,
      ...dueDateVariants,
      ...archivedDateVariants,
      task.columnId,
      ...(task.labels || []).map((label) => label.text),
      ...(task.subtasks || []).map((item) => item.text),
    ].join(" "));
    const matchesText = !search || text.includes(search);
    return matchesText && taskMatchesArchiveDateRange(task, dateFilters);
  });
}
export function taskMatchesTaskBoardFilters(task, filters = {}) {
  const search = normalizeSearchText(filters.search);
  const labelQuery = normalizeSearchText(filters.labelQuery);
  const priority = filters.priority || "all";
  const from = startOfSearchDay(filters.from);
  const to = endOfSearchDay(filters.to);
  const dueDate = task.dueDate ? coerceSearchDate(task.dueDate) : null;
  const searchableText = normalizeSearchText([
    task.title,
    task.description,
    task.dueDate,
    priorityMeta(task.priority).title,
    ...buildDateSearchVariants(task.dueDate),
    ...(task.labels || []).map((label) => label.text),
    ...(task.subtasks || []).map((item) => item.text),
  ].join(" "));
  const normalizedLabels = normalizeSearchText((task.labels || []).map((label) => label.text).join(" "));
  const matchesSearch = !search || searchableText.includes(search);
  const matchesLabel = !labelQuery || normalizedLabels.includes(labelQuery);
  const matchesPriority = priority === "all" ? true : normalizeTaskPriority(task.priority) === priority;
  const matchesDate = (!from && !to) ? true : Boolean(dueDate && (!from || dueDate >= from) && (!to || dueDate <= to));
  return matchesSearch && matchesLabel && matchesPriority && matchesDate;
}
export function filterTaskBoardTasks(tasks, filters = {}) {
  return (Array.isArray(tasks) ? tasks : []).filter((task) => taskMatchesTaskBoardFilters(task, filters));
}
export function buildTaskImageGallery(tasks) {
  return (Array.isArray(tasks) ? tasks : []).flatMap((task) =>
    getTaskImages(task).map((image, index) => ({
      id: `${task.id}-${image.id || index}`,
      taskId: task.id,
      title: task.title || "Bez nazwy",
      description: task.description || "",
      dueDate: task.dueDate || "",
      columnId: task.columnId,
      archivedAt: task.archivedAt,
      image,
      imageIndex: index,
      imageCount: getTaskImages(task).length,
    }))
  );
}
// Files, storage, import and export
export function readImageAttachment(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("To nie jest plik obrazu."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nie uda\u0142o si\u0119 odczyta\u0107 obrazu."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Nie uda\u0142o si\u0119 przygotowa\u0107 podgl\u0105du obrazu."));
      img.onload = () => {
        const maxSide = 1200;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, width, height);
        resolve({ id: uid(), name: file.name, type: "image/jpeg", dataUrl: canvas.toDataURL("image/jpeg", 0.82), width, height });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
export function loadInitialState() {
  const fallback = defaultBoardState;
  if (typeof window === "undefined") return fallback;
  const raw = safeStorageGetItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return normalizeImportedState(parsed, fallback);
    } catch {
      return fallback;
    }
  }
  for (const key of LEGACY_KEYS) {
    const legacyRaw = safeStorageGetItem(key);
    if (!legacyRaw) continue;
    try {
      const legacy = JSON.parse(legacyRaw);
      return normalizeImportedState(legacy, fallback);
    } catch {
      return fallback;
    }
  }
  return fallback;
}
// Import normalization helpers
export function getImportSource(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed.data && typeof parsed.data === "object") return parsed.data;
  if (parsed.state && typeof parsed.state === "object") return parsed.state;
  if (parsed.board && typeof parsed.board === "object") return parsed.board;
  return parsed;
}

export function normalizeTaskForImport(task, index = 0) {
  const safeTask = task && typeof task === "object" ? task : {};
  const safeColumnId = typeof safeTask.columnId === "string" && safeTask.columnId.trim() ? safeTask.columnId : "todo";
  const safeLabels = Array.isArray(safeTask.labels) ? safeTask.labels : [];
  const safeSubtasks = Array.isArray(safeTask.subtasks) ? safeTask.subtasks : [];

  return {
    ...safeTask,
    id: safeTask.id || uid(),
    columnId: safeColumnId,
    title: String(safeTask.title || `Zadanie ${index + 1}`),
    description: String(safeTask.description || ""),
    labels: safeLabels.map((label) => ({
      id: label?.id || uid(),
      text: String(label?.text || ""),
      color: label?.color || "gray",
    })),
    subtasks: safeSubtasks.map((item) => ({
      id: item?.id || uid(),
      text: String(item?.text || ""),
      done: Boolean(item?.done),
    })),
    dueDate: typeof safeTask.dueDate === "string" ? safeTask.dueDate : "",
    priority: normalizeTaskPriority(safeTask.priority),
    images: getTaskImages(safeTask),
    image: undefined,
    createdAt: Number(safeTask.createdAt) || Date.now(),
    archivedAt: safeTask.archivedAt ? Number(safeTask.archivedAt) : undefined,
  };
}

export function normalizeImportedColumns(importedColumns, fallbackColumns = defaultColumns) {
  const baseColumns = Array.isArray(fallbackColumns) && fallbackColumns.length ? fallbackColumns : defaultColumns;
  const candidateColumns = Array.isArray(importedColumns) && importedColumns.length ? importedColumns : baseColumns;
  const normalized = candidateColumns.map((column, index) => ({
    id: typeof column?.id === "string" && column.id.trim() ? column.id : baseColumns[index]?.id || `column-${index + 1}`,
    title: typeof column?.title === "string" && column.title.trim() ? column.title : baseColumns[index]?.title || `Kolumna ${index + 1}`,
    accent: typeof column?.accent === "string" && column.accent.trim() ? column.accent : baseColumns[index]?.accent || "from-slate-400 to-slate-600",
  }));

  return normalized.length ? normalized : defaultColumns;
}

export function normalizeImportedState(parsed, fallback = defaultBoardState) {
  const source = getImportSource(parsed);
  const importedTasks = Array.isArray(source) ? source : Array.isArray(source?.tasks) ? source.tasks : null;
  const importedColumns = normalizeImportedColumns(source?.columns, fallback.columns);
  const knownColumnIds = new Set(importedColumns.map((column) => column.id));
  const normalizedTasks = importedTasks
    ? importedTasks.map(normalizeTaskForImport).map((task) => ({
        ...task,
        columnId: knownColumnIds.has(task.columnId) ? task.columnId : importedColumns[0]?.id || "todo",
      }))
    : fallback.tasks;

  return {
    columns: importedColumns,
    tasks: normalizedTasks,
    darkMode: typeof source?.darkMode === "boolean" ? source.darkMode : fallback.darkMode,
    fontScale: clampFontScale(typeof source?.fontScale === "number" ? source.fontScale : fallback.fontScale),
    dashboardOrder: normalizeDashboardOrder(source?.dashboardOrder || fallback.dashboardOrder),
    dashboardSizes: normalizeDashboardSizes(source?.dashboardSizes || fallback.dashboardSizes),
    activeSection: normalizeActiveSection(source?.activeSection || fallback.activeSection),
  };
}

// Backup file helpers
export function buildBackupPayload(state) {
  return {
    app: "Aesthetic Kanban Board",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
}

export function parseBackupText(text) {
  const raw = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!raw) throw new Error("Nie podano tre\u015bci kopii zapasowej.");

  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("Nie uda\u0142o si\u0119 odczyta\u0107 pliku JSON. Sprawd\u017a, czy wklejona tre\u015b\u0107 pochodzi z eksportu tej aplikacji.");
  }
}

export function hasImportableKanbanData(parsed) {
  const source = getImportSource(parsed);
  return Boolean(source && (Array.isArray(source) || Array.isArray(source.tasks)));
}

export function countImportableTasks(parsed) {
  const source = getImportSource(parsed);
  if (Array.isArray(source)) return source.length;
  if (Array.isArray(source?.tasks)) return source.tasks.length;
  return 0;
}

export function readTextFile(file) {
  if (!file) return Promise.resolve("");
  if (typeof file.text === "function") return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nie uda\u0142o si\u0119 odczyta\u0107 pliku."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(file, "utf-8");
  });
}
export async function downloadTextFile(filename, text, mimeType = "application/json") {
  if (typeof window === "undefined" || typeof document === "undefined") return { ok: false, reason: "no-browser" };

  const safeFileName = filename || "kanban-kopia.json";
  const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });

  if (typeof window.showSaveFilePicker === "function") {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: safeFileName,
        types: [
          {
            description: "Kopia zapasowa Kanban JSON",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { ok: true, method: "file-picker" };
    } catch (error) {
      if (error?.name === "AbortError") return { ok: false, reason: "cancelled" };
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeFileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.position = "fixed";
    link.style.left = "-9999px";
    link.style.top = "-9999px";
    document.body.appendChild(link);

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    link.dispatchEvent(clickEvent);

    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1500);

    return { ok: true, method: "download-link" };
  } catch (error) {
    return { ok: false, reason: error?.message || "blocked" };
  }
}
export function backupFileName() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `kanban-kopia-${stamp}.json`;
}
export function runSelfTests() {
  console.assert(buildMonthDays(new Date(2026, 1, 1)).length === 42, "Calendar should render 42 cells.");
  console.assert(dateKey(new Date(2026, 0, 5)) === "2026-01-05", "dateKey should pad values.");
  console.assert(clampNumber(12, 0, 10) === 10, "clampNumber should clamp max.");
  console.assert(clampNumber(-2, 0, 10) === 0, "clampNumber should clamp min.");
  console.assert(normalizeTimelineView("year") === "year", "Timeline view should accept year.");
  console.assert(normalizeTimelineView("banana") === "month", "Timeline view should fallback to month.");
  console.assert(buildTimelineAxisTicks(new Date("2026-01-01T12:00:00"), timelineViewPresets.week).length === 7, "Week view should show 7 day ticks.");
  console.assert(buildTimelineAxisTicks(new Date("2026-01-01T12:00:00"), timelineViewPresets.week)[0].label === new Date("2026-01-01T12:00:00").toLocaleDateString("pl-PL", { weekday: "long" }), "Week view should show weekday names.");
  console.assert(buildTimelineAxisTicks(new Date("2026-01-01T12:00:00"), timelineViewPresets.month).length === 31, "Month view should show 31 day ticks.");
  console.assert(buildTimelineAxisTicks(new Date("2026-01-25T12:00:00"), timelineViewPresets.month)[0].label === "25", "Month view should show real calendar day number.");
  console.assert(snapDateToAxisTicks(new Date("2026-01-02T18:00:00"), buildTimelineAxisTicks(new Date("2026-01-01T12:00:00"), timelineViewPresets.month)) === "2026-01-02", "Timeline marker should snap to nearest day tick.");
  console.assert(snapDateToAxisTicks(new Date("2026-01-10T12:00:00"), buildTimelineAxisTicks(new Date("2026-01-01T12:00:00"), timelineViewPresets.quarter)) === "2026-01-08", "Quarter view should snap to nearest week tick.");
  console.assert(dateKey(snapDateToDateTicks(new Date("2026-05-28T12:00:00"), [new Date("2026-05-27T12:00:00"), new Date("2026-05-29T12:00:00")])) === "2026-05-27", "Mini timeline should snap task marker to nearest visible date tick.");
  console.assert(stageGradientForTask({ columnId: "doing" }, defaultColumns).includes("amber"), "Calendar stage color should follow task column accent.");
  console.assert(snapDateToDateTicks(null, [new Date("2026-05-27T12:00:00")]) === null, "Mini timeline snap should handle empty date.");
  console.assert(buildTimelineAxisTicks(new Date("2026-01-01T12:00:00"), timelineViewPresets.quarter).length === 13, "Quarter view should show 13 week ticks.");
  console.assert(buildTimelineAxisTicks(new Date("2026-01-01T12:00:00"), timelineViewPresets.year).length === 12, "Year view should show 12 month ticks.");
  console.assert(dateFromTimelinePointer(50, { left: 0, width: 100 }, new Date("2026-01-01T12:00:00"), 86400000 * 10) === "2026-01-06", "Timeline pointer should map to date.");
  console.assert(dateFromTimelinePointer(-100, { left: 0, width: 100 }, new Date("2026-01-01T12:00:00"), 86400000 * 10) === "2026-01-01", "Timeline pointer should clamp left edge.");
  console.assert(dateFromTimelinePointer(200, { left: 0, width: 100 }, new Date("2026-01-01T12:00:00"), 86400000 * 10) === "2026-01-11", "Timeline pointer should clamp right edge.");
  console.assert(dateFromTimelinePointerWithOffset(50, { left: 0, width: 100 }, new Date("2026-01-01T12:00:00"), 86400000 * 10, 86400000) === "2026-01-07", "Timeline drag should preserve grab offset.");
  console.assert(dateFromTimelinePointerWithOffset(200, { left: 0, width: 100 }, new Date("2026-01-01T12:00:00"), 86400000 * 10, 86400000 * 5) === "2026-01-11", "Timeline drag with offset should clamp right edge.");
  console.assert(dateFromTimelineDragDelta(50, 60, { left: 0, width: 100 }, new Date("2026-01-05T12:00:00"), new Date("2026-01-01T12:00:00"), 86400000 * 10) === "2026-01-06", "Timeline delta drag should move from original date without recentering.");
  console.assert(dateFromTimelineDragDelta(80, 200, { left: 0, width: 100 }, new Date("2026-01-05T12:00:00"), new Date("2026-01-01T12:00:00"), 86400000 * 10) === "2026-01-11", "Timeline delta drag should still reach right edge.");
  console.assert(taskTitlesForTooltip([{ title: "A" }, { title: "B" }]) === "A\nB", "Tooltip should use new lines.");
  console.assert(progressOf({ subtasks: [{ done: true }, { done: false }] }) === 50, "Progress should count subtasks.");
  const statsTest = buildPerformanceStats([{ id: "a", columnId: "done", archivedAt: 10, createdAt: 0, subtasks: [{ done: true }] }, { id: "b", columnId: "todo", subtasks: [{ done: false }] }], defaultColumns);
  console.assert(statsTest.total === 2 && statsTest.archived === 1, "Performance stats should include archived tasks.");
  console.assert(statsTest.subtaskPercent === 50, "Performance stats should count subtask completion.");
  console.assert(statsTest.healthTrend.length === 12 && statsTest.healthTrend.every((item) => typeof item.score === "number"), "Performance stats should include twelve monthly health trend points.");
  console.assert(statsTest.healthTrend.every((item) => Array.isArray(item.stageCounts) && item.stageCounts.length === defaultColumns.length), "Health trend should include stage distribution for every point.");
  const currentTestYear = new Date().getFullYear();
  const monthlyTrendTest = buildProjectHealthTrend([
    { id: "jan", columnId: "todo", dueDate: `${currentTestYear}-01-10`, subtasks: [] },
    { id: "feb", columnId: "doing", dueDate: `${currentTestYear}-02-12`, subtasks: [] },
    { id: "no-date", columnId: "review", subtasks: [] },
  ], defaultColumns);
  console.assert(monthlyTrendTest[0].stageCounts.find((item) => item.id === "todo")?.count === 1, "Year trend should count tasks by due month, not cumulative totals.");
  console.assert(monthlyTrendTest[1].stageCounts.find((item) => item.id === "doing")?.count === 1, "Year trend should place tasks in their exact due month.");
  console.assert(monthlyTrendTest[2].total === 0, "Year trend should not carry tasks into months where they do not fall.");
  const galleryTest = buildTaskImageGallery([{ id: "a", title: "A", image: { id: "img", dataUrl: "data:image/jpeg;base64,abc" } }, { id: "b", title: "B", image: null }]);
  console.assert(galleryTest.length === 1 && galleryTest[0].taskId === "a", "Gallery should include only tasks with images.");
  const galleryMultiImageTest = buildTaskImageGallery([{ id: "a", title: "A", images: [{ id: "img-1", dataUrl: "data:image/jpeg;base64,abc" }, { id: "img-2", dataUrl: "data:image/jpeg;base64,def" }] }]);
  console.assert(galleryMultiImageTest.length === 2 && galleryMultiImageTest.every((item) => item.taskId === "a"), "Gallery should include every image from one task.");
  console.assert(getTaskImages({ images: [{ id: "one", dataUrl: "data:image/jpeg;base64,abc" }, { id: "two", dataUrl: "data:image/jpeg;base64,def" }] }).length === 2, "Task cards should be able to read multiple attached images.");
  const archiveSearchTest = filterArchivedTasks([{ title: "Ścieki", description: "Przegląd", labels: [{ text: "kontrola" }] }, { title: "Mapa", description: "Skan" }], "scieki");
  console.assert(archiveSearchTest.length === 1 && archiveSearchTest[0].title === "Ścieki", "Archive search should ignore Polish diacritics.");
  const archiveTextDateTest = filterArchivedTasks([{ title: "A", dueDate: "2026-06-02" }, { title: "B", dueDate: "2026-07-01" }], "02.06.2026");
  console.assert(archiveTextDateTest.length === 1 && archiveTextDateTest[0].title === "A", "Archive text search should match formatted due dates.");
  const archiveDateRangeTest = filterArchivedTasks([{ title: "A", dueDate: "2026-06-02", archivedAt: new Date("2026-06-10T10:00:00").getTime() }, { title: "B", dueDate: "2026-07-01" }], "", { from: "2026-06-01", to: "2026-06-30", mode: "due" });
  console.assert(archiveDateRangeTest.length === 1 && archiveDateRangeTest[0].title === "A", "Archive date filter should match task due dates.");
  const archiveArchivedDateTest = filterArchivedTasks([{ title: "A", dueDate: "2026-06-02", archivedAt: new Date("2026-06-10T10:00:00").getTime() }, { title: "B", dueDate: "2026-06-02", archivedAt: new Date("2026-06-12T10:00:00").getTime() }], "", { from: "2026-06-10", to: "2026-06-10", mode: "archived" });
  console.assert(archiveArchivedDateTest.length === 1 && archiveArchivedDateTest[0].title === "A", "Archive date filter should match archive dates.");
  console.assert(normalizeActiveSection("banana") === "info", "Unknown section should fallback.");
  console.assert(normalizeActiveSection("help") === "help", "Help section should be accepted.");
  const backupTest = normalizeImportedState(buildBackupPayload({ columns: defaultColumns, tasks: [], darkMode: false, fontScale: 115, dashboardOrder: defaultDashboardOrder, dashboardSizes: defaultDashboardSizes, activeSection: "tasks" }));
  console.assert(backupTest.tasks.length === 0 && backupTest.darkMode === false && backupTest.activeSection === "tasks", "Backup import should read wrapped export payload.");
  const parsedBackupTest = parseBackupText(`tekst przed kopią ${JSON.stringify(buildBackupPayload({ columns: defaultColumns, tasks: [{ id: "x", title: "Test" }], darkMode: true, fontScale: 100, dashboardOrder: defaultDashboardOrder, dashboardSizes: defaultDashboardSizes, activeSection: "info" }))} tekst po kopii`);
  console.assert(hasImportableKanbanData(parsedBackupTest), "Import should accept pasted backup text with surrounding notes.");
  const normalizedBackupTest = normalizeImportedState(parsedBackupTest);
  console.assert(normalizedBackupTest.tasks.length === 1 && normalizedBackupTest.tasks[0].title === "Test", "Import should restore task list from backup payload.");
  const legacyStateImportTest = normalizeImportedState({ state: { tasks: [{ title: "Legacy" }], darkMode: false } });
  console.assert(legacyStateImportTest.tasks.length === 1 && legacyStateImportTest.tasks[0].title === "Legacy", "Import should also read legacy state wrapper.");
  const rawArrayImportTest = normalizeImportedState([{ title: "Raw array task", columnId: "missing-column" }], { columns: defaultColumns, tasks: [], darkMode: true, fontScale: 100, dashboardOrder: defaultDashboardOrder, dashboardSizes: defaultDashboardSizes, activeSection: "info" });
  console.assert(rawArrayImportTest.tasks.length === 1 && rawArrayImportTest.tasks[0].columnId === "todo", "Import should accept raw task arrays and repair missing columns.");
  console.assert(countImportableTasks(buildBackupPayload({ columns: defaultColumns, tasks: [{ title: "Count me" }], darkMode: true, fontScale: 100, dashboardOrder: defaultDashboardOrder, dashboardSizes: defaultDashboardSizes, activeSection: "info" })) === 1, "Import should count wrapped backup tasks.");
}
