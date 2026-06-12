import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Database, Download, HardDrive, ShieldCheck, Trash2, X } from "lucide-react";

import {
  LEGACY_KEYS,
  STORAGE_KEY,
  cx,
  downloadTextFile,
  parseBackupText,
} from "../shared.jsx";
import { encryptKanbanDatabase } from "../security/encryptedDatabase.js";
import {
  clearKanbanBrowserStorage,
  disableBrowserPersistenceForSession,
  hasKanbanBrowserStorage,
  isBrowserPersistenceDisabled,
} from "../security/browserStoragePolicy.js";
import {
  getActiveFileDatabaseSummary,
  isFileSystemAccessSupported,
  openEncryptedDatabaseSession,
  saveEncryptedDatabaseFile,
} from "../security/fileDatabaseStorage.js";

function encryptedDatabaseFileName(fileName = "kanban-baza.json") {
  return String(fileName).replace(/\.json$/i, "-zaszyfrowana.kanban.json");
}

function formatSessionTime(value) {
  if (!value) return "brak";
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

function StatusPill({ t, active, label, value, title }) {
  return (
    <span
      className={cx(
        "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black",
        active ? t.successButton : t.buttonSoft
      )}
      title={title}
    >
      <span className={cx("h-2 w-2 rounded-full", active ? "bg-emerald-400" : "bg-slate-400")} />
      <span>{label}</span>
      {value && <span className={cx("max-w-[14rem] truncate font-semibold", active ? "" : t.textMuted)}>{value}</span>}
    </span>
  );
}

function ActionCard({ t, icon, title, children, titleHint }) {
  return (
    <section className={cx("flex min-h-[18rem] flex-col rounded-[1.35rem] border p-4 sm:p-5", t.cardSolid)} title={titleHint}>
      <div className="mb-4 flex items-center gap-3">
        <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
          {icon}
        </span>
        <h3 className="text-sm font-black">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function SecurityDatabaseModal({ t, open, backupText, fileName, onClose }) {
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [openPassword, setOpenPassword] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storageCopyDetected, setStorageCopyDetected] = useState(false);
  const [browserPersistenceDisabled, setBrowserPersistenceDisabled] = useState(false);
  const [fileSystemSupported, setFileSystemSupported] = useState(false);
  const [lastFileSaveName, setLastFileSaveName] = useState("");
  const [fileSession, setFileSession] = useState(() => getActiveFileDatabaseSummary());

  const quietButtonClass = cx(
    "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40",
    t.buttonSoft
  );
  const inputClass = cx(
    "rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4",
    t.inputSolid
  );

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setPasswordRepeat("");
    setOpenPassword("");
    setEncryptedText("");
    setNotice("");
    setBusy(false);
    setCopied(false);
    setLastFileSaveName("");
    setStorageCopyDetected(hasKanbanBrowserStorage(STORAGE_KEY, LEGACY_KEYS));
    setBrowserPersistenceDisabled(isBrowserPersistenceDisabled());
    setFileSystemSupported(isFileSystemAccessSupported());
    setFileSession(getActiveFileDatabaseSummary());
  }, [open, backupText]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return undefined;

    function refreshSession(event) {
      const summary = getActiveFileDatabaseSummary();
      setFileSession(summary);

      if (event?.type === "kanban-file-database-save-error") {
        setNotice(event.detail?.message || "Nie udało się automatycznie zapisać zmian do pliku.");
      }
    }

    window.addEventListener("kanban-file-database-saved", refreshSession);
    window.addEventListener("kanban-file-database-save-error", refreshSession);
    window.addEventListener("kanban-file-database-applied", refreshSession);

    return () => {
      window.removeEventListener("kanban-file-database-saved", refreshSession);
      window.removeEventListener("kanban-file-database-save-error", refreshSession);
      window.removeEventListener("kanban-file-database-applied", refreshSession);
    };
  }, [open]);

  function validatePassword() {
    const nextPassword = password.trim();
    if (!nextPassword) {
      setNotice("Podaj hasło do zaszyfrowania bazy.");
      return "";
    }
    if (nextPassword.length < 8) {
      setNotice("Hasło powinno mieć minimum 8 znaków.");
      return "";
    }
    if (nextPassword !== passwordRepeat.trim()) {
      setNotice("Hasła nie są takie same.");
      return "";
    }
    return nextPassword;
  }

  async function buildEncryptedDatabase() {
    const nextPassword = validatePassword();
    if (!nextPassword) return "";

    setBusy(true);
    setNotice("Szyfruję bazę...");

    try {
      const payload = parseBackupText(backupText);
      const encryptedPayload = await encryptKanbanDatabase(payload, nextPassword);
      const nextEncryptedText = JSON.stringify(encryptedPayload, null, 2);
      setEncryptedText(nextEncryptedText);
      setNotice("Baza zaszyfrowana.");
      return nextEncryptedText;
    } catch (error) {
      setNotice(error.message || "Nie udało się zaszyfrować aktualnej bazy.");
      return "";
    } finally {
      setBusy(false);
    }
  }

  async function downloadEncryptedDatabase() {
    const text = encryptedText || (await buildEncryptedDatabase());
    if (!text) return;

    const result = await downloadTextFile(encryptedDatabaseFileName(fileName), text);
    if (result?.reason === "cancelled") {
      setNotice("Zapisywanie anulowane.");
      return;
    }
    if (result?.ok) {
      setNotice("Pobrano zaszyfrowany plik.");
      return;
    }
    setNotice("Przeglądarka zablokowała pobranie.");
  }

  async function saveEncryptedDatabaseToSelectedFile() {
    if (!fileSystemSupported) {
      setNotice("Tryb plikowy wymaga Chrome albo Edge.");
      return;
    }

    const text = encryptedText || (await buildEncryptedDatabase());
    if (!text) return;

    setBusy(true);
    try {
      const result = await saveEncryptedDatabaseFile({
        suggestedName: encryptedDatabaseFileName(fileName),
        text,
      });

      if (result?.reason === "cancelled") {
        setNotice("Wybór pliku anulowany.");
        return;
      }

      if (result?.reason === "unsupported") {
        setNotice("Ta przeglądarka nie obsługuje trybu plikowego.");
        return;
      }

      if (result?.ok) {
        setLastFileSaveName(result.fileName || "wybrany plik");
        setNotice("Zapisano zaszyfrowany plik.");
        return;
      }

      setNotice("Nie udało się zapisać pliku.");
    } catch (error) {
      setNotice(error.message || "Nie udało się zapisać pliku.");
    } finally {
      setBusy(false);
    }
  }

  async function openEncryptedFileSession() {
    if (!fileSystemSupported) {
      setNotice("Tryb plikowy wymaga Chrome albo Edge.");
      return;
    }

    const nextPassword = openPassword.trim();
    if (!nextPassword) {
      setNotice("Podaj hasło do bazy.");
      return;
    }

    setBusy(true);
    setNotice("Wybierz plik bazy.");

    try {
      const result = await openEncryptedDatabaseSession({ password: nextPassword });

      if (result?.reason === "cancelled") {
        setNotice("Otwieranie anulowane.");
        return;
      }

      if (result?.reason === "unsupported") {
        setNotice("Ta przeglądarka nie obsługuje trybu plikowego.");
        return;
      }

      if (!result?.ok) {
        setNotice("Nie udało się otworzyć bazy.");
        return;
      }

      disableBrowserPersistenceForSession(STORAGE_KEY, LEGACY_KEYS);
      setBrowserPersistenceDisabled(isBrowserPersistenceDisabled());
      setFileSession(getActiveFileDatabaseSummary());
      setOpenPassword("");
      window.dispatchEvent(
        new CustomEvent("kanban-file-database-opened", {
          detail: {
            fileName: result.fileName,
            payload: result.payload,
          },
        })
      );
      setNotice(`Otworzono: ${result.fileName}.`);
    } catch (error) {
      setNotice(error.message || "Nie udało się otworzyć bazy.");
    } finally {
      setBusy(false);
      setStorageCopyDetected(hasKanbanBrowserStorage(STORAGE_KEY, LEGACY_KEYS));
      setFileSession(getActiveFileDatabaseSummary());
    }
  }

  async function copyEncryptedDatabase() {
    const text = encryptedText || (await buildEncryptedDatabase());
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setNotice("Skopiowano zaszyfrowaną treść.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice("Nie udało się skopiować automatycznie.");
    }
  }

  function clearBrowserCopy() {
    const confirmed = window.confirm(
      "Usunąć starą kopię z pamięci przeglądarki i zatrzymać zapis do localStorage w tej sesji?"
    );
    if (!confirmed) return;

    const result = clearKanbanBrowserStorage(STORAGE_KEY, LEGACY_KEYS);
    setStorageCopyDetected(hasKanbanBrowserStorage(STORAGE_KEY, LEGACY_KEYS));
    setBrowserPersistenceDisabled(isBrowserPersistenceDisabled());

    if (result.failedKeys.length) {
      setNotice(`Nie wszystko udało się usunąć: ${result.failedKeys.join(", ")}`);
      return;
    }

    if (result.removedKeys.length) {
      setNotice(`Usunięto starą kopię (${result.removedKeys.length}).`);
      return;
    }

    setNotice("Brak starej kopii w localStorage.");
  }

  const activeFileLabel = fileSession.active ? fileSession.fileName : "brak";
  const lastSaveLabel = fileSession.active ? formatSessionTime(fileSession.lastSavedAt) : "—";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className={cx("max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)}
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
                  <ShieldCheck size={19} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-xl font-black tracking-tight">Baza Kanbana</h2>
                  <p className={cx("mt-0.5 text-xs font-semibold", t.textSoft)}>Plik, szyfrowanie, migracja.</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}>
                <X />
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <StatusPill
                t={t}
                active={fileSession.active}
                label="Plik"
                value={activeFileLabel}
                title={`Aktywna baza: ${activeFileLabel}. Ostatni zapis: ${lastSaveLabel}`}
              />
              <StatusPill
                t={t}
                active={browserPersistenceDisabled}
                label="localStorage"
                value={browserPersistenceDisabled ? "zatrzymany" : "aktywny"}
                title="Zapis do przeglądarki. Docelowo przy pracy na pliku powinien być zatrzymany."
              />
              <StatusPill
                t={t}
                active={fileSystemSupported}
                label="Chrome"
                value={fileSystemSupported ? "OK" : "brak trybu pliku"}
                title="Obsługa File System Access API."
              />
              <StatusPill
                t={t}
                active={!storageCopyDetected}
                label="Kopia"
                value={storageCopyDetected ? "jest" : "brak"}
                title="Stara kopia danych w localStorage."
              />
            </div>

            {notice && (
              <div className={cx("mb-4 rounded-2xl px-4 py-3 text-xs font-bold leading-5", t.subtle)}>
                {notice}
              </div>
            )}

            <div className="grid gap-4 xl:grid-cols-3">
              <ActionCard
                t={t}
                icon={<HardDrive size={17} />}
                title="Otwórz plik"
                titleHint="Otwórz istniejącą zaszyfrowaną bazę roboczą."
              >
                <label className="grid gap-1.5 text-xs font-black">
                  Hasło
                  <input
                    type="password"
                    value={openPassword}
                    onChange={(event) => setOpenPassword(event.target.value)}
                    className={inputClass}
                    placeholder="Hasło bazy"
                  />
                </label>
                <button
                  type="button"
                  onClick={openEncryptedFileSession}
                  disabled={busy || !fileSystemSupported}
                  className={cx("mt-auto w-full", quietButtonClass)}
                >
                  <HardDrive size={15} /> {busy ? "Otwieram..." : "Otwórz"}
                </button>
              </ActionCard>

              <ActionCard
                t={t}
                icon={<ShieldCheck size={17} />}
                title="Zapisz szyfrowany"
                titleHint="Utwórz zaszyfrowany plik z aktualnego stanu tablicy."
              >
                <div className="grid gap-3">
                  <label className="grid gap-1.5 text-xs font-black">
                    Hasło
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setEncryptedText("");
                        setLastFileSaveName("");
                      }}
                      className={inputClass}
                      placeholder="Minimum 8 znaków"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-black">
                    Powtórz
                    <input
                      type="password"
                      value={passwordRepeat}
                      onChange={(event) => {
                        setPasswordRepeat(event.target.value);
                        setEncryptedText("");
                        setLastFileSaveName("");
                      }}
                      className={inputClass}
                      placeholder="To samo hasło"
                    />
                  </label>
                </div>

                <div className="mt-auto grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                  <button
                    type="button"
                    onClick={saveEncryptedDatabaseToSelectedFile}
                    disabled={busy || !fileSystemSupported}
                    className={quietButtonClass}
                  >
                    <HardDrive size={15} /> Plik
                  </button>
                  <button
                    type="button"
                    onClick={downloadEncryptedDatabase}
                    disabled={busy}
                    className={quietButtonClass}
                  >
                    <Download size={15} /> Pobierz
                  </button>
                  <button
                    type="button"
                    onClick={copyEncryptedDatabase}
                    disabled={busy}
                    className={quietButtonClass}
                  >
                    {copied ? <CheckCircle2 size={15} /> : <ShieldCheck size={15} />} {copied ? "OK" : "Kopiuj"}
                  </button>
                </div>

                {lastFileSaveName && (
                  <p className={cx("mt-3 truncate rounded-2xl px-3 py-2 text-xs font-semibold", t.subtle)} title={lastFileSaveName}>
                    Zapisano: {lastFileSaveName}
                  </p>
                )}

                {encryptedText && (
                  <textarea
                    value={encryptedText}
                    readOnly
                    spellCheck={false}
                    className={cx("mt-3 h-28 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none", t.inputSolid)}
                    onFocus={(event) => event.target.select()}
                  />
                )}
              </ActionCard>

              <ActionCard
                t={t}
                icon={<Trash2 size={17} />}
                title="Przeglądarka"
                titleHint="Usuń starą kopię localStorage po zapisaniu zaszyfrowanego pliku."
              >
                <div className={cx("mb-3 rounded-2xl px-3 py-2 text-xs font-semibold", t.subtle)}>
                  {storageCopyDetected ? "Wykryto starą kopię." : "Brak starej kopii."}
                </div>
                <button
                  type="button"
                  onClick={clearBrowserCopy}
                  className={cx("mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.dangerButton)}
                >
                  <Trash2 size={15} /> Usuń kopię
                </button>
              </ActionCard>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
