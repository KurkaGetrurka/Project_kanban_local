import { useEffect, useMemo, useRef, useState } from "react";

import {
  STORAGE_KEY,
  backupFileName,
  buildBackupPayload,
  buildTaskImageGallery,
  clampFontScale,
  countImportableTasks,
  dashboardSizeOptions,
  dateKey,
  defaultDashboardOrder,
  defaultDashboardSizes,
  downloadTextFile,
  emptyDraft,
  filterTaskBoardTasks,
  getTaskImages,
  hasImportableKanbanData,
  loadInitialState,
  normalizeDashboardSizes,
  normalizeImportedState,
  normalizeTaskPriority,
  parseBackupText,
  parseLocalDate,
  progressOf,
  readImageAttachment,
  readTextFile,
  reorderDashboardOrder,
  runSelfTests,
  safeStorageSetItem,
  theme,
  uid,
} from "./shared.jsx";

const createQuickTaskState = () => ({
  title: "",
  columnId: "todo",
  dueDate: dateKey(new Date()),
  priority: "medium",
});

const createTaskFiltersState = () => ({
  search: "",
  labelQuery: "",
  priority: "all",
  from: "",
  to: "",
});

const createTaskSortState = () => ({
  mode: "manual",
});

const priorityRank = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function getSortableDateValue(task) {
  const date = parseLocalDate(task?.dueDate);
  return date ? date.getTime() : Number.POSITIVE_INFINITY;
}

function compareText(a, b) {
  return String(a || "").localeCompare(String(b || ""), "pl", { sensitivity: "base" });
}

function sortTaskBoardTasks(tasks, sort) {
  const mode = sort?.mode || "manual";
  const list = Array.isArray(tasks) ? [...tasks] : [];

  if (mode === "manual") return list;

  const createdAt = (task) => Number(task?.createdAt) || 0;
  const priorityValue = (task) => priorityRank[normalizeTaskPriority(task?.priority)] || 0;

  return list.sort((a, b) => {
    if (mode === "dueAsc") {
      return getSortableDateValue(a) - getSortableDateValue(b) || createdAt(a) - createdAt(b);
    }

    if (mode === "dueDesc") {
      return getSortableDateValue(b) - getSortableDateValue(a) || createdAt(a) - createdAt(b);
    }

    if (mode === "priorityDesc") {
      return priorityValue(b) - priorityValue(a) || getSortableDateValue(a) - getSortableDateValue(b);
    }

    if (mode === "priorityAsc") {
      return priorityValue(a) - priorityValue(b) || getSortableDateValue(a) - getSortableDateValue(b);
    }

    if (mode === "titleAsc") {
      return compareText(a?.title, b?.title) || createdAt(a) - createdAt(b);
    }

    if (mode === "titleDesc") {
      return compareText(b?.title, a?.title) || createdAt(a) - createdAt(b);
    }

    if (mode === "progressDesc") {
      return progressOf(b) - progressOf(a) || getSortableDateValue(a) - getSortableDateValue(b);
    }

    if (mode === "progressAsc") {
      return progressOf(a) - progressOf(b) || getSortableDateValue(a) - getSortableDateValue(b);
    }

    return 0;
  });
}

export function useKanbanBoard() {
  // Base state
  const initial = useMemo(loadInitialState, []);
  const [columns, setColumns] = useState(initial.columns);
  const [tasks, setTasks] = useState(initial.tasks);
  const [darkMode, setDarkMode] = useState(initial.darkMode);
  const [fontScale, setFontScale] = useState(initial.fontScale);
  const [dashboardOrder, setDashboardOrder] = useState(initial.dashboardOrder);
  const [dashboardSizes, setDashboardSizes] = useState(initial.dashboardSizes);
  const [activeSection, setActiveSection] = useState(initial.activeSection);
  const [isLayoutEditing, setIsLayoutEditing] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [draft, setDraft] = useState(null);
  const [quickTask, setQuickTask] = useState(createQuickTaskState);
  const [taskFilters, setTaskFilters] = useState(createTaskFiltersState);
  const [taskSort, setTaskSort] = useState(createTaskSortState);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const lastWidgetMoveRef = useRef("");
  const t = darkMode ? theme.dark : theme.light;
  const isDark = darkMode;
  const persistedBoardState = useMemo(
    () => ({
      columns,
      tasks,
      darkMode,
      fontScale,
      dashboardOrder,
      dashboardSizes,
      activeSection,
    }),
    [columns, tasks, darkMode, fontScale, dashboardOrder, dashboardSizes, activeSection]
  );

  // Boot and persistence
  useEffect(() => runSelfTests(), []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.remove("dark");
    document.body?.classList.remove("dark");
  }, [darkMode, draft, archiveOpen, timelineOpen]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    safeStorageSetItem(STORAGE_KEY, JSON.stringify(persistedBoardState));
  }, [persistedBoardState]);

  // Derived board state
  const activeTasks = useMemo(() => tasks.filter((task) => !task.archivedAt), [tasks]);
  const filteredActiveTasks = useMemo(() => filterTaskBoardTasks(activeTasks, taskFilters), [activeTasks, taskFilters]);
  const sortedFilteredActiveTasks = useMemo(() => sortTaskBoardTasks(filteredActiveTasks, taskSort), [filteredActiveTasks, taskSort]);
  const archivedTasks = useMemo(() => tasks.filter((task) => task.archivedAt).sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0)), [tasks]);
  const dueTasks = useMemo(() => activeTasks.filter((task) => task.dueDate), [activeTasks]);
  const timelineAllTasks = useMemo(() => dueTasks.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [dueTasks]);
  const taskImages = useMemo(() => buildTaskImageGallery(tasks), [tasks]);
  const backupText = useMemo(() => JSON.stringify(buildBackupPayload(persistedBoardState), null, 2), [persistedBoardState]);
  const upcomingTasks = useMemo(() => dueTasks.filter((task) => task.columnId !== "done").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6), [dueTasks]);
  const taskStats = useMemo(() => {
    const total = activeTasks.length;
    const done = activeTasks.filter((task) => task.columnId === "done").length;
    const subtasks = activeTasks.flatMap((task) => task.subtasks || []);
    return { total, done, subtasks: subtasks.length, completedSubtasks: subtasks.filter((item) => item.done).length };
  }, [activeTasks]);
  const projectProgress = taskStats.total ? Math.round((taskStats.done / taskStats.total) * 100) : 0;
  const columnStats = useMemo(() => columns.map((column) => ({ ...column, count: activeTasks.filter((task) => task.columnId === column.id).length })), [columns, activeTasks]);
  const draftExists = Boolean(draft && tasks.some((task) => task.id === draft.id));

  // Shared local helpers
  function closeSecondaryViews() {
    setArchiveOpen(false);
    setTimelineOpen(false);
    setCalendarOpen(false);
    setPerformanceOpen(false);
    setGalleryOpen(false);
    setSelectedGalleryImage(null);
    setImportOpen(false);
  }
  function updateTaskAndDraft(taskId, taskUpdater, draftUpdater = taskUpdater) {
    setTasks((current) => current.map((task) => (task.id === taskId ? taskUpdater(task) : task)));
    setDraft((current) => (current?.id === taskId ? draftUpdater(current) : current));
  }
  function resetDashboardDragState() {
    setDraggedWidgetId(null);
    setDropTarget(null);
    lastWidgetMoveRef.current = "";
  }

  // Task and modal actions
  function openTask(task) {
    setDraft({ ...JSON.parse(JSON.stringify(task)), priority: normalizeTaskPriority(task?.priority) });
  }
  function openNewTask(columnId = "todo", dueDate = "") {
    const nextDraft = emptyDraft(columnId);
    setDraft(dueDate ? { ...nextDraft, dueDate } : nextDraft);
  }
  function openTaskFromGallery(imageItem) {
    const task = tasks.find((item) => item.id === imageItem?.taskId);
    if (!task) return;
    setGalleryOpen(false);
    setSelectedGalleryImage(null);
    openTask(task);
  }
  function clearTaskFilters() {
    setTaskFilters(createTaskFiltersState());
  }
  function clearTaskSort() {
    setTaskSort(createTaskSortState());
  }
  function closeModal() {
    setDraft(null);
  }
  function saveDraft() {
    if (!draft?.title.trim()) return;
    const cleaned = {
      ...draft,
      priority: normalizeTaskPriority(draft.priority),
      title: draft.title.trim(),
      description: (draft.description || "").trim(),
      labels: (draft.labels || []).filter((label) => label.text.trim()),
      subtasks: (draft.subtasks || []).filter((item) => item.text.trim()),
      images: getTaskImages(draft),
      image: undefined,
    };
    setTasks((current) => (current.some((task) => task.id === cleaned.id) ? current.map((task) => (task.id === cleaned.id ? cleaned : task)) : [cleaned, ...current]));
    closeModal();
  }
  function quickAddTask() {
    const title = quickTask.title.trim();
    if (!title) return;
    setTasks((current) => [
      {
        ...emptyDraft(quickTask.columnId || "todo"),
        title,
        dueDate: quickTask.dueDate || dateKey(new Date()),
        priority: normalizeTaskPriority(quickTask.priority),
        labels: [{ id: uid(), text: "nowe", color: "green" }],
      },
      ...current,
    ]);
    setQuickTask((current) => ({ ...current, title: "" }));
  }

  // Import and export actions
  function exportBackup() {
    setExportOpen(true);
  }
  async function downloadBackupNow() {
    const result = await downloadTextFile(backupFileName(), backupText);
    if (result?.reason === "cancelled") return result;
    if (!result?.ok) {
      alert("Przeglądarka zablokowała automatyczne pobranie. Skopiuj zawartość kopii z okna eksportu i zapisz ją ręcznie jako plik .json.");
    }
    return result;
  }
  function applyImportedBackup(parsed) {
    if (!hasImportableKanbanData(parsed)) throw new Error("Wybrany plik nie wygląda jak kopia zapasowa tej tablicy. Brakuje listy zadań.");
    const normalized = normalizeImportedState(parsed, persistedBoardState);
    const importedCount = countImportableTasks(parsed);
    const nextState = {
      columns: normalized.columns,
      tasks: normalized.tasks,
      darkMode: normalized.darkMode,
      fontScale: normalized.fontScale,
      dashboardOrder: normalized.dashboardOrder,
      dashboardSizes: normalized.dashboardSizes,
      activeSection: normalized.activeSection,
    };
    const importedDueDate = nextState.tasks.find((task) => task.dueDate)?.dueDate;
    const importedMonth = parseLocalDate(importedDueDate || dateKey(new Date()));

    setColumns(nextState.columns);
    setTasks(nextState.tasks);
    setDarkMode(nextState.darkMode);
    setFontScale(nextState.fontScale);
    setDashboardOrder(nextState.dashboardOrder);
    setDashboardSizes(nextState.dashboardSizes);
    setActiveSection(nextState.activeSection);
    setDraft(null);
    closeSecondaryViews();
    if (importedMonth) setCalendarMonth(new Date(importedMonth.getFullYear(), importedMonth.getMonth(), 1));
    if (typeof window !== "undefined") {
      safeStorageSetItem(STORAGE_KEY, JSON.stringify(nextState));
      window.dispatchEvent(new CustomEvent("kanban-imported", { detail: { importedCount, restoredCount: nextState.tasks.length } }));
    }
    alert(`Kopia zapasowa została wczytana. Odczytano ${importedCount} kart, przywrócono ${nextState.tasks.length}.`);
  }
  function requestImportBackup() {
    setImportOpen(true);
  }
  async function importBackupFile(file) {
    if (!file) return;
    try {
      const text = await readTextFile(file);
      const parsed = parseBackupText(text);
      applyImportedBackup(parsed);
    } catch (error) {
      alert(error.message || "Nie udało się wczytać kopii zapasowej. Sprawdź, czy wybrany plik jest prawidłowym plikiem JSON z tej aplikacji.");
    }
  }
  function importBackupText(text) {
    try {
      const parsed = parseBackupText(text);
      applyImportedBackup(parsed);
      return true;
    } catch (error) {
      alert(error.message || "Nie udało się wczytać kopii zapasowej. Sprawdź treść JSON z eksportu.");
      return false;
    }
  }
  function moveTask(taskId, columnId, targetTaskId = null, placement = "end") {
    setTasks((current) => {
      const draggedTask = current.find((task) => task.id === taskId);
      if (!draggedTask) return current;

      const activeWithoutDragged = current.filter((task) => !task.archivedAt && task.id !== taskId);
      const archivedItems = current.filter((task) => task.archivedAt);
      const knownColumnIds = new Set(columns.map((column) => column.id));
      const grouped = columns.reduce((acc, column) => {
        acc[column.id] = activeWithoutDragged.filter((task) => task.columnId === column.id);
        return acc;
      }, {});
      const targetList = [...(grouped[columnId] || [])];
      const updatedDraggedTask = { ...draggedTask, columnId };

      if (!targetTaskId) {
        targetList.push(updatedDraggedTask);
      } else {
        const targetIndex = targetList.findIndex((task) => task.id === targetTaskId);
        const insertAt = targetIndex < 0 ? targetList.length : placement === "after" ? targetIndex + 1 : targetIndex;
        targetList.splice(insertAt, 0, updatedDraggedTask);
      }

      grouped[columnId] = targetList;

      const rebuiltActive = columns.flatMap((column) => grouped[column.id] || []);
      const unknownColumnTasks = activeWithoutDragged.filter((task) => !knownColumnIds.has(task.columnId));
      return [...rebuiltActive, ...unknownColumnTasks, ...archivedItems];
    });
  }
  function updateTaskDueDate(taskId, dueDate) {
    updateTaskAndDraft(taskId, (task) => ({ ...task, dueDate }));
  }
  function archiveTask(taskId) {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, archivedAt: Date.now() } : task)));
    closeModal();
  }
  function restoreTask(taskId, columnId = "done") {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, columnId, archivedAt: undefined } : task)));
    closeModal();
  }
  function deleteTask(taskId) {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    closeModal();
  }
  function addLabel() {
    setDraft((current) => ({ ...current, labels: [...(current.labels || []), { id: uid(), text: "", color: "pink" }] }));
  }
  function updateLabel(labelId, patch) {
    setDraft((current) => ({ ...current, labels: (current.labels || []).map((label) => (label.id === labelId ? { ...label, ...patch } : label)) }));
  }
  function removeLabel(labelId) {
    setDraft((current) => ({ ...current, labels: (current.labels || []).filter((label) => label.id !== labelId) }));
  }
  function addSubtask() {
    setDraft((current) => ({ ...current, subtasks: [...(current.subtasks || []), { id: uid(), text: "", done: false }] }));
  }
  function updateSubtask(subtaskId, patch) {
    setDraft((current) => ({ ...current, subtasks: (current.subtasks || []).map((item) => (item.id === subtaskId ? { ...item, ...patch } : item)) }));
  }
  function removeSubtask(subtaskId) {
    setDraft((current) => ({ ...current, subtasks: (current.subtasks || []).filter((item) => item.id !== subtaskId) }));
  }
  async function attachTaskImage(fileInput) {
    const files = Array.from(fileInput?.length !== undefined ? fileInput : [fileInput]).filter(Boolean);
    if (!files.length) return;
    try {
      const images = await Promise.all(files.map(readImageAttachment));
      setDraft((current) => ({ ...current, images: [...getTaskImages(current), ...images], image: undefined }));
    } catch (error) {
      alert(error.message || "Nie udało się dodać jednego ze zdjęć.");
    }
  }
  function removeTaskImage(imageId) {
    setDraft((current) => ({ ...current, images: getTaskImages(current).filter((image) => (image.id || image.dataUrl) !== imageId), image: undefined }));
  }
  function toggleSubtaskDone(taskId, subtaskId) {
    const toggleItems = (items = []) => items.map((item) => (item.id === subtaskId ? { ...item, done: !item.done } : item));
    updateTaskAndDraft(taskId, (task) => ({ ...task, subtasks: toggleItems(task.subtasks) }));
  }

  // Dashboard layout actions
  function getDashboardTargetFromPointer(clientX, clientY, draggedId) {
    if (typeof document === "undefined") return null;
    const candidates = Array.from(document.querySelectorAll("[data-dashboard-widget-id]")).map((element) => ({ id: element.getAttribute("data-dashboard-widget-id"), rect: element.getBoundingClientRect() })).filter((item) => item.id && item.id !== draggedId);
    if (!candidates.length) return null;
    const target = candidates.reduce((closest, item) => {
      const centerX = item.rect.left + item.rect.width / 2;
      const centerY = item.rect.top + item.rect.height / 2;
      const distance = Math.hypot(clientX - centerX, (clientY - centerY) * 1.35);
      return !closest || distance < closest.distance ? { ...item, distance } : closest;
    }, null);
    if (!target) return null;
    return { id: target.id, placement: clientX < target.rect.left + target.rect.width / 2 ? "before" : "after" };
  }
  function moveDashboardWidget(targetId, placement = "before") {
    if (!draggedWidgetId || draggedWidgetId === targetId) return;
    setDashboardOrder((current) => reorderDashboardOrder(current, draggedWidgetId, targetId, placement));
  }
  function changeDashboardWidgetSize(widgetId, direction) {
    setDashboardSizes((current) => {
      const normalized = normalizeDashboardSizes(current);
      const index = dashboardSizeOptions.indexOf(normalized[widgetId] || "normal");
      const nextIndex = direction === "increase" ? Math.min(dashboardSizeOptions.length - 1, index + 1) : Math.max(0, index - 1);
      return nextIndex === index ? normalized : { ...normalized, [widgetId]: dashboardSizeOptions[nextIndex] };
    });
  }
  function startDashboardWidgetDrag(event, widgetId) {
    if (!isLayoutEditing) return;
    event.preventDefault();
    event.stopPropagation();
    setDraggedWidgetId(widgetId);
    resetDashboardDragState();
    setDraggedWidgetId(widgetId);
  }
  useEffect(() => {
    if (!draggedWidgetId || !isLayoutEditing || typeof window === "undefined") return;
    function handlePointerMove(event) {
      const target = getDashboardTargetFromPointer(event.clientX, event.clientY, draggedWidgetId);
      if (!target) return setDropTarget(null);
      setDropTarget(target);
      const moveKey = `${draggedWidgetId}:${target.id}:${target.placement}`;
      if (lastWidgetMoveRef.current === moveKey) return;
      lastWidgetMoveRef.current = moveKey;
      moveDashboardWidget(target.id, target.placement);
    }
    function finishPointerDrag() {
      resetDashboardDragState();
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishPointerDrag, { once: true });
    window.addEventListener("pointercancel", finishPointerDrag, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishPointerDrag);
      window.removeEventListener("pointercancel", finishPointerDrag);
    };
  }, [draggedWidgetId, isLayoutEditing]);

  // Global view controls
  function toggleDarkMode() {
    setDarkMode((value) => !value);
  }
  function decreaseFont() {
    setFontScale((value) => clampFontScale(value - 5));
  }
  function increaseFont() {
    setFontScale((value) => clampFontScale(value + 5));
  }
  function resetFont() {
    setFontScale(100);
  }
  function changeSection(section) {
    setActiveSection(section);
    setIsLayoutEditing(false);
  }
  function showInfoSection() {
    changeSection("info");
  }
  function showTasksSection() {
    changeSection("tasks");
  }
  function showHelpSection() {
    changeSection("help");
  }
  function openPerformanceFromToolbar() {
    changeSection("info");
    setPerformanceOpen(true);
  }
  function toggleLayoutEditing() {
    setActiveSection("info");
    setIsLayoutEditing((value) => !value);
  }
  function resetDashboardLayout() {
    setDashboardOrder(defaultDashboardOrder);
  }
  function resetDashboardSizes() {
    setDashboardSizes(defaultDashboardSizes);
  }

  return {
    state: {
      t,
      isDark,
      columns,
      tasks,
      darkMode,
      fontScale,
      dashboardOrder,
      dashboardSizes,
      activeSection,
      isLayoutEditing,
      draggedWidgetId,
      dropTarget,
      draggedTaskId,
      archiveOpen,
      timelineOpen,
      calendarOpen,
      performanceOpen,
      galleryOpen,
      exportOpen,
      importOpen,
      selectedGalleryImage,
      draft,
      draftExists,
      quickTask,
      taskFilters,
      taskSort,
      calendarMonth,
      activeTasks,
      filteredActiveTasks,
      sortedFilteredActiveTasks,
      archivedTasks,
      dueTasks,
      timelineAllTasks,
      taskImages,
      backupText,
      upcomingTasks,
      taskStats,
      projectProgress,
      columnStats,
    },
    setters: {
      setArchiveOpen,
      setCalendarMonth,
      setCalendarOpen,
      setDraggedTaskId,
      setDraft,
      setExportOpen,
      setGalleryOpen,
      setImportOpen,
      setPerformanceOpen,
      setQuickTask,
      setSelectedGalleryImage,
      setTaskFilters,
      setTaskSort,
      setTimelineOpen,
    },
    actions: {
      addLabel,
      addSubtask,
      archiveTask,
      attachTaskImage,
      changeDashboardWidgetSize,
      changeSection,
      clearTaskFilters,
      clearTaskSort,
      closeModal,
      decreaseFont,
      deleteTask,
      downloadBackupNow,
      exportBackup,
      importBackupFile,
      importBackupText,
      increaseFont,
      moveTask,
      openNewTask,
      openPerformanceFromToolbar,
      openTask,
      openTaskFromGallery,
      quickAddTask,
      removeLabel,
      removeSubtask,
      removeTaskImage,
      requestImportBackup,
      resetDashboardLayout,
      resetDashboardSizes,
      resetFont,
      restoreTask,
      saveDraft,
      showHelpSection,
      showInfoSection,
      showTasksSection,
      startDashboardWidgetDrag,
      toggleDarkMode,
      toggleLayoutEditing,
      toggleSubtaskDone,
      updateLabel,
      updateSubtask,
      updateTaskDueDate,
    },
  };
}
