import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
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

const taskPriorityFilterOptions = [
  { id: "all", label: "Priorytet: wszystkie" },
  { id: "urgent", label: "Priorytet: pilny" },
  { id: "high", label: "Priorytet: wysoki" },
  { id: "medium", label: "Priorytet: średni" },
  { id: "low", label: "Priorytet: niski" },
];

function TaskSearchPanel({ t, filters, setFilters, onClear, visibleCount, totalCount }) {
  const [activeSearchMode, setActiveSearchMode] = React.useState("quick");

  const search = filters?.search || "";
  const labelQuery = filters?.labelQuery || "";
  const priority = filters?.priority || "all";
  const from = filters?.from || "";
  const to = filters?.to || "";
  const hasFilters = Boolean(search || labelQuery || priority !== "all" || from || to);

  const searchModes = [
    { id: "quick", label: "Szybkie" },
    { id: "label", label: "Etykieta" },
    { id: "priority", label: "Priorytet" },
    { id: "date", label: "Termin" },
    { id: "advanced", label: "Wszystko" },
  ];

  const activeMode =
    searchModes.find((mode) => mode.id === activeSearchMode) || searchModes[0];

  const activeFilterChips = [
    search ? { id: "search", label: `Treść: ${search}`, clear: () => updateFilter("search", "") } : null,
    labelQuery ? { id: "labelQuery", label: `Etykieta: ${labelQuery}`, clear: () => updateFilter("labelQuery", "") } : null,
    priority !== "all"
      ? {
          id: "priority",
          label:
            taskPriorityFilterOptions
              .find((option) => option.id === priority)
              ?.label.replace("Priorytet: ", "Priorytet: ") || "Priorytet",
          clear: () => updateFilter("priority", "all"),
        }
      : null,
    from ? { id: "from", label: `Od: ${from}`, clear: () => updateFilter("from", "") } : null,
    to ? { id: "to", label: `Do: ${to}`, clear: () => updateFilter("to", "") } : null,
  ].filter(Boolean);

  function updateFilter(field, value) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function renderSearchFields() {
    if (activeMode.id === "quick") {
      return (
        <input
          value={search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Szukaj po nazwie, opisie, dacie..."
          className={cx(
            "h-9 w-full rounded-xl border px-3 text-[11px] font-black outline-none ring-sky-300 transition focus:ring-2",
            t.inputSolid
          )}
        />
      );
    }

    if (activeMode.id === "label") {
      return (
        <input
          value={labelQuery}
          onChange={(event) => updateFilter("labelQuery", event.target.value)}
          placeholder="Wpisz etykietę, np. pilne, mapa, kontrola..."
          className={cx(
            "h-9 w-full rounded-xl border px-3 text-[11px] font-black outline-none ring-sky-300 transition focus:ring-2",
            t.inputSolid
          )}
        />
      );
    }

    if (activeMode.id === "priority") {
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          {taskPriorityFilterOptions.map((option) => {
            const isActive = priority === option.id;
            const label = option.id === "all" ? "Wszystkie" : option.label.replace("Priorytet: ", "");

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => updateFilter("priority", option.id)}
                className={cx(
                  "inline-flex h-7 items-center justify-center rounded-full border px-3 text-[10px] font-black transition hover:-translate-y-0.5",
                  isActive ? t.buttonPrimary : t.buttonSoft
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      );
    }

    if (activeMode.id === "date") {
      return (
        <div className="flex flex-wrap items-end gap-2">
          <label className="grid w-full gap-1 sm:w-[150px]">
            <span className={cx("px-1 text-[10px] font-black uppercase tracking-wide", t.textSoft)}>
              Od
            </span>
            <input
              type="date"
              value={from}
              onChange={(event) => updateFilter("from", event.target.value)}
              className={cx(
                "h-9 rounded-xl border px-2 text-[11px] font-black outline-none ring-sky-300 transition focus:ring-2",
                t.inputSolid
              )}
            />
          </label>

          <label className="grid w-full gap-1 sm:w-[150px]">
            <span className={cx("px-1 text-[10px] font-black uppercase tracking-wide", t.textSoft)}>
              Do
            </span>
            <input
              type="date"
              value={to}
              onChange={(event) => updateFilter("to", event.target.value)}
              className={cx(
                "h-9 rounded-xl border px-2 text-[11px] font-black outline-none ring-sky-300 transition focus:ring-2",
                t.inputSolid
              )}
            />
          </label>
        </div>
      );
    }

    return (
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1">
          <span className={cx("px-1 text-[9px] font-black uppercase tracking-wide", t.textSoft)}>
            Treść
          </span>
          <input
            value={search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Nazwa, opis..."
            className={cx(
              "h-8 rounded-xl border px-2 text-[11px] font-black outline-none ring-sky-300 transition focus:ring-2",
              t.inputSolid
            )}
          />
        </label>

        <label className="grid gap-1">
          <span className={cx("px-1 text-[9px] font-black uppercase tracking-wide", t.textSoft)}>
            Etykieta
          </span>
          <input
            value={labelQuery}
            onChange={(event) => updateFilter("labelQuery", event.target.value)}
            placeholder="Etykieta..."
            className={cx(
              "h-8 rounded-xl border px-2 text-[11px] font-black outline-none ring-sky-300 transition focus:ring-2",
              t.inputSolid
            )}
          />
        </label>

        <label className="grid gap-1">
          <span className={cx("px-1 text-[9px] font-black uppercase tracking-wide", t.textSoft)}>
            Priorytet
          </span>
          <select
            value={priority}
            onChange={(event) => updateFilter("priority", event.target.value)}
            className={cx(
              "h-8 rounded-xl border px-2 text-[11px] font-black outline-none ring-sky-300 transition focus:ring-2",
              t.inputSolid
            )}
          >
            {taskPriorityFilterOptions.map((option) => (
              <option key={option.id} value={option.id} style={selectOptionStyle(t)}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-1">
          <span className={cx("px-1 text-[9px] font-black uppercase tracking-wide", t.textSoft)}>
            Termin
          </span>

          <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <input
              type="date"
              value={from}
              onChange={(event) => updateFilter("from", event.target.value)}
              className={cx(
                "h-8 min-w-0 rounded-xl border px-2 text-[10px] font-black outline-none ring-sky-300 transition focus:ring-2",
                t.inputSolid
              )}
              title="Data od"
            />

            <input
              type="date"
              value={to}
              onChange={(event) => updateFilter("to", event.target.value)}
              className={cx(
                "h-8 min-w-0 rounded-xl border px-2 text-[10px] font-black outline-none ring-sky-300 transition focus:ring-2",
                t.inputSolid
              )}
              title="Data do"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className={cx(
        "h-full rounded-[1.15rem] border px-3 py-2 shadow-lg backdrop-blur-xl",
        t.card
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">
            Wyszukiwanie i filtrowanie
          </p>

        </div>

        <span className={cx("rounded-full px-2 py-1 text-[10px] font-black ring-1", t.chip)}>
          {visibleCount}/{totalCount}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {searchModes.map((mode) => {
          const isActive = activeMode.id === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveSearchMode(mode.id)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition hover:-translate-y-0.5",
                isActive ? t.buttonPrimary : t.buttonSoft
              )}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      <div className={cx("rounded-2xl border p-3", t.cardSolid)}>
        {renderSearchFields()}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {activeFilterChips.length > 0 ? (
          <>
            <span className={cx("text-[10px] font-black uppercase tracking-wide", t.textSoft)}>
              Aktywne:
            </span>

            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={chip.clear}
                className={cx(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ring-1 transition hover:-translate-y-0.5",
                  t.chip
                )}
                title="Kliknij, aby usunąć ten filtr"
              >
                {chip.label}
                <span className="text-xs opacity-70">×</span>
              </button>
            ))}
          </>
        ) : (
          <p className={cx("text-[11px] leading-5", t.textMuted)}>
            Brak aktywnych filtrów — widoczne są wszystkie aktywne karty.
          </p>
        )}

        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className={cx(
            "ml-auto inline-flex h-7 items-center justify-center rounded-xl border px-3 text-[10px] font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40",
            t.buttonSoft
          )}
        >
          Reset
        </button>
      </div>
    </section>
  );
}

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
  const selectedOption =
    taskSortOptions.find((option) => option.id === mode) || taskSortOptions[0];
  const isDefault = mode === "manual";

  return (
    <section
      className={cx(
        "flex h-full flex-col rounded-[1.15rem] border px-3 py-2 shadow-lg backdrop-blur-xl",
        t.card
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">
            Sortowanie
          </p>
          <p className={cx("text-[11px] font-semibold", t.textSoft)}>
            Układa widoczne karty w każdej kolumnie.
          </p>
        </div>

        <span className={cx("rounded-full px-2 py-1 text-[10px] font-black ring-1", t.chip)}>
          {visibleCount}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          value={mode}
          onChange={(event) => setSort({ mode: event.target.value })}
          className={cx(
            "h-8 rounded-xl border px-2 text-[11px] font-black outline-none ring-sky-300 transition focus:ring-2",
            t.inputSolid
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
            "inline-flex h-8 items-center justify-center rounded-xl border px-3 text-[11px] font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40",
            t.buttonSoft
          )}
        >
          Reset
        </button>
      </div>

      <p className={cx("mt-auto pt-3 text-[11px] leading-5", t.textMuted)}>
        {selectedOption.hint}
      </p>
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

        <header className="mb-5">
          <div
            className={cx(
              "mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 backdrop-blur",
              state.isDark
                ? "bg-white/10 text-violet-200 ring-white/10"
                : "bg-white/75 text-violet-600 ring-violet-100"
            )}
          >
            <LayoutDashboard size={14} />
            Pulpit projektu
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Tablica zadań i postępów projektu
          </h1>

          <p
            className={cx(
              "mt-2 max-w-2xl text-sm leading-6 sm:text-base",
              state.t.textMuted
            )}
          >
            Przejrzysty panel do planowania pracy, kontroli terminów,
            filtrowania zadań oraz monitorowania postępów na tablicy Kanban.
          </p>
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
              <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
                <TaskSearchPanel
                  t={state.t}
                  filters={state.taskFilters}
                  setFilters={setters.setTaskFilters}
                  onClear={actions.clearTaskFilters}
                  visibleCount={state.filteredActiveTasks.length}
                  totalCount={state.activeTasks.length}
                />

                <TaskSortPanel
                  t={state.t}
                  sort={state.taskSort}
                  setSort={setters.setTaskSort}
                  onClear={actions.clearTaskSort}
                  visibleCount={state.filteredActiveTasks.length}
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
                    tasks={state.sortedFilteredActiveTasks.filter(
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
