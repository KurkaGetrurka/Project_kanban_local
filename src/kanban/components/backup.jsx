import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import { cx, downloadTextFile, parseBackupText, readTextFile } from "../shared.jsx";
import {
  decryptKanbanDatabase,
  encryptKanbanDatabase,
  isEncryptedDatabasePayload,
} from "../security/encryptedDatabase.js";

function encryptedBackupFileName(fileName = "kanban-kopia.json") {
  return String(fileName).replace(/\.json$/i, "-zaszyfrowana.kanban.json");
}

export function ExportBackupModal({ t, open, backupText, fileName, onClose, onDownload }) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [encryptedCopied, setEncryptedCopied] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState("");
  const [encryptionNotice, setEncryptionNotice] = useState("");
  const [databasePassword, setDatabasePassword] = useState("");
  const [databasePasswordRepeat, setDatabasePasswordRepeat] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [encrypting, setEncrypting] = useState(false);

  useEffect(() => {
    setDownloadNotice("");
    setEncryptionNotice("");
    setCopied(false);
    setEncryptedCopied(false);
    setDatabasePassword("");
    setDatabasePasswordRepeat("");
    setEncryptedText("");
    setEncrypting(false);
  }, [open, backupText]);

  function selectBackupText() {
    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
    setDownloadNotice("Zaznaczyłam treść eksportu. Użyj Ctrl+C, wklej do Notatnika i zapisz ją ręcznie jako plik .json.");
  }

  function validateEncryptionPassword() {
    const password = databasePassword.trim();
    if (!password) {
      setEncryptionNotice("Podaj hasło do zaszyfrowania bazy.");
      return null;
    }
    if (password.length < 8) {
      setEncryptionNotice("Hasło powinno mieć minimum 8 znaków. To nie sejf z kartonu, dajmy mu trochę mięśni.");
      return null;
    }
    if (password !== databasePasswordRepeat.trim()) {
      setEncryptionNotice("Hasła nie są takie same. Popraw drugie pole, zanim zaszyfrujemy bazę.");
      return null;
    }
    return password;
  }

  async function buildEncryptedBackupText() {
    const password = validateEncryptionPassword();
    if (!password) return "";

    setEncrypting(true);
    setEncryptionNotice("Szyfruję bazę. Przy większych danych może to chwilę pomyśleć — taki mały cyfrowy sejf robi pompki.");

    try {
      const plainPayload = parseBackupText(backupText);
      const encryptedPayload = await encryptKanbanDatabase(plainPayload, password);
      const nextEncryptedText = JSON.stringify(encryptedPayload, null, 2);
      setEncryptedText(nextEncryptedText);
      setEncryptionNotice("Baza została zaszyfrowana. Możesz ją pobrać albo skopiować jako zaszyfrowany plik.");
      return nextEncryptedText;
    } catch (error) {
      setEncryptionNotice(error.message || "Nie udało się zaszyfrować bazy.");
      return "";
    } finally {
      setEncrypting(false);
    }
  }

  async function handleEncryptedDownloadClick() {
    const text = encryptedText || (await buildEncryptedBackupText());
    if (!text) return;

    const result = await downloadTextFile(encryptedBackupFileName(fileName), text);
    if (result?.reason === "cancelled") {
      setEncryptionNotice("Zapisywanie zaszyfrowanej bazy zostało anulowane.");
      return;
    }
    if (result?.ok) {
      setEncryptionNotice("Zaszyfrowana baza została przekazana do pobrania/zapisu.");
      return;
    }
    setEncryptionNotice("Przeglądarka zablokowała pobranie. Użyj przycisku „Kopiuj zaszyfrowaną treść”.");
  }

  async function copyEncryptedBackupText() {
    const text = encryptedText || (await buildEncryptedBackupText());
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setEncryptedCopied(true);
      setEncryptionNotice("Skopiowano zaszyfrowaną treść. Wklej ją do Notatnika i zapisz jako plik .json.");
      setTimeout(() => setEncryptedCopied(false), 1800);
    } catch {
      setEncryptionNotice("Nie udało się skopiować automatycznie. Zaszyfrowana treść jest poniżej — zaznacz ją ręcznie.");
    }
  }

  async function handleDownloadClick() {
    setDownloadNotice("Próbuję pobrać zwykły plik JSON. Jeśli przeglądarka nic nie pokaże, użyj bezpiecznej metody: „Zaznacz całość”.");
    const result = await onDownload?.();
    if (result?.reason === "cancelled") {
      setDownloadNotice("Zapisywanie zostało anulowane. Treść eksportu nadal jest poniżej i można ją zapisać ręcznie.");
      return;
    }
    if (result?.ok) {
      setDownloadNotice("Wysłałam polecenie pobrania pliku. W Canvasie przeglądarka może je wyciszyć, więc najpewniejsza metoda to nadal „Zaznacz całość”.");
      return;
    }
    setDownloadNotice("Pobieranie zostało zablokowane. Użyj „Zaznacz całość”, skopiuj tekst i zapisz go jako plik .json.");
  }

  async function copyBackupText() {
    try {
      await navigator.clipboard.writeText(backupText);
      setCopied(true);
      setDownloadNotice("Skopiowano treść eksportu do schowka. Wklej ją do Notatnika i zapisz jako plik .json.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      selectBackupText();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><Upload size={14} /> Eksport danych</div>
                <h2 className="text-2xl font-black">Kopia zapasowa tablicy</h2>
                <p className={cx("mt-1 text-sm leading-6", t.textMuted)}>Możesz pobrać zwykły eksport JSON albo od razu zaszyfrować bazę hasłem. Wariant szyfrowany jest zalecany dla danych służbowych i wrażliwych.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className={cx("mb-4 rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-3 flex items-center gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><ShieldCheck size={18} /></span>
                <div>
                  <h3 className="text-sm font-black">Bezpieczny eksport: zaszyfrowana baza</h3>
                  <p className={cx("text-xs font-semibold", t.textSoft)}>Ustaw hasło bazy. Bez niego plik będzie nieczytelny.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-black">
                  Hasło do bazy
                  <input
                    type="password"
                    value={databasePassword}
                    onChange={(event) => {
                      setDatabasePassword(event.target.value);
                      setEncryptedText("");
                    }}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                    placeholder="Minimum 8 znaków"
                  />
                </label>

                <label className="grid gap-1 text-xs font-black">
                  Powtórz hasło
                  <input
                    type="password"
                    value={databasePasswordRepeat}
                    onChange={(event) => {
                      setDatabasePasswordRepeat(event.target.value);
                      setEncryptedText("");
                    }}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                    placeholder="To samo hasło"
                  />
                </label>
              </div>

              {encryptionNotice && (
                <div className={cx("mt-3 rounded-2xl border px-3 py-2 text-xs font-bold leading-5", t.buttonSoft)}>
                  {encryptionNotice}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleEncryptedDownloadClick}
                  disabled={encrypting}
                  className={cx("inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}
                >
                  <ShieldCheck size={15} /> {encrypting ? "Szyfruję..." : "Zaszyfruj i pobierz"}
                </button>
                <button
                  type="button"
                  onClick={copyEncryptedBackupText}
                  disabled={encrypting}
                  className={cx("inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonSoft)}
                >
                  {encryptedCopied ? <CheckCircle2 size={15} /> : <BookOpen size={15} />} {encryptedCopied ? "Skopiowano" : "Kopiuj zaszyfrowaną treść"}
                </button>
              </div>

              {encryptedText && (
                <textarea
                  value={encryptedText}
                  readOnly
                  spellCheck={false}
                  className={cx("mt-3 h-40 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none", t.inputSolid)}
                  onFocus={(event) => event.target.select()}
                />
              )}
            </div>

            <div className={cx("mb-4 rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-black">Zwykły eksport JSON</p>
                  <p className={cx("truncate text-xs font-semibold", t.textSoft)}>{fileName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyBackupText}
                    className={cx("inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5", t.buttonPrimary)}
                  >
                    {copied ? <CheckCircle2 size={15} /> : <BookOpen size={15} />} {copied ? "Skopiowano" : "Kopiuj treść"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadClick}
                    className={cx("inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.buttonSoft)}
                  >
                    <Upload size={15} /> Pobierz zwykły JSON
                  </button>
                </div>
              </div>
              {downloadNotice && (
                <div className={cx("mb-3 rounded-2xl border px-3 py-2 text-xs font-bold leading-5", t.buttonSoft)}>
                  {downloadNotice}
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={backupText}
                readOnly
                spellCheck={false}
                className={cx("h-56 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none", t.inputSolid)}
                onFocus={(event) => event.target.select()}
              />
            </div>

            <div className={cx("rounded-3xl border p-4 text-sm leading-6", t.buttonSoft)}>
              <p className="font-black">Zalecenie bezpieczeństwa:</p>
              <p className={cx("mt-1", t.textMuted)}>Dla danych firmowych używaj eksportu zaszyfrowanego. Zwykły JSON zostawiamy tymczasowo do migracji i awaryjnego testowania, ale docelowo to nie powinien być główny sposób zapisu danych wrażliwych.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ImportBackupModal({ t, open, onClose, onImportText, onImportFile }) {
  const [text, setText] = useState("");
  const [databasePassword, setDatabasePassword] = useState("");
  const [importNotice, setImportNotice] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setText("");
      setDatabasePassword("");
      setImportNotice("");
      setImporting(false);
    }
  }, [open]);

  async function parseMaybeDecryptImport(rawText) {
    const parsed = parseBackupText(rawText);
    if (!isEncryptedDatabasePayload(parsed)) return { parsed, encrypted: false };

    if (!databasePassword.trim()) {
      throw new Error("Ten plik jest zaszyfrowany. Podaj hasło do bazy, żeby go wczytać.");
    }

    const decrypted = await decryptKanbanDatabase(parsed, databasePassword.trim());
    return { parsed: decrypted, encrypted: true };
  }

  async function importTextContent(rawText) {
    if (!String(rawText || "").trim()) {
      setImportNotice("Nie podano treści importu.");
      return false;
    }

    setImporting(true);
    setImportNotice("Sprawdzam plik importu...");

    try {
      const result = await parseMaybeDecryptImport(rawText);
      const ok = onImportText(JSON.stringify(result.parsed));
      if (ok) {
        setText("");
        setImportNotice(result.encrypted ? "Zaszyfrowana baza została odszyfrowana i wczytana." : "Zwykła kopia JSON została wczytana.");
      }
      return ok;
    } catch (error) {
      setImportNotice(error.message || "Nie udało się wczytać kopii zapasowej.");
      return false;
    } finally {
      setImporting(false);
    }
  }

  async function submitTextImport() {
    await importTextContent(text);
  }

  async function submitFileImport(file) {
    if (!file) return;

    try {
      const rawText = await readTextFile(file);
      await importTextContent(rawText);
    } catch (error) {
      if (typeof onImportFile === "function") {
        onImportFile(file);
        return;
      }
      setImportNotice(error.message || "Nie udało się odczytać pliku.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><RotateCcw size={14} /> Import danych</div>
                <h2 className="text-2xl font-black">Wczytaj kopię zapasową tablicy</h2>
                <p className={cx("mt-1 text-sm leading-6", t.textMuted)}>Możesz wybrać zwykły plik JSON albo zaszyfrowaną bazę. Dla zaszyfrowanej bazy wpisz hasło przed importem.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className={cx("mb-4 rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-3 flex items-center gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><ShieldCheck size={18} /></span>
                <div>
                  <h3 className="text-sm font-black">Hasło do zaszyfrowanej bazy</h3>
                  <p className={cx("text-xs font-semibold", t.textSoft)}>Wypełnij tylko wtedy, gdy importujesz plik zaszyfrowany.</p>
                </div>
              </div>
              <input
                type="password"
                value={databasePassword}
                onChange={(event) => setDatabasePassword(event.target.value)}
                className={cx("w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                placeholder="Hasło do bazy"
              />
              {importNotice && (
                <div className={cx("mt-3 rounded-2xl border px-3 py-2 text-xs font-bold leading-5", t.buttonSoft)}>
                  {importNotice}
                </div>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><Upload size={18} /></span>
                  <div>
                    <h3 className="text-sm font-black">Import z pliku</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Obsługuje zwykły JSON i zaszyfrowaną bazę.</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json,.kanban"
                  className="hidden"
                  onChange={(event) => {
                    submitFileImport(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={importing} className={cx("inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonPrimary)}>
                  <Upload size={16} /> {importing ? "Wczytuję..." : "Wybierz plik JSON"}
                </button>
                <div className={cx("mt-4 rounded-2xl border p-3 text-xs leading-5", t.buttonSoft)}>
                  <p className="font-black">Co zostanie wczytane?</p>
                  <p className={cx("mt-1", t.textMuted)}>Zadania, archiwum, zdjęcia, aktywny widok, układ kafelków, tryb kolorystyczny i wielkość tekstu.</p>
                </div>
              </section>

              <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><BookOpen size={18} /></span>
                  <div>
                    <h3 className="text-sm font-black">Import z wklejonej treści</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Awaryjna metoda dla zwykłego albo zaszyfrowanego JSON.</p>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Wklej tutaj pełną treść kopii JSON albo zaszyfrowanej bazy..."
                  className={cx("h-56 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                />
                <button type="button" onClick={submitTextImport} disabled={!text.trim() || importing} className={cx("mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}>
                  <RotateCcw size={16} /> {importing ? "Wczytuję..." : "Wczytaj z wklejonej treści"}
                </button>
              </section>
            </div>

            <div className={cx("mt-4 rounded-3xl border p-4 text-sm leading-6", t.buttonSoft)}>
              <p className="font-black">Bezpieczna kolejność testu:</p>
              <p className={cx("mt-1", t.textMuted)}>Najpierw zrób zaszyfrowany Eksport, potem spróbuj go zaimportować z hasłem. Jeśli hasło jest złe, aplikacja nie pokaże danych — czyli sejf trzyma fason.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
