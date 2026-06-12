let liveBoardSnapshot = null;

function cloneSnapshot(value) {
  if (!value || typeof value !== "object") return null;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

export function setLiveBoardSnapshot(value) {
  liveBoardSnapshot = cloneSnapshot(value);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kanban-live-board-snapshot-changed", {
        detail: { available: Boolean(liveBoardSnapshot) },
      })
    );
  }

  return Boolean(liveBoardSnapshot);
}

export function getLiveBoardSnapshot() {
  return cloneSnapshot(liveBoardSnapshot);
}

export function clearLiveBoardSnapshot() {
  liveBoardSnapshot = null;

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kanban-live-board-snapshot-changed", {
        detail: { available: false },
      })
    );
  }
}

export function hasLiveBoardSnapshot() {
  return Boolean(liveBoardSnapshot);
}
