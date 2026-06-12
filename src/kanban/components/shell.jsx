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

import {
  cx,
  dashboardSizeLabels,
  dashboardSizeOptions,
  dashboardSpanClass,
} from "../shared.jsx";

export function FontScaleStyles() {
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

    [data-kanban-board] .timeline-glass-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(248, 250, 252, 0.92) rgba(255, 255, 255, 0.12);
    }
    [data-kanban-board][data-theme="light"] .timeline-glass-scroll {
      scrollbar-color: rgba(71, 85, 105, 0.72) rgba(203, 213, 225, 0.42);
    }
    [data-kanban-board] .timeline-glass-scroll::-webkit-scrollbar {
      width: 14px;
    }
    [data-kanban-board] .timeline-glass-scroll::-webkit-scrollbar-track {
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.08));
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 8px 16px rgba(15, 23, 42, 0.18);
    }
    [data-kanban-board][data-theme="light"] .timeline-glass-scroll::-webkit-scrollbar-track {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(226, 232, 240, 0.72));
      box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.22), inset 0 8px 16px rgba(148, 163, 184, 0.12);
    }
    [data-kanban-board] .timeline-glass-scroll::-webkit-scrollbar-thumb {
      border-radius: 999px;
      border: 2px solid rgba(15, 23, 42, 0.18);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(203, 213, 225, 0.52)) padding-box;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.42), 0 8px 18px rgba(15, 23, 42, 0.28);
    }
    [data-kanban-board][data-theme="light"] .timeline-glass-scroll::-webkit-scrollbar-thumb {
      border: 2px solid rgba(255, 255, 255, 0.78);
      background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(203, 213, 225, 0.92)) padding-box;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 1), 0 8px 18px rgba(148, 163, 184, 0.28);
    }
    [data-kanban-board] .timeline-glass-scroll::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(196, 181, 253, 0.72)) padding-box;
    }
    [data-kanban-board][data-theme="light"] .timeline-glass-scroll::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(191, 219, 254, 0.96)) padding-box;
    }
  `}</style>;
}

export function TopToolbar({
  t,
  darkMode,
  fontScale,
  activeSection,
  isLayoutEditing,
  onToggleDark,
  onDecreaseFont,
  onIncreaseFont,
  onResetFont,
  onShowInfo,
  onShowTasks,
  onShowHelp,
  onOpenPerformance,
  onToggleLayout,
  onResetLayout,
  onResetSizes,
  onExportBackup,
  onImportBackup,
}) {
  const viewButtons = [
    {
      id: "info",
      label: "Pulpit",
      icon: <LayoutDashboard size={15} />,
      action: onShowInfo,
    },
    {
      id: "tasks",
      label: "Zadania",
      icon: <CheckSquare2 size={15} />,
      action: onShowTasks,
    },
    {
      id: "help",
      label: "Instrukcja",
      icon: <BookOpen size={15} />,
      action: onShowHelp,
    },
  ];

  const quickActions = [
    { label: "Raport", icon: <Activity size={15} />, action: onOpenPerformance },
    { label: "Eksport", icon: <Upload size={15} />, action: onExportBackup },
    { label: "Import", icon: <RotateCcw size={15} />, action: onImportBackup },
  ];

  return (
    <div
      className={cx(
        "sticky top-3 z-30 mb-5 overflow-hidden rounded-[1.75rem] border shadow-2xl backdrop-blur-2xl",
        t.card
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />

      <div className="grid gap-3 p-2.5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div
          className={cx(
            "flex flex-wrap items-center gap-2 rounded-[1.25rem] border p-1.5",
            t.buttonSoft
          )}
        >
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
            className={cx(
              "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5",
              t.buttonSoft
            )}
            title="Przełącz tryb jasny/ciemny"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">
              {darkMode ? "Jasny" : "Ciemny"}
            </span>
          </button>

          <div
            className={cx(
              "inline-flex items-center overflow-hidden rounded-2xl border shadow-sm",
              t.buttonSoft
            )}
            title="Wielkość tekstu"
          >
            <button
              type="button"
              onClick={onDecreaseFont}
              className={cx("px-3 py-2 text-xs font-black transition", t.hoverSoft)}
            >
              A−
            </button>

            <button
              type="button"
              onClick={onResetFont}
              className={cx(
                "border-x px-3 py-2 text-xs font-black transition",
                t.divider,
                t.hoverSoft
              )}
            >
              {fontScale}%
            </button>

            <button
              type="button"
              onClick={onIncreaseFont}
              className={cx("px-3 py-2 text-xs font-black transition", t.hoverSoft)}
            >
              A+
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleLayout}
            className={cx(
              "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5",
              isLayoutEditing ? t.actionPrimary : t.buttonSoft
            )}
            title={
              isLayoutEditing
                ? "Zakończ zmianę układu"
                : "Edytuj układ kafelków dashboardu"
            }
          >
            <GripVertical size={16} />
            <span className="hidden xl:inline">
              {isLayoutEditing ? "Zakończ edycję" : "Układ"}
            </span>
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
            <div
              className={cx(
                "mx-2.5 mb-2.5 rounded-[1.25rem] border p-2",
                t.buttonSoft
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={cx("px-2 text-xs font-bold", t.textMuted)}>
                  Tryb edycji układu jest aktywny — przeciągaj kafelki na
                  pulpicie albo zmień ich rozmiar przyciskiem na kafelce.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onResetLayout}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5",
                      t.buttonSoft
                    )}
                  >
                    <RotateCcw size={15} />
                    Reset układu
                  </button>

                  <button
                    type="button"
                    onClick={onResetSizes}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5",
                      t.buttonSoft
                    )}
                  >
                    <RotateCcw size={15} />
                    Reset rozmiarów
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DashboardSlot({
  t,
  widgetId,
  label,
  size,
  isEditing,
  draggedWidgetId,
  dropTarget,
  onPointerDragStart,
  onSizeChange,
  children,
}) {
  const isDragged = draggedWidgetId === widgetId;
  const showBeforeLine =
    isEditing &&
    !isDragged &&
    dropTarget?.id === widgetId &&
    dropTarget?.placement === "before";
  const showAfterLine =
    isEditing &&
    !isDragged &&
    dropTarget?.id === widgetId &&
    dropTarget?.placement === "after";

  return (
    <motion.div
      layout
      data-dashboard-widget-id={widgetId}
      data-dashboard-widget-size={size}
      onPointerDown={isEditing ? onPointerDragStart : undefined}
      initial={false}
      animate={{
        scale: isDragged ? 0.985 : 1,
        opacity: isDragged ? 0.58 : 1,
      }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 260,
          damping: 36,
          mass: 0.7,
        },
      }}
      className={cx(
        "relative h-full",
        dashboardSpanClass(size),
        isEditing &&
          "cursor-grab active:cursor-grabbing touch-none select-none"
      )}
    >
      <AnimatePresence>
        {(showBeforeLine || showAfterLine) && (
          <motion.div
            key={showBeforeLine ? "before" : "after"}
            initial={{ opacity: 0, scaleY: 0.65 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.65 }}
            className={cx(
              "absolute bottom-4 top-4 z-30 w-1 rounded-full bg-violet-400 shadow-[0_0_16px_rgba(168,85,247,.85)]",
              showBeforeLine ? "-left-2" : "-right-2"
            )}
          />
        )}
      </AnimatePresence>

      {isEditing && (
        <>
          <motion.div
            data-dashboard-drag-handle
            onPointerDown={onPointerDragStart}
            className={cx(
              "absolute right-3 top-3 z-20 inline-flex cursor-grab items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black shadow-lg",
              t.actionPrimary
            )}
          >
            <GripVertical size={12} />
            {label}
          </motion.div>

          <motion.div
            onPointerDown={(event) => event.stopPropagation()}
            className={cx(
              "absolute bottom-3 right-3 z-20 inline-flex items-center overflow-hidden rounded-full border text-[10px] font-black shadow-lg backdrop-blur",
              t.buttonSoft
            )}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSizeChange("decrease");
              }}
              disabled={dashboardSizeOptions.indexOf(size) === 0}
              className={cx(
                "px-2 py-1 transition disabled:opacity-35",
                t.hoverSoft
              )}
            >
              −
            </button>

            <span className={cx("border-x px-2 py-1", t.divider)}>
              {dashboardSizeLabels[size] || "Normalny"}
            </span>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSizeChange("increase");
              }}
              disabled={
                dashboardSizeOptions.indexOf(size) ===
                dashboardSizeOptions.length - 1
              }
              className={cx(
                "px-2 py-1 transition disabled:opacity-35",
                t.hoverSoft
              )}
            >
              +
            </button>
          </motion.div>
        </>
      )}

      <motion.div
        layout
        className={cx(
          "h-full transition-shadow duration-200",
          isEditing &&
            "rounded-[1.9rem] ring-2 ring-violet-400/50 ring-offset-2",
          isEditing && t.ringOffset
        )}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function DashboardCard({ t, children, className = "" }) {
  return (
    <section
      className={cx(
        "flex h-full min-h-[280px] flex-col rounded-[1.75rem] border p-4 shadow-xl backdrop-blur-xl",
        t.card,
        className
      )}
    >
      {children}
    </section>
  );
}

export function DashboardTitle({ t, icon, eyebrow, title, badge }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <div
          className={cx(
            "mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black ring-1",
            t.chip
          )}
        >
          {icon}
          {eyebrow}
        </div>

        <h2 className="text-base font-black leading-tight capitalize">
          {title}
        </h2>
      </div>

      {badge !== undefined && (
        <span
          className={cx(
            "inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-[10px] font-black leading-none",
            t.buttonPrimary
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

export function SectionTabs({ activeSection, onChange }) {
  const tabs = [
    {
      id: "info",
      icon: <LayoutDashboard size={23} />,
      title: "Pulpit",
      tone: "violet",
    },
    {
      id: "tasks",
      icon: <CheckSquare2 size={23} />,
      title: "Zadania",
      tone: "emerald",
    },
    {
      id: "help",
      icon: <BookOpen size={23} />,
      title: "Instrukcja",
      tone: "sky",
    },
    {
      id: "urlop",
      icon: <CalendarDays size={23} />,
      title: "Urlop",
      tone: "amber",
    },
  ];

  const toneClass = {
    violet: {
      active:
        "bg-violet-500 text-white shadow-xl shadow-violet-500/25 ring-4 ring-violet-300/35",
      idle:
        "bg-transparent text-violet-400 ring-1 ring-violet-400/30 hover:bg-violet-500/10",
    },
    emerald: {
      active:
        "bg-emerald-500 text-white shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-300/35",
      idle:
        "bg-transparent text-emerald-400 ring-1 ring-emerald-400/30 hover:bg-emerald-500/10",
    },
    sky: {
      active:
        "bg-sky-500 text-white shadow-xl shadow-sky-500/25 ring-4 ring-sky-300/35",
      idle:
        "bg-transparent text-sky-400 ring-1 ring-sky-400/30 hover:bg-sky-500/10",
    },
    amber: {
      active:
        "bg-amber-500 text-white shadow-xl shadow-amber-500/25 ring-4 ring-amber-300/35",
      idle:
        "bg-transparent text-amber-400 ring-1 ring-amber-400/30 hover:bg-amber-500/10",
    },
  };

  return (
    <div className="mb-6 flex justify-center">
      <div className="relative flex items-center justify-center gap-6 px-4 py-2 sm:gap-8">
        <div className="pointer-events-none absolute left-16 right-16 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-400/35 via-emerald-400/45 to-amber-400/35" />

        {tabs.map((tab, index) => {
          const isActive = activeSection === tab.id;

          return (
            <React.Fragment key={tab.id}>
              {index > 0 && (
                <div className="relative z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur sm:flex">
                  <ChevronRight size={16} className="text-sky-400" />
                </div>
              )}

              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-label={`Pokaż: ${tab.title}`}
                title={tab.title}
                className={cx(
                  "relative z-10 flex h-14 w-14 items-center justify-center rounded-full transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-violet-300/45",
                  isActive
                    ? toneClass[tab.tone].active
                    : toneClass[tab.tone].idle
                )}
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