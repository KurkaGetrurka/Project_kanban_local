import React, { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";

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
import { installBrowserPersistenceGuard } from "../security/browserStoragePolicy.js";

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

export function SecurityDatabaseLauncher() {
  const [open, setOpen] = useState(false);
  const [backupText, setBackupText] = useState(() => buildCurrentBackupText());
  const [fileName, setFileName] = useState(() => backupFileName());
  const [themeMode, setThemeMode] = useState(() => getCurrentThemeMode());

  const t = useMemo(() => buildPanelTheme(themeMode), [themeMode]);
  const launcherButtonTheme = themeMode === "dark"
    ? "border-violet-300/40 bg-slate-950/85 text-white hover:bg-slate-900"
    : "border-violet-200 bg-white/90 text-slate-800 shadow-violet-200/40 hover:bg-violet-50";

  function openSecurityPanel() {
    installBrowserPersistenceGuard(STORAGE_KEY, LEGACY_KEYS);
    setThemeMode(getCurrentThemeMode());
    setBackupText(buildCurrentBackupText());
    setFileName(backupFileName());
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openSecurityPanel}
        className={cx(
          "fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black shadow-2xl backdrop-blur-2xl transition hover:-translate-y-0.5",
          launcherButtonTheme
        )}
        title="Baza danych i szyfrowanie"
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
          setThemeMode(getCurrentThemeMode());
          setBackupText(buildCurrentBackupText());
        }}
      />
    </>
  );
}
