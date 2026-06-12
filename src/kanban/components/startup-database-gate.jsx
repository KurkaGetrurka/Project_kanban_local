import React, { useEffect, useMemo, useRef, useState } from "react";
import { Database, HardDrive, Plus, ShieldCheck, Upload, X } from "lucide-react";

import {
  LEGACY_KEYS,
  STORAGE_KEY,
  buildBackupPayload,
  cx,
  defaultBoardState,
  parseBackupText,
  readTextFile,
  theme,
} from "../shared.jsx";
import {
  disableBrowserPersistenceForSession,
  isBrowserPersistenceDisabled,
} from "../security/browserStoragePolicy.js";
import {
  createEncryptedDatabaseSession,
  isFileSystemAccessSupported,
  openEncryptedDatabaseSession,
} from "../security/fileDatabaseStorage.js";

function createEmptyBoardPayload() {
  return buildBackupPayload({
    ...defaultBoardState,
    tasks: [],
    activeSection: "info",
  });
}

function readLiveThemeMode() {
  if (typeof document !== "undefined") {
    const liveTheme = document.querySelector("[data-kanban-board]")?.getAttribute("data-theme");
    if (liveTheme === "dark" || liveTheme === "light") return liveTheme;
  }

  return defaultBoardState.darkMode ? "dark" : "light";
}

function dispatchStartupPayload({ fileName, payload, source }) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("kanban-file-database-opened", {
      detail: {
        fileName,
        payload,
        source,
      },
    })
  );
}

export function StartupDatabaseGate() {
  const [visible, setVisible] = useState(true);
  const [themeMode, setThemeMode] = useState(() => readLiveThemeMode());
  const [fileSystemSupported, setFileSystemSupported] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [openPassword, setOpenPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const importInputRef = useRef(null);

  const t = useMemo(() => theme[themeMode] || theme.dark, [themeMode]);
  const isDark = themeMode === "dark";

  const pageTheme = isDark
    ? "bg-slate-950/95 text-slate-100"
    : "bg-slate-50/95 text-slate-950";
  const shellTheme = isDark
    ? "border-white/10 bg-slate-950/96 shadow-black/30"
    : "border-slate-200 bg-white shadow-slate-200/70";
  const actionPanelTheme = isDark
    ? "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
    : "border-slate-200 bg-white hover:bg-slate-50/80";
  const mutedText = isDark ? "text-slate-300" : "text-slate-600";
  const softText = isDark ? "text-slate-500" : "text-slate-400";
  const inputTheme = isDark
    ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";
  const secondaryButton = isDark
    ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  const statusPill = fileSystemSupported
    ? isDark
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : "border-emerald-200 bg-emerald-50 text-emerald-800"
    : isDark
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
      : "border-amber-200 bg-amber-50 text-amber-900";
  const iconTile = isDark
    ? "border-white/10 bg-white/5 text-slate-100"
    : "border-slate-200 bg-slate-50 text-slate-700";
  const iconTileActive = fileSystemSupported
    ? isDark
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
      : "border-emerald-200 bg-emerald-50 text-emerald-800"
    : isDark
      ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
      : "border-amber-200 bg-amber-50 text-amber-900";
  const infographicLine = isDark ? "bg-white/10" : "bg-slate-200";

  useEffect(() => {
    setFileSystemSupported(isFileSystemAccessSupported());
    setThemeMode(readLiveThemeMode());
  }, []);

  useEffect(() => {
    if (typeof MutationObserver === "undefined" || typeof document === "undefined") return undefined;

    const observer = new MutationObserver(() => setThemeMode(readLiveThemeMode()));
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  function validateNewPassword() {
    const password = newPassword.trim();
    if (!password) {
      setNotice("Podaj hasło do nowej bazy.");
      return "";
    }
    if (password.length < 8) {
      setNotice("Hasło powinno mieć minimum 8 znaków.");
      return "";
    }
    if (password !== newPasswordRepeat.trim()) {
      setNotice("Hasła do nowej bazy nie są takie same.");
      return "";
    }
    return password;
  }

  async function createNewEncryptedDatabase() {
    if (!fileSystemSupported) {
      setNotice("Tworzenie pliku roboczego wymaga Chrome albo Edge z obsługą File System Access API.");
      return;
    }

    const password = validateNewPassword();
    if (!password) return;

    setBusy(true);
    setNotice("Wybierz miejsce zapisu nowej zaszyfrowanej bazy.");

    try {
      const result = await createEncryptedDatabaseSession({
        data: createEmptyBoardPayload(),
        password,
        suggestedName: "kanban-baza.kanban.json",
      });

      if (result?.reason === "cancelled") {
        setNotice("Tworzenie nowej bazy zostało anulowane.");
        return;
      }

      if (result?.reason === "unsupported") {
        setNotice("Ta przeglądarka nie obsługuje zapisu do wybranego pliku. Użyj Chrome albo Edge.");
        return;
      }

      if (!result?.ok) {
        setNotice("Nie udało się utworzyć nowej zaszyfrowanej bazy.");
        return;
      }

      disableBrowserPersistenceForSession(STORAGE_KEY, LEGACY_KEYS);
      dispatchStartupPayload({
        fileName: result.fileName,
        payload: result.payload,
        source: "startup-new-file",
      });
      window.dispatchEvent(new CustomEvent("kanban-browser-persistence-changed", { detail: { disabled: isBrowserPersistenceDisabled() } }));
      setNotice(`Utworzono i otwarto nową bazę: ${result.fileName}.`);
      setVisible(false);
    } catch (error) {
      setNotice(error?.message || "Nie udało się utworzyć nowej zaszyfrowanej bazy.");
    } finally {
      setBusy(false);
    }
  }

  async function openExistingEncryptedDatabase() {
    if (!fileSystemSupported) {
      setNotice("Otwieranie pliku roboczego wymaga Chrome albo Edge z obsługą File System Access API.");
      return;
    }

    const password = openPassword.trim();
    if (!password) {
      setNotice("Najpierw wpisz hasło do otwieranej bazy.");
      return;
    }

    setBusy(true);
    setNotice("Wybierz zaszyfrowany plik bazy.");

    try {
      const result = await openEncryptedDatabaseSession({ password });

      if (result?.reason === "cancelled") {
        setNotice("Otwieranie bazy zostało anulowane.");
        return;
      }

      if (result?.reason === "unsupported") {
        setNotice("Ta przeglądarka nie obsługuje otwierania wybranego pliku. Użyj Chrome albo Edge.");
        return;
      }

      if (!result?.ok) {
        setNotice("Nie udało się otworzyć zaszyfrowanej bazy.");
        return;
      }

      disableBrowserPersistenceForSession(STORAGE_KEY, LEGACY_KEYS);
      dispatchStartupPayload({
        fileName: result.fileName,
        payload: result.payload,
        source: "startup-open-file",
      });
      window.dispatchEvent(new CustomEvent("kanban-browser-persistence-changed", { detail: { disabled: isBrowserPersistenceDisabled() } }));
      setOpenPassword("");
      setNotice(`Otworzono bazę: ${result.fileName}.`);
      setVisible(false);
    } catch (error) {
      setNotice(error?.message || "Nie udało się otworzyć zaszyfrowanej bazy.");
    } finally {
      setBusy(false);
    }
  }

  async function importLegacyBackupFile(file) {
    if (!file) return;

    setBusy(true);
    setNotice("Importuję kopię JSON. Po wejściu do tablicy zapisz ją jako zaszyfrowaną bazę plikową.");

    try {
      const text = await readTextFile(file);
      const payload = parseBackupText(text);
      dispatchStartupPayload({
        fileName: file.name || "importowana kopia JSON",
        payload,
        source: "startup-legacy-import",
      });
      setVisible(false);
    } catch (error) {
      setNotice(error?.message || "Nie udało się zaimportować pliku JSON.");
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <div className={cx("fixed inset-0 z-[80] overflow-y-auto p-4 sm:p-6", pageTheme)}>
      <div className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center">
        <div className={cx("relative w-full rounded-[1.75rem] border p-5 shadow-2xl sm:p-8", shellTheme)}>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className={cx("absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold transition hover:-translate-y-0.5", secondaryButton)}
            title="Przejdź do tablicy bez otwierania bazy"
          >
            <X size={14} /> Pomiń
          </button>

          <header className="mb-7 flex flex-col items-center gap-4 px-14 text-center">
            <div className="flex items-center justify-center gap-3" aria-hidden="true">
              <span className={cx("flex h-12 w-12 items-center justify-center rounded-3xl border", iconTile)}>
                <Database size={20} />
              </span>
              <span className={cx("h-px w-8", infographicLine)} />
              <span className={cx("flex h-16 w-16 items-center justify-center rounded-[1.4rem] border shadow-sm", iconTileActive)}>
                <ShieldCheck size={26} />
              </span>
              <span className={cx("h-px w-8", infographicLine)} />
              <span className={cx("flex h-12 w-12 items-center justify-center rounded-3xl border", iconTile)}>
                <HardDrive size={20} />
              </span>
            </div>

            <div className="grid gap-2">
              <div className={cx("mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em]", statusPill)}>
                <ShieldCheck size={13} />
                {fileSystemSupported ? "Tryb plikowy dostępny" : "Wymagany Chrome / Edge"}
              </div>
              <p className={cx("mx-auto max-w-xl text-xs font-semibold leading-5", mutedText)}>
                Wybierz zaszyfrowany plik bazy albo utwórz nowy. Hasło zostaje tylko w pamięci strony.
              </p>
            </div>
          </header>

          {notice && (
            <div className={cx("mb-5 rounded-2xl border px-4 py-3 text-xs font-bold leading-5", secondaryButton)}>
              {notice}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <section className={cx("flex min-h-[22rem] flex-col rounded-[1.5rem] border p-5 transition", actionPanelTheme)}>
              <div className="mb-4 flex items-start gap-3">
                <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
                  <HardDrive size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-black">Otwórz bazę</h2>
                  <p className={cx("mt-1 text-xs font-semibold leading-5", mutedText)}>
                    Codzienna praca na istniejącym pliku.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <label className="grid gap-1.5 text-xs font-black">
                  Hasło
                  <input
                    type="password"
                    value={openPassword}
                    onChange={(event) => setOpenPassword(event.target.value)}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", inputTheme)}
                    placeholder="Hasło pliku roboczego"
                  />
                </label>
              </div>

              <p className={cx("mt-3 text-xs font-semibold leading-5", softText)}>
                Po otwarciu pliku aplikacja zatrzyma zapis do localStorage w tej sesji.
              </p>

              <button
                type="button"
                onClick={openExistingEncryptedDatabase}
                disabled={busy || !fileSystemSupported}
                className={cx("mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", secondaryButton)}
              >
                <HardDrive size={15} /> {busy ? "Otwieram..." : "Otwórz plik"}
              </button>
            </section>

            <section className={cx("flex min-h-[22rem] flex-col rounded-[1.5rem] border p-5 transition", actionPanelTheme)}>
              <div className="mb-4 flex items-start gap-3">
                <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
                  <Plus size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-black">Nowa baza</h2>
                  <p className={cx("mt-1 text-xs font-semibold leading-5", mutedText)}>
                    Pusta tablica w nowym zaszyfrowanym pliku.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <label className="grid gap-1.5 text-xs font-black">
                  Hasło
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", inputTheme)}
                    placeholder="Minimum 8 znaków"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-black">
                  Powtórz hasło
                  <input
                    type="password"
                    value={newPasswordRepeat}
                    onChange={(event) => setNewPasswordRepeat(event.target.value)}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", inputTheme)}
                    placeholder="To samo hasło"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={createNewEncryptedDatabase}
                disabled={busy || !fileSystemSupported}
                className={cx("mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", secondaryButton)}
              >
                <Database size={15} /> {busy ? "Tworzę..." : "Utwórz plik"}
              </button>
            </section>

            <section className={cx("flex min-h-[22rem] flex-col rounded-[1.5rem] border p-5 transition", actionPanelTheme)}>
              <div className="mb-4 flex items-start gap-3">
                <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
                  <Upload size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-black">Import JSON</h2>
                  <p className={cx("mt-1 text-xs font-semibold leading-5", mutedText)}>
                    Dla starej kopii. Potem zapisz ją jako zaszyfrowaną bazę.
                  </p>
                </div>
              </div>

              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json,.kanban.json"
                className="hidden"
                onChange={(event) => importLegacyBackupFile(event.target.files?.[0])}
              />

              <p className={cx("text-xs font-semibold leading-5", softText)}>
                Użyj tylko przy migracji ze starej, niezabezpieczonej kopii. Po imporcie wejdź w panel „Baza” i zapisz plik szyfrowany.
              </p>

              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                disabled={busy}
                className={cx("mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", secondaryButton)}
              >
                <Upload size={15} /> Importuj kopię
              </button>
            </section>
          </div>

          <footer className={cx("mt-6 flex flex-col gap-2 border-t pt-4 text-[11px] font-semibold leading-5 sm:flex-row sm:items-center sm:justify-between", isDark ? "border-white/10" : "border-slate-200", softText)}>
            <span>Panel „Baza” zostaje dostępny później w prawym dolnym rogu.</span>
            <span>{fileSystemSupported ? "Chrome: tryb plikowy gotowy." : "Dla trybu plikowego użyj Chrome albo Edge."}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
