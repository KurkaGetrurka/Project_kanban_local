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

import { DashboardCard, DashboardTitle } from "./shell.jsx";
import { buildMonthDays, cx, dateKey, defaultColumns, formatDate, monthLabel, parseLocalDate, priorityChipClass, priorityMeta, progressOf, stageGradientForTask, stageTitleForTask, taskTitlesForTooltip, theme } from "../shared.jsx";

export function MonthCalendar({ t, isDark, month, tasks, columns = defaultColumns, onOpenTask, onCreateTaskForDate, onPreviousMonth, onNextMonth, onToday, onOpenCalendar }) {
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

export function DayTaskPickerModal({ t, open, dayKeyValue, tasks, columns, onClose, onOpenTask, onCreateTask }) {
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

export function CalendarDetailsModal({ t, isDark, open, month, tasks, columns = defaultColumns, onClose, onOpenTask, onCreateTaskForDate, onPreviousMonth, onNextMonth, onToday }) {
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
