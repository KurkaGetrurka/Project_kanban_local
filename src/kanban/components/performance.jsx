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

import { buildPerformanceStats, clampNumber, cx, defaultColumns } from "../shared.jsx";

export function PerformanceModal({ t, open, tasks, columns, onClose }) {
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

export function ProjectHealthLineChart({ t, data, columns }) {
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

export function PerformanceMetric({ t, icon, label, value, helper }) {
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

export function ProgressLine({ t, label, value, gradient, helper }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-black"><span>{label}</span><span className={t.textMuted}>{helper || `${value}%`}</span></div>
      <div className={cx("h-3 overflow-hidden rounded-full", t.progressTrack)}><motion.div layout className={cx("h-full rounded-full bg-gradient-to-r", gradient)} style={{ width: `${clampNumber(value, 0, 100)}%` }} /></div>
    </div>
  );
}
