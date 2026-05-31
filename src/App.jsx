import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Archive,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  GripVertical,
  Image as ImageIcon,
  LayoutDashboard,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";

const STORAGE_KEY = "aesthetic-kanban-board-v5-fixed-timeline-drag";
const LEGACY_KEYS = [
  "aesthetic-kanban-board-v4-no-tailwind-dark",
  "aesthetic-kanban-board-v3",
  "aesthetic-kanban-board-v2",
  "aesthetic-kanban-board-v1",
];

const uid = () => Math.random().toString(36).slice(2, 10);
const cx = (...classes) => classes.filter(Boolean).join(" ");

const defaultColumns = [
  { id: "todo", title: "Do zrobienia", accent: "from-rose-400 to-pink-500" },
  { id: "doing", title: "W trakcie", accent: "from-amber-400 to-orange-500" },
  { id: "review", title: "Do sprawdzenia", accent: "from-sky-400 to-cyan-500" },
  { id: "done", title: "Gotowe", accent: "from-emerald-400 to-teal-500" },
];

const defaultTasks = [
  {
    id: uid(),
    columnId: "todo",
    title: "Wprowadzić pierwsze zadanie",
    description: "Kliknij kartę, aby uzupełnić szczegóły. Lista podzadań jest widoczna również na kafelku zadania.",
    labels: [{ id: uid(), text: "start", color: "pink" }],
    dueDate: "2026-06-02",
    priority: "medium",
    subtasks: [
      { id: uid(), text: "Otworzyć kartę", done: true },
      { id: uid(), text: "Zmienić treść", done: false },
    ],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    columnId: "doing",
    title: "Dopracować pulpit projektu",
    description: "Uporządkować kafelki informacyjne, kalendarz, oś czasu oraz wykres postępu projektu.",
    labels: [{ id: uid(), text: "projekt", color: "blue" }],
    dueDate: "2026-06-06",
    priority: "high",
    subtasks: [
      { id: uid(), text: "Dostosować mini kalendarz", done: true },
      { id: uid(), text: "Uzupełnić wykres postępu projektu", done: false },
      { id: uid(), text: "Dopracować oś czasu zadań", done: false },
    ],
    createdAt: Date.now() + 1,
  },
];

const defaultDashboardOrder = ["progress", "today", "calendar", "taskProgress", "actions", "timeline"];
const dashboardLabels = {
  progress: "Postęp projektu",
  today: "Dzisiejsze zadania",
  calendar: "Kalendarz",
  taskProgress: "Postęp zadań",
  actions: "Panel sterowania",
  timeline: "Oś czasu zadań",
};
const dashboardSizeOptions = ["normal", "wide", "large", "full"];
const dashboardSizeLabels = { normal: "Normalny", wide: "Szerszy", large: "Duży", full: "Pełny" };
const dashboardSizeClasses = {
  normal: "lg:col-span-2",
  wide: "lg:col-span-3",
  large: "lg:col-span-4",
  full: "lg:col-span-6",
};
const defaultDashboardSizes = {
  progress: "normal",
  today: "normal",
  calendar: "normal",
  taskProgress: "normal",
  actions: "normal",
  timeline: "normal",
};

const theme = {
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

const labelThemes = {
  pink: "bg-pink-100 text-pink-700 ring-pink-200",
  violet: "bg-violet-100 text-violet-700 ring-violet-200",
  blue: "bg-sky-100 text-sky-700 ring-sky-200",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  gray: "bg-slate-100 text-slate-700 ring-slate-200",
};
const labelThemesDark = {
  pink: "bg-pink-500/15 text-pink-200 ring-pink-400/30",
  violet: "bg-violet-500/15 text-violet-200 ring-violet-400/30",
  blue: "bg-sky-500/15 text-sky-200 ring-sky-400/30",
  green: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
  amber: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  gray: "bg-slate-700/50 text-slate-200 ring-slate-500/40",
};
const labelSwatches = {
  pink: "bg-gradient-to-br from-pink-300 via-pink-500 to-rose-600 shadow-pink-300/50",
  violet: "bg-gradient-to-br from-violet-300 via-violet-500 to-purple-700 shadow-violet-300/50",
  blue: "bg-gradient-to-br from-sky-300 via-sky-500 to-blue-700 shadow-sky-300/50",
  green: "bg-gradient-to-br from-emerald-300 via-emerald-500 to-teal-700 shadow-emerald-300/50",
  amber: "bg-gradient-to-br from-amber-200 via-amber-400 to-orange-600 shadow-amber-300/50",
  gray: "bg-gradient-to-br from-slate-300 via-slate-500 to-slate-700 shadow-slate-300/50",
};
const labelSwatchesDark = {
  pink: "bg-gradient-to-br from-pink-300 via-pink-500 to-rose-600 shadow-pink-500/35",
  violet: "bg-gradient-to-br from-violet-300 via-violet-500 to-purple-700 shadow-violet-500/35",
  blue: "bg-gradient-to-br from-sky-300 via-sky-500 to-blue-700 shadow-sky-500/35",
  green: "bg-gradient-to-br from-emerald-300 via-emerald-500 to-teal-700 shadow-emerald-500/35",
  amber: "bg-gradient-to-br from-amber-200 via-amber-400 to-orange-600 shadow-amber-500/35",
  gray: "bg-gradient-to-br from-slate-300 via-slate-500 to-slate-700 shadow-slate-500/35",
};

const priorityOptions = [
  { id: "low", title: "Niski", light: "bg-emerald-100 text-emerald-700 ring-emerald-200", dark: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30" },
  { id: "medium", title: "Średni", light: "bg-sky-100 text-sky-700 ring-sky-200", dark: "bg-sky-500/15 text-sky-200 ring-sky-400/30" },
  { id: "high", title: "Wysoki", light: "bg-amber-100 text-amber-800 ring-amber-200", dark: "bg-amber-500/15 text-amber-200 ring-amber-400/30" },
  { id: "urgent", title: "Pilny", light: "bg-rose-100 text-rose-700 ring-rose-200", dark: "bg-rose-500/15 text-rose-200 ring-rose-400/30" },
];

function normalizeTaskPriority(value) {
  return priorityOptions.some((item) => item.id === value) ? value : "medium";
}
function priorityMeta(priority) {
  return priorityOptions.find((item) => item.id === normalizeTaskPriority(priority)) || priorityOptions[1];
}
function priorityChipClass(priority, isDark) {
  const meta = priorityMeta(priority);
  return isDark ? meta.dark : meta.light;
}
function PriorityToggleGroup({ value, onChange, isDark, compact = false }) {
  return (
    <div className={cx("grid w-full grid-cols-2 items-center sm:grid-cols-4", compact ? "gap-1.5" : "gap-2") }>
      {priorityOptions.map((priority) => {
        const isActive = normalizeTaskPriority(value) === priority.id;
        return (
          <button
            key={priority.id}
            type="button"
            onClick={() => onChange(priority.id)}
            className={cx(
              "min-w-0 rounded-full px-2 py-1.5 text-center text-[11px] font-black ring-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300",
              isActive
                ? priorityChipClass(priority.id, isDark)
                : isDark
                  ? "bg-white/5 text-slate-300 ring-white/10"
                  : "bg-white text-slate-600 ring-slate-200"
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

function normalizeDashboardOrder(order) {
  if (!Array.isArray(order)) return defaultDashboardOrder;
  const known = order.filter((item) => defaultDashboardOrder.includes(item));
  const missing = defaultDashboardOrder.filter((item) => !known.includes(item));
  return [...known, ...missing];
}
function normalizeDashboardSizes(sizes) {
  return defaultDashboardOrder.reduce((acc, id) => {
    acc[id] = dashboardSizeOptions.includes(sizes?.[id]) ? sizes[id] : defaultDashboardSizes[id];
    return acc;
  }, {});
}
function normalizeActiveSection(section) {
  return section === "tasks" || section === "help" ? section : "info";
}
function dashboardSpanClass(size) {
  return dashboardSizeClasses[size] || dashboardSizeClasses.normal;
}
function reorderDashboardOrder(order, draggedId, targetId, placement = "before") {
  const normalized = normalizeDashboardOrder(order);
  if (draggedId === targetId) return normalized;
  const withoutDragged = normalized.filter((item) => item !== draggedId);
  const targetIndex = withoutDragged.indexOf(targetId);
  if (targetIndex < 0) return normalized;
  withoutDragged.splice(placement === "after" ? targetIndex + 1 : targetIndex, 0, draggedId);
  return normalizeDashboardOrder(withoutDragged);
}
function clampFontScale(value) {
  return Math.max(85, Math.min(120, Number(value) || 100));
}
function fontScaleMultiplier(value) {
  return clampFontScale(value) / 100;
}
function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
const timelineViewPresets = {
  week: { label: "Tydzień", days: 7, width: 180, unitLabel: "Dni", unit: "day" },
  month: { label: "Miesiąc", days: 31, width: 150, unitLabel: "Dni miesiąca", unit: "monthDay" },
  quarter: { label: "Kwartał", days: 92, width: 135, unitLabel: "Tygodnie", unit: "week" },
  year: { label: "Rok", days: 365, width: 120, unitLabel: "Miesiące", unit: "month" },
};
function normalizeTimelineView(value) {
  return timelineViewPresets[value] ? value : "month";
}
function buildTimelineAxisTicks(start, preset) {
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
function snapDateToAxisTicks(date, axisTicks) {
  if (!date || !axisTicks?.length) return date ? dateKey(date) : null;
  const time = date.getTime();
  const nearest = axisTicks.reduce((closest, tick) => {
    const distance = Math.abs(tick.date.getTime() - time);
    return !closest || distance < closest.distance ? { date: tick.date, distance } : closest;
  }, null);
  return nearest?.date ? dateKey(nearest.date) : dateKey(date);
}
function snapDateToDateTicks(date, dateTicks) {
  if (!date || !dateTicks?.length) return null;
  const time = date.getTime();
  return dateTicks.reduce((closest, tick) => {
    const distance = Math.abs(tick.getTime() - time);
    return !closest || distance < closest.distance ? { date: tick, distance } : closest;
  }, null)?.date || null;
}
function parseLocalDate(dateString) {
  if (!dateString) return null;
  return new Date(`${dateString}T12:00:00`);
}
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function timelinePointerToDate(clientX, rect, rangeStart, rangeMs, offsetMs = 0) {
  if (!rect || !rangeMs) return null;
  const ratio = clampNumber((clientX - rect.left) / rect.width, 0, 1);
  const minTime = rangeStart.getTime();
  const maxTime = rangeStart.getTime() + rangeMs;
  const date = new Date(clampNumber(minTime + rangeMs * ratio + offsetMs, minTime, maxTime));
  date.setHours(12, 0, 0, 0);
  return date;
}
function dateFromTimelinePointer(clientX, rect, rangeStart, rangeMs) {
  const date = timelinePointerToDate(clientX, rect, rangeStart, rangeMs);
  return date ? dateKey(date) : null;
}
function dateFromTimelinePointerWithOffset(clientX, rect, rangeStart, rangeMs, offsetMs = 0) {
  const date = timelinePointerToDate(clientX, rect, rangeStart, rangeMs, offsetMs);
  return date ? dateKey(date) : null;
}
function dateFromTimelineDragDelta(startClientX, currentClientX, rect, originalDate, rangeStart, rangeMs) {
  if (!rect || !originalDate || !rangeMs) return null;
  const deltaRatio = (currentClientX - startClientX) / rect.width;
  const minTime = rangeStart.getTime();
  const maxTime = rangeStart.getTime() + rangeMs;
  const nextTime = clampNumber(originalDate.getTime() + rangeMs * deltaRatio, minTime, maxTime);
  const date = new Date(nextTime);
  date.setHours(12, 0, 0, 0);
  return dateKey(date);
}
function formatDate(dateString, options = { day: "2-digit", month: "short" }) {
  const date = parseLocalDate(dateString);
  return date ? date.toLocaleDateString("pl-PL", options) : "";
}
function progressOf(task) {
  if (!task.subtasks?.length) return 0;
  return Math.round((task.subtasks.filter((item) => item.done).length / task.subtasks.length) * 100);
}
function monthLabel(date) {
  return date.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
}
function buildMonthDays(monthDate) {
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
function taskTitlesForTooltip(tasks) {
  return tasks.map((task) => task.title).join("\n");
}
function emptyDraft(columnId = "todo") {
  return { id: uid(), columnId, title: "", description: "", labels: [], subtasks: [], dueDate: "", priority: "medium", images: [], createdAt: Date.now() };
}
function getTaskImages(task) {
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
function selectOptionStyle(t) {
  return t === theme.dark ? { backgroundColor: "#0f172a", color: "#f8fafc" } : { backgroundColor: "#ffffff", color: "#0f172a" };
}
function dateTone(dateString) {
  if (!dateString) return "neutral";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseLocalDate(dateString);
  if (!due) return "neutral";
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return "overdue";
  if (days <= 2) return "soon";
  return "later";
}
function columnForTask(task, columns = defaultColumns) {
  return (Array.isArray(columns) ? columns : defaultColumns).find((column) => column.id === task?.columnId) || defaultColumns[0];
}
function stageGradientForTask(task, columns = defaultColumns) {
  return columnForTask(task, columns)?.accent || "from-slate-400 to-slate-600";
}
function stageTitleForTask(task, columns = defaultColumns) {
  return columnForTask(task, columns)?.title || "Bez etapu";
}

function buildProjectHealthTrend(tasks, columns = defaultColumns) {
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

function buildPerformanceStats(tasks, columns) {
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
function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}
function coerceSearchDate(value) {
  if (!value) return null;
  const date = typeof value === "string" && value.length === 10 && value[4] === "-" && value[7] === "-" ? parseLocalDate(value) : new Date(value);
  return date && !Number.isNaN(date.getTime()) ? date : null;
}
function startOfSearchDay(value) {
  const date = coerceSearchDate(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}
function endOfSearchDay(value) {
  const date = coerceSearchDate(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}
function buildDateSearchVariants(value) {
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
function taskMatchesArchiveDateRange(task, dateFilters = {}) {
  const from = startOfSearchDay(dateFilters.from);
  const to = endOfSearchDay(dateFilters.to);
  if (!from && !to) return true;

  const mode = dateFilters.mode || "any";
  const dueDate = task.dueDate ? coerceSearchDate(task.dueDate) : null;
  const archivedDate = task.archivedAt ? coerceSearchDate(task.archivedAt) : null;
  const candidates = mode === "due" ? [dueDate] : mode === "archived" ? [archivedDate] : [dueDate, archivedDate];

  return candidates.some((date) => date && (!from || date >= from) && (!to || date <= to));
}
function filterArchivedTasks(tasks, query, dateFilters = {}) {
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
function buildTaskImageGallery(tasks) {
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
function readImageAttachment(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("To nie jest plik obrazu."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nie udało się odczytać obrazu."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Nie udało się przygotować podglądu obrazu."));
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
function loadInitialState() {
  const fallback = { columns: defaultColumns, tasks: defaultTasks, darkMode: true, fontScale: 100, dashboardOrder: defaultDashboardOrder, dashboardSizes: defaultDashboardSizes, activeSection: "info" };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return normalizeImportedState(parsed, fallback);
    }
    for (const key of LEGACY_KEYS) {
      const legacyRaw = window.localStorage.getItem(key);
      if (!legacyRaw) continue;
      const legacy = JSON.parse(legacyRaw);
      return normalizeImportedState(legacy, fallback);
    }
  } catch {
    return fallback;
  }
  return fallback;
}
function getImportSource(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed.data && typeof parsed.data === "object") return parsed.data;
  if (parsed.state && typeof parsed.state === "object") return parsed.state;
  if (parsed.board && typeof parsed.board === "object") return parsed.board;
  return parsed;
}

function normalizeTaskForImport(task, index = 0) {
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

function normalizeImportedColumns(importedColumns, fallbackColumns = defaultColumns) {
  const baseColumns = Array.isArray(fallbackColumns) && fallbackColumns.length ? fallbackColumns : defaultColumns;
  const candidateColumns = Array.isArray(importedColumns) && importedColumns.length ? importedColumns : baseColumns;
  const normalized = candidateColumns.map((column, index) => ({
    id: typeof column?.id === "string" && column.id.trim() ? column.id : baseColumns[index]?.id || `column-${index + 1}`,
    title: typeof column?.title === "string" && column.title.trim() ? column.title : baseColumns[index]?.title || `Kolumna ${index + 1}`,
    accent: typeof column?.accent === "string" && column.accent.trim() ? column.accent : baseColumns[index]?.accent || "from-slate-400 to-slate-600",
  }));

  return normalized.length ? normalized : defaultColumns;
}

function normalizeImportedState(parsed, fallback = { columns: defaultColumns, tasks: defaultTasks, darkMode: true, fontScale: 100, dashboardOrder: defaultDashboardOrder, dashboardSizes: defaultDashboardSizes, activeSection: "info" }) {
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
    fontScale: clampFontScale(source?.fontScale ?? fallback.fontScale),
    dashboardOrder: normalizeDashboardOrder(source?.dashboardOrder || fallback.dashboardOrder),
    dashboardSizes: normalizeDashboardSizes(source?.dashboardSizes || fallback.dashboardSizes),
    activeSection: normalizeActiveSection(source?.activeSection || fallback.activeSection),
  };
}

function buildBackupPayload(state) {
  return {
    app: "Aesthetic Kanban Board",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
}

function parseBackupText(text) {
  const raw = String(text || "").replace(/^﻿/, "").trim();
  if (!raw) throw new Error("Nie podano treści kopii zapasowej.");

  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("Nie udało się odczytać pliku JSON. Sprawdź, czy wklejona treść pochodzi z eksportu tej aplikacji.");
  }
}

function hasImportableKanbanData(parsed) {
  const source = getImportSource(parsed);
  return Boolean(source && (Array.isArray(source) || Array.isArray(source.tasks)));
}

function countImportableTasks(parsed) {
  const source = getImportSource(parsed);
  if (Array.isArray(source)) return source.length;
  if (Array.isArray(source?.tasks)) return source.tasks.length;
  return 0;
}

function readTextFile(file) {
  if (!file) return Promise.resolve("");
  if (typeof file.text === "function") return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(file, "utf-8");
  });
}
async function downloadTextFile(filename, text, mimeType = "application/json") {
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
function backupFileName() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `kanban-kopia-${stamp}.json`;
}
function runSelfTests() {
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

export default function AestheticKanbanBoard() {
  const initial = useMemo(loadInitialState, []);
  const [columns, setColumns] = useState(initial.columns);
  const [tasks, setTasks] = useState(initial.tasks);
  const [darkMode, setDarkMode] = useState(initial.darkMode);
  const [fontScale, setFontScale] = useState(initial.fontScale);
  const [dashboardOrder, setDashboardOrder] = useState(initial.dashboardOrder);
  const [dashboardSizes, setDashboardSizes] = useState(initial.dashboardSizes);
  const [activeSection, setActiveSection] = useState(initial.activeSection);
  const [isLayoutEditing, setIsLayoutEditing] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const importInputRef = useRef(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [draft, setDraft] = useState(null);
  const [quickTask, setQuickTask] = useState(() => ({ title: "", columnId: "todo", dueDate: dateKey(new Date()), priority: "medium" }));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const lastWidgetMoveRef = useRef("");
  const t = darkMode ? theme.dark : theme.light;
  const isDark = darkMode;

  useEffect(() => runSelfTests(), []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.remove("dark");
    document.body?.classList.remove("dark");
  }, [darkMode, draft, archiveOpen, timelineOpen]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ columns, tasks, darkMode, fontScale, dashboardOrder, dashboardSizes, activeSection }));
  }, [columns, tasks, darkMode, fontScale, dashboardOrder, dashboardSizes, activeSection]);

  const activeTasks = useMemo(() => tasks.filter((task) => !task.archivedAt), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter((task) => task.archivedAt).sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0)), [tasks]);
  const dueTasks = useMemo(() => activeTasks.filter((task) => task.dueDate), [activeTasks]);
  const timelineTasks = useMemo(() => dueTasks.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6), [dueTasks]);
  const timelineAllTasks = useMemo(() => dueTasks.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [dueTasks]);
  const taskImages = useMemo(() => buildTaskImageGallery(tasks), [tasks]);
  const backupText = useMemo(() => JSON.stringify(buildBackupPayload({ columns, tasks, darkMode, fontScale, dashboardOrder, dashboardSizes, activeSection }), null, 2), [columns, tasks, darkMode, fontScale, dashboardOrder, dashboardSizes, activeSection]);
  const upcomingTasks = useMemo(() => dueTasks.filter((task) => task.columnId !== "done").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6), [dueTasks]);
  const taskStats = useMemo(() => {
    const total = activeTasks.length;
    const done = activeTasks.filter((task) => task.columnId === "done").length;
    const subtasks = activeTasks.flatMap((task) => task.subtasks || []);
    return { total, done, subtasks: subtasks.length, completedSubtasks: subtasks.filter((item) => item.done).length };
  }, [activeTasks]);
  const projectProgress = taskStats.total ? Math.round((taskStats.done / taskStats.total) * 100) : 0;
  const columnStats = useMemo(() => columns.map((column) => ({ ...column, count: activeTasks.filter((task) => task.columnId === column.id).length })), [columns, activeTasks]);
  const draftExists = Boolean(draft && tasks.some((task) => task.id === draft.id));

  function openTask(task) {
    setDraft({ ...JSON.parse(JSON.stringify(task)), priority: normalizeTaskPriority(task?.priority) });
  }
  function openNewTask(columnId = "todo", dueDate = "") {
    const nextDraft = emptyDraft(columnId);
    setDraft(dueDate ? { ...nextDraft, dueDate } : nextDraft);
  }
  function openTaskFromGallery(imageItem) {
    const task = tasks.find((item) => item.id === imageItem?.taskId);
    if (!task) return;
    setGalleryOpen(false);
    setSelectedGalleryImage(null);
    openTask(task);
  }
  function exportBackup() {
    setExportOpen(true);
  }
  async function downloadBackupNow() {
    const result = await downloadTextFile(backupFileName(), backupText);
    if (result?.reason === "cancelled") return result;
    if (!result?.ok) {
      alert("Przeglądarka zablokowała automatyczne pobranie. Skopiuj zawartość kopii z okna eksportu i zapisz ją ręcznie jako plik .json.");
    }
    return result;
  }
  function applyImportedBackup(parsed) {
    if (!hasImportableKanbanData(parsed)) throw new Error("Wybrany plik nie wygląda jak kopia zapasowa tej tablicy. Brakuje listy zadań.");
    const normalized = normalizeImportedState(parsed, { columns, tasks, darkMode, fontScale, dashboardOrder, dashboardSizes, activeSection });
    const importedCount = countImportableTasks(parsed);
    const nextState = {
      columns: normalized.columns,
      tasks: normalized.tasks,
      darkMode: normalized.darkMode,
      fontScale: normalized.fontScale,
      dashboardOrder: normalized.dashboardOrder,
      dashboardSizes: normalized.dashboardSizes,
      activeSection: normalized.activeSection,
    };
    const importedDueDate = nextState.tasks.find((task) => task.dueDate)?.dueDate;
    const importedMonth = parseLocalDate(importedDueDate || dateKey(new Date()));

    setColumns(nextState.columns);
    setTasks(nextState.tasks);
    setDarkMode(nextState.darkMode);
    setFontScale(nextState.fontScale);
    setDashboardOrder(nextState.dashboardOrder);
    setDashboardSizes(nextState.dashboardSizes);
    setActiveSection(nextState.activeSection);
    setDraft(null);
    setArchiveOpen(false);
    setTimelineOpen(false);
    setCalendarOpen(false);
    setPerformanceOpen(false);
    setGalleryOpen(false);
    setSelectedGalleryImage(null);
    setImportOpen(false);
    if (importedMonth) setCalendarMonth(new Date(importedMonth.getFullYear(), importedMonth.getMonth(), 1));
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      window.dispatchEvent(new CustomEvent("kanban-imported", { detail: { importedCount, restoredCount: nextState.tasks.length } }));
    }
    alert(`Kopia zapasowa została wczytana. Odczytano ${importedCount} kart, przywrócono ${nextState.tasks.length}.`);
  }
  function requestImportBackup() {
    setImportOpen(true);
  }
  async function importBackupFile(file) {
    if (!file) return;
    try {
      const text = await readTextFile(file);
      const parsed = parseBackupText(text);
      applyImportedBackup(parsed);
    } catch (error) {
      alert(error.message || "Nie udało się wczytać kopii zapasowej. Sprawdź, czy wybrany plik jest prawidłowym plikiem JSON z tej aplikacji.");
    }
  }
  function importBackupText(text) {
    try {
      const parsed = parseBackupText(text);
      applyImportedBackup(parsed);
      return true;
    } catch (error) {
      alert(error.message || "Nie udało się wczytać kopii zapasowej. Sprawdź treść JSON z eksportu.");
      return false;
    }
  }
  function closeModal() {
    setDraft(null);
  }
  function saveDraft() {
    if (!draft?.title.trim()) return;
    const cleaned = {
      ...draft,
      priority: normalizeTaskPriority(draft.priority),
      title: draft.title.trim(),
      description: (draft.description || "").trim(),
      labels: (draft.labels || []).filter((label) => label.text.trim()),
      subtasks: (draft.subtasks || []).filter((item) => item.text.trim()),
      images: getTaskImages(draft),
      image: undefined,
    };
    setTasks((current) => (current.some((task) => task.id === cleaned.id) ? current.map((task) => (task.id === cleaned.id ? cleaned : task)) : [cleaned, ...current]));
    closeModal();
  }
  function quickAddTask() {
    const title = quickTask.title.trim();
    if (!title) return;
    setTasks((current) => [
      {
        ...emptyDraft(quickTask.columnId || "todo"),
        title,
        dueDate: quickTask.dueDate || dateKey(new Date()),
        priority: normalizeTaskPriority(quickTask.priority),
        labels: [{ id: uid(), text: "nowe", color: "green" }],
      },
      ...current,
    ]);
    setQuickTask((current) => ({ ...current, title: "" }));
  }
  function moveTask(taskId, columnId, targetTaskId = null, placement = "end") {
    setTasks((current) => {
      const draggedTask = current.find((task) => task.id === taskId);
      if (!draggedTask) return current;

      const activeWithoutDragged = current.filter((task) => !task.archivedAt && task.id !== taskId);
      const archivedTasks = current.filter((task) => task.archivedAt);
      const knownColumnIds = new Set(columns.map((column) => column.id));
      const grouped = columns.reduce((acc, column) => {
        acc[column.id] = activeWithoutDragged.filter((task) => task.columnId === column.id);
        return acc;
      }, {});
      const targetList = [...(grouped[columnId] || [])];
      const updatedDraggedTask = { ...draggedTask, columnId };

      if (!targetTaskId) {
        targetList.push(updatedDraggedTask);
      } else {
        const targetIndex = targetList.findIndex((task) => task.id === targetTaskId);
        const insertAt = targetIndex < 0 ? targetList.length : placement === "after" ? targetIndex + 1 : targetIndex;
        targetList.splice(insertAt, 0, updatedDraggedTask);
      }

      grouped[columnId] = targetList;

      const rebuiltActive = columns.flatMap((column) => grouped[column.id] || []);
      const unknownColumnTasks = activeWithoutDragged.filter((task) => !knownColumnIds.has(task.columnId));
      return [...rebuiltActive, ...unknownColumnTasks, ...archivedTasks];
    });
  }
  function updateTaskDueDate(taskId, dueDate) {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, dueDate } : task)));
    setDraft((current) => (current?.id === taskId ? { ...current, dueDate } : current));
  }
  function archiveTask(taskId) {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, archivedAt: Date.now() } : task)));
    closeModal();
  }
  function restoreTask(taskId, columnId = "done") {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, columnId, archivedAt: undefined } : task)));
    closeModal();
  }
  function deleteTask(taskId) {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    closeModal();
  }
  function addLabel() {
    setDraft((current) => ({ ...current, labels: [...(current.labels || []), { id: uid(), text: "", color: "pink" }] }));
  }
  function updateLabel(labelId, patch) {
    setDraft((current) => ({ ...current, labels: (current.labels || []).map((label) => (label.id === labelId ? { ...label, ...patch } : label)) }));
  }
  function removeLabel(labelId) {
    setDraft((current) => ({ ...current, labels: (current.labels || []).filter((label) => label.id !== labelId) }));
  }
  function addSubtask() {
    setDraft((current) => ({ ...current, subtasks: [...(current.subtasks || []), { id: uid(), text: "", done: false }] }));
  }
  function updateSubtask(subtaskId, patch) {
    setDraft((current) => ({ ...current, subtasks: (current.subtasks || []).map((item) => (item.id === subtaskId ? { ...item, ...patch } : item)) }));
  }
  function removeSubtask(subtaskId) {
    setDraft((current) => ({ ...current, subtasks: (current.subtasks || []).filter((item) => item.id !== subtaskId) }));
  }
  async function attachTaskImage(fileInput) {
    const files = Array.from(fileInput?.length !== undefined ? fileInput : [fileInput]).filter(Boolean);
    if (!files.length) return;
    try {
      const images = await Promise.all(files.map(readImageAttachment));
      setDraft((current) => ({ ...current, images: [...getTaskImages(current), ...images], image: undefined }));
    } catch (error) {
      alert(error.message || "Nie udało się dodać jednego ze zdjęć.");
    }
  }
  function removeTaskImage(imageId) {
    setDraft((current) => ({ ...current, images: getTaskImages(current).filter((image) => (image.id || image.dataUrl) !== imageId), image: undefined }));
  }
  function toggleSubtaskDone(taskId, subtaskId) {
    const toggleItems = (items = []) => items.map((item) => (item.id === subtaskId ? { ...item, done: !item.done } : item));
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, subtasks: toggleItems(task.subtasks) } : task)));
    setDraft((current) => (current?.id === taskId ? { ...current, subtasks: toggleItems(current.subtasks) } : current));
  }

  function getDashboardTargetFromPointer(clientX, clientY, draggedId) {
    if (typeof document === "undefined") return null;
    const candidates = Array.from(document.querySelectorAll("[data-dashboard-widget-id]")).map((element) => ({ id: element.getAttribute("data-dashboard-widget-id"), rect: element.getBoundingClientRect() })).filter((item) => item.id && item.id !== draggedId);
    if (!candidates.length) return null;
    const target = candidates.reduce((closest, item) => {
      const centerX = item.rect.left + item.rect.width / 2;
      const centerY = item.rect.top + item.rect.height / 2;
      const distance = Math.hypot(clientX - centerX, (clientY - centerY) * 1.35);
      return !closest || distance < closest.distance ? { ...item, distance } : closest;
    }, null);
    if (!target) return null;
    return { id: target.id, placement: clientX < target.rect.left + target.rect.width / 2 ? "before" : "after" };
  }
  function moveDashboardWidget(targetId, placement = "before") {
    if (!draggedWidgetId || draggedWidgetId === targetId) return;
    setDashboardOrder((current) => reorderDashboardOrder(current, draggedWidgetId, targetId, placement));
  }
  function changeDashboardWidgetSize(widgetId, direction) {
    setDashboardSizes((current) => {
      const normalized = normalizeDashboardSizes(current);
      const index = dashboardSizeOptions.indexOf(normalized[widgetId] || "normal");
      const nextIndex = direction === "increase" ? Math.min(dashboardSizeOptions.length - 1, index + 1) : Math.max(0, index - 1);
      return nextIndex === index ? normalized : { ...normalized, [widgetId]: dashboardSizeOptions[nextIndex] };
    });
  }
  function startDashboardWidgetDrag(event, widgetId) {
    if (!isLayoutEditing) return;
    event.preventDefault();
    event.stopPropagation();
    setDraggedWidgetId(widgetId);
    setDropTarget(null);
    lastWidgetMoveRef.current = "";
  }
  useEffect(() => {
    if (!draggedWidgetId || !isLayoutEditing || typeof window === "undefined") return;
    function handlePointerMove(event) {
      const target = getDashboardTargetFromPointer(event.clientX, event.clientY, draggedWidgetId);
      if (!target) return setDropTarget(null);
      setDropTarget(target);
      const moveKey = `${draggedWidgetId}:${target.id}:${target.placement}`;
      if (lastWidgetMoveRef.current === moveKey) return;
      lastWidgetMoveRef.current = moveKey;
      moveDashboardWidget(target.id, target.placement);
    }
    function finishPointerDrag() {
      setDraggedWidgetId(null);
      setDropTarget(null);
      lastWidgetMoveRef.current = "";
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishPointerDrag, { once: true });
    window.addEventListener("pointercancel", finishPointerDrag, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishPointerDrag);
      window.removeEventListener("pointercancel", finishPointerDrag);
    };
  }, [draggedWidgetId, isLayoutEditing]);

  const dashboardCards = {
    progress: <ProjectProgressCard t={t} progress={projectProgress} total={taskStats.total} done={taskStats.done} archived={archivedTasks.length} />,
    today: <QuickAddPanel t={t} columns={columns} quickTask={quickTask} setQuickTask={setQuickTask} onQuickAdd={quickAddTask} onOpenFull={() => openNewTask(quickTask.columnId || "todo")} upcomingTasks={upcomingTasks} onOpenTask={openTask} />,
    calendar: <MonthCalendar t={t} isDark={isDark} month={calendarMonth} tasks={dueTasks} columns={columns} onOpenTask={openTask} onCreateTaskForDate={(selectedDate) => openNewTask("todo", selectedDate)} onPreviousMonth={() => setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} onNextMonth={() => setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} onToday={() => { const today = new Date(); setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1)); }} onOpenCalendar={() => setCalendarOpen(true)} />,
    taskProgress: <TaskProgressCard t={t} columnStats={columnStats} total={taskStats.total} />,
    actions: <DashboardActionsCard t={t} archivedCount={archivedTasks.length} galleryCount={taskImages.length} onNewTask={() => openNewTask("todo")} onArchive={() => setArchiveOpen(true)} onPerformance={() => setPerformanceOpen(true)} onGallery={() => setGalleryOpen(true)} />,
    timeline: <TimelineCard t={t} tasks={timelineAllTasks} month={calendarMonth} columns={columns} onOpenTask={openTask} onOpenDetails={() => setTimelineOpen(true)} />,
  };

  return (
    <div data-kanban-board className={cx("min-h-screen px-4 py-6 transition-colors duration-300 sm:px-6 lg:px-8", t.app)} data-theme={isDark ? "dark" : "light"} style={{ colorScheme: isDark ? "dark" : "light", "--kanban-font-scale": fontScaleMultiplier(fontScale) }}>
      <FontScaleStyles />
      <main className="mx-auto max-w-7xl">
        <TopToolbar
          t={t}
          darkMode={darkMode}
          fontScale={fontScale}
          activeSection={activeSection}
          isLayoutEditing={isLayoutEditing}
          archiveCount={archivedTasks.length}
          galleryCount={taskImages.length}
          onToggleDark={() => setDarkMode((value) => !value)}
          onDecreaseFont={() => setFontScale((value) => clampFontScale(value - 5))}
          onIncreaseFont={() => setFontScale((value) => clampFontScale(value + 5))}
          onResetFont={() => setFontScale(100)}
          onShowInfo={() => { setActiveSection("info"); setIsLayoutEditing(false); }}
          onShowTasks={() => { setActiveSection("tasks"); setIsLayoutEditing(false); }}
          onShowHelp={() => { setActiveSection("help"); setIsLayoutEditing(false); }}
          onNewTask={() => openNewTask("todo")}
          onOpenTimeline={() => { setActiveSection("info"); setTimelineOpen(true); setIsLayoutEditing(false); }}
          onOpenPerformance={() => { setActiveSection("info"); setPerformanceOpen(true); setIsLayoutEditing(false); }}
          onOpenGallery={() => { setActiveSection("info"); setGalleryOpen(true); setIsLayoutEditing(false); }}
          onOpenArchive={() => { setActiveSection("info"); setArchiveOpen(true); setIsLayoutEditing(false); }}
          onToggleLayout={() => { setActiveSection("info"); setIsLayoutEditing((value) => !value); }}
          onResetLayout={() => setDashboardOrder(defaultDashboardOrder)}
          onResetSizes={() => setDashboardSizes(defaultDashboardSizes)}
          onExportBackup={exportBackup}
          onImportBackup={requestImportBackup}
        />
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            importBackupFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <header className="mb-5">
          <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 backdrop-blur", isDark ? "bg-white/10 text-violet-200 ring-white/10" : "bg-white/75 text-violet-600 ring-violet-100")}><LayoutDashboard size={14} /> Pulpit projektu</div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Tablica zadań i postępów projektu</h1>
          <p className={cx("mt-2 max-w-2xl text-sm leading-6 sm:text-base", t.textMuted)}>Przejrzysty panel do planowania pracy, kontroli terminów oraz monitorowania postępów na tablicy Kanban.</p>
        </header>

        <SectionTabs t={t} activeSection={activeSection} onChange={(section) => { setActiveSection(section); setIsLayoutEditing(false); }} />

        <AnimatePresence mode="wait" initial={false}>
          {activeSection === "info" ? (
            <motion.section key="info-section" data-dashboard-grid className="grid auto-rows-[minmax(280px,auto)] items-stretch gap-4 lg:grid-cols-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {dashboardOrder.map((widgetId) => (
                <DashboardSlot key={widgetId} t={t} widgetId={widgetId} label={dashboardLabels[widgetId]} size={dashboardSizes[widgetId] || "normal"} isEditing={isLayoutEditing} draggedWidgetId={draggedWidgetId} dropTarget={dropTarget} onPointerDragStart={(event) => startDashboardWidgetDrag(event, widgetId)} onSizeChange={(direction) => changeDashboardWidgetSize(widgetId, direction)}>{dashboardCards[widgetId]}</DashboardSlot>
              ))}
            </motion.section>
          ) : activeSection === "help" ? (
            <HelpGuide
              t={t}
              onGoToInfo={() => setActiveSection("info")}
              onGoToTasks={() => setActiveSection("tasks")}
              onNewTask={() => { setActiveSection("tasks"); openNewTask("todo"); }}
              onOpenTimeline={() => { setActiveSection("info"); setTimelineOpen(true); }}
              onOpenPerformance={() => { setActiveSection("info"); setPerformanceOpen(true); }}
              onOpenGallery={() => { setActiveSection("info"); setGalleryOpen(true); }}
              onOpenArchive={() => { setActiveSection("info"); setArchiveOpen(true); }}
            />
          ) : (
            <motion.section key="tasks-section" data-task-board className="grid w-full grid-cols-4 items-stretch gap-3 pb-4 lg:gap-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {columns.map((column) => <Column key={column.id} t={t} isDark={isDark} column={column} tasks={activeTasks.filter((task) => task.columnId === column.id)} onOpenNew={() => openNewTask(column.id)} onOpenTask={openTask} onMoveTask={moveTask} onToggleSubtask={toggleSubtaskDone} draggedTaskId={draggedTaskId} setDraggedTaskId={setDraggedTaskId} />)}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <ArchiveModal t={t} open={archiveOpen} tasks={archivedTasks} onClose={() => setArchiveOpen(false)} onOpenTask={(task) => { setArchiveOpen(false); openTask(task); }} onRestore={(taskId) => restoreTask(taskId, "done")} />
      <CalendarDetailsModal t={t} isDark={isDark} open={calendarOpen} month={calendarMonth} tasks={dueTasks} columns={columns} onClose={() => setCalendarOpen(false)} onOpenTask={(task) => { setCalendarOpen(false); openTask(task); }} onCreateTaskForDate={(selectedDate) => { setCalendarOpen(false); openNewTask("todo", selectedDate); }} onPreviousMonth={() => setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} onNextMonth={() => setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} onToday={() => { const today = new Date(); setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1)); }} />
      <TimelineDetailsModal t={t} open={timelineOpen} tasks={timelineAllTasks} columns={columns} onClose={() => setTimelineOpen(false)} onOpenTask={openTask} onMoveTaskDate={updateTaskDueDate} />
      <PerformanceModal t={t} open={performanceOpen} tasks={tasks} columns={columns} onClose={() => setPerformanceOpen(false)} />
      <GalleryModal t={t} open={galleryOpen} images={taskImages} selected={selectedGalleryImage} onSelect={setSelectedGalleryImage} onClose={() => { setGalleryOpen(false); setSelectedGalleryImage(null); }} onClosePreview={() => setSelectedGalleryImage(null)} onGoToTask={openTaskFromGallery} />
      <ExportBackupModal t={t} open={exportOpen} backupText={backupText} fileName={backupFileName()} onClose={() => setExportOpen(false)} onDownload={downloadBackupNow} />
      <ImportBackupModal t={t} open={importOpen} onClose={() => setImportOpen(false)} onImportText={importBackupText} onImportFile={importBackupFile} />
      <EditTaskModal t={t} isDark={isDark} draft={draft} columns={columns} draftExists={draftExists} setDraft={setDraft} onClose={closeModal} onSave={saveDraft} onDelete={deleteTask} onArchive={archiveTask} onRestore={restoreTask} onAddLabel={addLabel} onUpdateLabel={updateLabel} onRemoveLabel={removeLabel} onAddSubtask={addSubtask} onUpdateSubtask={updateSubtask} onRemoveSubtask={removeSubtask} onAttachImage={attachTaskImage} onRemoveImage={removeTaskImage} />
    </div>
  );
}

function FontScaleStyles() {
  return <style>{String.raw`
    [data-kanban-board] .text-\[8px\] { font-size: calc(8px * var(--kanban-font-scale, 1)) !important; }
    [data-kanban-board] .text-\[10px\] { font-size: calc(10px * var(--kanban-font-scale, 1)) !important; }
    [data-kanban-board] .text-\[11px\] { font-size: calc(11px * var(--kanban-font-scale, 1)) !important; }
    [data-kanban-board] .text-xs { font-size: calc(0.75rem * var(--kanban-font-scale, 1)) !important; }
    [data-kanban-board] .text-sm { font-size: calc(0.875rem * var(--kanban-font-scale, 1)) !important; }
    [data-kanban-board] .text-base { font-size: calc(1rem * var(--kanban-font-scale, 1)) !important; }
    [data-kanban-board] .text-lg { font-size: calc(1.125rem * var(--kanban-font-scale, 1)) !important; }
    [data-kanban-board] .text-2xl { font-size: calc(1.5rem * var(--kanban-font-scale, 1)) !important; }
    [data-kanban-board] .text-3xl { font-size: calc(1.875rem * var(--kanban-font-scale, 1)) !important; }
    @media (max-width: 1180px) {
      [data-task-board] { gap: 0.65rem !important; }
      [data-task-board] [data-task-subtasks] { padding: 0.65rem !important; }
    }
    @media (max-width: 920px) { [data-task-board] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
    @media (max-width: 560px) { [data-task-board] { grid-template-columns: 1fr !important; } }
    @media (min-width: 640px) {
      [data-kanban-board] .sm\:text-base { font-size: calc(1rem * var(--kanban-font-scale, 1)) !important; }
      [data-kanban-board] .sm\:text-5xl { font-size: calc(3rem * var(--kanban-font-scale, 1)) !important; }
    }
  `}</style>;
}

function TopToolbar({
  t,
  darkMode,
  fontScale,
  activeSection,
  isLayoutEditing,
  archiveCount,
  galleryCount,
  onToggleDark,
  onDecreaseFont,
  onIncreaseFont,
  onResetFont,
  onShowInfo,
  onShowTasks,
  onShowHelp,
  onNewTask,
  onOpenTimeline,
  onOpenPerformance,
  onOpenGallery,
  onOpenArchive,
  onToggleLayout,
  onResetLayout,
  onResetSizes,
  onExportBackup,
  onImportBackup,
}) {
  const viewButtons = [
    { id: "info", label: "Pulpit", icon: <LayoutDashboard size={15} />, action: onShowInfo },
    { id: "tasks", label: "Zadania", icon: <CheckSquare2 size={15} />, action: onShowTasks },
    { id: "help", label: "Instrukcja", icon: <BookOpen size={15} />, action: onShowHelp },
  ];
  const quickActions = [
    { label: "Raport", icon: <Activity size={15} />, action: onOpenPerformance },
    { label: "Eksport", icon: <Upload size={15} />, action: onExportBackup },
    { label: "Import", icon: <RotateCcw size={15} />, action: onImportBackup },
  ];

  return (
    <div className={cx("sticky top-3 z-30 mb-5 overflow-hidden rounded-[1.75rem] border shadow-2xl backdrop-blur-2xl", t.card)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />
      <div className="grid gap-3 p-2.5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className={cx("flex flex-wrap items-center gap-2 rounded-[1.25rem] border p-1.5", t.buttonSoft)}>
          {viewButtons.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className={cx(
                  "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition hover:-translate-y-0.5",
                  isActive ? t.actionPrimary : t.hoverSoft
                )}
                title={`Przejdź do: ${item.label}`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
          {quickActions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5",
                item.primary ? t.actionPrimary : t.buttonSoft
              )}
              title={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onToggleDark}
            className={cx("inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5", t.buttonSoft)}
            title="Przełącz tryb jasny/ciemny"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{darkMode ? "Jasny" : "Ciemny"}</span>
          </button>

          <div className={cx("inline-flex items-center overflow-hidden rounded-2xl border shadow-sm", t.buttonSoft)} title="Wielkość tekstu">
            <button type="button" onClick={onDecreaseFont} className={cx("px-3 py-2 text-xs font-black transition", t.hoverSoft)}>A−</button>
            <button type="button" onClick={onResetFont} className={cx("border-x px-3 py-2 text-xs font-black transition", t.divider, t.hoverSoft)}>{fontScale}%</button>
            <button type="button" onClick={onIncreaseFont} className={cx("px-3 py-2 text-xs font-black transition", t.hoverSoft)}>A+</button>
          </div>

          <button
            type="button"
            onClick={onToggleLayout}
            className={cx("inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5", isLayoutEditing ? t.actionPrimary : t.buttonSoft)}
            title={isLayoutEditing ? "Zakończ zmianę układu" : "Edytuj układ kafelków dashboardu"}
          >
            <GripVertical size={16} />
            <span className="hidden xl:inline">{isLayoutEditing ? "Zakończ edycję" : "Układ"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isLayoutEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={cx("mx-2.5 mb-2.5 rounded-[1.25rem] border p-2", t.buttonSoft)}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={cx("px-2 text-xs font-bold", t.textMuted)}>Tryb edycji układu jest aktywny — przeciągaj kafelki na pulpicie albo zmień ich rozmiar przyciskiem na kafelce.</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={onResetLayout} className={cx("inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5", t.buttonSoft)}><RotateCcw size={15} /> Reset układu</button>
                  <button type="button" onClick={onResetSizes} className={cx("inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5", t.buttonSoft)}><RotateCcw size={15} /> Reset rozmiarów</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardSlot({ t, widgetId, label, size, isEditing, draggedWidgetId, dropTarget, onPointerDragStart, onSizeChange, children }) {
  const isDragged = draggedWidgetId === widgetId;
  const showBeforeLine = isEditing && !isDragged && dropTarget?.id === widgetId && dropTarget?.placement === "before";
  const showAfterLine = isEditing && !isDragged && dropTarget?.id === widgetId && dropTarget?.placement === "after";
  return (
    <motion.div layout data-dashboard-widget-id={widgetId} data-dashboard-widget-size={size} onPointerDown={isEditing ? onPointerDragStart : undefined} initial={false} animate={{ scale: isDragged ? 0.985 : 1, opacity: isDragged ? 0.58 : 1 }} transition={{ layout: { type: "spring", stiffness: 260, damping: 36, mass: 0.7 } }} className={cx("relative h-full", dashboardSpanClass(size), isEditing && "cursor-grab active:cursor-grabbing touch-none select-none")}>
      <AnimatePresence>{(showBeforeLine || showAfterLine) && <motion.div key={showBeforeLine ? "before" : "after"} initial={{ opacity: 0, scaleY: 0.65 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0.65 }} className={cx("absolute bottom-4 top-4 z-30 w-1 rounded-full bg-violet-400 shadow-[0_0_16px_rgba(168,85,247,.85)]", showBeforeLine ? "-left-2" : "-right-2")} />}</AnimatePresence>
      {isEditing && <><motion.div data-dashboard-drag-handle onPointerDown={onPointerDragStart} className={cx("absolute right-3 top-3 z-20 inline-flex cursor-grab items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black shadow-lg", t.actionPrimary)}><GripVertical size={12} /> {label}</motion.div><motion.div onPointerDown={(event) => event.stopPropagation()} className={cx("absolute bottom-3 right-3 z-20 inline-flex items-center overflow-hidden rounded-full border text-[10px] font-black shadow-lg backdrop-blur", t.buttonSoft)}><button type="button" onClick={(event) => { event.stopPropagation(); onSizeChange("decrease"); }} disabled={dashboardSizeOptions.indexOf(size) === 0} className={cx("px-2 py-1 transition disabled:opacity-35", t.hoverSoft)}>−</button><span className={cx("border-x px-2 py-1", t.divider)}>{dashboardSizeLabels[size] || "Normalny"}</span><button type="button" onClick={(event) => { event.stopPropagation(); onSizeChange("increase"); }} disabled={dashboardSizeOptions.indexOf(size) === dashboardSizeOptions.length - 1} className={cx("px-2 py-1 transition disabled:opacity-35", t.hoverSoft)}>+</button></motion.div></>}
      <motion.div layout className={cx("h-full transition-shadow duration-200", isEditing && "rounded-[1.9rem] ring-2 ring-violet-400/50 ring-offset-2", isEditing && t.ringOffset)}>{children}</motion.div>
    </motion.div>
  );
}
function DashboardCard({ t, children, className = "" }) {
  return <section className={cx("flex h-full min-h-[280px] flex-col rounded-[1.75rem] border p-4 shadow-xl backdrop-blur-xl", t.card, className)}>{children}</section>;
}
function SectionTabs({ activeSection, onChange }) {
  const tabs = [
    { id: "info", icon: <LayoutDashboard size={23} />, title: "Pulpit", tone: "violet" },
    { id: "tasks", icon: <CheckSquare2 size={23} />, title: "Zadania", tone: "emerald" },
    { id: "help", icon: <BookOpen size={23} />, title: "Instrukcja", tone: "sky" },
  ];
  const toneClass = {
    violet: { active: "bg-violet-500 text-white shadow-xl shadow-violet-500/25 ring-4 ring-violet-300/35", idle: "bg-transparent text-violet-400 ring-1 ring-violet-400/30 hover:bg-violet-500/10", line: "from-violet-400/35" },
    sky: { active: "bg-sky-500 text-white shadow-xl shadow-sky-500/25 ring-4 ring-sky-300/35", idle: "bg-transparent text-sky-400 ring-1 ring-sky-400/30 hover:bg-sky-500/10", line: "via-sky-400/45" },
    emerald: { active: "bg-emerald-500 text-white shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-300/35", idle: "bg-transparent text-emerald-400 ring-1 ring-emerald-400/30 hover:bg-emerald-500/10", line: "to-emerald-400/35" },
  };
  return (
    <div className="mb-6 flex justify-center">
      <div className="relative flex items-center justify-center gap-6 px-4 py-2 sm:gap-8">
        <div className="pointer-events-none absolute left-16 right-16 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-400/35 via-emerald-400/45 to-sky-400/35" />
        {tabs.map((tab, index) => {
          const isActive = activeSection === tab.id;
          return (
            <React.Fragment key={tab.id}>
              {index > 0 && <div className="relative z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur sm:flex"><ChevronRight size={16} className="text-sky-400" /></div>}
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-label={`Pokaż: ${tab.title}`}
                title={tab.title}
                className={cx("relative z-10 flex h-14 w-14 items-center justify-center rounded-full transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-violet-300/45", isActive ? toneClass[tab.tone].active : toneClass[tab.tone].idle)}
              >
                {tab.icon}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
function HelpGuide({ t, onGoToInfo, onGoToTasks, onNewTask, onOpenTimeline, onOpenPerformance, onOpenGallery, onOpenArchive }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const quickFlow = [
    { icon: <LayoutDashboard size={32} />, step: "01", title: "Sprawdź status projektu", hint: "Pulpit pokazuje postęp, terminy i najbliższe zadania.", gradient: "from-violet-400 to-fuchsia-500" },
    { icon: <Plus size={32} />, step: "02", title: "Dodaj kartę", hint: "Utwórz szybki task albo pełną kartę z opisem i zdjęciem.", gradient: "from-sky-400 to-cyan-500" },
    { icon: <GripVertical size={32} />, step: "03", title: "Przesuwaj pracę", hint: "Zmieniaj etap zadania przez przeciąganie kart między kolumnami.", gradient: "from-emerald-400 to-teal-500" },
    { icon: <Archive size={32} />, step: "04", title: "Porządkuj", hint: "Gotowe sprawy przenieś do archiwum zamiast od razu usuwać.", gradient: "from-amber-400 to-orange-500" },
  ];

  const topics = [
    {
      id: "dashboard",
      icon: <LayoutDashboard size={26} />,
      title: "Dashboard",
      hint: "Szybki podgląd projektu",
      accent: "from-violet-400 to-fuchsia-500",
      details: {
        title: "Dashboard — centrum informacji",
        intro: "Sekcja Informacje służy do szybkiego sprawdzenia stanu pracy bez wchodzenia w każdą kartę osobno. To miejsce najlepiej traktować jako panel kontrolny projektu.",
        points: [
          "Project Progress pokazuje ogólny udział zadań ukończonych w aktywnej pracy.",
          "Today's Tasks pozwala szybko dodać nowe zadanie z terminem i etapem.",
          "Calendar pokazuje miesiąc oraz dni, do których przypisano zadania.",
          "Tasks Timeline daje wizualny podgląd terminów na osi czasu."
        ],
        tip: "Najlepiej zaczynać dzień od Dashboardu: szybko zobaczysz, co jest pilne, co utknęło i czy coś zbliża się do terminu."
      },
    },
    {
      id: "tasks",
      icon: <CheckSquare2 size={26} />,
      title: "Karty zadań",
      hint: "Opis, etap, subtaski i zdjęcia",
      accent: "from-emerald-400 to-teal-500",
      details: {
        title: "Karty zadań — pojedyncze sprawy do wykonania",
        intro: "Każda karta reprezentuje jedno zadanie. Może mieć nazwę, opis, termin, etap, etykiety, subtaski oraz zdjęcia. Dzięki temu jedna karta może przechowywać zarówno prostą notatkę, jak i pełniejszy opis sprawy.",
        points: [
          "Kliknięcie karty otwiera okno edycji.",
          "Zmiana etapu odbywa się przez wybór w oknie edycji albo przeciągnięcie karty między kolumnami.",
          "Subtaski pomagają rozbić większe zadanie na mniejsze kroki.",
          "Zdjęcia dodane do karty pojawią się także w galerii zdjęć."
        ],
        tip: "Dla większych spraw twórz subtaski. Dzięki temu postęp będzie bardziej czytelny niż samo przerzucanie karty między kolumnami."
      },
    },
    {
      id: "timeline",
      icon: <Clock3 size={26} />,
      title: "Timeline",
      hint: "Planowanie terminów na osi czasu",
      accent: "from-sky-400 to-blue-500",
      details: {
        title: "Timeline — planowanie w czasie",
        intro: "Timeline pokazuje zadania według ich terminów. W małej kafelce widzisz szybki podgląd, a po kliknięciu kafelki otwiera się szczegółowy widok osi czasu.",
        points: [
          "Możesz wybrać zakres widoku: tydzień, miesiąc, kwartał albo rok.",
          "Przeciągnięcie paska zadania w szczegółowym widoku zmienia termin w oryginalnej karcie.",
          "Podświetlenia pomagają zobaczyć, do którego dnia przypisane jest zadanie.",
          "Kolor paska odpowiada etapowi, w którym znajduje się zadanie."
        ],
        tip: "Gdy ustawiasz termin, patrz na podświetloną datę na osi. To ona pokazuje dzień, do którego zadanie zostanie przypisane."
      },
    },
    {
      id: "archive",
      icon: <Archive size={26} />,
      title: "Archiwum",
      hint: "Zadania zakończone, ale zachowane",
      accent: "from-amber-400 to-orange-500",
      details: {
        title: "Archiwum — bezpieczne odłożenie zadania",
        intro: "Archiwum służy do przechowywania zadań, które są zakończone albo chwilowo niepotrzebne, ale nie powinny zostać usunięte. To takie eleganckie pudełko opisane markerem, a nie czarna dziura.",
        points: [
          "Zarchiwizowane zadania znikają z głównej tablicy Kanban.",
          "Nadal są uwzględniane w raporcie postępów i galerii zdjęć.",
          "Możesz otworzyć kartę z archiwum i przywrócić ją do kolumny Gotowe.",
          "Usuwanie jest osobną akcją i oznacza trwałe skasowanie karty z aplikacji."
        ],
        tip: "Archiwum warto stosować do spraw zakończonych, które mogą się jeszcze przydać jako historia pracy, dowód, notatka albo wzór."
      },
    },
    {
      id: "gallery",
      icon: <ImageIcon size={26} />,
      title: "Galeria zdjęć",
      hint: "Wszystkie obrazy z tasków",
      accent: "from-pink-400 to-rose-500",
      details: {
        title: "Galeria zdjęć — szybkie odnajdywanie załączników",
        intro: "Galeria zbiera zdjęcia ze wszystkich kart, również tych z archiwum. Dzięki temu nie trzeba pamiętać, w którym zadaniu było konkretne zdjęcie.",
        points: [
          "Kliknięcie miniatury otwiera większy podgląd.",
          "Podgląd pokazuje nazwę zadania, opis, termin i nazwę pliku.",
          "Przycisk Zaprowadź mnie do tego zadania otwiera właściwą kartę.",
          "Zdjęcia są zmniejszane przy dodawaniu, aby aplikacja była lżejsza."
        ],
        tip: "To przydatne, gdy zadania są dokumentowane zdjęciami, zrzutami ekranu albo skanami. Galeria działa jak wizualny indeks spraw."
      },
    },
    {
      id: "report",
      icon: <Activity size={26} />,
      title: "Raport",
      hint: "Postęp i wydajność pracy",
      accent: "from-cyan-400 to-violet-500",
      details: {
        title: "Raport postępów — liczby bez ręcznego liczenia",
        intro: "Raport zbiera dane z całej aplikacji: zadań aktywnych, ukończonych i archiwalnych. Pokazuje nie tylko liczbę kart, ale też postęp subtasków, rozkład po etapach oraz zadania po terminie.",
        points: [
          "Wszystkie karty obejmują także archiwum.",
          "Ukończenie liczone jest na podstawie kolumny Gotowe oraz postępu subtasków.",
          "Po terminie oznacza aktywne zadania z datą wcześniejszą niż dzisiaj.",
          "Rozkład po etapach pokazuje, gdzie gromadzi się najwięcej pracy."
        ],
        tip: "Raport pomaga zobaczyć, czy projekt idzie płynnie, czy zadania zaczynają kumulować się w jednym etapie."
      },
    },
  ];

  const navigationCards = [
    { icon: <LayoutDashboard size={28} />, title: "Dashboard", hint: "Postęp, kalendarz i panel sterowania", action: onGoToInfo, accent: "from-violet-400 to-fuchsia-500", tag: "Informacje" },
    { icon: <Plus size={28} />, title: "Nowe zadanie", hint: "Otwiera pełną kartę edycji", action: onNewTask, accent: "from-sky-400 to-cyan-500", tag: "Start" },
    { icon: <CheckSquare2 size={28} />, title: "Tablica zadań", hint: "Kolumny Kanban i przesuwanie kart", action: onGoToTasks, accent: "from-emerald-400 to-teal-500", tag: "Zadania" },
    { icon: <Clock3 size={28} />, title: "Timeline", hint: "Szczegółowy widok terminów", action: onOpenTimeline, accent: "from-blue-400 to-sky-500", tag: "Plan" },
    { icon: <Activity size={28} />, title: "Raport", hint: "Postęp, wydajność i archiwum", action: onOpenPerformance, accent: "from-cyan-400 to-violet-500", tag: "Analiza" },
    { icon: <ImageIcon size={28} />, title: "Galeria", hint: "Zdjęcia ze wszystkich tasków", action: onOpenGallery, accent: "from-pink-400 to-rose-500", tag: "Zdjęcia" },
    { icon: <Archive size={28} />, title: "Archiwum", hint: "Zadania odłożone, ale zachowane", action: onOpenArchive, accent: "from-amber-400 to-orange-500", tag: "Historia" },
  ];

  return (
    <motion.section key="help-section" className="grid gap-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
      <div className={cx("rounded-[2rem] border p-5 shadow-xl backdrop-blur-xl", t.card)}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><BookOpen size={14} /> Instrukcja obsługi</div>
            <h2 className="text-2xl font-black">Szybki przewodnik po aplikacji</h2>
            <p className={cx("mt-1 max-w-2xl text-sm leading-6", t.textMuted)}>Najważniejsze działania są pokazane skrótowo. Szczegółowy opis znajdziesz po kliknięciu wybranej kafelki.</p>
          </div>
          <div className={cx("flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ring-1", t.chip)}><Sparkles size={15} /> kliknij kafelkę, żeby rozwinąć</div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {quickFlow.map((item, index) => (
            <div key={item.step} className="relative">
              {index > 0 && <ChevronRight className="absolute -left-5 top-1/2 z-10 hidden -translate-y-1/2 text-sky-400 md:block" size={22} />}
              <div className={cx("h-full rounded-3xl border p-4 text-center shadow-lg", t.cardSolid)}>
                <div className={cx("mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-lg", item.gradient)}>{item.icon}</div>
                <div className={cx("mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black", t.buttonPrimary)}>{item.step}</div>
                <h3 className="text-base font-black">{item.title}</h3>
                <p className={cx("mt-1 text-xs font-semibold leading-5", t.textSoft)}>{item.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className={cx("rounded-[2rem] border p-5 shadow-xl backdrop-blur-xl", t.card)}>
          <DashboardTitle t={t} icon={<Sparkles size={12} />} eyebrow="Moduły" title="Kliknij, aby zobaczyć szczegóły" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <button key={topic.id} type="button" onClick={() => setSelectedTopic(topic)} className={cx("group rounded-3xl border p-4 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl", t.cardSolid)}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className={cx("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition group-hover:scale-105", topic.accent)}>{topic.icon}</span>
                  <span className={cx("rounded-full px-2.5 py-1 text-[10px] font-black ring-1", t.chip)}>więcej</span>
                </div>
                <h3 className="text-base font-black">{topic.title}</h3>
                <p className={cx("mt-1 text-xs font-semibold leading-5", t.textSoft)}>{topic.hint}</p>
              </button>
            ))}
          </div>
        </section>

        <section className={cx("rounded-[2rem] border p-5 shadow-xl backdrop-blur-xl", t.card)}>
          <DashboardTitle t={t} icon={<LayoutDashboard size={12} />} eyebrow="Skróty" title="Najbardziej użyteczne miejsca" />
          <div className="grid gap-3">
            {navigationCards.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={item.action}
                className={cx("group rounded-3xl border p-3 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl", t.cardSolid)}
              >
                <div className="flex items-center gap-3">
                  <span className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition group-hover:scale-105", item.accent)}>{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="truncate text-sm font-black">{item.title}</h3>
                      <span className={cx("rounded-full px-2 py-0.5 text-[9px] font-black ring-1", t.chip)}>{item.tag}</span>
                    </div>
                    <p className={cx("text-xs font-semibold leading-5", t.textSoft)}>{item.hint}</p>
                  </div>
                  <ChevronRight size={20} className={cx("shrink-0 transition group-hover:translate-x-1", t.textSoft)} />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <HelpDetailModal t={t} topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
    </motion.section>
  );
}
function HelpDetailModal({ t, topic, onClose }) {
  return (
    <AnimatePresence>
      {topic && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className={cx("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", topic.accent)}>{topic.icon}</span>
                <div>
                  <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><BookOpen size={14} /> Szczegóły</div>
                  <h2 className="text-2xl font-black leading-tight">{topic.details.title}</h2>
                </div>
              </div>
              <button type="button" onClick={onClose} className={cx("shrink-0 rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <p className={cx("rounded-3xl border p-4 text-sm leading-7", t.cardSolid, t.textMuted)}>{topic.details.intro}</p>

            <div className="mt-4 grid gap-3">
              {topic.details.points.map((point, index) => (
                <div key={point} className={cx("flex gap-3 rounded-2xl border p-3", t.buttonSoft)}>
                  <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black", t.buttonPrimary)}>{index + 1}</span>
                  <p className="text-sm font-semibold leading-6">{point}</p>
                </div>
              ))}
            </div>

            <div className={cx("mt-4 rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-2 flex items-center gap-2 text-sm font-black"><Sparkles size={16} /> Dobra praktyka</div>
              <p className={cx("text-sm leading-7", t.textMuted)}>{topic.details.tip}</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button type="button" onClick={onClose} className={cx("rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5", t.buttonPrimary)}>Rozumiem</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function DashboardTitle({ t, icon, eyebrow, title, badge }) {
  return <div className="mb-4 flex items-start justify-between gap-3"><div><div className={cx("mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black ring-1", t.chip)}>{icon} {eyebrow}</div><h2 className="text-base font-black leading-tight capitalize">{title}</h2></div>{badge !== undefined && <span className={cx("inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-[10px] font-black leading-none", t.buttonPrimary)}>{badge}</span>}</div>;
}

function ProjectProgressCard({ t, progress, total, done, archived }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return <DashboardCard t={t}><DashboardTitle t={t} icon={<TrendingUp size={12} />} eyebrow="Postęp" title="Postęp projektu" /><div className="flex items-center justify-center"><div className="relative h-40 w-40"><svg viewBox="0 0 140 140" className="h-full w-full -rotate-90"><circle cx="70" cy="70" r={radius} fill="none" stroke={t.progressCircleTrack} strokeWidth="14" /><circle cx="70" cy="70" r={radius} fill="none" stroke="url(#progressGradient)" strokeWidth="14" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} /><defs><linearGradient id="progressGradient" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#38bdf8" /><stop offset="55%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs></svg><div className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-3xl font-black">{progress}%</span><span className={cx("text-xs font-semibold", t.textMuted)}>ukończone</span></div></div></div><div className="mt-2 grid grid-cols-3 gap-2 text-center"><MiniMetric t={t} value={done} label="Gotowe" tone="bg-emerald-400" /><MiniMetric t={t} value={total} label="Aktywne" tone="bg-sky-400" /><MiniMetric t={t} value={archived} label="Archiwum" tone="bg-violet-400" /></div></DashboardCard>;
}
function MiniMetric({ t, value, label, tone }) {
  return <div className={cx("rounded-2xl p-2 ring-1", t.chip)}><div className="flex items-center justify-center gap-1"><span className={cx("h-2 w-2 rounded-full", tone)} /><span className="text-lg font-black">{value}</span></div><p className={cx("text-[10px] font-semibold", t.textMuted)}>{label}</p></div>;
}
function QuickAddPanel({ t, columns, quickTask, setQuickTask, onQuickAdd, upcomingTasks, onOpenTask }) {
  return (
    <DashboardCard t={t}>
      <DashboardTitle t={t} icon={<CheckSquare2 size={12} />} eyebrow="Dzisiaj" title="Dzisiejsze zadania" badge={upcomingTasks.length} />
      <div className="grid gap-3">
        <input
          value={quickTask.title}
          onChange={(event) => setQuickTask((current) => ({ ...current, title: event.target.value }))}
          onKeyDown={(event) => {
            if (event.key === "Enter") onQuickAdd();
          }}
          placeholder="+ Dodaj nowe zadanie"
          className={cx("rounded-2xl border border-dashed px-4 py-3 text-sm font-semibold outline-none ring-violet-300 transition focus:ring-4", t.input, "border-violet-300 placeholder:text-violet-400")}
        />

        <label className="grid gap-1.5">
          <span className={cx("px-1 text-[10px] font-black uppercase tracking-wide", t.textSoft)}>Termin szybkiego taska</span>
          <input
            type="date"
            value={quickTask.dueDate || dateKey(new Date())}
            onChange={(event) => setQuickTask((current) => ({ ...current, dueDate: event.target.value }))}
            className={cx("rounded-2xl border px-3 py-2.5 text-xs font-bold outline-none ring-sky-300 transition focus:ring-4", t.input)}
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <select
            value={quickTask.columnId}
            onChange={(event) => setQuickTask((current) => ({ ...current, columnId: event.target.value }))}
            className={cx("rounded-2xl border px-3 py-2.5 text-xs font-bold outline-none ring-pink-300 transition focus:ring-4", t.input)}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id} style={selectOptionStyle(t)}>{column.title}</option>
            ))}
          </select>

          <button type="button" onClick={onQuickAdd} disabled={!quickTask.title.trim()} className="rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-0.5 disabled:opacity-40">Dodaj</button>
        </div>

        <label className="grid gap-1.5">
          <span className={cx("px-1 text-[10px] font-black uppercase tracking-wide", t.textSoft)}>Priorytet</span>
          <PriorityToggleGroup
            value={quickTask.priority}
            onChange={(priority) => setQuickTask((current) => ({ ...current, priority }))}
            isDark={t === theme.dark}
            compact
          />
        </label>

        <div className="grid gap-2">
          {upcomingTasks.slice(0, 3).map((task) => {
            const priority = priorityMeta(task.priority);
            return (
              <button type="button" key={task.id} onClick={() => onOpenTask(task)} className={cx("flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm", t.subtle)}>
                <span className={cx("h-4 w-4 rounded-md border", t.border)} />
                <span className="min-w-0 flex-1 truncate">{task.title}</span>
                <span className={cx("rounded-full px-2 py-1 text-[9px] font-black ring-1", priorityChipClass(task.priority, t === theme.dark))}>{priority.title}</span>
                <span className={cx("text-[10px]", t.textSoft)}>{formatDate(task.dueDate)}</span>
              </button>
            );
          })}
          {upcomingTasks.length === 0 && <p className={cx("rounded-2xl p-3 text-xs", t.subtle)}>Brak najbliższych terminów. Podejrzanie miło.</p>}
        </div>
      </div>
    </DashboardCard>
  );
}
function MonthCalendar({ t, isDark, month, tasks, columns = defaultColumns, onOpenTask, onCreateTaskForDate, onPreviousMonth, onNextMonth, onToday, onOpenCalendar }) {
  const [selectedDayKey, setSelectedDayKey] = useState("");
  const days = buildMonthDays(month);
  const tasksByDay = useMemo(() => {
    return tasks.reduce((grouped, task) => {
      if (!task?.dueDate) return grouped;
      if (!grouped[task.dueDate]) grouped[task.dueDate] = [];
      grouped[task.dueDate].push(task);
      return grouped;
    }, {});
  }, [tasks]);
  const weekdays = ["P", "W", "Ś", "C", "P", "S", "N"];
  const selectedDayTasks = useMemo(() => {
    if (!selectedDayKey) return [];
    return (tasksByDay[selectedDayKey] || []).slice().sort((a, b) => a.title.localeCompare(b.title, "pl-PL"));
  }, [selectedDayKey, tasksByDay]);

  function handleDayClick(dayKey) {
    const dayTasks = tasksByDay[dayKey] || [];
    if (dayTasks.length === 0) {
      onCreateTaskForDate?.(dayKey);
      return;
    }
    if (dayTasks.length === 1) {
      onOpenTask(dayTasks[0]);
      return;
    }
    setSelectedDayKey(dayKey);
  }

  return (
    <>
      <DashboardCard t={t}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <DashboardTitle t={t} icon={<CalendarDays size={12} />} eyebrow="Kalendarz" title={monthLabel(month)} />
            <div className="mb-4 flex shrink-0 items-center gap-1">
              <button type="button" onClick={onPreviousMonth} className={cx("rounded-lg border p-1", t.buttonSoft)}><ChevronLeft size={13} /></button>
              <button type="button" onClick={onToday} className={cx("rounded-lg border px-2 py-1 text-[10px] font-black", t.buttonSoft)}>Dziś</button>
              <button type="button" onClick={onNextMonth} className={cx("rounded-lg border p-1", t.buttonSoft)}><ChevronRight size={13} /></button>
              <button type="button" onClick={onOpenCalendar} className={cx("rounded-lg border px-2 py-1 text-[10px] font-black", t.buttonSoft)}>Pełny widok</button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))] gap-x-1.5 gap-y-1.5">
            {weekdays.map((day, index) => (
              <div key={`${day}-${index}`} className={cx("flex items-center justify-center text-[10px] font-black uppercase", t.textSoft)}>{day}</div>
            ))}
            {days.map((day) => {
              const dayTasks = tasksByDay[day.key] || [];
              const firstTask = dayTasks[0];
              const stageGradient = firstTask ? stageGradientForTask(firstTask, columns) : "";
              const stageTitle = firstTask ? stageTitleForTask(firstTask, columns) : "";
              const stageDots = dayTasks.slice(0, 4).map((task) => ({
                id: task.id,
                gradient: stageGradientForTask(task, columns),
                title: stageTitleForTask(task, columns),
              }));
              const emptyCircleClass = day.inCurrentMonth ? t.emptyDay : cx("opacity-45", t.textSoft);

              return (
                <div key={day.key} className="flex min-h-0 items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleDayClick(day.key)}
                    title={firstTask ? `${taskTitlesForTooltip(dayTasks)}
Etap: ${stageTitle}${dayTasks.length > 1 ? `
Kliknij, aby wybrać jedno z ${dayTasks.length} zadań.` : ""}` : `Utwórz nowe zadanie z terminem: ${formatDate(day.key, { day: "2-digit", month: "long", year: "numeric" })}`}
                    style={!day.inCurrentMonth ? { background: "repeating-linear-gradient(135deg, rgba(148,163,184,.18) 0 3px, rgba(148,163,184,.04) 3px 6px)" } : undefined}
                    className={cx(
                      "relative flex aspect-square h-full max-h-10 min-h-7 w-full max-w-10 min-w-7 items-center justify-center rounded-full text-[11px] font-black transition sm:max-h-11 sm:max-w-11",
                      firstTask ? cx("bg-gradient-to-br text-white shadow-md hover:-translate-y-0.5", stageGradient) : emptyCircleClass,
                      day.isToday && cx("ring-2 ring-pink-300 ring-offset-1", t.ringOffset)
                    )}
                  >
                    <span className="relative z-10">{day.date.getDate()}</span>
                    {stageDots.length > 1 && (
                      <span className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 gap-0.5">
                        {stageDots.map((dot) => (
                          <span key={dot.id} title={dot.title} className={cx("h-1.5 w-1.5 rounded-full bg-gradient-to-br ring-1 ring-white/70", dot.gradient)} />
                        ))}
                      </span>
                    )}
                    {dayTasks.length > 1 && (
                      <span className={cx("absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] font-black ring-2", t.buttonPrimary, isDark ? "ring-slate-950" : "ring-white")}>{dayTasks.length}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </DashboardCard>

      <DayTaskPickerModal
        t={t}
        open={Boolean(selectedDayKey)}
        dayKeyValue={selectedDayKey}
        tasks={selectedDayTasks}
        columns={columns}
        onClose={() => setSelectedDayKey("")}
        onOpenTask={(task) => {
          setSelectedDayKey("");
          onOpenTask(task);
        }}
        onCreateTask={() => {
          const nextDay = selectedDayKey;
          setSelectedDayKey("");
          if (nextDay) onCreateTaskForDate?.(nextDay);
        }}
      />
    </>
  );
}

function DayTaskPickerModal({ t, open, dayKeyValue, tasks, columns, onClose, onOpenTask, onCreateTask }) {
  const leadTask = tasks[0];
  const accent = leadTask ? stageGradientForTask(leadTask, columns) : "from-violet-500 to-fuchsia-500";
  const dayDate = dayKeyValue ? parseLocalDate(dayKeyValue) : null;
  const dayNumber = dayDate ? dayDate.getDate() : "";
  const summary =
    tasks.length === 0
      ? "Na ten dzień nie ma jeszcze zadań. Możesz od razu dodać nowe."
      : tasks.length === 1
        ? "Na ten dzień przypisano 1 zadanie. Kliknij kartę, aby przejść do szczegółów."
        : `Na ten dzień przypisano ${tasks.length} ${tasks.length < 5 ? "zadania" : "zadań"}. Wybierz kartę, którą chcesz otworzyć.`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[2rem] border shadow-2xl", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className={cx("relative overflow-hidden border-b p-5 sm:p-6", t.border)}>
              <div className={cx("absolute inset-0 bg-gradient-to-br opacity-95", accent)} />
              <div className="relative flex items-start justify-between gap-4 text-white">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black shadow-sm backdrop-blur">
                    <CalendarDays size={14} /> Szczegóły dnia
                  </div>
                  <h3 className="text-2xl font-black leading-tight">{formatDate(dayKeyValue, { day: "2-digit", month: "long", year: "numeric" })}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">{summary}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="inline-flex h-12 min-w-12 items-center justify-center rounded-full bg-white/90 px-3 text-lg font-black text-violet-700 shadow-lg">{dayNumber}</span>
                  <button type="button" onClick={onClose} className="rounded-2xl bg-white/12 p-2 text-white transition hover:bg-white/20"><X /></button>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {tasks.length === 0 ? (
                <div className={cx("rounded-3xl border border-dashed p-5 text-sm leading-6", t.border, t.textMuted)}>
                  Ten dzień jest pusty. Możesz dodać nowe zadanie i od razu przypisać je do wybranej daty.
                </div>
              ) : (
                <div className="grid max-h-[52vh] gap-3 overflow-y-auto pr-1">
                  {tasks.map((task) => {
                    const column = columns.find((item) => item.id === task.columnId);
                    const progress = progressOf(task);
                    const labels = task.labels || [];
                    return (
                      <button key={task.id} type="button" onClick={() => onOpenTask(task)} className={cx("rounded-3xl border p-4 text-left shadow-lg transition hover:-translate-y-0.5", t.cardSolid)}>
                        <div className={cx("mb-3 h-1.5 w-24 rounded-full bg-gradient-to-r", column?.accent || "from-slate-400 to-slate-600")} />
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className={cx("rounded-full px-2.5 py-1 text-[10px] font-black ring-1", priorityChipClass(task.priority, t === theme.dark))}>{priorityMeta(task.priority).title}</span>
                            </div>
                            <h4 className="line-clamp-2 text-base font-black leading-snug">{task.title}</h4>
                            {task.description ? <p className={cx("mt-2 line-clamp-3 text-sm leading-6", t.textMuted)}>{task.description}</p> : <p className={cx("mt-2 text-sm leading-6", t.textSoft)}>Brak dodatkowego opisu.</p>}
                          </div>
                          <span className={cx("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ring-1", t.chip)}>{progress}%</span>
                        </div>
                        <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-black">
                          <span className={cx("rounded-full px-2.5 py-1 ring-1", t.chip)}>{column?.title || "Bez etapu"}</span>
                          <span className={cx("rounded-full px-2.5 py-1 ring-1", t.chip)}>{formatDate(task.dueDate, { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                          {labels.slice(0, 3).map((label) => <span key={label.id} className={cx("rounded-full px-2.5 py-1 ring-1", t.chip)}>{label.text}</span>)}
                        </div>
                        <div className={cx("h-2 overflow-hidden rounded-full", t.progressTrack)}>
                          <div className={cx("h-full rounded-full bg-gradient-to-r", column?.accent || "from-pink-400 to-sky-400")} style={{ width: `${progress}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className={cx("rounded-2xl border px-4 py-2.5 text-xs font-black transition", t.buttonSoft)}>Zamknij</button>
                <button type="button" onClick={onCreateTask} className={cx("rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5", t.buttonPrimary)}><Plus size={14} className="mr-1 inline" /> Nowe zadanie</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CalendarDetailsModal({ t, isDark, open, month, tasks, columns = defaultColumns, onClose, onOpenTask, onCreateTaskForDate, onPreviousMonth, onNextMonth, onToday }) {
  const days = buildMonthDays(month);
  const [selectedDayKey, setSelectedDayKey] = useState("");
  const tasksByDay = useMemo(() => {
    return tasks.reduce((grouped, task) => {
      if (!task?.dueDate) return grouped;
      if (!grouped[task.dueDate]) grouped[task.dueDate] = [];
      grouped[task.dueDate].push(task);
      return grouped;
    }, {});
  }, [tasks]);
  const weekdays = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"];
  const currentMonthTaskCount = useMemo(() => {
    return tasks.filter((task) => {
      const due = parseLocalDate(task.dueDate);
      return due && due.getFullYear() === month.getFullYear() && due.getMonth() === month.getMonth();
    }).length;
  }, [tasks, month]);
  const selectedTasks = useMemo(() => {
    if (!selectedDayKey) return [];
    return (tasksByDay[selectedDayKey] || []).slice().sort((a, b) => a.title.localeCompare(b.title, "pl-PL"));
  }, [selectedDayKey, tasksByDay]);

  useEffect(() => {
    if (!open) setSelectedDayKey("");
  }, [open, month]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("h-[min(94vh,920px)] w-full max-w-7xl overflow-hidden rounded-[2rem] border shadow-2xl", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b p-5 sm:p-6">
                <div>
                  <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><CalendarDays size={14} /> Kalendarz szczegółowy</div>
                  <h2 className="text-2xl font-black">{monthLabel(month)}</h2>
                  <p className={cx("mt-1 text-sm leading-6", t.textMuted)}>{currentMonthTaskCount} {currentMonthTaskCount === 1 ? "zadanie" : currentMonthTaskCount < 5 ? "zadania" : "zadań"} w tym miesiącu. Kliknij dzień, aby otworzyć popup z pełną listą.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className={cx("inline-flex items-center overflow-hidden rounded-2xl border shadow-sm", t.buttonSoft)}>
                    <button type="button" onClick={onPreviousMonth} className={cx("px-3 py-2 transition", t.hoverSoft)}><ChevronLeft size={16} /></button>
                    <button type="button" onClick={onToday} className={cx("border-x px-3 py-2 text-xs font-black transition", t.divider, t.hoverSoft)}>Dziś</button>
                    <button type="button" onClick={onNextMonth} className={cx("px-3 py-2 transition", t.hoverSoft)}><ChevronRight size={16} /></button>
                  </div>
                  <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
                </div>
              </div>

              <div className={cx("grid grid-cols-7 border-b px-2 py-2 text-center text-[11px] font-black uppercase tracking-wide", isDark ? "border-white/10 bg-white/[0.04] text-slate-400" : "border-slate-200 bg-slate-100/70 text-slate-500")}>
                {weekdays.map((day) => (
                  <div key={day} className="px-2 py-1">{day}</div>
                ))}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className={cx("grid grid-cols-7", isDark ? "bg-slate-950/35" : "bg-white/35")}>
                  {days.map((day) => {
                    const dayTasks = tasksByDay[day.key] || [];
                    const isSelected = selectedDayKey === day.key;
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => setSelectedDayKey(day.key)}
                        className={cx(
                          "group min-h-[118px] overflow-hidden border p-2 text-left align-top transition hover:bg-white/[0.03]",
                          isDark ? "border-white/10" : "border-slate-200/80",
                          !day.inCurrentMonth && "opacity-45",
                          isSelected && (isDark ? "bg-violet-500/10 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.55)]" : "bg-violet-50 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.55)]")
                        )}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className={cx("text-sm font-black", day.isToday ? (isDark ? "text-pink-200" : "text-pink-600") : t.textMuted)}>{day.date.getDate()}</span>
                          {dayTasks.length > 0 && <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-black ring-1", t.chip)}>{dayTasks.length}</span>}
                        </div>

                        <div className="grid gap-1.5">
                          {dayTasks.slice(0, 3).map((task) => (
                            <div key={task.id} className={cx("overflow-hidden rounded-xl border px-2 py-1.5 text-[10px] font-black shadow-sm", isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200/90 bg-white/90")}>
                              <div className={cx("mb-1 h-px w-full rounded-full bg-gradient-to-r", stageGradientForTask(task, columns))} />
                              <p className={cx("truncate leading-none", isDark ? "text-slate-100" : "text-slate-800")}>{task.title}</p>
                            </div>
                          ))}
                          {dayTasks.length > 3 && <p className={cx("px-1 text-[10px] font-black", t.textSoft)}>+{dayTasks.length - 3} więcej</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DayTaskPickerModal
              t={t}
              open={Boolean(selectedDayKey)}
              dayKeyValue={selectedDayKey}
              tasks={selectedTasks}
              columns={columns}
              onClose={() => setSelectedDayKey("")}
              onOpenTask={(task) => {
                setSelectedDayKey("");
                onOpenTask(task);
              }}
              onCreateTask={() => {
                const nextDay = selectedDayKey;
                setSelectedDayKey("");
                if (nextDay) onCreateTaskForDate(nextDay);
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TaskProgressCard({ t, columnStats, total }) {
  const maxCount = Math.max(1, ...columnStats.map((item) => item.count));
  return (
    <DashboardCard t={t}>
      <DashboardTitle t={t} icon={<Activity size={12} />} eyebrow="Wykres" title="Task Progress" />
      <div className="flex min-h-0 flex-1 items-end gap-3 px-1 pt-2">
        {columnStats.map((column) => {
          const height = column.count > 0 ? `${14 + (column.count / maxCount) * 86}%` : "8%";
          const percent = total ? Math.round((column.count / total) * 100) : 0;
          return (
            <div key={column.id} className="flex h-full min-h-0 flex-1 flex-col items-center gap-2">
              <div className={cx("flex min-h-0 w-full flex-1 items-end justify-center rounded-2xl p-1", t.miniTrack)}>
                <motion.div
                  layout
                  className={cx("w-full rounded-xl bg-gradient-to-t shadow-lg transition-all", column.accent)}
                  style={{ height }}
                  title={`${column.title}: ${column.count} tasków`}
                />
              </div>
              <div className="shrink-0 text-center">
                <p className={cx("text-[10px] font-black", t.textMuted)}>{percent}%</p>
                <p className={cx("max-w-16 truncate text-[10px] font-semibold", t.textSoft)}>{column.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
function DashboardActionsCard({ t, archivedCount, galleryCount, onNewTask, onArchive, onPerformance, onGallery }) {
  return (
    <DashboardCard t={t}>
      <DashboardTitle t={t} icon={<Sparkles size={12} />} eyebrow="Akcje" title="Panel sterowania" />
      <div className="grid gap-3">
        <button type="button" onClick={onNewTask} className={cx("group inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold shadow-lg transition hover:-translate-y-0.5", t.actionPrimary)}><Plus size={18} className="transition group-hover:rotate-90" />Dodaj większe zadanie</button>
        <button type="button" onClick={onPerformance} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5", t.actionSecondary)}><Activity size={18} />Raport postępów</button>
        <button type="button" onClick={onGallery} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5", t.actionSecondary)}><ImageIcon size={18} />Galeria zdjęć ({galleryCount})</button>
        <button type="button" onClick={onArchive} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5", t.actionSecondary)}><Archive size={18} />Archiwum ({archivedCount})</button>
      </div>
    </DashboardCard>
  );
}
function TimelineCard({ t, tasks, month, columns, onOpenTask, onOpenDetails }) {
  const isDarkTimeline = t === theme.dark;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const weekStart = new Date(today);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weeklyTasks = tasks.filter((task) => {
    const due = parseLocalDate(task.dueDate);
    return due && due >= weekStart && due <= weekEnd;
  });
  const visibleTasks = weeklyTasks.slice(0, 4);
  const rangeMs = Math.max(1, weekEnd.getTime() - weekStart.getTime());
  const percentForDate = (date) => clampNumber(((date.getTime() - weekStart.getTime()) / rangeMs) * 100, 0, 100);
  const axisDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const highlightedAxisDates = new Set(
    visibleTasks
      .map((task) => {
        const due = parseLocalDate(task.dueDate);
        const snappedDue = snapDateToDateTicks(due, axisDays);
        return snappedDue ? dateKey(snappedDue) : null;
      })
      .filter(Boolean)
  );
  const rangeLabel = `${formatDate(dateKey(weekStart), { day: "2-digit", month: "short" })} – ${formatDate(dateKey(weekEnd), { day: "2-digit", month: "short" })}`;

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenDetails();
    }
  }

  if (!visibleTasks.length) {
    return (
      <DashboardCard t={t}>
        <div role="button" tabIndex={0} onClick={onOpenDetails} onKeyDown={handleKeyDown} className="flex h-full cursor-pointer flex-col rounded-[1.5rem] outline-none transition focus:ring-4 focus:ring-sky-300/40">
          <DashboardTitle t={t} icon={<Clock3 size={12} />} eyebrow="Plan" title={`Tasks Timeline • ${rangeLabel}`} badge={0} />
          <p className={cx("flex flex-1 items-center rounded-2xl p-4 text-sm", t.subtle)}>Brak tasków w najbliższych 7 dniach. Timeline ma chwilę ciszy.</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard t={t}>
      <div role="button" tabIndex={0} onClick={onOpenDetails} onKeyDown={handleKeyDown} className="flex h-full cursor-pointer flex-col rounded-[1.5rem] outline-none transition focus:ring-4 focus:ring-sky-300/40">
        <DashboardTitle t={t} icon={<Clock3 size={12} />} eyebrow="Plan" title={`Tasks Timeline • ${rangeLabel}`} badge={visibleTasks.length} />
        <div className="relative min-h-[180px] flex-1 overflow-hidden rounded-3xl px-2 pb-12 pt-3">
          <div className="absolute inset-x-2 top-4 bottom-12">
            {[0, 1, 2, 3].map((line) => (
              <div key={line} className={cx("absolute left-0 right-0 border-t border-dashed", t.border)} style={{ top: `${line * 28 + 8}px`, opacity: 0.55 }} />
            ))}
          </div>

          <div className="absolute bottom-12 top-3 z-20 w-0.5 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(168,85,247,.70)]" style={{ left: `${percentForDate(today)}%` }} title="Dzisiaj">
            <span className="absolute -left-1.5 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-violet-200 bg-violet-500" />
          </div>

          {visibleTasks.map((task, index) => {
            const due = parseLocalDate(task.dueDate);
            const displayDueKey = task.dueDate;
            const column = columns.find((item) => item.id === task.columnId);
            const barClass = column?.accent || "from-slate-400 to-slate-600";
            const markerPercent = due ? percentForDate(due) : 0;
            const pillLeft = clampNumber(markerPercent, 15, 85);
            const rowTop = index * 28 + 18;
            const taskProgress = progressOf(task);

            return (
              <React.Fragment key={task.id}>
                <span
                  className={cx(
                    "pointer-events-none absolute z-20 w-[2px] -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(168,85,247,.28)]",
                    isDarkTimeline ? "bg-gradient-to-b from-white/60 via-violet-300/65 to-sky-300/28" : "bg-gradient-to-b from-violet-600/58 via-fuchsia-500/42 to-sky-400/25"
                  )}
                  style={{ left: `${markerPercent}%`, top: `${rowTop + 32}px`, bottom: "40px" }}
                />
                <span
                  className="pointer-events-none absolute z-30 h-2 w-2 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(168,85,247,.52)] ring-2 ring-white/60"
                  style={{ left: `${markerPercent}%`, bottom: "40px" }}
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenTask(task);
                  }}
                  className={cx("absolute z-20 -translate-x-1/2 rounded-2xl bg-gradient-to-r px-3 py-2 text-left text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110", barClass)}
                  style={{ top: `${rowTop}px`, left: `${pillLeft}%`, width: "clamp(92px, 30%, 150px)" }}
                  title={`${task.title} — ${formatDate(displayDueKey, { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                >
                  <span className="block truncate text-[11px] font-black leading-tight">{task.title}</span>
                  <span className="block truncate text-[9px] font-bold opacity-85">{taskProgress}% • {formatDate(displayDueKey)}</span>
                </button>
              </React.Fragment>
            );
          })}

          <div className={cx("pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-14 rounded-b-3xl border-t backdrop-blur-md", isDarkTimeline ? "border-white/10 bg-slate-950/78" : "border-white/70 bg-white/78")} />
          <div className="absolute bottom-2 left-0 right-0 z-40 h-10">
            {axisDays.map((date) => {
              const tickKey = dateKey(date);
              const isHighlighted = highlightedAxisDates.has(tickKey);
              const isTodayTick = tickKey === dateKey(today);
              return (
                <div key={tickKey} className="absolute flex min-w-[34px] -translate-x-1/2 flex-col items-center text-center" style={{ left: `${percentForDate(date)}%` }}>
                  <span className={cx("mb-1 rounded-full transition-all", isHighlighted ? "h-4 w-[2px] bg-gradient-to-b from-violet-400 to-sky-400 shadow-[0_0_10px_rgba(168,85,247,.45)]" : cx("h-2.5 w-px", isDarkTimeline ? "bg-slate-500/70" : "bg-slate-300/90"))} />
                  <span className={cx("text-[10px] font-black leading-none transition-all", isHighlighted || isTodayTick ? (isDarkTimeline ? "text-violet-100" : "text-violet-700") : t.textSoft)}>{date.toLocaleDateString("pl-PL", { weekday: "short" })}</span>
                  <span className={cx("mt-1 text-[9px] font-bold leading-none transition-all", isTodayTick ? (isDarkTimeline ? "text-sky-200" : "text-sky-700") : t.textMuted)}>{date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function TimelineDetailsModal({ t, open, tasks, columns, onClose, onOpenTask, onMoveTaskDate }) {
  const chartRef = useRef(null);
  const dragMetaRef = useRef({ taskId: null, startX: 0, moved: false, previewDate: null, originalDate: null });
  const clickGuardRef = useRef(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragPreview, setDragPreview] = useState({ taskId: null, dueDate: null });
  const [timelineView, setTimelineView] = useState("month");

  const taskDates = tasks.map((task) => parseLocalDate(task.dueDate)).filter(Boolean);
  const hasTasks = taskDates.length > 0;
  const rangeStart = hasTasks ? new Date(Math.min(...taskDates.map((date) => date.getTime()))) : new Date();
  const rangeEnd = hasTasks ? new Date(Math.max(...taskDates.map((date) => date.getTime()))) : new Date();

  rangeStart.setDate(rangeStart.getDate() - 4);
  rangeEnd.setDate(rangeEnd.getDate() + 4);

  const currentRangeDays = Math.max(1, Math.round((rangeEnd - rangeStart) / 86400000));
  if (currentRangeDays < 14) {
    const extra = 14 - currentRangeDays;
    rangeStart.setDate(rangeStart.getDate() - Math.ceil(extra / 2));
    rangeEnd.setDate(rangeEnd.getDate() + Math.floor(extra / 2));
  }

  const selectedTimelineView = normalizeTimelineView(timelineView);
  const preset = timelineViewPresets[selectedTimelineView];
  const isDarkTimeline = t === theme.dark;
  const taskMidpoint = new Date((rangeStart.getTime() + rangeEnd.getTime()) / 2);
  const todayForCenter = new Date();
  todayForCenter.setHours(12, 0, 0, 0);
  const centerDate = todayForCenter >= rangeStart && todayForCenter <= rangeEnd ? todayForCenter : taskMidpoint;
  const presetRangeMs = preset.days * 86400000;
  const visibleRangeStart = new Date(centerDate.getTime() - presetRangeMs / 2);
  const visibleRangeEnd = new Date(centerDate.getTime() + presetRangeMs / 2);
  const visibleRangeMs = Math.max(1, visibleRangeEnd.getTime() - visibleRangeStart.getTime());
  const axisTicks = buildTimelineAxisTicks(visibleRangeStart, preset);

  const percentForDate = (date) => clampNumber(((date.getTime() - visibleRangeStart.getTime()) / visibleRangeMs) * 100, 0, 100);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const showToday = today >= visibleRangeStart && today <= visibleRangeEnd;
  const timelineHeight = Math.max(360, Math.min(680, 130 + tasks.length * 42));
  const highlightedAxisItems = Array.from(
    new Map(
      tasks
        .map((task) => {
          const visibleDueDate = dragPreview.taskId === task.id && dragPreview.dueDate ? dragPreview.dueDate : task.dueDate;
          const rawDue = parseLocalDate(visibleDueDate);
          if (!rawDue || rawDue < visibleRangeStart || rawDue > visibleRangeEnd) return null;
          return [visibleDueDate, { key: visibleDueDate, date: rawDue, label: formatDate(visibleDueDate, { day: "2-digit", month: "short" }) }];
        })
        .filter(Boolean)
    ).values()
  );
  const highlightedAxisDates = new Set(
    tasks
      .map((task) => {
        const visibleDueDate = dragPreview.taskId === task.id && dragPreview.dueDate ? dragPreview.dueDate : task.dueDate;
        const rawDue = parseLocalDate(visibleDueDate);
        if (!rawDue || rawDue < visibleRangeStart || rawDue > visibleRangeEnd) return null;
        return snapDateToAxisTicks(rawDue, axisTicks);
      })
      .filter(Boolean)
  );

  function previewDraggedTaskDate(taskId, clientX) {
    const rect = chartRef.current?.getBoundingClientRect();
    const nextDate = dateFromTimelineDragDelta(dragMetaRef.current.startX, clientX, rect, dragMetaRef.current.originalDate, visibleRangeStart, visibleRangeMs);
    if (!nextDate) return null;

    dragMetaRef.current.previewDate = nextDate;
    setDragPreview((current) => (current.taskId === taskId && current.dueDate === nextDate ? current : { taskId, dueDate: nextDate }));
    return nextDate;
  }

  function startTimelineDrag(event, taskId) {
    event.preventDefault();
    event.stopPropagation();

    const task = tasks.find((item) => item.id === taskId);
    dragMetaRef.current = { taskId, startX: event.clientX, moved: false, previewDate: task?.dueDate || null, originalDate: parseLocalDate(task?.dueDate) };
    setDraggingTaskId(taskId);
    setDragPreview({ taskId, dueDate: task?.dueDate || null });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveTimelineDrag(event, taskId) {
    if (dragMetaRef.current.taskId !== taskId) return;
    event.preventDefault();
    event.stopPropagation();

    if (Math.abs(event.clientX - dragMetaRef.current.startX) > 4) {
      dragMetaRef.current.moved = true;
      clickGuardRef.current = true;
    }

    previewDraggedTaskDate(taskId, event.clientX);
  }

  function finishTimelineDrag(event, taskId) {
    if (dragMetaRef.current.taskId !== taskId) return;
    event.preventDefault();
    event.stopPropagation();

    const finalDate = previewDraggedTaskDate(taskId, event.clientX) || dragMetaRef.current.previewDate;
    const task = tasks.find((item) => item.id === taskId);
    if (finalDate && task?.dueDate !== finalDate) onMoveTaskDate(taskId, finalDate);

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDraggingTaskId(null);
    setDragPreview({ taskId: null, dueDate: null });
    dragMetaRef.current = { taskId: null, startX: 0, moved: false, previewDate: null, originalDate: null };
  }

  function handleTimelineTaskClick(event, task) {
    event.stopPropagation();
    if (clickGuardRef.current) {
      clickGuardRef.current = false;
      return;
    }
    onOpenTask(task);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className={cx("max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)}
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}>
                  <Clock3 size={14} /> Szczegółowy timeline
                </div>
                <h2 className="text-2xl font-black">Plan zadań na osi czasu</h2>
                <p className={cx("mt-1 text-sm", t.textMuted)}>Przeciągnij pasek zadania po osi czasu, aby zmienić jego termin w oryginalnej karcie.</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={cx("text-xs font-black", t.textMuted)}>Zakres:</span>
                  {Object.entries(timelineViewPresets).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTimelineView(key)}
                      className={cx("rounded-xl border px-3 py-1.5 text-xs font-black transition hover:-translate-y-0.5", selectedTimelineView === key ? t.buttonPrimary : t.buttonSoft)}
                    >
                      {item.label}
                    </button>
                  ))}
                  <span className={cx("text-xs", t.textSoft)}>Oś pokazuje teraz skalę wybranego zakresu: dni, tygodnie albo miesiące.</span>
                </div>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}>
                <X />
              </button>
            </div>

            {!hasTasks ? (
              <div className={cx("rounded-3xl border border-dashed p-8 text-center text-sm", t.border, t.textMuted)}>
                Brak tasków z terminami. Timeline siedzi w ciszy i udaje kalendarz zen.
              </div>
            ) : (
              <div className="grid gap-5">
                <div className={cx("rounded-[1.75rem] border p-4", t.cardSolid)}>
                  <div
                    ref={chartRef}
                    className="relative w-full overflow-hidden rounded-3xl px-3 pb-14 pt-5 select-none"
                    style={{ height: `${timelineHeight}px` }}
                  >
                      <div className={cx("absolute left-3 top-1 z-20 rounded-full px-2.5 py-1 text-[10px] font-black ring-1", t.chip)}>{preset.unitLabel}</div>
                      <div className="absolute inset-x-3 top-6 bottom-12">
                        {tasks.map((task, index) => (
                          <div
                            key={`line-${task.id}`}
                            className={cx("absolute left-0 right-0 border-t border-dashed", t.border)}
                            style={{ top: `${index * 42 + 34}px`, opacity: 0.55 }}
                          />
                        ))}
                      </div>

                      {showToday && (
                        <div
                          className="absolute bottom-12 top-4 z-20 w-0.5 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(168,85,247,.75)]"
                          style={{ left: `${percentForDate(today)}%` }}
                          title="Dzisiaj"
                        >
                          <span className="absolute -left-1.5 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-violet-200 bg-violet-500" />
                        </div>
                      )}

                      {tasks.map((task, index) => {
                        const visibleDueDate = dragPreview.taskId === task.id && dragPreview.dueDate ? dragPreview.dueDate : task.dueDate;
                        const rawDue = parseLocalDate(visibleDueDate);
                        const dueIsVisible = rawDue && rawDue >= visibleRangeStart && rawDue <= visibleRangeEnd;
                        const displayDueDate = visibleDueDate;
                        const due = parseLocalDate(displayDueDate);
                        const column = columns.find((item) => item.id === task.columnId);
                        const barClass = column?.accent || "from-slate-400 to-slate-600";
                        const taskProgress = progressOf(task);
                        const markerPercent = percentForDate(due);
                        const pillLeft = clampNumber(markerPercent, 8, 92);
                        const rowTop = index * 42 + 38;
                        const isDragging = draggingTaskId === task.id;

                        return (
                          <React.Fragment key={task.id}>
                            <span
                              className={cx("pointer-events-none absolute z-20 w-[2px] -translate-x-1/2 rounded-full shadow-[0_0_12px_rgba(168,85,247,.32)]", isDarkTimeline ? "bg-gradient-to-b from-white/65 via-violet-300/70 to-sky-300/30" : "bg-gradient-to-b from-violet-600/65 via-fuchsia-500/48 to-sky-400/30")}
                              style={{ left: `${markerPercent}%`, top: `${rowTop + 44}px`, bottom: "38px" }}
                            />
                            <span
                              className="pointer-events-none absolute z-30 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(168,85,247,.58)] ring-2 ring-white/65"
                              style={{ left: `${markerPercent}%`, bottom: "38px" }}
                              title={`Marker: ${formatDate(displayDueDate, { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                            />
                            <button
                              type="button"
                              onPointerDown={(event) => startTimelineDrag(event, task.id)}
                              onPointerMove={(event) => moveTimelineDrag(event, task.id)}
                              onPointerUp={(event) => finishTimelineDrag(event, task.id)}
                              onPointerCancel={(event) => finishTimelineDrag(event, task.id)}
                              onClick={(event) => handleTimelineTaskClick(event, task)}
                              className={cx(
                                "absolute z-10 -translate-x-1/2 cursor-grab rounded-2xl bg-gradient-to-r px-3 py-2 text-left text-white shadow-lg hover:brightness-110 active:cursor-grabbing",
                                isDragging ? "scale-[1.02] ring-4 ring-white/30 transition-none" : "transition hover:-translate-y-0.5",
                                barClass
                              )}
                              style={{ top: `${rowTop}px`, left: `${pillLeft}%`, width: "clamp(120px, 20%, 220px)" }}
                              title={`${task.title} — termin: ${formatDate(displayDueDate, { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                            >
                              <span className="block truncate text-xs font-black">{task.title}</span>
                              <span className="block truncate text-[10px] font-bold opacity-85">
                                {column?.title || "Bez etapu"} • {taskProgress}% • {formatDate(displayDueDate, { day: "2-digit", month: "2-digit" })}
                              </span>
                              {isDragging && (
                                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-950 shadow-lg">
                                  {formatDate(displayDueDate, { day: "2-digit", month: "long" })}
                                </span>
                              )}
                            </button>
                          </React.Fragment>
                        );
                      })}

                      <AnimatePresence initial={false}>
                        {highlightedAxisItems.map((item) => {
                          const date = item.date;
                          return (
                            <motion.div
                              key={`floating-date-${item.key}`}
                              className="pointer-events-none absolute z-40 -translate-x-1/2"
                              style={{ left: `${percentForDate(date)}%`, bottom: "48px" }}
                              initial={{ opacity: 0, y: 18, scale: 0.86 }}
                              animate={{ opacity: 1, y: -8, scale: 1 }}
                              exit={{ opacity: 0, y: 14, scale: 0.9 }}
                              transition={{ type: "spring", stiffness: 360, damping: 24, mass: 0.65 }}
                            >
                              <span className={cx("relative inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black shadow-lg ring-1 backdrop-blur-md", isDarkTimeline ? "bg-slate-950/82 text-violet-100 ring-violet-300/25 shadow-violet-950/30" : "bg-white/92 text-violet-700 ring-violet-200/80 shadow-violet-200/70")}>
                                <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-inherit ring-1 ring-inherit" />
                                <span className="relative z-10">{item.label}</span>
                              </span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      <div className={cx("pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-12 rounded-b-3xl border-t backdrop-blur-md", isDarkTimeline ? "border-white/10 bg-slate-950/78" : "border-white/70 bg-white/78")} />
                      <div className="absolute bottom-2 left-0 right-0 z-40 h-9">
                        {axisTicks.map((tick, index) => {
                          const tickKey = dateKey(tick.date);
                          const isHighlightedDate = highlightedAxisDates.has(tickKey);
                          return (
                            <div
                              key={`${tickKey}-${index}`}
                              className="absolute flex min-w-[36px] -translate-x-1/2 flex-col items-center text-center"
                              style={{ left: `${percentForDate(tick.date)}%` }}
                            >
                              <span className={cx("mb-1.5 rounded-full transition-all", isHighlightedDate ? "h-4 w-[2px] bg-gradient-to-b from-violet-400 to-sky-400 shadow-[0_0_10px_rgba(168,85,247,.45)]" : cx("h-2.5 w-px", isDarkTimeline ? "bg-slate-500/70" : "bg-slate-300/90"))} />
                              <span className={cx("max-w-[82px] truncate text-[10px] font-black leading-none transition-all", isHighlightedDate ? (isDarkTimeline ? "text-violet-100 drop-shadow-[0_0_6px_rgba(168,85,247,.45)]" : "text-violet-700 drop-shadow-sm") : t.textMuted)} title={tick.label}>{tick.label}</span>
                              <span className={cx("mt-1 text-[8px] font-bold leading-none transition-all", isHighlightedDate ? (isDarkTimeline ? "text-sky-200" : "text-sky-700") : t.textSoft)}>{tick.sublabel}</span>
                            </div>
                          );
                        })}
                      </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {tasks.map((task) => {
                    const column = columns.find((item) => item.id === task.columnId);
                    const completed = task.subtasks?.filter((item) => item.done).length || 0;
                    const total = task.subtasks?.length || 0;
                    const taskProgress = progressOf(task);

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onOpenTask(task)}
                        className={cx("rounded-3xl border p-4 text-left shadow-lg transition hover:-translate-y-0.5", t.cardSolid)}
                      >
                        <div className={cx("mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r", column?.accent || "from-slate-400 to-slate-600")} />
                        <h3 className="line-clamp-2 text-base font-black">{task.title}</h3>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black">
                          <span className={cx("rounded-full px-2.5 py-1 ring-1", t.chip)}>{column?.title || "Bez etapu"}</span>
                          <span className={cx("rounded-full px-2.5 py-1 ring-1", t.chip)}>{formatDate(task.dueDate, { day: "2-digit", month: "long", year: "numeric" })}</span>
                          <span className={cx("rounded-full px-2.5 py-1 ring-1", t.chip)}>{completed}/{total} subtasków</span>
                        </div>
                        <div className={cx("mt-3 h-2 overflow-hidden rounded-full", t.progressTrack)}>
                          <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-sky-400 transition-all" style={{ width: `${taskProgress}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Column({
  t,
  isDark,
  column,
  tasks,
  onOpenNew,
  onOpenTask,
  onMoveTask,
  onToggleSubtask,
  draggedTaskId,
  setDraggedTaskId,
}) {
  const [isOver, setIsOver] = useState(false);
  const [dropMarker, setDropMarker] = useState(null);
  const listRef = useRef(null);

  function readDraggedTaskId(event) {
    return event.dataTransfer?.getData("application/x-kanban-task") || event.dataTransfer?.getData("text/plain") || draggedTaskId;
  }

  function clearDropState() {
    setIsOver(false);
    setDropMarker(null);
  }

  function getMarkerFromPointer(clientY) {
    const items = Array.from(listRef.current?.querySelectorAll("[data-task-drop-id]") || []).filter(
      (element) => element.dataset.taskDropId && element.dataset.taskDropId !== draggedTaskId
    );

    if (!items.length) return { taskId: null, placement: "end" };

    for (const element of items) {
      const rect = element.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (clientY < midpoint) {
        return { taskId: element.dataset.taskDropId, placement: "before" };
      }
    }

    return { taskId: items[items.length - 1].dataset.taskDropId, placement: "after" };
  }

  function handleColumnDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const droppedTaskId = readDraggedTaskId(event);
    const marker = dropMarker || getMarkerFromPointer(event.clientY);
    if (droppedTaskId) onMoveTask(droppedTaskId, column.id, marker?.taskId || null, marker?.placement || "end");
    setDraggedTaskId(null);
    clearDropState();
  }

  function handleColumnDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    if (!isOver) setIsOver(true);
    setDropMarker(getMarkerFromPointer(event.clientY));
  }

  function handleColumnDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsOver(true);
  }

  function handleColumnDragLeave(event) {
    const nextTarget = event.relatedTarget;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    clearDropState();
  }

  return (
    <motion.article
      layout
      className={cx(
        "flex h-full min-w-0 flex-col rounded-[1.6rem] border p-2.5 shadow-xl backdrop-blur-xl transition lg:rounded-[1.9rem] lg:p-4",
        isOver
          ? isDark
            ? "border-pink-400/40 bg-pink-500/10"
            : "border-pink-300 bg-pink-50/80 shadow-pink-200/70"
          : t.card
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2 lg:mb-4">
        <div className="min-w-0">
          <div className={cx("mb-2 h-1.5 w-14 rounded-full bg-gradient-to-r lg:h-2 lg:w-20", column.accent)} />
          <h2 className="truncate text-sm font-black lg:text-lg">{column.title}</h2>
        </div>
        <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-black shadow-sm ring-1 lg:px-3 lg:py-1 lg:text-xs", t.chip)}>
          {tasks.length}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenNew}
        className={cx(
          "mb-3 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border px-2 py-2 text-[11px] font-bold shadow-sm transition hover:-translate-y-0.5 lg:mb-4 lg:gap-2 lg:px-3 lg:py-2.5 lg:text-xs",
          t.buttonSoft
        )}
      >
        <Plus size={14} className="lg:hidden" />
        <Plus size={15} className="hidden lg:block" />
        <span className="lg:hidden">Dodaj</span>
        <span className="hidden lg:inline">Dodaj kartę</span>
      </button>

      <div
        onDragEnter={handleColumnDragEnter}
        onDragOver={handleColumnDragOver}
        onDragLeave={handleColumnDragLeave}
        onDrop={handleColumnDrop}
        className={cx(
          "relative flex min-h-[260px] flex-1 flex-col rounded-3xl transition",
          isOver && (isDark ? "bg-white/[0.04]" : "bg-white/65")
        )}
      >
        {isOver && !dropMarker?.taskId && (
          <div className={cx(
            "pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-3xl border-2 border-dashed text-xs font-black",
            isDark ? "border-pink-300/50 bg-pink-400/10 text-pink-100" : "border-pink-300 bg-pink-100/80 text-pink-700"
          )}>
            Upuść zadanie w tej kolumnie
          </div>
        )}

        <div ref={listRef} className="relative z-20 flex flex-1 flex-col justify-start gap-2.5 lg:gap-3">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <div key={task.id} data-task-drop-id={task.id} className="relative">
                {dropMarker?.taskId === task.id && dropMarker?.placement === "before" && (
                  <div className={cx("mb-2 h-3 rounded-full border-2 border-dashed", isDark ? "border-violet-300/60 bg-violet-400/10" : "border-violet-300 bg-violet-100/80")} />
                )}

                <TaskCard
                  t={t}
                  isDark={isDark}
                  task={task}
                  onOpen={() => onOpenTask(task)}
                  onToggleSubtask={onToggleSubtask}
                  onDragStart={(event) => {
                    event.dataTransfer?.setData("application/x-kanban-task", task.id);
                    event.dataTransfer?.setData("text/plain", task.id);
                    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
                    setDraggedTaskId(task.id);
                  }}
                  onDragEnd={() => {
                    setDraggedTaskId(null);
                    clearDropState();
                  }}
                />

                {dropMarker?.taskId === task.id && dropMarker?.placement === "after" && (
                  <div className={cx("mt-2 h-3 rounded-full border-2 border-dashed", isDark ? "border-violet-300/60 bg-violet-400/10" : "border-violet-300 bg-violet-100/80")} />
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

function TaskCard({ t, isDark, task, onOpen, onToggleSubtask, onDragStart, onDragEnd }) {
  const progress = progressOf(task);
  const completed = task.subtasks?.filter((item) => item.done).length || 0;
  const total = task.subtasks?.length || 0;
  const allSubtasks = task.subtasks || [];
  const labelSet = isDark ? labelThemesDark : labelThemes;
  const images = getTaskImages(task);
  const coverImage = images[0];
  const priority = priorityMeta(task.priority);

  return (
    <motion.article
      role="button"
      tabIndex={0}
      layout
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -3 }}
      className={cx(
        "group w-full cursor-pointer rounded-[1.35rem] border p-2.5 text-left shadow-lg outline-none ring-pink-300 transition focus:ring-4 lg:rounded-3xl lg:p-4",
        t.taskCard
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={cx("rounded-full px-2.5 py-1 text-[10px] font-black ring-1", priorityChipClass(task.priority, isDark))}>{priority.title}</span>
          </div>
          <h3 className="text-sm font-black leading-snug break-words lg:text-base">{task.title}</h3>
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ring-1", isDark ? "bg-fuchsia-500/15 text-fuchsia-100 ring-fuchsia-300/30" : "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200")}>
                <ImageIcon size={11} /> {images.length === 1 ? "1 zdjęcie" : `${images.length} zdjęcia`}
              </span>
            </div>
          )}
        </div>
        <GripVertical className={cx("mt-0.5 shrink-0 transition group-hover:text-slate-500", t.textSoft)} size={18} />
      </div>

      {coverImage?.dataUrl && <TaskImagePaperStack t={t} images={images} title={task.title} />}

      {task.description && (
        <p data-task-description className={cx("mb-3 text-sm leading-6 break-words whitespace-pre-wrap", t.textMuted)}>
          {task.description}
        </p>
      )}

      {(task.labels?.length > 0 || task.dueDate) && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {task.labels?.map((label) => (
            <span key={label.id} className={cx("rounded-full px-2.5 py-1 text-[11px] font-black ring-1", labelSet[label.color] || labelSet.gray)}>
              {label.text}
            </span>
          ))}
          {task.dueDate && (
            <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ring-1", isDark ? "bg-sky-500/15 text-sky-200 ring-sky-400/30" : "bg-sky-100 text-sky-700 ring-sky-200")}>
              <Clock3 size={12} /> {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      )}

      {total > 0 && (
        <div data-task-subtasks className={cx("mt-3 rounded-2xl p-3 ring-1", t.chip)}>
          <div className={cx("mb-2 flex items-center justify-between text-xs font-bold", t.textMuted)}>
            <span>Podzadania</span>
            <span>{completed}/{total}</span>
          </div>

          <div className="grid gap-1.5">
            {allSubtasks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleSubtask(task.id, item.id);
                }}
                className={cx(
                  "flex items-start gap-2 rounded-xl px-1 py-0.5 text-left text-xs leading-5 transition focus:outline-none focus:ring-2 focus:ring-emerald-400/50",
                  t.hoverSoft,
                  t.textMuted
                )}
              >
                {item.done ? (
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle size={15} className={cx("mt-0.5 shrink-0", t.textSoft)} />
                )}
                <span className={cx("min-w-0 break-words whitespace-normal", item.done && "text-slate-400 line-through")}>{item.text}</span>
              </button>
            ))}
          </div>

          <div className={cx("mt-3 h-2 overflow-hidden rounded-full", t.progressTrack)}>
            <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-sky-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </motion.article>
  );
}

function TaskImagePaperStack({ t, images, title }) {
  const visibleImages = getTaskImages({ images }).slice(0, 4);
  if (!visibleImages.length) return null;

  function naturalBox(image, index, single = false) {
    const ratio = (image.width || 4) / Math.max(1, image.height || 3);
    const isWide = ratio >= 1.2;
    const isTall = ratio <= 0.82;

    if (single) {
      if (isWide) return { left: "0%", top: "6%", width: "92%", height: "82%", rotate: -1, z: 1 };
      if (isTall) return { left: "5%", top: "0%", width: "54%", height: "96%", rotate: -1, z: 1 };
      return { left: "2%", top: "2%", width: "72%", height: "88%", rotate: -1, z: 1 };
    }

    const wideLayouts = [
      { left: "0%", top: "8%", width: "58%", height: "42%", rotate: -1.5, z: 2 },
      { left: "30%", top: "34%", width: "62%", height: "42%", rotate: 1.2, z: 3 },
      { left: "10%", top: "58%", width: "46%", height: "34%", rotate: -0.8, z: 4 },
      { left: "58%", top: "7%", width: "38%", height: "32%", rotate: 1.8, z: 1 },
    ];
    const tallLayouts = [
      { left: "1%", top: "7%", width: "30%", height: "76%", rotate: -1.4, z: 2 },
      { left: "27%", top: "1%", width: "32%", height: "84%", rotate: 1.1, z: 3 },
      { left: "55%", top: "12%", width: "29%", height: "72%", rotate: -0.7, z: 4 },
      { left: "72%", top: "25%", width: "24%", height: "58%", rotate: 1.5, z: 1 },
    ];
    const mixedLayouts = [
      { left: "0%", top: "10%", width: "43%", height: "56%", rotate: -1.2, z: 2 },
      { left: "30%", top: "3%", width: "38%", height: "67%", rotate: 0.9, z: 3 },
      { left: "57%", top: "24%", width: "37%", height: "50%", rotate: -0.6, z: 4 },
      { left: "14%", top: "61%", width: "41%", height: "31%", rotate: 1.3, z: 1 },
    ];

    if (isWide) return wideLayouts[index] || wideLayouts[wideLayouts.length - 1];
    if (isTall) return tallLayouts[index] || tallLayouts[tallLayouts.length - 1];
    return mixedLayouts[index] || mixedLayouts[mixedLayouts.length - 1];
  }

  return (
    <div className="relative mb-3 h-28 overflow-visible lg:h-40">
      {visibleImages.map((image, index) => {
        const layout = naturalBox(image, index, visibleImages.length === 1);
        return (
          <div
            key={image.id || image.dataUrl}
            className={cx(
              "absolute overflow-hidden rounded-xl shadow-xl ring-1 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl",
              t === theme.dark ? "ring-white/12" : "ring-slate-950/10"
            )}
            style={{
              left: layout.left,
              top: layout.top,
              width: layout.width,
              height: layout.height,
              zIndex: layout.z,
              transform: `rotate(${layout.rotate}deg)`,
              transformOrigin: "center center",
            }}
          >
            <img
              src={image.dataUrl}
              alt={image.name || `${title} — zdjęcie ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        );
      })}

      {images.length > 1 && (
        <span className="absolute right-1 top-1 z-10 inline-flex items-center gap-1 rounded-full bg-slate-950/78 px-2 py-1 text-[10px] font-black text-white shadow-lg backdrop-blur">
          <ImageIcon size={11} /> {images.length}
        </span>
      )}
    </div>
  );
}

function PerformanceModal({ t, open, tasks, columns, onClose }) {
  const stats = useMemo(() => buildPerformanceStats(tasks, columns), [tasks, columns]);
  const topStage = stats.columnBreakdown.slice().sort((a, b) => b.total - a.total)[0];
  const archiveSpeedLabel = stats.averageArchiveDays === null ? "brak danych" : `${stats.averageArchiveDays} dni`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><Activity size={14} /> Raport działań</div>
                <h2 className="text-2xl font-black">Postępy i wydajność</h2>
                <p className={cx("mt-1 text-sm", t.textMuted)}>Raport liczy wszystkie karty: aktywne, gotowe i archiwalne. Nic się nie chowa po kątach.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <PerformanceMetric t={t} icon={<CheckSquare2 size={17} />} label="Wszystkie karty" value={stats.total} helper={`${stats.active} aktywnych`} />
              <PerformanceMetric t={t} icon={<CheckCircle2 size={17} />} label="Ukończone" value={`${stats.donePercent}%`} helper={`${stats.done} kart w Gotowe`} />
              <PerformanceMetric t={t} icon={<Archive size={17} />} label="Archiwum" value={stats.archived} helper={`${stats.archivedPercent}% całej bazy`} />
              <PerformanceMetric t={t} icon={<Clock3 size={17} />} label="Śr. czas do archiwum" value={archiveSpeedLabel} helper="liczone po createdAt → archivedAt" />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
              <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black">Zdrowie projektu</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Postęp liczony z etapów i subtasków</p>
                  </div>
                  <span className={cx("rounded-full px-3 py-1 text-xs font-black", t.buttonPrimary)}>{stats.averageProgress}%</span>
                </div>
                <div className="grid gap-3">
                  <ProgressLine t={t} label="Średni postęp kart" value={stats.averageProgress} gradient="from-violet-400 to-sky-400" />
                  <ProgressLine t={t} label="Subtaski ukończone" value={stats.subtaskPercent} gradient="from-emerald-400 to-teal-500" helper={`${stats.completedSubtasks}/${stats.subtasks}`} />
                  <ProgressLine t={t} label="Karty ukończone" value={stats.donePercent} gradient="from-pink-400 to-violet-500" helper={`${stats.done}/${stats.total}`} />
                  <ProgressLine t={t} label="Zarchiwizowane" value={stats.archivedPercent} gradient="from-amber-400 to-orange-500" helper={`${stats.archived}/${stats.total}`} />
                </div>
                <ProjectHealthLineChart t={t} data={stats.healthTrend} columns={columns} />
              </section>

              <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black">Rozkład po etapach</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Aktywne + archiwalne razem</p>
                  </div>
                  <span className={cx("rounded-full px-3 py-1 text-xs font-black ring-1", t.chip)}>{topStage?.title || "brak"}</span>
                </div>
                <div className="grid gap-3">
                  {stats.columnBreakdown.map((column) => (
                    <div key={column.id} className={cx("rounded-2xl border p-3", t.buttonSoft)}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-black">{column.title}</span>
                        <span className={cx("text-xs font-black", t.textMuted)}>{column.total} kart</span>
                      </div>
                      <div className={cx("h-2 overflow-hidden rounded-full", t.progressTrack)}><div className={cx("h-full rounded-full bg-gradient-to-r", column.accent)} style={{ width: `${column.percent}%` }} /></div>
                      <div className={cx("mt-2 flex justify-between text-[10px] font-bold", t.textSoft)}><span>{column.active} aktywne</span><span>{column.archived} archiwum</span><span>{column.percent}%</span></div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <PerformanceMetric t={t} icon={<CalendarDays size={17} />} label="Terminy w 7 dni" value={stats.nextSevenDays} helper="aktywne zadania z datą" />
              <PerformanceMetric t={t} icon={<Clock3 size={17} />} label="Po terminie" value={stats.overdue} helper="aktywne, niegotowe" />
              <PerformanceMetric t={t} icon={<Sparkles size={17} />} label="Subtaski" value={`${stats.completedSubtasks}/${stats.subtasks}`} helper={`${stats.subtaskPercent}% wykonania`} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function ProjectHealthLineChart({ t, data, columns }) {
  const width = 460;
  const height = 190;
  const paddingLeft = 32;
  const paddingRight = 32;
  const paddingY = 18;
  const labelHeight = 24;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingY * 2 - labelHeight;
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) && columns.length ? columns : defaultColumns;
  const stageColors = ["#f43f5e", "#f59e0b", "#0ea5e9", "#10b981", "#8b5cf6", "#64748b"];
  const maxStageCount = Math.max(1, ...safeData.flatMap((item) => (item.stageCounts || []).map((stage) => stage.count || 0)));

  const xForIndex = (index, listLength) => listLength <= 1 ? width / 2 : paddingLeft + (index / (listLength - 1)) * chartWidth;
  const yForScore = (score) => paddingY + (1 - clampNumber(score, 0, 100) / 100) * chartHeight;
  const yForStageCount = (count) => paddingY + (1 - clampNumber(count, 0, maxStageCount) / maxStageCount) * chartHeight;
  const buildPath = (points) => points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  const points = safeData.map((item, index, list) => ({
    ...item,
    x: xForIndex(index, list.length),
    scoreY: yForScore(item.score),
  }));
  const scorePath = buildPath(points.map((point) => ({ x: point.x, y: point.scoreY })));
  const scoreAreaPath = points.length ? `${scorePath} L ${points[points.length - 1].x} ${height - paddingY - labelHeight} L ${points[0].x} ${height - paddingY - labelHeight} Z` : "";
  const stageLines = safeColumns.map((column, columnIndex) => {
    const stagePoints = safeData.map((item, index, list) => {
      const stage = (item.stageCounts || []).find((entry) => entry.id === column.id);
      const count = stage?.count || 0;
      return {
        key: item.key,
        label: item.label,
        sublabel: item.sublabel,
        count,
        x: xForIndex(index, list.length),
        y: yForStageCount(count),
      };
    });
    return {
      ...column,
      color: stageColors[columnIndex % stageColors.length],
      points: stagePoints,
      path: buildPath(stagePoints),
      yearTotal: stagePoints.reduce((sum, point) => sum + point.count, 0),
    };
  });

  return (
    <div className={cx("mt-5 rounded-3xl border p-3", t.buttonSoft)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-black">Trend zdrowia projektu i rozkład etapów</h4>
          <p className={cx("text-[10px] font-semibold", t.textSoft)}>Widok obejmuje cały bieżący rok. Każdy miesiąc pokazuje tylko te karty, których termin wypada w tym miesiącu.</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-black">
        <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1", t.chip)}>
          <span className="h-2 w-4 rounded-full bg-gradient-to-r from-violet-500 to-emerald-400" /> Zdrowie projektu
        </span>
        {stageLines.map((stage) => (
          <span key={stage.id} className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1", t.chip)}>
            <span className="h-2 w-4 rounded-full" style={{ backgroundColor: stage.color }} /> {stage.title}: {stage.yearTotal}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full overflow-visible" role="img" aria-label="Wykres liniowy zdrowia projektu oraz rozkładu zadań po etapach">
        <defs>
          <linearGradient id="healthLineGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="55%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="healthAreaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((value) => {
          const y = yForScore(value);
          return (
            <g key={value}>
              <line x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="4 6" />
              <text x={4} y={y + 3} className={cx("fill-current text-[8px] font-bold", t.textSoft)}>{value}%</text>
            </g>
          );
        })}

        {[0, maxStageCount].map((value) => {
          const y = yForStageCount(value);
          return <text key={`stage-scale-${value}`} x={width - 2} y={y + 3} textAnchor="end" className={cx("fill-current text-[8px] font-bold", t.textSoft)}>{value}</text>;
        })}

        {scoreAreaPath && <path d={scoreAreaPath} fill="url(#healthAreaGradient)" />}

        {stageLines.map((stage, index) => (
          <motion.path
            key={stage.id}
            d={stage.path}
            fill="none"
            stroke={stage.color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.82"
            strokeDasharray={index % 2 === 0 ? "0" : "5 5"}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        ))}

        {scorePath && <motion.path d={scorePath} fill="none" stroke="url(#healthLineGradient)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.65, ease: "easeOut" }} />}

        {points.map((point) => (
          <g key={point.key}>
            <line x1={point.x} x2={point.x} y1={paddingY} y2={height - paddingY - labelHeight} stroke="currentColor" strokeOpacity="0.08" />
            <circle cx={point.x} cy={point.scoreY} r="5" fill="#ffffff" stroke="#8b5cf6" strokeWidth="3" />
            <title>{`${point.label} ${point.sublabel}: zdrowie ${point.score}% · ukończone ${point.completed}/${point.total} · po terminie ${point.overdue}`}</title>
            <text x={point.x} y={height - 17} textAnchor="middle" className={cx("fill-current text-[8px] font-black", t.textMuted)}>{point.label}</text>
            <text x={point.x} y={height - 6} textAnchor="middle" className={cx("fill-current text-[7px] font-bold", t.textSoft)}>{point.sublabel}</text>
          </g>
        ))}

        {stageLines.map((stage) => stage.points.map((point) => (
          <circle key={`${stage.id}-${point.key}`} cx={point.x} cy={point.y} r="2.6" fill={stage.color} opacity="0.9">
            <title>{`${stage.title} · ${point.label} ${point.sublabel}: ${point.count} kart`}</title>
          </circle>
        )))}
      </svg>
    </div>
  );
}
function PerformanceMetric({ t, icon, label, value, helper }) {
  return (
    <div className={cx("rounded-3xl border p-4 shadow-lg", t.cardSolid)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={cx("flex h-9 w-9 items-center justify-center rounded-2xl ring-1", t.chip)}>{icon}</span>
        <span className="text-2xl font-black">{value}</span>
      </div>
      <p className="text-sm font-black">{label}</p>
      <p className={cx("mt-1 text-xs font-semibold", t.textSoft)}>{helper}</p>
    </div>
  );
}
function ProgressLine({ t, label, value, gradient, helper }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-black"><span>{label}</span><span className={t.textMuted}>{helper || `${value}%`}</span></div>
      <div className={cx("h-3 overflow-hidden rounded-full", t.progressTrack)}><motion.div layout className={cx("h-full rounded-full bg-gradient-to-r", gradient)} style={{ width: `${clampNumber(value, 0, 100)}%` }} /></div>
    </div>
  );
}
function GalleryModal({ t, open, images, selected, onSelect, onClose, onClosePreview, onGoToTask }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><ImageIcon size={14} /> Galeria</div>
                <h2 className="text-2xl font-black">Zdjęcia ze wszystkich tasków</h2>
                <p className={cx("mt-1 text-sm", t.textMuted)}>Galeria pokazuje zdjęcia z kart aktywnych i archiwalnych. Archiwum nie chowa dowodów rzeczowych.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            {images.length === 0 ? (
              <div className={cx("rounded-3xl border border-dashed p-8 text-center text-sm", t.border, t.textMuted)}>
                Brak zdjęć w taskach. Galeria jeszcze czeka na swoje pierwsze dzieło sztuki.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((item) => (
                  <button key={item.id} type="button" onClick={() => onSelect(item)} className={cx("group overflow-hidden rounded-3xl border text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl", t.cardSolid)}>
                    <div className="relative h-44 overflow-hidden">
                      <img src={item.image.dataUrl} alt={item.image.name || item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-3 text-white">
                        <h3 className="line-clamp-2 text-sm font-black">{item.title}</h3>
                      </div>
                      {item.archivedAt && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur"><Archive size={11} /> Archiwum</span>}
                    </div>
                    <div className="p-3">
                      <p className={cx("line-clamp-2 text-xs font-semibold", t.textMuted)}>{item.description || "Brak opisu przy zadaniu."}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black">
                        {item.dueDate && <span className={cx("rounded-full px-2 py-1 ring-1", t.chip)}>{formatDate(item.dueDate)}</span>}
                        <span className={cx("rounded-full px-2 py-1 ring-1", t.chip)}>{item.image.width || "?"}×{item.image.height || "?"}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {selected && (
              <motion.div className={cx("fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClosePreview}>
                <motion.div className={cx("grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border shadow-2xl lg:grid-cols-[1fr_320px]", t.modal)} initial={{ scale: 0.96, y: 18, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 18, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
                  <div className="flex min-h-[52vh] items-center justify-center bg-slate-950/90 p-3">
                    <img src={selected.image.dataUrl} alt={selected.image.name || selected.title} className="max-h-[82vh] w-full rounded-2xl object-contain" />
                  </div>
                  <aside className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><ImageIcon size={14} /> Podgląd</div>
                        <h3 className="text-xl font-black leading-tight">{selected.title}</h3>
                      </div>
                      <button type="button" onClick={onClosePreview} className={cx("shrink-0 rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
                    </div>
                    <p className={cx("text-sm leading-6", t.textMuted)}>{selected.description || "To zdjęcie nie ma dodatkowego opisu w karcie."}</p>
                    <div className="grid gap-2 text-xs font-black">
                      {selected.dueDate && <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Termin: {formatDate(selected.dueDate, { day: "2-digit", month: "long", year: "numeric" })}</span>}
                      {selected.archivedAt && <span className={cx("inline-flex items-center gap-2 rounded-2xl px-3 py-2 ring-1", t.chip)}><Archive size={14} /> Z archiwum</span>}
                      <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Plik: {selected.image.name || "bez nazwy"}</span>
                    </div>
                    <button type="button" onClick={() => onGoToTask(selected)} className={cx("mt-auto inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5", t.actionPrimary)}><CheckSquare2 size={17} /> Zaprowadź mnie do tego zadania</button>
                  </aside>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function ExportBackupModal({ t, open, backupText, fileName, onClose, onDownload }) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadNotice, setDownloadNotice] = useState("");
  const [manualMode, setManualMode] = useState(true);

  useEffect(() => {
    setDownloadNotice("");
    setCopied(false);
    setManualMode(true);
    if (!open || typeof URL === "undefined") {
      setDownloadUrl("");
      return undefined;
    }

    const blob = new Blob([backupText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      setDownloadUrl("");
    };
  }, [open, backupText]);

  function selectBackupText() {
    setManualMode(true);
    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
    setDownloadNotice("Zaznaczyłam treść eksportu. Użyj Ctrl+C, wklej do Notatnika i zapisz jako plik .json.");
  }

  function openJsonPreview() {
    setManualMode(true);
    setDownloadNotice("Podgląd w nowej karcie bywa blokowany przez Canvas. Treść eksportu jest poniżej — użyj „Zaznacz całość” albo „Kopiuj treść”.");
    try {
      const popup = window.open("", "_blank", "noopener,noreferrer");
      if (!popup) return;
      popup.document.open();
      popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${fileName}</title><style>body{margin:0;padding:24px;background:#0f172a;color:#e2e8f0;font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;white-space:pre-wrap;word-break:break-word}</style></head><body>${backupText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body></html>`);
      popup.document.close();
      setDownloadNotice("Otworzyłam tekst JSON w nowej karcie. Zapisz go przez Ctrl+S jako plik .json albo skopiuj treść.");
    } catch {
      setDownloadNotice("Przeglądarka zablokowała nową kartę. Treść eksportu jest poniżej — użyj „Zaznacz całość”.");
    }
  }

  async function handleDownloadClick() {
    setManualMode(true);
    setDownloadNotice("Próbuję pobrać plik JSON. Jeśli przeglądarka nic nie pokaże, użyj bezpiecznej metody: „Zaznacz całość”.");
    const result = await onDownload?.();
    if (result?.reason === "cancelled") {
      setDownloadNotice("Zapisywanie zostało anulowane. Treść eksportu nadal jest poniżej i można ją zapisać ręcznie.");
      return;
    }
    if (result?.ok) {
      setDownloadNotice("Wysłałam polecenie pobrania pliku. W Canvasie przeglądarka może je wyciszyć, więc najpewniejsza metoda to nadal „Zaznacz całość”.");
      return;
    }
    setDownloadNotice("Pobieranie zostało zablokowane. Użyj „Zaznacz całość”, skopiuj tekst i zapisz go jako plik .json.");
  }

  async function copyBackupText() {
    try {
      await navigator.clipboard.writeText(backupText);
      setCopied(true);
      setManualMode(true);
      setDownloadNotice("Skopiowano treść eksportu do schowka. Wklej ją do Notatnika i zapisz jako plik .json.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      selectBackupText();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><Upload size={14} /> Eksport danych</div>
                <h2 className="text-2xl font-black">Kopia zapasowa tablicy</h2>
                <p className={cx("mt-1 text-sm leading-6", t.textMuted)}>Pobierz plik JSON albo skopiuj zawartość ręcznie. Ten eksport obejmuje zadania, archiwum, zdjęcia, układ kafelków, tryb kolorystyczny i ustawienia tekstu.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className={cx("mb-4 rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-black">Nazwa pliku</p>
                  <p className={cx("truncate text-xs font-semibold", t.textSoft)}>{fileName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyBackupText}
                    className={cx("inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5", t.buttonPrimary)}
                  >
                    {copied ? <CheckCircle2 size={15} /> : <BookOpen size={15} />} {copied ? "Skopiowano" : "Kopiuj treść"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadClick}
                    className={cx("inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.buttonSoft)}
                  >
                    <Upload size={15} /> Pobierz
                  </button>
                </div>
              </div>
              {downloadNotice && (
                <div className={cx("mb-3 rounded-2xl border px-3 py-2 text-xs font-bold leading-5", t.buttonSoft)}>
                  {downloadNotice}
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={backupText}
                readOnly
                spellCheck={false}
                className={cx("h-72 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none", t.inputSolid)}
                onFocus={(event) => event.target.select()}
              />
            </div>

            <div className={cx("rounded-3xl border p-4 text-sm leading-6", t.buttonSoft)}>
              <p className="font-black">Najpewniejsza metoda w podglądzie Canvas:</p>
              <p className={cx("mt-1", t.textMuted)}>Najwygodniej kliknij <strong>Pobierz</strong>. Jeśli przeglądarka zablokuje zapis pliku, użyj <strong>Kopiuj treść</strong>, wklej zawartość do Notatnika i zapisz jako plik z końcówką <strong>.json</strong>. Potem taki plik można wczytać przez Import.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function ImportBackupModal({ t, open, onClose, onImportText, onImportFile }) {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) setText("");
  }, [open]);

  function submitTextImport() {
    const ok = onImportText(text);
    if (ok) setText("");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><RotateCcw size={14} /> Import danych</div>
                <h2 className="text-2xl font-black">Wczytaj kopię zapasową tablicy</h2>
                <p className={cx("mt-1 text-sm leading-6", t.textMuted)}>Możesz wybrać plik JSON albo wkleić treść skopiowaną z okna eksportu. Import zastąpi aktualne dane zapisane w tej przeglądarce.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><Upload size={18} /></span>
                  <div>
                    <h3 className="text-sm font-black">Import z pliku</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Najlepsze dla pliku pobranego przez Eksport.</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    onImportFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={cx("inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5", t.buttonPrimary)}>
                  <Upload size={16} /> Wybierz plik JSON
                </button>
                <div className={cx("mt-4 rounded-2xl border p-3 text-xs leading-5", t.buttonSoft)}>
                  <p className="font-black">Co zostanie wczytane?</p>
                  <p className={cx("mt-1", t.textMuted)}>Zadania, archiwum, zdjęcia, aktywny widok, układ kafelków, tryb kolorystyczny i wielkość tekstu.</p>
                </div>
              </section>

              <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><BookOpen size={18} /></span>
                  <div>
                    <h3 className="text-sm font-black">Import z wklejonej treści</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Awaryjna metoda, gdy przeglądarka blokuje pliki.</p>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Wklej tutaj pełną treść kopii JSON z okna Eksport..."
                  className={cx("h-56 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                />
                <button type="button" onClick={submitTextImport} disabled={!text.trim()} className={cx("mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}>
                  <RotateCcw size={16} /> Wczytaj z wklejonej treści
                </button>
              </section>
            </div>

            <div className={cx("mt-4 rounded-3xl border p-4 text-sm leading-6", t.buttonSoft)}>
              <p className="font-black">Bezpieczna kolejność testu:</p>
              <p className={cx("mt-1", t.textMuted)}>Najpierw zrób Eksport, potem dodaj testowe zadanie, a następnie wykonaj Import. Jeśli testowe zadanie zniknie i wróci stan z eksportu, kopia działa prawidłowo. Mały rytuał, ale bez świec i kadzidła.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function ArchiveModal({ t, open, tasks, onClose, onOpenTask, onRestore }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateMode, setDateMode] = useState("any");
  const dateFilters = useMemo(() => ({ from: dateFrom, to: dateTo, mode: dateMode }), [dateFrom, dateTo, dateMode]);
  const filteredTasks = useMemo(() => filterArchivedTasks(tasks, searchQuery, dateFilters), [tasks, searchQuery, dateFilters]);
  const hasSearch = searchQuery.trim().length > 0;
  const hasDateFilter = Boolean(dateFrom || dateTo);
  const hasAnyFilter = hasSearch || hasDateFilter;

  function clearArchiveFilters() {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setDateMode("any");
  }

  useEffect(() => {
    if (!open) clearArchiveFilters();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><Archive size={14} /> Archiwum</div>
                <h2 className="text-2xl font-black">Zadania odłożone, ale nie wyrzucone</h2>
                <p className={cx("mt-1 text-sm", t.textMuted)}>Szukaj po treści albo zawęź wyniki po terminie zadania i dacie archiwizacji.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className={cx("mb-4 rounded-3xl border p-3 shadow-sm", t.cardSolid)}>
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <label className="relative block">
                    <Search size={17} className={cx("pointer-events-none absolute left-4 top-1/2 -translate-y-1/2", t.textSoft)} />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Szukaj w archiwum... np. nazwa, etykieta, 02.06.2026"
                      className={cx("w-full rounded-2xl border py-3 pl-11 pr-11 text-sm font-semibold outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                    />
                    {hasSearch && (
                      <button type="button" onClick={() => setSearchQuery("")} title="Wyczyść wyszukiwanie tekstowe" className={cx("absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1.5 transition", t.hoverSoft, t.textMuted)}>
                        <X size={15} />
                      </button>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2 text-[10px] font-black">
                    <span className={cx("rounded-full px-3 py-2 ring-1", t.chip)}>{filteredTasks.length}/{tasks.length} widoczne</span>
                    {hasSearch && <span className={cx("rounded-full px-3 py-2 ring-1", t.chip)}>tekst</span>}
                    {hasDateFilter && <span className={cx("rounded-full px-3 py-2 ring-1", t.chip)}>data</span>}
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-[1fr_1fr_1.15fr_auto] md:items-end">
                  <label className="grid gap-1.5">
                    <span className={cx("px-1 text-[10px] font-black uppercase tracking-wide", t.textSoft)}>Data od</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(event) => setDateFrom(event.target.value)}
                      className={cx("rounded-2xl border px-3 py-2.5 text-xs font-bold outline-none ring-sky-300 transition focus:ring-4", t.inputSolid)}
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className={cx("px-1 text-[10px] font-black uppercase tracking-wide", t.textSoft)}>Data do</span>
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(event) => setDateTo(event.target.value)}
                      className={cx("rounded-2xl border px-3 py-2.5 text-xs font-bold outline-none ring-sky-300 transition focus:ring-4", t.inputSolid)}
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className={cx("px-1 text-[10px] font-black uppercase tracking-wide", t.textSoft)}>Gdzie szukać daty</span>
                    <select
                      value={dateMode}
                      onChange={(event) => setDateMode(event.target.value)}
                      className={cx("rounded-2xl border px-3 py-2.5 text-xs font-bold outline-none ring-sky-300 transition focus:ring-4", t.inputSolid)}
                    >
                      <option value="any" style={selectOptionStyle(t)}>Termin lub archiwizacja</option>
                      <option value="due" style={selectOptionStyle(t)}>Tylko termin zadania</option>
                      <option value="archived" style={selectOptionStyle(t)}>Tylko data archiwizacji</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={clearArchiveFilters}
                    disabled={!hasAnyFilter}
                    className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonSoft)}
                  >
                    <X size={14} /> Wyczyść
                  </button>
                </div>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className={cx("rounded-3xl border border-dashed p-8 text-center text-sm", t.border, t.textMuted)}>Archiwum jest puste. Zero kurzu, zero pajęczyn.</div>
            ) : filteredTasks.length === 0 ? (
              <div className={cx("rounded-3xl border border-dashed p-8 text-center text-sm", t.border, t.textMuted)}>
                Nic nie znaleziono. Archiwum twierdzi, że tego nie widziało i ma alibi.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredTasks.map((task) => <ArchivedTaskCard key={task.id} t={t} task={task} onOpen={() => onOpenTask(task)} onRestore={() => onRestore(task.id)} />)}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function ArchivedTaskCard({ t, task, onOpen, onRestore }) {
  const date = task.archivedAt ? new Date(task.archivedAt).toLocaleDateString("pl-PL") : "";
  const images = getTaskImages(task);
  const coverImage = images[0];

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cx("rounded-3xl border p-4 shadow-lg", t.cardSolid)}>
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-black leading-snug">{task.title}</h3>
          <Archive className={cx("shrink-0", t.textSoft)} size={18} />
        </div>
        {coverImage?.dataUrl && (
          <div className="relative mb-3 overflow-hidden rounded-2xl">
            <img src={coverImage.dataUrl} alt={coverImage.name || task.title} className="h-28 w-full object-cover" />
            {images.length > 1 && <span className="absolute right-2 top-2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-black text-white backdrop-blur">+{images.length - 1}</span>}
          </div>
        )}
        {task.description && <p className={cx("mb-3 line-clamp-2 text-sm leading-6", t.textMuted)}>{task.description}</p>}
        <p className={cx("text-xs font-semibold", t.textSoft)}>Zarchiwizowano: {date}</p>
      </button>
      <button type="button" onClick={onRestore} className={cx("mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition hover:-translate-y-0.5", t.buttonPrimary)}>
        <RotateCcw size={15} /> Przywróć do Gotowe
      </button>
    </motion.div>
  );
}
function EditTaskModal({ t, isDark, draft, columns, draftExists, setDraft, onClose, onSave, onDelete, onArchive, onRestore, onAddLabel, onUpdateLabel, onRemoveLabel, onAddSubtask, onUpdateSubtask, onRemoveSubtask, onAttachImage, onRemoveImage }) {
  const currentColumn = columns.find((column) => column.id === draft?.columnId);
  const doneSubtasks = draft?.subtasks?.filter((item) => item.done).length || 0;
  const allSubtasks = draft?.subtasks?.length || 0;
  const progress = draft ? progressOf(draft) : 0;

  return (
    <AnimatePresence>
      {draft && (
        <motion.div
          className={cx("fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className={cx("max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border p-4 shadow-2xl sm:p-5", t.modal)}
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}>
                  <CheckSquare2 size={14} /> Edycja karty
                </div>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Nazwa zadania..."
                  className={cx("w-full rounded-2xl border px-4 py-3 text-lg font-black outline-none ring-pink-300 transition focus:ring-4", t.input)}
                  autoFocus
                />
              </div>
              <button type="button" onClick={onClose} className={cx("shrink-0 rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <label className={cx("rounded-2xl border p-3", t.buttonSoft)}>
                <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><LayoutDashboard size={14} /> Etap</span>
                <select
                  value={draft.columnId}
                  onChange={(event) => setDraft({ ...draft, columnId: event.target.value })}
                  className={cx("w-full rounded-xl border px-3 py-2 text-xs font-black outline-none ring-pink-300 transition focus:ring-4", t.inputSolid)}
                >
                  {columns.map((column) => <option key={column.id} value={column.id} style={selectOptionStyle(t)}>{column.title}</option>)}
                </select>
              </label>

              <label className={cx("rounded-2xl border p-3", t.buttonSoft)}>
                <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><CalendarDays size={14} /> Termin</span>
                <input
                  type="date"
                  value={draft.dueDate || ""}
                  onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
                  className={cx("w-full rounded-xl border px-3 py-2 text-xs font-black outline-none ring-pink-300 transition focus:ring-4", t.inputSolid)}
                />
              </label>

              <div className={cx("rounded-2xl border p-3", t.buttonSoft)}>
                <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><Sparkles size={14} /> Priorytet</span>
                <PriorityToggleGroup
                  value={draft.priority}
                  onChange={(priority) => setDraft({ ...draft, priority })}
                  isDark={isDark}
                />
              </div>

              <div className={cx("rounded-2xl border p-3", t.buttonSoft)}>
                <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><Activity size={14} /> Postęp</span>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-[5rem]">
                    <p className="text-lg font-black">{progress}%</p>
                    <p className={cx("text-[10px] font-bold", t.textSoft)}>{doneSubtasks}/{allSubtasks} subtasków</p>
                  </div>
                  <div className={cx("h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full", t.progressTrack)}>
                    <div className={cx("h-full rounded-full bg-gradient-to-r", currentColumn?.accent || "from-pink-400 to-sky-400")} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <label className={cx("mb-4 block rounded-2xl border p-3", t.buttonSoft)}>
              <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><Sparkles size={14} /> Opis</span>
              <textarea
                value={draft.description || ""}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                rows={3}
                placeholder="Krótki opis, notatka albo kontekst zadania..."
                className={cx("w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none ring-pink-300 transition focus:ring-4", t.inputSolid)}
              />
            </label>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-4">
                <EditTaskImage t={t} draft={draft} onAttachImage={onAttachImage} onRemoveImage={onRemoveImage} />
                <EditLabels t={t} isDark={isDark} draft={draft} onAdd={onAddLabel} onUpdate={onUpdateLabel} onRemove={onRemoveLabel} />
              </div>
              <EditSubtasks t={t} draft={draft} onAdd={onAddSubtask} onUpdate={onUpdateSubtask} onRemove={onRemoveSubtask} />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => onDelete(draft.id)} title="Usuń kartę" className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.dangerButton)}><Trash2 size={16} /> Usuń</button>
                {draftExists && (draft.archivedAt ? (
                  <button type="button" onClick={() => onRestore(draft.id, "done")} title="Przywróć z archiwum" className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.successButton)}><RotateCcw size={16} /> Przywróć</button>
                ) : (
                  <button type="button" onClick={() => onArchive(draft.id)} title="Przenieś do archiwum" className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.buttonSoft)}><Archive size={16} /> Archiwum</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className={cx("rounded-2xl border px-4 py-2.5 text-xs font-black transition", t.buttonSoft)}>Anuluj</button>
                <button type="button" onClick={onSave} disabled={!draft.title.trim()} className={cx("inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonPrimary)}><CheckCircle2 size={16} /> Zapisz</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function EditTaskImage({ t, draft, onAttachImage, onRemoveImage }) {
  const images = getTaskImages(draft);
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <section className={cx("rounded-2xl border p-3", t.buttonSoft)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cx("flex h-8 w-8 items-center justify-center rounded-xl", t.chip)}><ImageIcon size={16} /></span>
          <div>
            <h3 className="text-sm font-black">Zdjęcia</h3>
            <p className={cx("text-[10px] font-semibold", t.textSoft)}>{images.length ? `${images.length} dodane · kliknij miniaturę, aby powiększyć` : "Opcjonalne załączniki graficzne"}</p>
          </div>
        </div>
        <label title="Wybierz jedno lub kilka zdjęć" className={cx("inline-flex cursor-pointer items-center justify-center rounded-xl p-2 shadow-sm ring-1 transition hover:-translate-y-0.5", t.chip)}>
          <Upload size={16} />
          <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => { onAttachImage(event.target.files); event.target.value = ""; }} />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => {
            const imageId = image.id || image.dataUrl;
            return (
              <div key={imageId} className={cx("group relative overflow-hidden rounded-2xl border", t.imageBorder)}>
                <button
                  type="button"
                  onClick={() => setPreviewImage({ ...image, index })}
                  title="Otwórz większy podgląd zdjęcia"
                  className="block w-full text-left outline-none transition focus:ring-4 focus:ring-violet-300/50"
                >
                  <img src={image.dataUrl} alt={image.name || `${draft.title || "Zdjęcie"} ${index + 1}`} className="h-24 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2 text-white">
                    <p className="truncate text-[10px] font-black">{image.name || `Zdjęcie ${index + 1}`}</p>
                  </div>
                  <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-xl bg-slate-950/65 px-2 py-1 text-[9px] font-black text-white opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100">
                    Powiększ
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); onRemoveImage(imageId); }}
                  title="Usuń zdjęcie"
                  className="absolute right-1.5 top-1.5 rounded-xl bg-slate-950/70 p-1.5 text-white opacity-90 shadow-lg backdrop-blur transition hover:bg-rose-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={cx("flex min-h-24 items-center justify-center rounded-2xl border border-dashed text-xs font-bold", t.border, t.textMuted)}>
          Brak zdjęć
        </div>
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div
            className={cx("fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-md", t.overlay)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setPreviewImage(null)}
          >
            <motion.div
              className={cx("grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border shadow-2xl lg:grid-cols-[1fr_280px]", t.modal)}
              initial={{ scale: 0.96, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 18, opacity: 0 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex min-h-[52vh] items-center justify-center bg-slate-950/90 p-3">
                <img src={previewImage.dataUrl} alt={previewImage.name || draft.title || "Podgląd zdjęcia"} className="max-h-[82vh] w-full rounded-2xl object-contain" />
              </div>
              <aside className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><ImageIcon size={14} /> Podgląd zdjęcia</div>
                    <h3 className="text-xl font-black leading-tight">{draft.title || "Nowa karta"}</h3>
                  </div>
                  <button type="button" onClick={() => setPreviewImage(null)} className={cx("shrink-0 rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
                </div>
                <div className="grid gap-2 text-xs font-black">
                  <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Zdjęcie: {(previewImage.index || 0) + 1}/{images.length}</span>
                  <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Plik: {previewImage.name || "bez nazwy"}</span>
                  <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Rozmiar: {previewImage.width || "?"}×{previewImage.height || "?"}</span>
                </div>
                <p className={cx("text-sm leading-6", t.textMuted)}>Podgląd służy tylko do wygodnego sprawdzenia obrazu. Zdjęcie pozostaje przypisane do edytowanej karty.</p>
                <button type="button" onClick={() => setPreviewImage(null)} className={cx("mt-auto inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5", t.buttonPrimary)}>
                  Zamknij podgląd
                </button>
              </aside>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
function EditLabels({ t, isDark, draft, onAdd, onUpdate, onRemove }) {
  const labelSet = isDark ? labelThemesDark : labelThemes;
  const swatchSet = isDark ? labelSwatchesDark : labelSwatches;
  const colors = Object.keys(labelSet);
  return (
    <section className={cx("rounded-2xl border p-3", t.buttonSoft)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cx("flex h-8 w-8 items-center justify-center rounded-xl", t.chip)}><Sparkles size={16} /></span>
          <h3 className="text-sm font-black">Etykiety</h3>
        </div>
        <button type="button" onClick={onAdd} title="Dodaj etykietę" className={cx("inline-flex items-center justify-center rounded-xl p-2 shadow-sm ring-1 transition hover:-translate-y-0.5", t.chip)}><Plus size={16} /></button>
      </div>
      <div className="grid gap-2">
        {(draft.labels || []).length === 0 && <p className={cx("rounded-2xl border border-dashed p-3 text-xs font-semibold", t.border, t.textMuted)}>Brak etykiet.</p>}
        {(draft.labels || []).map((label) => (
          <div key={label.id} className="grid grid-cols-[1fr_auto] items-center gap-2">
            <input
              value={label.text}
              onChange={(event) => onUpdate(label.id, { text: event.target.value })}
              placeholder="Etykieta"
              className={cx("rounded-xl border px-3 py-2 text-xs font-bold outline-none ring-pink-300 transition focus:ring-4", t.inputSolid)}
            />
            <button type="button" onClick={() => onRemove(label.id)} title="Usuń etykietę" className={cx("rounded-xl p-2 transition", t.iconDanger)}><Trash2 size={16} /></button>
            <div className="col-span-2 flex flex-wrap gap-1.5">
              {colors.map((color) => {
                const isSelected = label.color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onUpdate(label.id, { color })}
                    aria-label={`Kolor ${color}`}
                    title={color}
                    className={cx(
                      "relative h-7 w-7 rounded-full text-[0px] shadow-lg ring-2 transition hover:scale-110 hover:brightness-110",
                      swatchSet[color],
                      isSelected ? (isDark ? "ring-white scale-110" : "ring-slate-950 scale-110") : "ring-white/70 opacity-95"
                    )}
                  >
                    {color}
                    {isSelected && <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-white shadow ring-1 ring-slate-900/10" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function EditSubtasks({ t, draft, onAdd, onUpdate, onRemove }) {
  return (
    <section className={cx("rounded-2xl border p-3", t.buttonSoft)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cx("flex h-8 w-8 items-center justify-center rounded-xl", t.chip)}><CheckSquare2 size={16} /></span>
          <div>
            <h3 className="text-sm font-black">Subtaski</h3>
            <p className={cx("text-[10px] font-semibold", t.textSoft)}>{(draft.subtasks || []).filter((item) => item.done).length}/{(draft.subtasks || []).length} gotowe</p>
          </div>
        </div>
        <button type="button" onClick={onAdd} title="Dodaj subtask" className={cx("inline-flex items-center justify-center rounded-xl p-2 shadow-sm ring-1 transition hover:-translate-y-0.5", t.chip)}><Plus size={16} /></button>
      </div>
      <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
        {(draft.subtasks || []).length === 0 && <p className={cx("rounded-2xl border border-dashed p-3 text-xs font-semibold", t.border, t.textMuted)}>Brak subtasków.</p>}
        {(draft.subtasks || []).map((item) => (
          <div key={item.id} className={cx("grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border p-2", t.border)}>
            <button type="button" onClick={() => onUpdate(item.id, { done: !item.done })} title={item.done ? "Oznacz jako niegotowe" : "Oznacz jako gotowe"} className="text-emerald-500">
              {item.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
            <input
              value={item.text}
              onChange={(event) => onUpdate(item.id, { text: event.target.value })}
              placeholder="Treść subtaska"
              className={cx("min-w-0 rounded-xl border px-3 py-2 text-xs font-semibold outline-none ring-pink-300 transition focus:ring-4", t.inputSolid, item.done && "text-slate-400 line-through")}
            />
            <button type="button" onClick={() => onRemove(item.id)} title="Usuń subtask" className={cx("rounded-xl p-2 transition", t.iconDanger)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
