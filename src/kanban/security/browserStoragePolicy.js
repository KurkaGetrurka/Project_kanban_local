export const BROWSER_PERSISTENCE_DISABLED_KEY = "kanban-browser-persistence-disabled-session";

export function isBrowserPersistenceDisabled() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(BROWSER_PERSISTENCE_DISABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export function disableBrowserPersistenceForSession() {
  if (typeof window === "undefined") return false;
  try {
    window.sessionStorage.setItem(BROWSER_PERSISTENCE_DISABLED_KEY, "1");
    window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__ = true;
    return true;
  } catch {
    window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__ = true;
    return false;
  }
}

export function enableBrowserPersistenceForSession() {
  if (typeof window === "undefined") return false;
  try {
    window.sessionStorage.removeItem(BROWSER_PERSISTENCE_DISABLED_KEY);
    window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__ = false;
    return true;
  } catch {
    window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__ = false;
    return false;
  }
}

export function shouldPersistToBrowserStorage() {
  if (typeof window === "undefined") return false;
  return !window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__ && !isBrowserPersistenceDisabled();
}

export function hasKanbanBrowserStorage(storageKey, legacyKeys = []) {
  if (typeof window === "undefined") return false;
  try {
    const keys = [storageKey, ...(Array.isArray(legacyKeys) ? legacyKeys : [])].filter(Boolean);
    return keys.some((key) => window.localStorage.getItem(key) !== null);
  } catch {
    return false;
  }
}

export function clearKanbanBrowserStorage(storageKey, legacyKeys = []) {
  if (typeof window === "undefined") {
    return { ok: false, removedKeys: [], failedKeys: [], disabledPersistence: false };
  }

  const keys = [storageKey, ...(Array.isArray(legacyKeys) ? legacyKeys : [])].filter(Boolean);
  const removedKeys = [];
  const failedKeys = [];

  for (const key of keys) {
    try {
      if (window.localStorage.getItem(key) !== null) {
        window.localStorage.removeItem(key);
        removedKeys.push(key);
      }
    } catch {
      failedKeys.push(key);
    }
  }

  const disabledPersistence = disableBrowserPersistenceForSession();

  return {
    ok: failedKeys.length === 0,
    removedKeys,
    failedKeys,
    disabledPersistence,
  };
}
