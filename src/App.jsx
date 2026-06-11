import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CalendarDays, CircleHelp, GripVertical, LayoutDashboard, ListChecks, Moon, RotateCcw, Sun, Upload } from "lucide-react";
import UrlopTab from "./kanban/UrlopTab.jsx";

import {
  ArchiveModal,
  CalendarDetailsModal,
  Column,
  DashboardActionsCard,
  DashboardSlot,
  EditTaskModal,
  ExportBackupModal,
  FontScaleStyles,
  GalleryModal,
  HelpGuide,
  ImportBackupModal,
  MonthCalendar,
  PerformanceModal,
  ProjectProgressCard,
  QuickAddPanel,
  SectionTabs,
  TaskProgressCard,
  TimelineCard,
  TimelineDetailsModal,
} from "./kanban/components.jsx";

import {
  backupFileName,
  cx,
  dashboardLabels,
  fontScaleMultiplier,
  selectOptionStyle,
} from "./kanban/shared.jsx";

import { useKanbanBoard } from "./kanban/useKanbanBoard.jsx";

const taskSortOptions = [
  {
    id: "manual",
    label: "Ręcznie / obecna kolejność",
    hint: "Zostawia układ kart dokładnie tak, jak jest ułożony ręcznie.",
  },
  {
    id: "dueAsc",
    label: "Termin: najbliższe pierwsze",
    hint: "Najpierw zadania z najbliższą datą. Brak daty idzie na koniec.",
  },
  {
    id: "dueDesc",
    label: "Termin: najdalsze pierwsze",
    hint: "Najpierw zadania z najdalszą datą.",
  },
  {
    id: "priorityDesc",
    label: "Priorytet: najwyższy pierwszy",
    hint: "Pilne i wysokie zadania trafiają wyżej w kolumnach.",
  },
  {
    id: "priorityAsc",
    label: "Priorytet: najniższy pierwszy",
    hint: "Najpierw niskie priorytety, potem coraz ważniejsze.",
  },
  {
    id: "titleAsc",
    label: "Nazwa: A-Z",
    hint: "Sortowanie alfabetyczne od A do Z.",
  },
  {
    id: "titleDesc",
    label: "Nazwa: Z-A",
    hint: "Sortowanie alfabetyczne od Z do A.",
  },
  {
    id: "progressDesc",
    label: "Postęp: największy pierwszy",
    hint: "Najpierw karty z największym procentem wykonania subtasków.",
  },
  {
    id: "progressAsc",
    label: "Postęp: najmniejszy pierwszy",
    hint: "Najpierw karty z najmniejszym procentem wykonania subtasków.",
  },
];

function TaskSortPanel({ t, sort, setSort, onClear, visibleCount }) {
  const mode = sort?.mode || "manual";
  const isDefault = mode === "manual";

  return (
    <section className="ml-auto flex w-fit max-w-full flex-wrap items-center justify-end gap-2">
      <span className={cx("text-[10px] font-black uppercase tracking-[0.14em]", t.textSoft)}>
        Sortuj
      </span>

      <span className={cx("text-[10px] font-black", t.textSoft)}>
        {visibleCount}
      </span>

      <select
        value={mode}
        onChange={(event) => setSort({ mode: event.target.value })}
        className={cx(
          "h-8 w-[230px] max-w-[58vw] rounded-full border border-transparent bg-transparent px-3 text-[11px] font-black outline-none ring-sky-300 transition hover:border-white/10 hover:bg-white/5 focus:border-sky-400/50 focus:ring-2",
          t.textMuted
        )}
      >
        {taskSortOptions.map((option) => (
          <option key={option.id} value={option.id} style={selectOptionStyle(t)}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onClear}
        disabled={isDefault}
        className={cx(
          "inline-flex h-8 items-center justify-center rounded-full border border-transparent bg-transparent px-3 text-[10px] font-black transition hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40",
          t.textMuted
        )}
      >
        Reset
      </button>
    </section>
  );
}

function TodayBadge({ t }) {
  const [nowMs, setNowMs] = React.useState(() => Date.now());

  React.useEffect(() => {
    const tick = () => setNowMs(Date.now());

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const now = new Date(nowMs);
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondAngle = seconds * 6;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60) * 30;

  const dateLabel = now.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timeLabel = now.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className={cx(
        "flex min-w-0 items-center gap-2 px-1 text-xs font-black",
        t.textSoft
      )}
      title={`Dzisiejsza data i godzina: ${dateLabel}, ${timeLabel}`}
    >
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9 shrink-0 overflow-visible"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.26"
        />

        {[0, 1, 2, 3].map((tick) => (
          <line
            key={tick}
            x1="24"
            y1="5"
            x2="24"
            y2="9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.38"
            transform={`rotate(${tick * 90} 24 24)`}
          />
        ))}

        <line
          x1="24"
          y1="24"
          x2="24"
          y2="14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.82"
          transform={`rotate(${hourAngle} 24 24)`}
        />

        <line
          x1="24"
          y1="24"
          x2="24"
          y2="10"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.72"
          transform={`rotate(${minuteAngle} 24 24)`}
        />

        <line
          x1="24"
          y1="27"
          x2="24"
          y2="7"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.92"
          transform={`rotate(${secondAngle} 24 24)`}
        />

        <circle cx="24" cy="24" r="2.5" fill="currentColor" opacity="0.9" />
      </svg>

      <span className="whitespace-nowrap capitalize">
        {dateLabel}
      </span>
    </div>
  );
}

function ControlToolbar({
  t,
  darkMode,
  fontScale,
  isLayoutEditing,
  onToggleDark,
  onDecreaseFont,
  onIncreaseFont,
  onResetFont,
  onOpenPerformance,
  onToggleLayout,
  onResetLayout,
  onResetSizes,
  onExportBackup,
  onImportBackup,
}) {
  const quickActions = [
    { label: "Raport", icon: <Activity size={15} />, action: onOpenPerformance },
    { label: "Eksport", icon: <Upload size={15} />, action: onExportBackup },
    { label: "Import", icon: <RotateCcw size={15} />, action: onImportBackup },
  ];

  return (
    <div
      className={cx(
        "sticky top-3 z-30 mb-4 w-full overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl",
        t.card
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />

      <div className="flex w-full flex-wrap items-center justify-between gap-2 p-2.5">
        <TodayBadge t={t} />

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {quickActions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className={cx(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5",
                t.buttonSoft
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
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5",
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
              "inline-flex items-center overflow-hidden rounded-xl border shadow-sm",
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
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5",
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
                "mx-2.5 mb-2.5 rounded-xl border p-2",
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
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5",
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
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5",
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

export default function AestheticKanbanBoard() {
  const { state, setters, actions } = useKanbanBoard();

  const dashboardCards = {
    progress: (
      <ProjectProgressCard
        t={state.t}
        progress={state.projectProgress}
        total={state.taskStats.total}
        done={state.taskStats.done}
        archived={state.archivedTasks.length}
      />
    ),

    today: (
      <QuickAddPanel
        t={state.t}
        columns={state.columns}
        quickTask={state.quickTask}
        setQuickTask={setters.setQuickTask}
        onQuickAdd={actions.quickAddTask}
        upcomingTasks={state.upcomingTasks}
        onOpenTask={actions.openTask}
      />
    ),

    calendar: (
      <MonthCalendar
        t={state.t}
        isDark={state.isDark}
        month={state.calendarMonth}
        tasks={state.dueTasks}
        columns={state.columns}
        onOpenTask={actions.openTask}
        onCreateTaskForDate={(selectedDate) =>
          actions.openNewTask("todo", selectedDate)
        }
        onPreviousMonth={() =>
          setters.setCalendarMonth(
            (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1)
          )
        }
        onNextMonth={() =>
          setters.setCalendarMonth(
            (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1)
          )
        }
        onToday={() => {
          const today = new Date();

          setters.setCalendarMonth(
            new Date(today.getFullYear(), today.getMonth(), 1)
          );
        }}
        onOpenCalendar={() => setters.setCalendarOpen(true)}
      />
    ),

    taskProgress: (
      <TaskProgressCard
        t={state.t}
        columnStats={state.columnStats}
        total={state.taskStats.total}
      />
    ),

    actions: (
      <DashboardActionsCard
        t={state.t}
        archivedCount={state.archivedTasks.length}
        galleryCount={state.taskImages.length}
        onNewTask={() => actions.openNewTask("todo")}
        onArchive={() => setters.setArchiveOpen(true)}
        onPerformance={() => setters.setPerformanceOpen(true)}
        onGallery={() => setters.setGalleryOpen(true)}
      />
    ),

    timeline: (
      <TimelineCard
        t={state.t}
        tasks={state.timelineAllTasks}
        columns={state.columns}
        onOpenTask={actions.openTask}
        onOpenDetails={() => setters.setTimelineOpen(true)}
      />
    ),
  };

  const sectionMeta = {
    info: { label: "Pulpit", icon: LayoutDashboard },
    tasks: { label: "Zadania", icon: ListChecks },
    help: { label: "Instrukcja", icon: CircleHelp },
    urlop: { label: "Urlop", icon: CalendarDays },
  };

  const currentSectionMeta = sectionMeta[state.activeSection] || sectionMeta.info;
  const CurrentSectionIcon = currentSectionMeta.icon;

  return (
    <div
      data-kanban-board
      className={cx(
        "min-h-screen px-4 py-6 transition-colors duration-300 sm:px-6 lg:px-8",
        state.t.app
      )}
      data-theme={state.isDark ? "dark" : "light"}
      style={{
        colorScheme: state.isDark ? "dark" : "light",
        "--kanban-font-scale": fontScaleMultiplier(state.fontScale),
      }}
    >
      <FontScaleStyles />

      <main className="mx-auto max-w-7xl">
        <ControlToolbar
          t={state.t}
          darkMode={state.darkMode}
          fontScale={state.fontScale}
          isLayoutEditing={state.isLayoutEditing}
          onToggleDark={actions.toggleDarkMode}
          onDecreaseFont={actions.decreaseFont}
          onIncreaseFont={actions.increaseFont}
          onResetFont={actions.resetFont}
          onOpenPerformance={actions.openPerformanceFromToolbar}
          onToggleLayout={actions.toggleLayoutEditing}
          onResetLayout={actions.resetDashboardLayout}
          onResetSizes={actions.resetDashboardSizes}
          onExportBackup={actions.exportBackup}
          onImportBackup={actions.requestImportBackup}
        />

        <div className="mb-6 flex min-h-[210px] w-full items-center justify-center">
          <div className="grid w-fit place-items-center gap-4 text-center">
            <header className="flex w-full items-center justify-center">
              <div className={cx("inline-flex items-center justify-center gap-2 text-sm font-black", state.t.textSoft)}>
                <CurrentSectionIcon size={18} strokeWidth={2.5} />
                <span>{currentSectionMeta.label}</span>
              </div>
            </header>

            <div className="flex w-full justify-center">
              <SectionTabs
                activeSection={state.activeSection}
                onChange={actions.changeSection}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {state.activeSection === "info" ? (
            <motion.section
              key="info-section"
              data-dashboard-grid
              className="grid auto-rows-[minmax(280px,auto)] items-stretch gap-4 lg:grid-cols-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {state.dashboardOrder.map((widgetId) => (
                <DashboardSlot
                  key={widgetId}
                  t={state.t}
                  widgetId={widgetId}
                  label={dashboardLabels[widgetId]}
                  size={state.dashboardSizes[widgetId] || "normal"}
                  isEditing={state.isLayoutEditing}
                  draggedWidgetId={state.draggedWidgetId}
                  dropTarget={state.dropTarget}
                  onPointerDragStart={(event) =>
                    actions.startDashboardWidgetDrag(event, widgetId)
                  }
                  onSizeChange={(direction) =>
                    actions.changeDashboardWidgetSize(widgetId, direction)
                  }
                >
                  {dashboardCards[widgetId]}
                </DashboardSlot>
              ))}
            </motion.section>
          ) : state.activeSection === "help" ? (
            <HelpGuide
              t={state.t}
              onGoToInfo={actions.showInfoSection}
              onGoToTasks={actions.showTasksSection}
              onNewTask={() => {
                actions.showTasksSection();
                actions.openNewTask("todo");
              }}
              onOpenTimeline={() => {
                actions.showInfoSection();
                setters.setTimelineOpen(true);
              }}
              onOpenPerformance={() => {
                actions.showInfoSection();
                setters.setPerformanceOpen(true);
              }}
              onOpenGallery={() => {
                actions.showInfoSection();
                setters.setGalleryOpen(true);
              }}
              onOpenArchive={() => {
                actions.showInfoSection();
                setters.setArchiveOpen(true);
              }}
            />
          ) : state.activeSection === "urlop" ? (
            <motion.section
              key="urlop-section"
              className="grid gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UrlopTab />
            </motion.section>
          ) : (
            <motion.section
              key="tasks-section"
              className="grid gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="-mb-2 flex justify-end">
                <TaskSortPanel
                  t={state.t}
                  sort={state.taskSort}
                  setSort={setters.setTaskSort}
                  onClear={actions.clearTaskSort}
                  visibleCount={state.sortedActiveTasks.length}
                />
              </div>

              <div
                data-task-board
                className="grid w-full grid-cols-4 items-stretch gap-3 pb-4 lg:gap-4"
              >
                {state.columns.map((column) => (
                  <Column
                    key={column.id}
                    t={state.t}
                    isDark={state.isDark}
                    column={column}
                    tasks={state.sortedActiveTasks.filter(
                      (task) => task.columnId === column.id
                    )}
                    onOpenNew={() => actions.openNewTask(column.id)}
                    onOpenTask={actions.openTask}
                    onMoveTask={actions.moveTask}
                    onToggleSubtask={actions.toggleSubtaskDone}
                    draggedTaskId={state.draggedTaskId}
                    setDraggedTaskId={setters.setDraggedTaskId}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <ArchiveModal
        t={state.t}
        open={state.archiveOpen}
        tasks={state.archivedTasks}
        onClose={() => setters.setArchiveOpen(false)}
        onOpenTask={(task) => {
          setters.setArchiveOpen(false);
          actions.openTask(task);
        }}
        onRestore={(taskId) => actions.restoreTask(taskId, "done")}
      />

      <CalendarDetailsModal
        t={state.t}
        isDark={state.isDark}
        open={state.calendarOpen}
        month={state.calendarMonth}
        tasks={state.dueTasks}
        columns={state.columns}
        onClose={() => setters.setCalendarOpen(false)}
        onOpenTask={(task) => {
          setters.setCalendarOpen(false);
          actions.openTask(task);
        }}
        onCreateTaskForDate={(selectedDate) => {
          setters.setCalendarOpen(false);
          actions.openNewTask("todo", selectedDate);
        }}
        onPreviousMonth={() =>
          setters.setCalendarMonth(
            (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1)
          )
        }
        onNextMonth={() =>
          setters.setCalendarMonth(
            (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1)
          )
        }
        onToday={() => {
          const today = new Date();

          setters.setCalendarMonth(
            new Date(today.getFullYear(), today.getMonth(), 1)
          );
        }}
      />

      <TimelineDetailsModal
        t={state.t}
        open={state.timelineOpen}
        tasks={state.timelineAllTasks}
        columns={state.columns}
        onClose={() => setters.setTimelineOpen(false)}
        onOpenTask={actions.openTask}
        onMoveTaskDate={actions.updateTaskDueDate}
      />

      <PerformanceModal
        t={state.t}
        open={state.performanceOpen}
        tasks={state.tasks}
        columns={state.columns}
        onClose={() => setters.setPerformanceOpen(false)}
      />

      <GalleryModal
        t={state.t}
        open={state.galleryOpen}
        images={state.taskImages}
        selected={state.selectedGalleryImage}
        onSelect={setters.setSelectedGalleryImage}
        onClose={() => {
          setters.setGalleryOpen(false);
          setters.setSelectedGalleryImage(null);
        }}
        onClosePreview={() => setters.setSelectedGalleryImage(null)}
        onGoToTask={actions.openTaskFromGallery}
      />

      <ExportBackupModal
        t={state.t}
        open={state.exportOpen}
        backupText={state.backupText}
        fileName={backupFileName()}
        onClose={() => setters.setExportOpen(false)}
        onDownload={actions.downloadBackupNow}
      />

      <ImportBackupModal
        t={state.t}
        open={state.importOpen}
        onClose={() => setters.setImportOpen(false)}
        onImportText={actions.importBackupText}
        onImportFile={actions.importBackupFile}
      />

      <EditTaskModal
        t={state.t}
        isDark={state.isDark}
        draft={state.draft}
        columns={state.columns}
        draftExists={state.draftExists}
        setDraft={setters.setDraft}
        onClose={actions.closeModal}
        onSave={actions.saveDraft}
        onDelete={actions.deleteTask}
        onArchive={actions.archiveTask}
        onRestore={actions.restoreTask}
        onAddLabel={actions.addLabel}
        onUpdateLabel={actions.updateLabel}
        onRemoveLabel={actions.removeLabel}
        onAddSubtask={actions.addSubtask}
        onUpdateSubtask={actions.updateSubtask}
        onRemoveSubtask={actions.removeSubtask}
        onAttachImage={actions.attachTaskImage}
        onRemoveImage={actions.removeTaskImage}
      />
    </div>
  );
}
