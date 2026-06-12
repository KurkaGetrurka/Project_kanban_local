import {
  decryptKanbanDatabase,
  encryptKanbanDatabase,
  isEncryptedDatabasePayload,
} from "./encryptedDatabase.js";
import { clearLiveBoardSnapshot, setLiveBoardSnapshot } from "./liveBoardSnapshot.js";

let activeFileDatabaseSession = null;

export function isFileSystemAccessSupported() {
  return Boolean(
    typeof window !== "undefined" &&
      typeof window.showSaveFilePicker === "function" &&
      typeof window.showOpenFilePicker === "function"
  );
}

export function encryptedKanbanFileTypes() {
  return [
    {
      description: "Zaszyfrowana baza Kanban",
      accept: {
        "application/json": [".json", ".kanban.json"],
      },
    },
  ];
}

async function writeEncryptedTextToHandle(handle, text) {
  const writable = await handle.createWritable();
  await writable.write(new Blob([text], { type: "application/json;charset=utf-8" }));
  await writable.close();
}

export async function saveEncryptedDatabaseFile({ suggestedName = "kanban-baza.kanban.json", text }) {
  if (!text || typeof text !== "string") {
    throw new Error("Brak treści zaszyfrowanej bazy do zapisania.");
  }

  if (!isFileSystemAccessSupported()) {
    return { ok: false, reason: "unsupported" };
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: encryptedKanbanFileTypes(),
      excludeAcceptAllOption: false,
    });

    await writeEncryptedTextToHandle(handle, text);

    return {
      ok: true,
      method: "file-system-access",
      fileName: handle.name || suggestedName,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { ok: false, reason: "cancelled" };
    }

    throw new Error(error?.message || "Nie udało się zapisać zaszyfrowanej bazy do wybranego pliku.");
  }
}

export async function openEncryptedDatabaseFile() {
  if (!isFileSystemAccessSupported()) {
    return { ok: false, reason: "unsupported" };
  }

  try {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: encryptedKanbanFileTypes(),
      excludeAcceptAllOption: false,
    });

    if (!handle) return { ok: false, reason: "cancelled" };

    const file = await handle.getFile();
    const text = await file.text();

    return {
      ok: true,
      method: "file-system-access",
      fileName: file.name || handle.name || "kanban-baza.kanban.json",
      text,
      handle,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { ok: false, reason: "cancelled" };
    }

    throw new Error(error?.message || "Nie udało się otworzyć zaszyfrowanej bazy z pliku.");
  }
}

export function hasActiveFileDatabaseSession() {
  return Boolean(activeFileDatabaseSession?.handle && activeFileDatabaseSession?.password);
}

export function getActiveFileDatabaseSummary() {
  if (!hasActiveFileDatabaseSession()) {
    return {
      active: false,
      fileName: "",
      openedAt: "",
      lastSavedAt: "",
    };
  }

  return {
    active: true,
    fileName: activeFileDatabaseSession.fileName,
    openedAt: activeFileDatabaseSession.openedAt,
    lastSavedAt: activeFileDatabaseSession.lastSavedAt,
  };
}

export function closeActiveFileDatabaseSession() {
  activeFileDatabaseSession = null;
  clearLiveBoardSnapshot();
  return { ok: true };
}

export async function openEncryptedDatabaseSession({ password }) {
  const nextPassword = String(password || "").trim();
  if (!nextPassword) {
    throw new Error("Podaj hasło do zaszyfrowanej bazy.");
  }

  const result = await openEncryptedDatabaseFile();
  if (!result?.ok) return result;

  let envelope;
  try {
    envelope = JSON.parse(String(result.text || ""));
  } catch {
    throw new Error("Wybrany plik nie jest poprawnym plikiem JSON.");
  }

  if (!isEncryptedDatabasePayload(envelope)) {
    throw new Error("Wybrany plik nie wygląda jak zaszyfrowana baza Kanbana.");
  }

  const payload = await decryptKanbanDatabase(envelope, nextPassword);
  activeFileDatabaseSession = {
    handle: result.handle,
    fileName: result.fileName || "kanban-baza.kanban.json",
    password: nextPassword,
    openedAt: new Date().toISOString(),
    lastSavedAt: "",
  };
  setLiveBoardSnapshot(payload);

  return {
    ok: true,
    method: "file-system-access",
    fileName: activeFileDatabaseSession.fileName,
    payload,
    session: getActiveFileDatabaseSummary(),
  };
}

export async function saveActiveEncryptedDatabaseSession(data) {
  if (!hasActiveFileDatabaseSession()) {
    return { ok: false, reason: "no-active-session" };
  }

  const envelope = await encryptKanbanDatabase(data, activeFileDatabaseSession.password);
  const text = JSON.stringify(envelope, null, 2);
  await writeEncryptedTextToHandle(activeFileDatabaseSession.handle, text);

  activeFileDatabaseSession = {
    ...activeFileDatabaseSession,
    lastSavedAt: new Date().toISOString(),
  };
  setLiveBoardSnapshot(data);

  return {
    ok: true,
    method: "active-file-session",
    fileName: activeFileDatabaseSession.fileName,
    lastSavedAt: activeFileDatabaseSession.lastSavedAt,
  };
}
