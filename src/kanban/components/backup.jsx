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
  const [selectedImport, setSelectedImport] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setText("");
      setDatabasePassword("");
      setImportNotice("");
      setImporting(false);
      setSelectedImport(null);
    }
  }, [open]);

  function clearSelectedImport() {
    setSelectedImport(null);
    setDatabasePassword("");
    setImportNotice("");
  }

  function buildPreview(payload) {
    return JSON.stringify(payload, null, 2);
  }

  function inspectImportText(rawText, sourceName = "wklejona treść") {
    if (!String(rawText || "").trim()) {
      setImportNotice("Nie podano treści importu.");
      setSelectedImport(null);
      return null;
    }

    try {
      const parsed = parseBackupText(rawText);
      if (isEncryptedDatabasePayload(parsed)) {
        setSelectedImport({
          sourceName,
          rawText,
          encrypted: true,
          locked: true,
          encryptedPayload: parsed,
          parsed: null,
          previewText: "",
        });
        setDatabasePassword("");
        setImportNotice("Wykryto zaszyfrowaną bazę. Wpisz hasło, żeby odblokować podgląd i import.");
        return { encrypted: true };
      }

      setSelectedImport({
        sourceName,
        rawText,
        encrypted: false,
        locked: false,
        encryptedPayload: null,
        parsed,
        previewText: buildPreview(parsed),
      });
      setDatabasePassword("");
      setImportNotice("Wykryto zwykłą kopię JSON. Podgląd jest odblokowany — możesz ją wczytać.");
      return { encrypted: false };
    } catch (error) {
      setSelectedImport(null);
      setImportNotice(error.message || "Nie udało się rozpoznać pliku importu.");
      return null;
    }
  }

  async function unlockEncryptedImport() {
    if (!selectedImport?.encrypted) {
      setImportNotice("Najpierw wybierz zaszyfrowany plik bazy.");
      return;
    }

    const password = databasePassword.trim();
    if (!password) {
      setImportNotice("Podaj hasło do bazy, żeby odblokować import.");
      return;
    }

    setImporting(true);
    setImportNotice("Odszyfrowuję bazę i sprawdzam, czy hasło pasuje...");

    try {
      const decrypted = await decryptKanbanDatabase(selectedImport.encryptedPayload, password);
      setSelectedImport((current) => ({
        ...current,
        locked: false,
        parsed: decrypted,
        previewText: buildPreview(decrypted),
      }));
      setImportNotice("Baza została odszyfrowana. Podgląd i przycisk importu są odblokowane.");
    } catch (error) {
      setImportNotice(error.message || "Nie udało się odszyfrować bazy. Sprawdź hasło i spróbuj ponownie.");
    } finally {
      setImporting(false);
    }
  }

  async function commitSelectedImport() {
    if (!selectedImport?.parsed || selectedImport.locked) {
      setImportNotice("Najpierw odblokuj bazę albo wybierz poprawny plik JSON.");
      return false;
    }

    setImporting(true);
    setImportNotice("Wczytuję odblokowaną bazę do tablicy...");

    try {
      const ok = onImportText(JSON.stringify(selectedImport.parsed));
      if (ok) {
        setText("");
        setDatabasePassword("");
        setSelectedImport(null);
        setImportNotice(selectedImport.encrypted ? "Zaszyfrowana baza została odszyfrowana i wczytana." : "Zwykła kopia JSON została wczytana.");
      }
      return ok;
    } catch (error) {
      setImportNotice(error.message || "Nie udało się wczytać kopii zapasowej.");
      return false;
    } finally {
      setImporting(false);
    }
  }

  function submitTextInspection() {
    inspectImportText(text, "wklejona treść");
  }

  async function submitFileSelection(file) {
    if (!file) return;

    setImporting(true);
    setImportNotice("Odczytuję wybrany plik...");

    try {
      const rawText = await readTextFile(file);
      inspectImportText(rawText, file.name || "wybrany plik");
    } catch (error) {
      if (typeof onImportFile === "function") {
        onImportFile(file);
        return;
      }
      setSelectedImport(null);
      setImportNotice(error.message || "Nie udało się odczytać pliku.");
    } finally {
      setImporting(false);
    }
  }

  const hasLockedEncryptedImport = Boolean(selectedImport?.encrypted && selectedImport.locked);
  const hasUnlockedImport = Boolean(selectedImport?.parsed && !selectedImport.locked);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><RotateCcw size={14} /> Import danych</div>
                <h2 className="text-2xl font-black">Wczytaj kopię zapasową tablicy</h2>
                <p className={cx("mt-1 text-sm leading-6", t.textMuted)}>Najpierw wybierz plik albo wklej treść. Jeśli baza jest zaszyfrowana, podgląd i import odblokują się dopiero po wpisaniu hasła.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            {importNotice && (
              <div className={cx("mb-4 rounded-3xl border px-4 py-3 text-xs font-bold leading-5", t.buttonSoft)}>
                {importNotice}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><Upload size={18} /></span>
                  <div>
                    <h3 className="text-sm font-black">1. Wybierz plik bazy</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Aplikacja sama rozpozna zwykły JSON albo zaszyfrowaną bazę.</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json,.kanban,.kanban.json"
                  className="hidden"
                  onChange={(event) => {
                    submitFileSelection(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={importing} className={cx("inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonPrimary)}>
                  <Upload size={16} /> {importing ? "Sprawdzam..." : "Wybierz plik bazy"}
                </button>

                {selectedImport && (
                  <div className={cx("mt-4 rounded-2xl border p-3 text-xs leading-5", t.buttonSoft)}>
                    <p className="font-black">Wybrano:</p>
                    <p className={cx("mt-1 break-all font-semibold", t.textMuted)}>{selectedImport.sourceName}</p>
                    <p className="mt-2 font-black">Status:</p>
                    <p className={cx("mt-1", t.textMuted)}>
                      {selectedImport.encrypted
                        ? selectedImport.locked
                          ? "Zaszyfrowana baza — zablokowana do czasu wpisania hasła."
                          : "Zaszyfrowana baza — odblokowana i gotowa do wczytania."
                        : "Zwykła kopia JSON — gotowa do wczytania."}
                    </p>
                    <button type="button" onClick={clearSelectedImport} className={cx("mt-3 inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5", t.buttonSoft)}>
                      <X size={14} /> Wybierz inny plik
                    </button>
                  </div>
                )}
              </section>

              <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><BookOpen size={18} /></span>
                  <div>
                    <h3 className="text-sm font-black">Awaryjnie: wklej treść bazy</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Działa dla zwykłego JSON i zaszyfrowanej treści.</p>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Wklej tutaj pełną treść kopii JSON albo zaszyfrowanej bazy..."
                  className={cx("h-40 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                />
                <button type="button" onClick={submitTextInspection} disabled={!text.trim() || importing} className={cx("mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonPrimary)}>
                  <BookOpen size={16} /> Sprawdź wklejoną treść
                </button>
              </section>
            </div>

            {hasLockedEncryptedImport && (
              <section className={cx("mt-4 rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><ShieldCheck size={18} /></span>
                  <div>
                    <h3 className="text-sm font-black">2. Odblokuj zaszyfrowaną bazę</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Po poprawnym haśle pokażę podgląd danych i dopiero wtedy odblokuję import.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="password"
                    value={databasePassword}
                    onChange={(event) => setDatabasePassword(event.target.value)}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                    placeholder="Hasło do bazy"
                  />
                  <button type="button" onClick={unlockEncryptedImport} disabled={!databasePassword.trim() || importing} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}>
                    <ShieldCheck size={15} /> {importing ? "Odszyfrowuję..." : "Odszyfruj i pokaż podgląd"}
                  </button>
                </div>
              </section>
            )}

            <section className={cx("mt-4 rounded-3xl border p-4", hasUnlockedImport ? t.cardSolid : t.buttonSoft)}>
              <div className="mb-3 flex items-center gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><CheckCircle2 size={18} /></span>
                <div>
                  <h3 className="text-sm font-black">3. Podgląd i wczytanie</h3>
                  <p className={cx("text-xs font-semibold", t.textSoft)}>
                    {hasUnlockedImport ? "Dane są odblokowane. Sprawdź podgląd i wczytaj bazę." : "Podgląd pojawi się po wybraniu zwykłego JSON albo po odszyfrowaniu bazy."}
                  </p>
                </div>
              </div>

              {hasUnlockedImport ? (
                <>
                  <textarea
                    value={selectedImport.previewText}
                    readOnly
                    spellCheck={false}
                    className={cx("h-56 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none", t.inputSolid)}
                    onFocus={(event) => event.target.select()}
                  />
                  <button type="button" onClick={commitSelectedImport} disabled={importing} className={cx("mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}>
                    <RotateCcw size={16} /> {importing ? "Wczytuję..." : "Wczytaj odblokowaną bazę"}
                  </button>
                </>
              ) : (
                <div className={cx("rounded-2xl border p-3 text-xs leading-5", t.buttonSoft)}>
                  <p className="font-black">Import jest jeszcze zablokowany.</p>
                  <p className={cx("mt-1", t.textMuted)}>Najpierw wybierz plik. Jeśli jest zaszyfrowany, wpisz hasło i odblokuj podgląd. Mały sejf nie pokaże zawartości bez klucza — i bardzo dobrze.</p>
                </div>
              )}
            </section>

            <div className={cx("mt-4 rounded-3xl border p-4 text-sm leading-6", t.buttonSoft)}>
              <p className="font-black">Bezpieczna kolejność testu:</p>
              <p className={cx("mt-1", t.textMuted)}>Wybierz zaszyfrowany plik, wpisz hasło, sprawdź odblokowany podgląd i dopiero wtedy kliknij wczytanie. Przy złym haśle podgląd oraz import pozostaną zablokowane.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
