import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, HardDrive, ShieldCheck } from "lucide-react";

import { SecurityDatabaseModal } from "./security-database.jsx";
import {
  LEGACY_KEYS,
  STORAGE_KEY,
  backupFileName,
  buildBackupPayload,
  cx,
  defaultBoardState,
  normalizeImportedState,
  safeStorageGetItem,
  theme,
} from "../shared.jsx";
import {
  installBrowserPersistenceGuard,
  isBrowserPersistenceDisabled,
} from "../security/browserStoragePolicy.js";
import { getActiveFileDatabaseSummary } from "../security/fileDatabaseStorage.js";

const STATUS_TOAST_TIMEOUT_MS = 4200;

function readStoredBoardState() {
  const keys = [STORAGE_KEY, ...LEGACY_KEYS];

  for (const key of keys) {
    const raw = safeStorageGetItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      return normalizeImportedState(parsed, defaultBoardState);
    } catch {
      // Ignore damaged legacy entries and continue looking for a usable copy.
    }
  }

  return defaultBoardState;
}

function buildCurrentBackupText() {
  const boardState = readStoredBoardState();
  return JSON.stringify(buildBackupPayload(boardState), null, 2);
}

function getCurrentThemeMode() {
  if (typeof document !== "undefined") {
    const liveTheme = document.querySelector("[data-kanban-board]")?.getAttribute("data-theme");
    if (liveTheme === "dark" || liveTheme === "light") return liveTheme;
  }

  return readStoredBoardState().darkMode ? "dark" : "light";
}

function buildPanelTheme(mode) {
  const baseTheme = theme[mode] || theme.dark;
  const isDark = mode === "dark";

  return {
    ...baseTheme,
    modal: cx(baseTheme.modal, isDark ? "text-slate-100" : "text-slate-900"),
  };
}

function formatStatusTime(value) {
  if (!value) return "czeka na zapis";

  try {
    return new Date(value).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function buildDatabaseStatus(extra = {}) {
  return {
    session: getActiveFileDatabaseSummary(),
    browserPersistenceDisabled: isBrowserPersistenceDisabled(),
    lastError: extra.lastError || "",
  };
}

function getStatusCopy(status) {
  if (status.lastError) {
    return {
      tone: "error",
      icon: AlertTriangle,
      title: "Błąd zapisu bazy",
      detail: status.lastError,
    };
  }

  if (status.session?.active) {
    return {
      tone: "success",
      icon: CheckCircle2,
      title: `Plik aktywny: ${status.session.fileName || "baza Kanbana"}`,
      detail: status.session.lastSavedAt
        ? `Ostatni zapis: ${formatStatusTime(status.session.lastSavedAt)}`
        : "Sesja odblokowana, pierwszy zapis nastąpi po zmianie danych.",
    };
  }

  if (status.browserPersistenceDisabled) {
    return {
      tone: "warning",
      icon: ShieldCheck,
      title: "Zapis do przeglądarki zatrzymany",
      detail: "Otwórz zaszyfrowany plik bazy, żeby zapisywać dalsze zmiany.",
    };
  }

  return {
    tone: "neutral",
    icon: HardDrive,
    title: "Tryb przeglądarkowy",
    detail: "Dane mogą nadal zapisywać się lokalnie w przeglądarce.",
  };
}

export function SecurityDatabaseLauncher() {
  const [open, setOpen] = useState(false);
  const [backupText, setBackupText] = useState(() => buildCurrentBackupText());
  const [fileName, setFileName] = useState(() => backupFileName());
  const [themeMode, setThemeMode] = useState(() => getCurrentThemeMode());
  const [databaseStatus, setDatabaseStatus] = useState(() => buildDatabaseStatus());
  const [statusVisible, setStatusVisible] = useState(false);

  const t = useMemo(() => buildPanelTheme(themeMode), [themeMode]);
  const launcherButtonTheme = themeMode === "dark"
    ? "border-violet-300/40 bg-slate-950/85 text-white hover:bg-slate-900"
    : "border-violet-200 bg-white/90 text-slate-800 shadow-violet-200/40 hover:bg-violet-50";
  const statusCopy = getStatusCopy(databaseStatus);
  const StatusIcon = statusCopy.icon;
  const statusTheme = themeMode === "dark"
    ? {
        neutral: "border-slate-700/80 bg-slate-950/90 text-slate-100",
        success: "border-emerald-400/40 bg-emerald-950/90 text-emerald-50",
        warning: "border-amber-300/40 bg-amber-950/90 text-amber-50",
        error: "border-rose-300/40 bg-rose-950/90 text-rose-50",
      }
    : {
        neutral: "border-slate-200 bg-white/95 text-slate-800 shadow-slate-200/50",
        success: "border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-100/60",
        warning: "border-amber-200 bg-amber-50/95 text-amber-950 shadow-amber-100/60",
        error: "border-rose-200 bg-rose-50/95 text-rose-950 shadow-rose-100/60",
      };

  function refreshLauncherState(extra = {}) {
    setThemeMode(getCurrentThemeMode());
    setBackupText(buildCurrentBackupText());
    setFileName(backupFileName());
    setDatabaseStatus(buildDatabaseStatus(extra));
  }

  useEffect(() => {
    if (!statusVisible) return undefined;

    const timer = window.setTimeout(() => {
      setStatusVisible(false);
    }, STATUS_TOAST_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [statusVisible, databaseStatus]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function refreshFromEvent(event) {
      if (event?.type === "kanban-file-database-save-error") {
        setDatabaseStatus(buildDatabaseStatus({ lastError: event.detail?.message || "Nie udało się zapisać zmian do pliku." }));
        setStatusVisible(true);
        return;
      }

      setThemeMode(getCurrentThemeMode());
      setDatabaseStatus(buildDatabaseStatus({ lastError: "" }));

      if (event?.type !== "kanban-file-database-saved") {
        setStatusVisible(true);
      }
    }

    const events = [
      "kanban-file-database-opened",
      "kanban-file-database-applied",
      "kanban-file-database-saved",
      "kanban-file-database-save-error",
      "kanban-browser-persistence-changed",
      "kanban-imported",
    ];

    events.forEach((eventName) => window.addEventListener(eventName, refreshFromEvent));
    return () => events.forEach((eventName) => window.removeEventListener(eventName, refreshFromEvent));
  }, []);

  useEffect(() => {
    if (typeof MutationObserver === "undefined" || typeof document === "undefined") return undefined;

    const observer = new MutationObserver(() => {
      setThemeMode(getCurrentThemeMode());
    });

    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    setThemeMode(getCurrentThemeMode());
    return () => observer.disconnect();
  }, []);

  function openSecurityPanel() {
    installBrowserPersistenceGuard(STORAGE_KEY, LEGACY_KEYS);
    refreshLauncherState({ lastError: databaseStatus.lastError });
    setStatusVisible(false);
    setOpen(true);
  }

  return (
    <>
      {statusVisible && !open && (
        <button
          type="button"
          onClick={openSecurityPanel}
          className={cx(
            "fixed bottom-20 right-4 z-50 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border px-4 py-3 text-left text-xs shadow-2xl backdrop-blur-2xl transition hover:-translate-y-0.5",
            statusTheme[statusCopy.tone] || statusTheme.neutral
          )}
          title="Status bazy danych Kanbana"
        >
          <div className="flex items-start gap-3">
            <StatusIcon size={17} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="truncate font-black">{statusCopy.title}</div>
              <div className="mt-0.5 line-clamp-2 text-[11px] font-semibold opacity-80">{statusCopy.detail}</div>
            </div>
          </div>
        </button>
      )}

      <button
        type="button"
        onClick={openSecurityPanel}
        className={cx(
          "fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black shadow-2xl backdrop-blur-2xl transition hover:-translate-y-0.5",
          launcherButtonTheme
        )}
        title={`${statusCopy.title}. Kliknij, aby otworzyć bazę danych i szyfrowanie.`}
      >
        <ShieldCheck size={16} />
        <span>Baza</span>
      </button>

      <SecurityDatabaseModal
        t={t}
        open={open}
        backupText={backupText}
        fileName={fileName}
        onClose={() => {
          setOpen(false);
          refreshLauncherState({ lastError: databaseStatus.lastError });
        }}
      />
    </>
  );
}
