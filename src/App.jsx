import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CircleHelp, LayoutDashboard, ListChecks } from "lucide-react";
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
  TopToolbar,
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
        <TopToolbar
          t={state.t}
          darkMode={state.darkMode}
          fontScale={state.fontScale}
          activeSection={state.activeSection}
          isLayoutEditing={state.isLayoutEditing}
          onToggleDark={actions.toggleDarkMode}
          onDecreaseFont={actions.decreaseFont}
          onIncreaseFont={actions.increaseFont}
          onResetFont={actions.resetFont}
          onShowInfo={actions.showInfoSection}
          onShowTasks={actions.showTasksSection}
          onShowHelp={actions.showHelpSection}
          onOpenPerformance={actions.openPerformanceFromToolbar}
          onToggleLayout={actions.toggleLayoutEditing}
          onResetLayout={actions.resetDashboardLayout}
          onResetSizes={actions.resetDashboardSizes}
          onExportBackup={actions.exportBackup}
          onImportBackup={actions.requestImportBackup}
        />

        <header className="mb-3 flex items-center">
          <div className={cx("inline-flex items-center gap-2 text-sm font-black", state.t.textSoft)}>
            <CurrentSectionIcon size={18} strokeWidth={2.5} />
            <span>{currentSectionMeta.label}</span>
          </div>
        </header>

        <div className="mb-8 flex w-full justify-center">
          <SectionTabs
            activeSection={state.activeSection}
            onChange={actions.changeSection}
          />
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
