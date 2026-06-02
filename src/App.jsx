import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";

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
  TaskFiltersPanel,
  TaskProgressCard,
  TimelineCard,
  TimelineDetailsModal,
  TopToolbar,
} from "./kanban/components.jsx";
import { cx, dashboardLabels, fontScaleMultiplier, backupFileName } from "./kanban/shared.jsx";
import { useKanbanBoard } from "./kanban/useKanbanBoard.jsx";

export default function AestheticKanbanBoard() {
  const { state, setters, actions } = useKanbanBoard();

  const dashboardCards = {
    progress: <ProjectProgressCard t={state.t} progress={state.projectProgress} total={state.taskStats.total} done={state.taskStats.done} archived={state.archivedTasks.length} />,
    today: <QuickAddPanel t={state.t} columns={state.columns} quickTask={state.quickTask} setQuickTask={setters.setQuickTask} onQuickAdd={actions.quickAddTask} upcomingTasks={state.upcomingTasks} onOpenTask={actions.openTask} />,
    calendar: <MonthCalendar t={state.t} isDark={state.isDark} month={state.calendarMonth} tasks={state.dueTasks} columns={state.columns} onOpenTask={actions.openTask} onCreateTaskForDate={(selectedDate) => actions.openNewTask("todo", selectedDate)} onPreviousMonth={() => setters.setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} onNextMonth={() => setters.setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} onToday={() => { const today = new Date(); setters.setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1)); }} onOpenCalendar={() => setters.setCalendarOpen(true)} />,
    taskProgress: <TaskProgressCard t={state.t} columnStats={state.columnStats} total={state.taskStats.total} />,
    actions: <DashboardActionsCard t={state.t} archivedCount={state.archivedTasks.length} galleryCount={state.taskImages.length} onNewTask={() => actions.openNewTask("todo")} onArchive={() => setters.setArchiveOpen(true)} onPerformance={() => setters.setPerformanceOpen(true)} onGallery={() => setters.setGalleryOpen(true)} />,
    timeline: <TimelineCard t={state.t} tasks={state.timelineAllTasks} columns={state.columns} onOpenTask={actions.openTask} onOpenDetails={() => setters.setTimelineOpen(true)} />,
  };

  return (
    <div data-kanban-board className={cx("min-h-screen px-4 py-6 transition-colors duration-300 sm:px-6 lg:px-8", state.t.app)} data-theme={state.isDark ? "dark" : "light"} style={{ colorScheme: state.isDark ? "dark" : "light", "--kanban-font-scale": fontScaleMultiplier(state.fontScale) }}>
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

        <header className="mb-5">
          <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 backdrop-blur", state.isDark ? "bg-white/10 text-violet-200 ring-white/10" : "bg-white/75 text-violet-600 ring-violet-100")}><LayoutDashboard size={14} /> Pulpit projektu</div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{"Tablica zada\u0144 i post\u0119p\u00f3w projektu"}</h1>
          <p className={cx("mt-2 max-w-2xl text-sm leading-6 sm:text-base", state.t.textMuted)}>{"Przejrzysty panel do planowania pracy, kontroli termin\u00f3w, filtrowania zada\u0144 oraz monitorowania post\u0119p\u00f3w na tablicy Kanban."}</p>
        </header>

        <SectionTabs activeSection={state.activeSection} onChange={actions.changeSection} />

        <AnimatePresence mode="wait" initial={false}>
          {state.activeSection === "info" ? (
            <motion.section key="info-section" data-dashboard-grid className="grid auto-rows-[minmax(280px,auto)] items-stretch gap-4 lg:grid-cols-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {state.dashboardOrder.map((widgetId) => (
                <DashboardSlot key={widgetId} t={state.t} widgetId={widgetId} label={dashboardLabels[widgetId]} size={state.dashboardSizes[widgetId] || "normal"} isEditing={state.isLayoutEditing} draggedWidgetId={state.draggedWidgetId} dropTarget={state.dropTarget} onPointerDragStart={(event) => actions.startDashboardWidgetDrag(event, widgetId)} onSizeChange={(direction) => actions.changeDashboardWidgetSize(widgetId, direction)}>{dashboardCards[widgetId]}</DashboardSlot>
              ))}
            </motion.section>
          ) : state.activeSection === "help" ? (
            <HelpGuide
              t={state.t}
              onGoToInfo={actions.showInfoSection}
              onGoToTasks={actions.showTasksSection}
              onNewTask={() => { actions.showTasksSection(); actions.openNewTask("todo"); }}
              onOpenTimeline={() => { actions.showInfoSection(); setters.setTimelineOpen(true); }}
              onOpenPerformance={() => { actions.showInfoSection(); setters.setPerformanceOpen(true); }}
              onOpenGallery={() => { actions.showInfoSection(); setters.setGalleryOpen(true); }}
              onOpenArchive={() => { actions.showInfoSection(); setters.setArchiveOpen(true); }}
            />
          ) : (
            <motion.section key="tasks-section" className="grid gap-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <TaskFiltersPanel
                t={state.t}
                filters={state.taskFilters}
                setFilters={setters.setTaskFilters}
                onClear={actions.clearTaskFilters}
                visibleCount={state.filteredActiveTasks.length}
                totalCount={state.activeTasks.length}
              />
              <div data-task-board className="grid w-full grid-cols-4 items-stretch gap-3 pb-4 lg:gap-4">
                {state.columns.map((column) => <Column key={column.id} t={state.t} isDark={state.isDark} column={column} tasks={state.filteredActiveTasks.filter((task) => task.columnId === column.id)} onOpenNew={() => actions.openNewTask(column.id)} onOpenTask={actions.openTask} onMoveTask={actions.moveTask} onToggleSubtask={actions.toggleSubtaskDone} draggedTaskId={state.draggedTaskId} setDraggedTaskId={setters.setDraggedTaskId} />)}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <ArchiveModal t={state.t} open={state.archiveOpen} tasks={state.archivedTasks} onClose={() => setters.setArchiveOpen(false)} onOpenTask={(task) => { setters.setArchiveOpen(false); actions.openTask(task); }} onRestore={(taskId) => actions.restoreTask(taskId, "done")} />
      <CalendarDetailsModal t={state.t} isDark={state.isDark} open={state.calendarOpen} month={state.calendarMonth} tasks={state.dueTasks} columns={state.columns} onClose={() => setters.setCalendarOpen(false)} onOpenTask={(task) => { setters.setCalendarOpen(false); actions.openTask(task); }} onCreateTaskForDate={(selectedDate) => { setters.setCalendarOpen(false); actions.openNewTask("todo", selectedDate); }} onPreviousMonth={() => setters.setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} onNextMonth={() => setters.setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} onToday={() => { const today = new Date(); setters.setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1)); }} />
      <TimelineDetailsModal t={state.t} open={state.timelineOpen} tasks={state.timelineAllTasks} columns={state.columns} onClose={() => setters.setTimelineOpen(false)} onOpenTask={actions.openTask} onMoveTaskDate={actions.updateTaskDueDate} />
      <PerformanceModal t={state.t} open={state.performanceOpen} tasks={state.tasks} columns={state.columns} onClose={() => setters.setPerformanceOpen(false)} />
      <GalleryModal t={state.t} open={state.galleryOpen} images={state.taskImages} selected={state.selectedGalleryImage} onSelect={setters.setSelectedGalleryImage} onClose={() => { setters.setGalleryOpen(false); setters.setSelectedGalleryImage(null); }} onClosePreview={() => setters.setSelectedGalleryImage(null)} onGoToTask={actions.openTaskFromGallery} />
      <ExportBackupModal t={state.t} open={state.exportOpen} backupText={state.backupText} fileName={backupFileName()} onClose={() => setters.setExportOpen(false)} onDownload={actions.downloadBackupNow} />
      <ImportBackupModal t={state.t} open={state.importOpen} onClose={() => setters.setImportOpen(false)} onImportText={actions.importBackupText} onImportFile={actions.importBackupFile} />
      <EditTaskModal t={state.t} isDark={state.isDark} draft={state.draft} columns={state.columns} draftExists={state.draftExists} setDraft={setters.setDraft} onClose={actions.closeModal} onSave={actions.saveDraft} onDelete={actions.deleteTask} onArchive={actions.archiveTask} onRestore={actions.restoreTask} onAddLabel={actions.addLabel} onUpdateLabel={actions.updateLabel} onRemoveLabel={actions.removeLabel} onAddSubtask={actions.addSubtask} onUpdateSubtask={actions.updateSubtask} onRemoveSubtask={actions.removeSubtask} onAttachImage={actions.attachTaskImage} onRemoveImage={actions.removeTaskImage} />
    </div>
  );
}
