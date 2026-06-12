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
  progress: "Postęp projektu",
  today: "Dzisiejsze zadania",
  calendar: "Kalendarz",
  taskProgress: "Postęp zadań",
  actions: "Panel sterowania",
  timeline: "Oś czasu zadań",
};
export const dashboardSizeOptions = ["normal", "wide", "large", "full"];
export const dashboardSizeLabels = { normal: "Normalny", wide: "Szerszy", large: "Duży", full: "Pełny" };
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

export const defaultTasks = [];
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

export function selectOptionStyle(t) {
  const isDarkTheme = String(t?.inputSolid || t?.modal || "").includes("slate-950");
  return {
    backgroundColor: isDarkTheme ? "#020617" : "#ffffff",
    color: isDarkTheme ? "#e2e8f0" : "#0f172a",
  };
}

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
  { id: "medium", title: "Średni", light: "bg-sky-100 text-sky-700 ring-sky-200", dark: "bg-sky-500/15 text-sky-200 ring-sky-400/30" },
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
  week: { label: "Tydzień", days: 7, unitLabel: "Dni", unit: "day" },
  month: { label: "Miesiąc", days: 31, unitLabel: "Dni miesiąca", unit: "monthDay" },
  quarter: { label: "Kwartał", days: 92, unitLabel: "Tygodnie", unit: "week" },
  year: { label: "Rok", days: 365, unitLabel: "Miesiące", unit: "month" },
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
  if (!task?.subtasks?.length) return 0;
  return Math.round((task.subtasks.filter((item) => item.done).length / task.subtasks.length) * 100);
}
export function getTaskImages(task) {
  if (Array.isArray(task?.images)) return task.images.filter(Boolean);
  if (task?.image) return [task.image].filter(Boolean);
  return [];
}
export function stageMetaForTask(task, columns = defaultColumns) {
  return columns.find((column) => column.id === task?.columnId) || columns[0] || defaultColumns[0];
}
export function stageGradientForTask(task, columns = defaultColumns) {
  return stageMetaForTask(task, columns)?.accent || "from-slate-400 to-slate-600";
}
export function stageTitleForTask(task, columns = defaultColumns) {
  return stageMetaForTask(task, columns)?.title || "Bez etapu";
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
  return Array.isArray(tasks) ? tasks.map((task) => task.title).join("\n") : "";
}

// Backup helpers
export function buildBackupPayload(state = defaultBoardState) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    columns: Array.isArray(state.columns) ? state.columns : defaultColumns,
    tasks: Array.isArray(state.tasks) ? state.tasks : [],
    darkMode: Boolean(state.darkMode),
    fontScale: clampFontScale(state.fontScale),
    dashboardOrder: normalizeDashboardOrder(state.dashboardOrder),
    dashboardSizes: normalizeDashboardSizes(state.dashboardSizes || {}),
    activeSection: normalizeActiveSection(state.activeSection),
  };
}

export function normalizeBackupPayload(payload = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  return {
    ...defaultBoardState,
    ...source,
    columns: Array.isArray(source.columns) && source.columns.length ? source.columns : defaultColumns,
    tasks: Array.isArray(source.tasks) ? source.tasks : [],
    darkMode: typeof source.darkMode === "boolean" ? source.darkMode : defaultBoardState.darkMode,
    fontScale: clampFontScale(source.fontScale),
    dashboardOrder: normalizeDashboardOrder(source.dashboardOrder),
    dashboardSizes: normalizeDashboardSizes(source.dashboardSizes || {}),
    activeSection: normalizeActiveSection(source.activeSection),
  };
}

export function parseBackupText(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Plik kopii jest pusty.");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") throw new Error("Nieprawidłowy format kopii.");
  return normalizeBackupPayload(parsed);
}

export function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Nie udało się odczytać pliku."));
    reader.readAsText(file);
  });
}

export async function downloadTextFile(fileName, text) {
  if (typeof window === "undefined" || typeof document === "undefined") return { ok: false, reason: "unsupported" };

  try {
    if (typeof window.showSaveFilePicker === "function") {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "Kanban JSON",
            accept: { "application/json": [".json", ".kanban.json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      return { ok: true, fileName: handle.name || fileName };
    }
  } catch (error) {
    if (error?.name === "AbortError") return { ok: false, reason: "cancelled" };
    return { ok: false, reason: "error", error };
  }

  try {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true, fileName };
  } catch (error) {
    return { ok: false, reason: "error", error };
  }
}
