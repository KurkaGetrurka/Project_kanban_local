export const BROWSER_PERSISTENCE_DISABLED_KEY = "kanban-browser-persistence-disabled-session";

function normalizeStorageKeys(storageKey, legacyKeys = []) {
  return [storageKey, ...(Array.isArray(legacyKeys) ? legacyKeys : [])].filter(Boolean).map(String);
}

function dispatchBrowserPersistenceChanged(disabled) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("kanban-browser-persistence-changed", {
      detail: {
        disabled: Boolean(disabled),
      },
    })
  );
}

export function isBrowserPersistenceDisabled() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(BROWSER_PERSISTENCE_DISABLED_KEY) === "1";
  } catch {
    return Boolean(window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__);
  }
}

export function installBrowserPersistenceGuard(storageKey, legacyKeys = []) {
  if (typeof window === "undefined" || typeof Storage === "undefined") return false;

  const blockedKeys = normalizeStorageKeys(storageKey, legacyKeys);
  window.__KANBAN_BLOCKED_BROWSER_STORAGE_KEYS__ = new Set([
    ...Array.from(window.__KANBAN_BLOCKED_BROWSER_STORAGE_KEYS__ || []),
    ...blockedKeys,
  ]);

  if (window.__KANBAN_BROWSER_PERSISTENCE_GUARD_INSTALLED__) return true;

  const originalSetItem = Storage.prototype.setItem;
  window.__KANBAN_ORIGINAL_STORAGE_SET_ITEM__ = originalSetItem;

  Storage.prototype.setItem = function guardedSetItem(key, value) {
    const disabled = Boolean(window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__) || isBrowserPersistenceDisabled();
    const blocked = window.__KANBAN_BLOCKED_BROWSER_STORAGE_KEYS__?.has(String(key));

    if (disabled && blocked && this === window.localStorage) {
      return undefined;
    }

    return originalSetItem.call(this, key, value);
  };

  window.__KANBAN_BROWSER_PERSISTENCE_GUARD_INSTALLED__ = true;
  return true;
}

export function disableBrowserPersistenceForSession(storageKey, legacyKeys = []) {
  if (typeof window === "undefined") return false;
  let sessionStorageUpdated = false;

  try {
    window.sessionStorage.setItem(BROWSER_PERSISTENCE_DISABLED_KEY, "1");
    sessionStorageUpdated = true;
  } catch {
    sessionStorageUpdated = false;
  }

  window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__ = true;
  installBrowserPersistenceGuard(storageKey, legacyKeys);
  dispatchBrowserPersistenceChanged(true);
  return sessionStorageUpdated;
}

export function enableBrowserPersistenceForSession() {
  if (typeof window === "undefined") return false;
  let sessionStorageUpdated = false;

  try {
    window.sessionStorage.removeItem(BROWSER_PERSISTENCE_DISABLED_KEY);
    sessionStorageUpdated = true;
  } catch {
    sessionStorageUpdated = false;
  }

  window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__ = false;
  dispatchBrowserPersistenceChanged(false);
  return sessionStorageUpdated;
}

export function shouldPersistToBrowserStorage() {
  if (typeof window === "undefined") return false;
  return !window.__KANBAN_BROWSER_PERSISTENCE_DISABLED__ && !isBrowserPersistenceDisabled();
}

export function hasKanbanBrowserStorage(storageKey, legacyKeys = []) {
  if (typeof window === "undefined") return false;
  try {
    const keys = normalizeStorageKeys(storageKey, legacyKeys);
    return keys.some((key) => window.localStorage.getItem(key) !== null);
  } catch {
    return false;
  }
}

export function clearKanbanBrowserStorage(storageKey, legacyKeys = []) {
  if (typeof window === "undefined") {
    return { ok: false, removedKeys: [], failedKeys: [], disabledPersistence: false };
  }

  const keys = normalizeStorageKeys(storageKey, legacyKeys);
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

  const disabledPersistence = disableBrowserPersistenceForSession(storageKey, legacyKeys);

  return {
    ok: failedKeys.length === 0,
    removedKeys,
    failedKeys,
    disabledPersistence,
  };
}
