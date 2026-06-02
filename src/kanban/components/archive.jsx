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

import { cx, filterArchivedTasks, formatDate, getTaskImages, labelThemes, labelThemesDark, selectOptionStyle } from "../shared.jsx";

export function ArchiveModal({ t, open, tasks, onClose, onOpenTask, onRestore }) {
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

export function ArchivedTaskCard({ t, task, onOpen, onRestore }) {
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
