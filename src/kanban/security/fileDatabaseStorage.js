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

    const writable = await handle.createWritable();
    await writable.write(new Blob([text], { type: "application/json;charset=utf-8" }));
    await writable.close();

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
