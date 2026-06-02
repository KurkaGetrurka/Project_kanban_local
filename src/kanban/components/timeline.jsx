import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, X } from "lucide-react";

import { DashboardCard, DashboardTitle } from "./shell.jsx";
import {
  buildTimelineAxisTicks,
  clampNumber,
  cx,
  dateFromTimelineDragDelta,
  dateKey,
  formatDate,
  normalizeTimelineView,
  parseLocalDate,
  progressOf,
  snapDateToAxisTicks,
  snapDateToDateTicks,
  theme,
  timelineViewPresets,
} from "../shared.jsx";

export function TimelineCard({ t, tasks, columns, onOpenTask, onOpenDetails }) {
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
  const visibleTasks = weeklyTasks;
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
  const rangeLabel = `${formatDate(dateKey(weekStart), { day: "2-digit", month: "short" })} - ${formatDate(dateKey(weekEnd), { day: "2-digit", month: "short" })}`;

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
          <DashboardTitle t={t} icon={<Clock3 size={12} />} eyebrow="Plan" title={`Tasks Timeline - ${rangeLabel}`} badge={0} />
          <p className={cx("flex flex-1 items-center rounded-2xl p-4 text-sm", t.subtle)}>Brak task\u00f3w w najbli\u017cszych 7 dniach. Timeline ma chwil\u0119 ciszy.</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard t={t}>
      <div role="button" tabIndex={0} onClick={onOpenDetails} onKeyDown={handleKeyDown} className="flex h-full cursor-pointer flex-col rounded-[1.5rem] outline-none transition focus:ring-4 focus:ring-sky-300/40">
        <DashboardTitle t={t} icon={<Clock3 size={12} />} eyebrow="Plan" title={`Tasks Timeline - ${rangeLabel}`} badge={weeklyTasks.length} />
        <div className="relative min-h-[180px] flex-1 overflow-hidden rounded-3xl px-2 pb-12 pt-3">
          <div className="absolute inset-x-2 bottom-12 top-4">
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
                  title={`${task.title} - ${formatDate(displayDueKey, { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                >
                  <span className="block truncate text-[11px] font-black leading-tight">{task.title}</span>
                  <span className="block truncate text-[9px] font-bold opacity-85">{taskProgress}% - {formatDate(displayDueKey)}</span>
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

export function TimelineDetailsModal({ t, open, tasks, columns, onClose, onOpenTask, onMoveTaskDate }) {
  const chartRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const dragMetaRef = useRef({ taskId: null, startX: 0, moved: false, previewDate: null, originalDate: null });
  const clickGuardRef = useRef(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragPreview, setDragPreview] = useState({ taskId: null, dueDate: null });
  const [timelineView, setTimelineView] = useState("month");
  const [stickyAxisPosition, setStickyAxisPosition] = useState({ markerY: 0, labelY: 0 });
  const AXIS_MARKER_OFFSET = 50;
  const AXIS_LABEL_OFFSET = 68;

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
  const timelineRowHeight = 52;
  const timelineHeight = Math.max(360, 150 + tasks.length * timelineRowHeight);

  useEffect(() => {
    if (!open) return;
    const node = scrollAreaRef.current;
    if (!node) return;

    const updateStickyAxisPosition = () => {
      setStickyAxisPosition({
        markerY: node.scrollTop + node.clientHeight - AXIS_MARKER_OFFSET,
        labelY: node.scrollTop + node.clientHeight - AXIS_LABEL_OFFSET,
      });
    };

    updateStickyAxisPosition();
    node.addEventListener("scroll", updateStickyAxisPosition, { passive: true });
    window.addEventListener("resize", updateStickyAxisPosition);

    return () => {
      node.removeEventListener("scroll", updateStickyAxisPosition);
      window.removeEventListener("resize", updateStickyAxisPosition);
    };
  }, [open, timelineHeight, selectedTimelineView, tasks.length]);

  const axisMarkerY = stickyAxisPosition.markerY || Math.max(0, timelineHeight - AXIS_MARKER_OFFSET);
  const axisLabelY = stickyAxisPosition.labelY || Math.max(0, timelineHeight - AXIS_LABEL_OFFSET);

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
                  <Clock3 size={14} /> Szczeg\u00f3\u0142owy timeline
                </div>
                <h2 className="text-2xl font-black">Plan zada\u0144 na osi czasu</h2>
                <p className={cx("mt-1 text-sm", t.textMuted)}>Przeci\u0105gnij pasek zadania po osi czasu, aby zmieni\u0107 jego termin w oryginalnej karcie.</p>
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
                  <span className={cx("text-xs", t.textSoft)}>O\u015b pokazuje teraz skal\u0119 wybranego zakresu: dni, tygodnie albo miesi\u0105ce.</span>
                </div>
              </div>

              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}>
                <X />
              </button>
            </div>

            {!hasTasks ? (
              <div className={cx("rounded-3xl border border-dashed p-8 text-center text-sm", t.border, t.textMuted)}>
                Brak task\u00f3w z terminami. Timeline siedzi w ciszy i udaje kalendarz zen.
              </div>
            ) : (
              <div className="grid gap-5">
                <div className={cx("rounded-[1.75rem] border p-4", t.cardSolid)}>
                  <div ref={scrollAreaRef} className="timeline-glass-scroll relative max-h-[58vh] overflow-auto rounded-3xl">
                    <div
                      ref={chartRef}
                      className="relative w-full overflow-hidden rounded-3xl px-3 pb-28 pt-5 select-none"
                      style={{ height: `${timelineHeight}px`, minWidth: "100%" }}
                    >
                      <div className={cx("absolute left-3 top-1 z-20 rounded-full px-2.5 py-1 text-[10px] font-black ring-1", t.chip)}>{preset.unitLabel}</div>
                      <div className="absolute inset-x-3 bottom-12 top-6">
                        {tasks.map((task, index) => (
                          <div
                            key={`line-${task.id}`}
                            className={cx("absolute left-0 right-0 border-t border-dashed", t.border)}
                            style={{ top: `${index * timelineRowHeight + 40}px`, opacity: 0.55 }}
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
                        const due = parseLocalDate(visibleDueDate);
                        const column = columns.find((item) => item.id === task.columnId);
                        const barClass = column?.accent || "from-slate-400 to-slate-600";
                        const taskProgress = progressOf(task);
                        const markerPercent = percentForDate(due);
                        const pillLeft = clampNumber(markerPercent, 8, 92);
                        const rowTop = index * timelineRowHeight + 42;
                        const isDragging = draggingTaskId === task.id;

                        return (
                          <React.Fragment key={task.id}>
                            <span
                              className={cx(
                                "pointer-events-none absolute z-20 w-[2px] -translate-x-1/2 rounded-full shadow-[0_0_12px_rgba(168,85,247,.32)]",
                                isDarkTimeline ? "bg-gradient-to-b from-white/65 via-violet-300/70 to-sky-300/30" : "bg-gradient-to-b from-violet-600/65 via-fuchsia-500/48 to-sky-400/30"
                              )}
                              style={{
                                left: `${markerPercent}%`,
                                top: `${rowTop + 44}px`,
                                height: `${Math.max(0, axisMarkerY - (rowTop + 44))}px`,
                              }}
                            />
                            <span
                              className="pointer-events-none absolute z-30 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(168,85,247,.58)] ring-2 ring-white/65"
                              style={{ left: `${markerPercent}%`, top: `${axisMarkerY}px` }}
                              title={`Marker: ${formatDate(visibleDueDate, { day: "2-digit", month: "2-digit", year: "numeric" })}`}
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
                              title={`${task.title} - termin: ${formatDate(visibleDueDate, { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                            >
                              <span className="block truncate text-xs font-black">{task.title}</span>
                              <span className="block truncate text-[10px] font-bold opacity-85">
                                {column?.title || "Bez etapu"} - {taskProgress}% - {formatDate(visibleDueDate, { day: "2-digit", month: "2-digit" })}
                              </span>
                              {isDragging && (
                                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-950 shadow-lg">
                                  {formatDate(visibleDueDate, { day: "2-digit", month: "long" })}
                                </span>
                              )}
                            </button>
                          </React.Fragment>
                        );
                      })}

                      <AnimatePresence initial={false}>
                        {highlightedAxisItems.map((item) => (
                          <motion.div
                            key={`floating-date-${item.key}`}
                            className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full"
                            style={{ left: `${percentForDate(item.date)}%`, top: `${axisLabelY}px` }}
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
                        ))}
                      </AnimatePresence>

                      <div
                        className={cx("pointer-events-none absolute inset-x-0 z-30 h-14 rounded-b-3xl border-t backdrop-blur-md", isDarkTimeline ? "border-white/10 bg-slate-950/78" : "border-white/70 bg-white/78")}
                        style={{ top: `${Math.max(0, axisLabelY + 19)}px` }}
                      />
                      <div className="pointer-events-none absolute inset-x-0 z-40 h-14" style={{ top: `${Math.max(0, axisLabelY + 23)}px` }}>
                        {axisTicks.map((tick, index) => {
                          const tickKey = dateKey(tick.date);
                          const isHighlightedDate = highlightedAxisDates.has(tickKey);
                          return (
                            <div key={`${tickKey}-${index}`} className="absolute flex min-w-[36px] -translate-x-1/2 flex-col items-center text-center" style={{ left: `${percentForDate(tick.date)}%` }}>
                              <span className={cx("mb-1.5 rounded-full transition-all", isHighlightedDate ? "h-4 w-[2px] bg-gradient-to-b from-violet-400 to-sky-400 shadow-[0_0_10px_rgba(168,85,247,.45)]" : cx("h-2.5 w-px", isDarkTimeline ? "bg-slate-500/70" : "bg-slate-300/90"))} />
                              <span className={cx("max-w-[82px] truncate text-[10px] font-black leading-none transition-all", isHighlightedDate ? (isDarkTimeline ? "text-violet-100 drop-shadow-[0_0_6px_rgba(168,85,247,.45)]" : "text-violet-700 drop-shadow-sm") : t.textMuted)} title={tick.label}>
                                {tick.label}
                              </span>
                              <span className={cx("mt-1 text-[8px] font-bold leading-none transition-all", isHighlightedDate ? (isDarkTimeline ? "text-sky-200" : "text-sky-700") : t.textSoft)}>{tick.sublabel}</span>
                            </div>
                          );
                        })}
                      </div>
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
                      <button key={task.id} type="button" onClick={() => onOpenTask(task)} className={cx("rounded-3xl border p-4 text-left shadow-lg transition hover:-translate-y-0.5", t.cardSolid)}>
                        <div className={cx("mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r", column?.accent || "from-slate-400 to-slate-600")} />
                        <h3 className="line-clamp-2 text-base font-black">{task.title}</h3>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black">
                          <span className={cx("rounded-full px-2.5 py-1 ring-1", t.chip)}>{column?.title || "Bez etapu"}</span>
                          <span className={cx("rounded-full px-2.5 py-1 ring-1", t.chip)}>{formatDate(task.dueDate, { day: "2-digit", month: "long", year: "numeric" })}</span>
                          <span className={cx("rounded-full px-2.5 py-1 ring-1", t.chip)}>{completed}/{total} subtask\u00f3w</span>
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
