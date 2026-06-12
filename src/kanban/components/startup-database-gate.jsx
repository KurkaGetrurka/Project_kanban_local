import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Database, HardDrive, Plus, ShieldCheck, Upload, X } from "lucide-react";

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

  const shellTheme = isDark
    ? "border-white/10 bg-slate-950/95 text-slate-100 shadow-black/40"
    : "border-white/70 bg-white/95 text-slate-900 shadow-slate-200/70";
  const panelTheme = isDark
    ? "border-white/10 bg-white/[0.045] text-slate-100"
    : "border-slate-200 bg-white/80 text-slate-900";
  const mutedText = isDark ? "text-slate-300" : "text-slate-600";
  const softText = isDark ? "text-slate-500" : "text-slate-400";
  const inputTheme = isDark
    ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";
  const secondaryButton = isDark
    ? "border-white/10 bg-white/10 text-slate-100 hover:bg-white/15"
    : "border-slate-200 bg-white/85 text-slate-700 hover:bg-white";

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
    <div
      className={cx(
        "fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4 backdrop-blur-2xl",
        isDark ? "bg-slate-950/90" : "bg-slate-100/85"
      )}
    >
      <div className={cx("relative w-full max-w-6xl overflow-hidden rounded-[2rem] border p-5 shadow-2xl sm:p-7", shellTheme)}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/80 to-transparent" />

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className={cx("mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}>
              <ShieldCheck size={14} /> Start bazy Kanbana
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Wybierz bazę do pracy</h1>
            <p className={cx("mt-2 max-w-3xl text-sm font-semibold leading-6", mutedText)}>
              Najbezpieczniejszy tryb to praca na zaszyfrowanym pliku. Hasło nie jest zapisywane w przeglądarce, a zmiany mogą trafiać bezpośrednio do wybranego pliku roboczego.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className={cx("inline-flex items-center gap-2 self-start rounded-2xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5", secondaryButton)}
            title="Przejdź do tablicy bez otwierania bazy"
          >
            <X size={15} /> Pomiń testowo
          </button>
        </div>

        {notice && (
          <div className={cx("mb-5 rounded-3xl border px-4 py-3 text-xs font-bold leading-5", secondaryButton)}>
            {notice}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <section className={cx("rounded-3xl border p-4 shadow-sm", panelTheme)}>
            <div className="mb-4 flex items-start gap-3">
              <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
                <Plus size={20} />
              </span>
              <div>
                <h2 className="text-base font-black">Utwórz nową bazę</h2>
                <p className={cx("mt-1 text-xs font-semibold leading-5", mutedText)}>
                  Dla nowej pracy. Zaczyna od pustej tablicy i od razu tworzy zaszyfrowany plik roboczy.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-1 text-xs font-black">
                Hasło do nowej bazy
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", inputTheme)}
                  placeholder="Minimum 8 znaków"
                />
              </label>
              <label className="grid gap-1 text-xs font-black">
                Powtórz hasło
                <input
                  type="password"
                  value={newPasswordRepeat}
                  onChange={(event) => setNewPasswordRepeat(event.target.value)}
                  className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", inputTheme)}
                  placeholder="To samo hasło"
                />
              </label>
              <button
                type="button"
                onClick={createNewEncryptedDatabase}
                disabled={busy || !fileSystemSupported}
                className={cx("inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}
              >
                <Database size={15} /> {busy ? "Tworzę..." : "Utwórz zaszyfrowany plik"}
              </button>
            </div>
          </section>

          <section className={cx("rounded-3xl border p-4 shadow-sm", panelTheme)}>
            <div className="mb-4 flex items-start gap-3">
              <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
                <HardDrive size={20} />
              </span>
              <div>
                <h2 className="text-base font-black">Otwórz bazę</h2>
                <p className={cx("mt-1 text-xs font-semibold leading-5", mutedText)}>
                  Dla codziennej pracy. Wpisz hasło, wybierz plik i pracuj na tym samym zaszyfrowanym pliku.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-1 text-xs font-black">
                Hasło do bazy
                <input
                  type="password"
                  value={openPassword}
                  onChange={(event) => setOpenPassword(event.target.value)}
                  className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", inputTheme)}
                  placeholder="Hasło pliku roboczego"
                />
              </label>
              <button
                type="button"
                onClick={openExistingEncryptedDatabase}
                disabled={busy || !fileSystemSupported}
                className={cx("inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}
              >
                <HardDrive size={15} /> {busy ? "Otwieram..." : "Otwórz zaszyfrowany plik"}
              </button>
            </div>
          </section>

          <section className={cx("rounded-3xl border p-4 shadow-sm", panelTheme)}>
            <div className="mb-4 flex items-start gap-3">
              <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
                <Upload size={20} />
              </span>
              <div>
                <h2 className="text-base font-black">Importuj kopię</h2>
                <p className={cx("mt-1 text-xs font-semibold leading-5", mutedText)}>
                  Dla starego eksportu JSON. Po imporcie zapisz dane jako nową zaszyfrowaną bazę przez panel „Baza”.
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
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              disabled={busy}
              className={cx("inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", secondaryButton)}
            >
              <Upload size={15} /> Importuj zwykły JSON
            </button>

            <div className={cx("mt-4 rounded-2xl border px-3 py-2 text-xs font-semibold leading-5", secondaryButton)}>
              <CheckCircle2 size={14} className="mb-1 inline-block" /> Ten wariant służy głównie do migracji starych kopii.
            </div>
          </section>
        </div>

        <div className={cx("mt-5 rounded-3xl border px-4 py-3 text-xs font-semibold leading-5", secondaryButton)}>
          {fileSystemSupported
            ? "Chrome wykryty poprawnie: tryb plikowy powinien działać."
            : "Ta przeglądarka nie zgłasza obsługi File System Access API. Dla trybu plikowego użyj Chrome albo Edge."}
          <span className={cx("ml-2", softText)}>
            Mały przycisk „Baza” zostaje dostępny później jako panel narzędziowy.
          </span>
        </div>
      </div>
    </div>
  );
}
