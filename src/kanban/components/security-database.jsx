import React, { useEffect, useMemo, useState } from "react";
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
    return new Date(value).toLocaleString("pl-PL");
  } catch {
    return value;
  }
}

function SectionIntro({ t, icon, title, children }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className={cx("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-black">{title}</h3>
        {children && <p className={cx("mt-1 text-xs font-semibold leading-5", t.textSoft)}>{children}</p>}
      </div>
    </div>
  );
}

function StatusLine({ t, label, value, strong = false }) {
  return (
    <div className={cx("grid gap-1 py-2.5 text-xs sm:grid-cols-[12rem_1fr] sm:gap-4", t.divider)}>
      <dt className={cx("font-black", t.textSoft)}>{label}</dt>
      <dd className={cx("font-semibold leading-5", strong ? "" : t.textMuted)}>{value}</dd>
    </div>
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

  const storageSummary = useMemo(() => {
    const keys = [STORAGE_KEY, ...LEGACY_KEYS];
    return {
      keys,
      currentKey: STORAGE_KEY,
      legacyCount: LEGACY_KEYS.length,
    };
  }, []);

  const panelClass = cx("rounded-[1.5rem] border p-4 sm:p-5", t.cardSolid);
  const subtleInfoClass = cx("rounded-2xl px-3 py-2 text-xs font-semibold leading-5", t.subtle);
  const quietButtonClass = cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonSoft);

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

      if (event?.type === "kanban-file-database-saved") {
        setNotice(`Zapisano zmiany do pliku: ${summary.fileName || "wybrany plik"}.`);
      }

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
      setNotice("Hasło powinno mieć minimum 8 znaków. Sejf z hasłem 1234 robi smutne piiip.");
      return "";
    }
    if (nextPassword !== passwordRepeat.trim()) {
      setNotice("Hasła nie są takie same. Popraw drugie pole przed szyfrowaniem.");
      return "";
    }
    return nextPassword;
  }

  async function buildEncryptedDatabase() {
    const nextPassword = validatePassword();
    if (!nextPassword) return "";

    setBusy(true);
    setNotice("Szyfruję aktualną bazę. Po pobraniu pliku sprawdź go importem testowym, zanim usuniesz starą kopię z przeglądarki.");

    try {
      const payload = parseBackupText(backupText);
      const encryptedPayload = await encryptKanbanDatabase(payload, nextPassword);
      const nextEncryptedText = JSON.stringify(encryptedPayload, null, 2);
      setEncryptedText(nextEncryptedText);
      setNotice("Baza została zaszyfrowana. Pobierz plik albo zapisz go jako plik roboczy, a potem wykonaj test importu.");
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
      setNotice("Zapisywanie zaszyfrowanej bazy zostało anulowane.");
      return;
    }
    if (result?.ok) {
      setNotice("Zaszyfrowana baza została przekazana do pobrania/zapisu. Teraz zrób test importu tym samym hasłem.");
      return;
    }
    setNotice("Przeglądarka zablokowała pobranie. Użyj kopiowania zaszyfrowanej treści.");
  }

  async function saveEncryptedDatabaseToSelectedFile() {
    if (!fileSystemSupported) {
      setNotice("Ta przeglądarka nie wspiera zapisu do wybranego pliku. Użyj Chrome albo Edge, albo zwykłego pobrania pliku.");
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
        setNotice("Wybór pliku został anulowany. Dane nie zostały zapisane do pliku roboczego.");
        return;
      }

      if (result?.reason === "unsupported") {
        setNotice("Ta przeglądarka nie obsługuje File System Access API. Użyj zwykłego pobrania albo Chrome/Edge.");
        return;
      }

      if (result?.ok) {
        setLastFileSaveName(result.fileName || "wybrany plik");
        setNotice(`Zapisano zaszyfrowaną bazę do wybranego pliku: ${result.fileName || "wybrany plik"}. Możesz teraz otworzyć ją jako sesję plikową.`);
        return;
      }

      setNotice("Nie udało się zapisać zaszyfrowanej bazy do wybranego pliku.");
    } catch (error) {
      setNotice(error.message || "Nie udało się zapisać zaszyfrowanej bazy do wybranego pliku.");
    } finally {
      setBusy(false);
    }
  }

  async function openEncryptedFileSession() {
    if (!fileSystemSupported) {
      setNotice("Ta przeglądarka nie wspiera otwierania bazy z wybranego pliku. Użyj Chrome albo Edge.");
      return;
    }

    const nextPassword = openPassword.trim();
    if (!nextPassword) {
      setNotice("Najpierw wpisz hasło do zaszyfrowanej bazy, potem wybierz plik.");
      return;
    }

    setBusy(true);
    setNotice("Wybierz zaszyfrowany plik bazy. Po poprawnym haśle aplikacja przełączy się na sesję plikową.");

    try {
      const result = await openEncryptedDatabaseSession({ password: nextPassword });

      if (result?.reason === "cancelled") {
        setNotice("Otwieranie zaszyfrowanej bazy zostało anulowane.");
        return;
      }

      if (result?.reason === "unsupported") {
        setNotice("Ta przeglądarka nie obsługuje File System Access API. Użyj Chrome albo Edge.");
        return;
      }

      if (!result?.ok) {
        setNotice("Nie udało się otworzyć zaszyfrowanej bazy.");
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
      setNotice(`Odblokowano plik: ${result.fileName}. Zmiany będą zapisywane do tego samego zaszyfrowanego pliku.`);
    } catch (error) {
      setNotice(error.message || "Nie udało się otworzyć zaszyfrowanej bazy.");
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
      setNotice("Skopiowano zaszyfrowaną treść. Wklej ją do Notatnika i zapisz jako plik .kanban.json.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice("Nie udało się skopiować automatycznie. Zaszyfrowana treść jest widoczna poniżej — zaznacz ją ręcznie.");
    }
  }

  function clearBrowserCopy() {
    const confirmed = window.confirm(
      "Najpierw upewnij się, że masz pobraną albo zapisaną zaszyfrowaną bazę i że import testowy działa. Usunąć starą kopię z pamięci przeglądarki i zatrzymać zapis do localStorage w tej sesji?"
    );
    if (!confirmed) return;

    const result = clearKanbanBrowserStorage(STORAGE_KEY, LEGACY_KEYS);
    setStorageCopyDetected(hasKanbanBrowserStorage(STORAGE_KEY, LEGACY_KEYS));
    setBrowserPersistenceDisabled(isBrowserPersistenceDisabled());

    if (result.failedKeys.length) {
      setNotice(`Nie wszystko udało się usunąć. Problem z kluczami: ${result.failedKeys.join(", ")}`);
      return;
    }

    if (result.removedKeys.length) {
      setNotice(`Usunięto starą kopię z przeglądarki (${result.removedKeys.length} kluczy). Zapis do localStorage jest zatrzymany w tej sesji.`);
      return;
    }

    setNotice("Nie znaleziono starej kopii w localStorage. Zapis do localStorage jest zatrzymany w tej sesji.");
  }

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
            className={cx("max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)}
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className={cx("mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ring-1", t.chip)}>
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Baza Kanbana</h2>
                <p className={cx("mt-1 max-w-2xl text-sm leading-6", t.textMuted)}>
                  Zarządzanie zaszyfrowanym plikiem roboczym i migracją starego zapisu z przeglądarki.
                </p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}>
                <X />
              </button>
            </div>

            {notice && (
              <div className={cx("mb-4 rounded-2xl px-4 py-3 text-xs font-bold leading-5", t.subtle)}>
                {notice}
              </div>
            )}

            <section className={cx("mb-4", panelClass)}>
              <SectionIntro t={t} icon={<Database size={17} />} title="Status">
                Krótki podgląd tego, gdzie aktualnie znajduje się baza i czy przeglądarka nadal przechowuje kopię.
              </SectionIntro>

              <dl className={cx("divide-y", t.divider)}>
                <StatusLine
                  t={t}
                  label="Kopia w przeglądarce"
                  value={storageCopyDetected ? "Wykryto dane w znanych kluczach localStorage." : "Nie wykryto danych w znanych kluczach localStorage."}
                />
                <StatusLine
                  t={t}
                  label="Zapis do localStorage"
                  value={browserPersistenceDisabled ? "Zatrzymany w tej sesji." : "Aktywny tylko, gdy nie ma sesji plikowej."}
                />
                <StatusLine
                  t={t}
                  label="Tryb plikowy"
                  value={fileSystemSupported ? "Dostępny w tej przeglądarce." : "Niedostępny — użyj Chrome/Edge albo pobrania pliku."}
                />
                <StatusLine
                  t={t}
                  label="Aktywna baza"
                  value={fileSession.active ? `${fileSession.fileName} · ostatni zapis: ${formatSessionTime(fileSession.lastSavedAt)}` : "Brak otwartej sesji plikowej."}
                  strong={fileSession.active}
                />
              </dl>
            </section>

            <section className={cx("mb-4", panelClass)}>
              <SectionIntro t={t} icon={<HardDrive size={17} />} title="Otwórz zaszyfrowany plik">
                Użyj, gdy chcesz przełączyć tablicę na inny plik roboczy albo ponownie otworzyć bazę po zablokowaniu.
              </SectionIntro>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="grid gap-1.5 text-xs font-black">
                  Hasło do bazy
                  <input
                    type="password"
                    value={openPassword}
                    onChange={(event) => setOpenPassword(event.target.value)}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                    placeholder="Hasło pliku roboczego"
                  />
                </label>
                <button
                  type="button"
                  onClick={openEncryptedFileSession}
                  disabled={busy || !fileSystemSupported}
                  className={quietButtonClass}
                >
                  <HardDrive size={15} /> {busy ? "Otwieram..." : "Otwórz plik"}
                </button>
              </div>

              <p className={cx("mt-3 text-xs font-semibold leading-5", t.textSoft)}>
                Hasło zostaje tylko w pamięci strony. Po otwarciu pliku zapis do localStorage zostaje zatrzymany w tej sesji.
              </p>
            </section>

            <section className={cx("mb-4", panelClass)}>
              <SectionIntro t={t} icon={<ShieldCheck size={17} />} title="Zaszyfruj aktualny stan">
                Przydatne przy migracji starej bazy albo gdy chcesz utworzyć dodatkowy zaszyfrowany plik.
              </SectionIntro>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-black">
                  Hasło do bazy
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setEncryptedText("");
                      setLastFileSaveName("");
                    }}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                    placeholder="Minimum 8 znaków"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-black">
                  Powtórz hasło
                  <input
                    type="password"
                    value={passwordRepeat}
                    onChange={(event) => {
                      setPasswordRepeat(event.target.value);
                      setEncryptedText("");
                      setLastFileSaveName("");
                    }}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                    placeholder="To samo hasło"
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveEncryptedDatabaseToSelectedFile}
                  disabled={busy || !fileSystemSupported}
                  className={quietButtonClass}
                >
                  <HardDrive size={15} /> {busy ? "Szyfruję..." : "Zapisz do pliku"}
                </button>
                <button
                  type="button"
                  onClick={downloadEncryptedDatabase}
                  disabled={busy}
                  className={quietButtonClass}
                >
                  <Download size={15} /> Pobierz plik
                </button>
                <button
                  type="button"
                  onClick={copyEncryptedDatabase}
                  disabled={busy}
                  className={quietButtonClass}
                >
                  {copied ? <CheckCircle2 size={15} /> : <ShieldCheck size={15} />} {copied ? "Skopiowano" : "Kopiuj treść"}
                </button>
              </div>

              {lastFileSaveName && (
                <p className={cx("mt-3", subtleInfoClass)}>
                  Plik roboczy zapisany: {lastFileSaveName}
                </p>
              )}

              {encryptedText && (
                <textarea
                  value={encryptedText}
                  readOnly
                  spellCheck={false}
                  className={cx("mt-3 h-40 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none", t.inputSolid)}
                  onFocus={(event) => event.target.select()}
                />
              )}
            </section>

            <section className={panelClass}>
              <SectionIntro t={t} icon={<Trash2 size={17} />} title="Stara kopia w przeglądarce">
                Użyj dopiero po zapisaniu zaszyfrowanego pliku i pozytywnym teście otwierania bazy.
              </SectionIntro>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={clearBrowserCopy}
                  className={cx("inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.dangerButton)}
                >
                  <Trash2 size={15} /> Usuń starą kopię
                </button>
                <p className={cx("max-w-xl text-xs font-semibold leading-5", t.textMuted)}>
                  Otwarta sesja plikowa zapisuje zmiany do zaszyfrowanego pliku. localStorage zostaje tylko trybem awaryjnym, gdy nie pracujesz na pliku.
                </p>
              </div>
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
