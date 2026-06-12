import React from "react";
import { Activity, Archive, CheckSquare2, Image as ImageIcon, Plus, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { DashboardCard, DashboardTitle } from "./shell.jsx";
import { cx, dateKey, formatDate } from "../shared.jsx";

const selectOptionStyle = (t) => ({
  color: String(t?.modal || "").includes("slate-950") ? "#f8fafc" : "#0f172a",
  backgroundColor: String(t?.modal || "").includes("slate-950") ? "#020617" : "#ffffff",
});

export function ProjectProgressCard({ t, progress, total, done, archived }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <DashboardCard t={t}>
      <DashboardTitle t={t} icon={<TrendingUp size={12} />} eyebrow="Postęp" title="Postęp projektu" />

      <div className="flex items-center justify-center">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke={t.progressCircleTrack} strokeWidth="14" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="55%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black">{progress}%</span>
            <span className={cx("text-xs font-semibold", t.textMuted)}>ukończone</span>
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <MiniMetric t={t} value={done} label="Gotowe" tone="bg-emerald-400" />
        <MiniMetric t={t} value={total} label="Aktywne" tone="bg-sky-400" />
        <MiniMetric t={t} value={archived} label="Archiwum" tone="bg-violet-400" />
      </div>
    </DashboardCard>
  );
}

export function MiniMetric({ t, value, label, tone }) {
  return (
    <div className={cx("rounded-2xl p-2 ring-1", t.chip)}>
      <div className="flex items-center justify-center gap-1">
        <span className={cx("h-2 w-2 rounded-full", tone)} />
        <span className="text-lg font-black">{value}</span>
      </div>
      <p className={cx("text-[10px] font-semibold", t.textMuted)}>{label}</p>
    </div>
  );
}

export function QuickAddPanel({ t, columns, quickTask, setQuickTask, onQuickAdd, upcomingTasks, onOpenTask }) {
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
              <option key={column.id} value={column.id} style={selectOptionStyle(t)}>
                {column.title}
              </option>
            ))}
          </select>

          <button type="button" onClick={onQuickAdd} disabled={!quickTask.title.trim()} className="rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-300/40 transition hover:-translate-y-0.5 disabled:opacity-40">
            Dodaj
          </button>
        </div>

        <div className="grid gap-2">
          {upcomingTasks.slice(0, 3).map((task) => (
            <button
              type="button"
              key={task.id}
              onClick={() => onOpenTask(task)}
              className={cx("flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm", t.subtle)}
            >
              <span className={cx("h-4 w-4 rounded-md border", t.border)} />
              <span className="min-w-0 flex-1 truncate">{task.title}</span>
              <span className={cx("text-[10px]", t.textSoft)}>{formatDate(task.dueDate)}</span>
            </button>
          ))}

          {upcomingTasks.length === 0 && (
            <p className={cx("rounded-2xl p-3 text-xs", t.subtle)}>Brak najbliższych terminów. Podejrzanie miło.</p>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}

export function TaskProgressCard({ t, columnStats, total }) {
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

export function DashboardActionsCard({ t, archivedCount, galleryCount, onNewTask, onArchive, onPerformance, onGallery }) {
  return (
    <DashboardCard t={t}>
      <DashboardTitle t={t} icon={<Sparkles size={12} />} eyebrow="Akcje" title="Panel sterowania" />

      <div className="grid gap-3">
        <button type="button" onClick={onNewTask} className={cx("group inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold shadow-lg transition hover:-translate-y-0.5", t.actionPrimary)}>
          <Plus size={18} className="transition group-hover:rotate-90" />
          Dodaj większe zadanie
        </button>

        <button type="button" onClick={onPerformance} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5", t.actionSecondary)}>
          <Activity size={18} />
          Raport postępów
        </button>

        <button type="button" onClick={onGallery} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5", t.actionSecondary)}>
          <ImageIcon size={18} />
          Galeria zdjęć ({galleryCount})
        </button>

        <button type="button" onClick={onArchive} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5", t.actionSecondary)}>
          <Archive size={18} />
          Archiwum ({archivedCount})
        </button>
      </div>
    </DashboardCard>
  );
}
