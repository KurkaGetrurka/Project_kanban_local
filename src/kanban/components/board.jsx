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

import { cx, formatDate, getTaskImages, labelThemes, labelThemesDark, priorityChipClass, priorityMeta, priorityOptions, progressOf, selectOptionStyle, theme } from "../shared.jsx";

export function TaskFiltersPanel({ t, filters, setFilters, onClear, visibleCount, totalCount }) {
  const hasFilters = Boolean(filters.search.trim() || filters.labelQuery.trim() || filters.priority !== "all" || filters.from || filters.to);

  return (
    <section className={cx("overflow-x-auto rounded-[1.15rem] border px-2 py-1.5 shadow-lg backdrop-blur-xl", t.card)}>
      <div className="flex min-w-max items-center gap-1.5 whitespace-nowrap">
        <div className={cx("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ring-1", t.chip)}>
          <Search size={11} />
          <span>{visibleCount}/{totalCount}</span>
        </div>

        <label className="relative block">
          <Search size={12} className={cx("pointer-events-none absolute left-2 top-1/2 -translate-y-1/2", t.textSoft)} />
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Szukaj..."
            className={cx("h-7 w-36 rounded-xl border pl-7 pr-2 text-[11px] font-semibold outline-none ring-violet-300 transition focus:ring-2", t.inputSolid)}
          />
        </label>

        <label className="relative block">
          <Sparkles size={12} className={cx("pointer-events-none absolute left-2 top-1/2 -translate-y-1/2", t.textSoft)} />
          <input
            value={filters.labelQuery}
            onChange={(event) => setFilters((current) => ({ ...current, labelQuery: event.target.value }))}
            placeholder="Etykieta..."
            className={cx("h-7 w-32 rounded-xl border pl-7 pr-2 text-[11px] font-semibold outline-none ring-pink-300 transition focus:ring-2", t.inputSolid)}
          />
        </label>

        <select
          value={filters.priority}
          onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
          className={cx("h-7 rounded-xl border px-2 text-[11px] font-black outline-none ring-sky-300 transition focus:ring-2", t.inputSolid)}
        >
          <option value="all" style={selectOptionStyle(t)}>Priorytet: wszystkie</option>
          {priorityOptions.map((priority) => (
            <option key={priority.id} value={priority.id} style={selectOptionStyle(t)}>{priority.title}</option>
          ))}
        </select>

        <label className="flex items-center gap-1">
          <span className={cx("text-[10px] font-black", t.textSoft)}>Od</span>
          <input
            type="date"
            value={filters.from}
            onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
            className={cx("h-7 rounded-xl border px-2 text-[11px] font-bold outline-none ring-sky-300 transition focus:ring-2", t.inputSolid)}
          />
        </label>

        <label className="flex items-center gap-1">
          <span className={cx("text-[10px] font-black", t.textSoft)}>Do</span>
          <input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
            className={cx("h-7 rounded-xl border px-2 text-[11px] font-bold outline-none ring-sky-300 transition focus:ring-2", t.inputSolid)}
          />
        </label>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className={cx("inline-flex h-7 items-center justify-center gap-1 rounded-xl border px-2.5 text-[11px] font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonSoft)}
        >
          <X size={12} /> Czyść
        </button>
      </div>
    </section>
  );
}

export function Column({
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

export function TaskCard({ t, isDark, task, onOpen, onToggleSubtask, onDragStart, onDragEnd }) {
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

export function TaskImagePaperStack({ t, images, title }) {
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
