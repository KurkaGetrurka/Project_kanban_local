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

function ModalHeader({ t, icon, title, hint }) {
  return (
    <div className="mb-5 flex min-w-0 items-start gap-3">
      <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-xl font-black tracking-tight">{title}</h2>
        {hint && <p className={cx("mt-1 text-xs font-semibold leading-5", t.textMuted)}>{hint}</p>}
      </div>
    </div>
  );
}

function ActionCard({ t, icon, title, subtitle, children, muted = false, className = "" }) {
  return (
    <section className={cx("rounded-3xl border p-4", muted ? t.buttonSoft : t.cardSolid, className)}>
      <div className="mb-3 flex items-start gap-3">
        <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1", t.chip)}>
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-black">{title}</h3>
          {subtitle && <p className={cx("mt-1 text-xs font-semibold leading-5", t.textSoft)}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Notice({ t, children }) {
  if (!children) return null;

  return (
    <div className={cx("mb-4 rounded-2xl border px-4 py-3 text-xs font-bold leading-5", t.buttonSoft)}>
      {children}
    </div>
  );
}

function InlineNotice({ t, children }) {
  if (!children) return null;

  return (
    <div className={cx("mt-3 rounded-2xl border px-3 py-2 text-xs font-bold leading-5", t.buttonSoft)}>
      {children}
    </div>
  );
}

function TextPreview({ t, label, children }) {
  return (
    <details className={cx("mt-3 rounded-2xl border px-3 py-2 text-xs", t.buttonSoft)}>
      <summary className="cursor-pointer select-none font-black">{label}</summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export function ExportBackupModal({ t, open, backupText, fileName, onClose }) {
  const [encryptedCopied, setEncryptedCopied] = useState(false);
  const [encryptionNotice, setEncryptionNotice] = useState("");
  const [databasePassword, setDatabasePassword] = useState("");
  const [databasePasswordRepeat, setDatabasePasswordRepeat] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [encrypting, setEncrypting] = useState(false);

  useEffect(() => {
    setEncryptionNotice("");
    setEncryptedCopied(false);
    setDatabasePassword("");
    setDatabasePasswordRepeat("");
    setEncryptedText("");
    setEncrypting(false);
  }, [open, backupText]);

  function validateEncryptionPassword() {
    const password = databasePassword.trim();
    if (!password) {
      setEncryptionNotice("Wpisz hasło do pliku.");
      return null;
    }
    if (password.length < 8) {
      setEncryptionNotice("Hasło musi mieć co najmniej 8 znaków.");
      return null;
    }
    if (password !== databasePasswordRepeat.trim()) {
      setEncryptionNotice("Wpisane hasła różnią się.");
      return null;
    }
    return password;
  }

  async function buildEncryptedBackupText() {
    const password = validateEncryptionPassword();
    if (!password) return "";

    setEncrypting(true);
    setEncryptionNotice("Przygotowuję plik...");

    try {
      const plainPayload = parseBackupText(backupText);
      const encryptedPayload = await encryptKanbanDatabase(plainPayload, password);
      const nextEncryptedText = JSON.stringify(encryptedPayload, null, 2);
      setEncryptedText(nextEncryptedText);
      setEncryptionNotice("Plik jest gotowy do pobrania.");
      return nextEncryptedText;
    } catch (error) {
      setEncryptionNotice(error.message || "Nie udało się przygotować pliku.");
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
      setEncryptionNotice("Zapis pliku został anulowany.");
      return;
    }
    if (result?.ok) {
      setEncryptionNotice("Plik został przekazany do pobrania.");
      return;
    }
    setEncryptionNotice("Pobieranie nie powiodło się. Skopiuj treść pliku i zapisz ją ręcznie.");
  }

  async function copyEncryptedBackupText() {
    const text = encryptedText || (await buildEncryptedBackupText());
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setEncryptedCopied(true);
      setEncryptionNotice("Treść pliku została skopiowana.");
      setTimeout(() => setEncryptedCopied(false), 1800);
    } catch {
      setEncryptionNotice("Nie udało się skopiować treści. Użyj sekcji zaawansowanej.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-1 flex items-start justify-between gap-4">
              <ModalHeader
                t={t}
                icon={<ShieldCheck size={18} />}
                title="Eksport kopii"
                hint="Utwórz zabezpieczony plik kopii zapasowej tablicy."
              />
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className={cx("mb-4 flex flex-wrap items-center gap-2 border-b pb-4", t.divider)}>
              <span className={cx("rounded-full border px-3 py-1 text-[11px] font-black", t.successButton)}>
                Format: szyfrowany plik
              </span>
              <span className={cx("min-w-0 truncate text-[11px] font-semibold", t.textSoft)} title={fileName}>
                Nazwa: {fileName}
              </span>
            </div>

            <ActionCard
              t={t}
              icon={<ShieldCheck size={18} />}
              title="Zabezpieczona kopia"
              subtitle="Plik będzie wymagał hasła przy imporcie."
              className="min-w-0"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-black">
                  Hasło do pliku
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
                    placeholder="Wpisz ponownie"
                  />
                </label>
              </div>

              <InlineNotice t={t}>{encryptionNotice}</InlineNotice>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleEncryptedDownloadClick}
                  disabled={encrypting}
                  className={cx("inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}
                >
                  <ShieldCheck size={15} /> {encrypting ? "Przygotowuję..." : "Pobierz plik"}
                </button>
                <button
                  type="button"
                  onClick={copyEncryptedBackupText}
                  disabled={encrypting}
                  className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonSoft)}
                >
                  {encryptedCopied ? <CheckCircle2 size={15} /> : <BookOpen size={15} />} {encryptedCopied ? "Skopiowano" : "Kopiuj treść"}
                </button>
              </div>

              {encryptedText && (
                <TextPreview t={t} label="Zaawansowane: pokaż treść pliku">
                  <textarea
                    value={encryptedText}
                    readOnly
                    spellCheck={false}
                    className={cx("h-40 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none", t.inputSolid)}
                    onFocus={(event) => event.target.select()}
                  />
                </TextPreview>
              )}
            </ActionCard>
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
        setImportNotice("Wykryto zaszyfrowaną bazę. Wpisz hasło.");
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
      setImportNotice("Wykryto zwykły JSON. Możesz wczytać bazę.");
      return { encrypted: false };
    } catch (error) {
      setSelectedImport(null);
      setImportNotice(error.message || "Nie udało się rozpoznać importu.");
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
      setImportNotice("Podaj hasło do bazy.");
      return;
    }

    setImporting(true);
    setImportNotice("Odszyfrowuję...");

    try {
      const decrypted = await decryptKanbanDatabase(selectedImport.encryptedPayload, password);
      setSelectedImport((current) => ({
        ...current,
        locked: false,
        parsed: decrypted,
        previewText: buildPreview(decrypted),
      }));
      setImportNotice("Baza odblokowana. Możesz ją wczytać.");
    } catch (error) {
      setImportNotice(error.message || "Nie udało się odszyfrować bazy.");
    } finally {
      setImporting(false);
    }
  }

  async function commitSelectedImport() {
    if (!selectedImport?.parsed || selectedImport.locked) {
      setImportNotice("Najpierw wybierz albo odblokuj bazę.");
      return false;
    }

    setImporting(true);
    setImportNotice("Wczytuję...");

    try {
      const ok = onImportText(JSON.stringify(selectedImport.parsed));
      if (ok) {
        setText("");
        setDatabasePassword("");
        setSelectedImport(null);
        setImportNotice("Baza została wczytana.");
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
    setImportNotice("Odczytuję plik...");

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
  const importStatus = selectedImport
    ? selectedImport.encrypted
      ? selectedImport.locked
        ? "Zaszyfrowana · zablokowana"
        : "Zaszyfrowana · odblokowana"
      : "JSON · gotowy"
    : "Brak pliku";

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <ModalHeader
                t={t}
                icon={<RotateCcw size={18} />}
                title="Import"
                hint="Wybierz plik lub wklej treść. Zaszyfrowane bazy wymagają hasła."
              />
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <Notice t={t}>{importNotice}</Notice>

            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              <div className={cx("rounded-2xl border px-3 py-2 text-xs font-bold", t.buttonSoft)} title={selectedImport?.sourceName || "Nie wybrano pliku"}>
                <span className={t.textSoft}>Status: </span>{importStatus}
              </div>
              <div className={cx("rounded-2xl border px-3 py-2 text-xs font-bold", t.buttonSoft)}>
                <span className={t.textSoft}>Źródło: </span>{selectedImport ? "wybrane" : "czeka"}
              </div>
              <div className={cx("rounded-2xl border px-3 py-2 text-xs font-bold", hasUnlockedImport ? t.successButton : t.buttonSoft)}>
                {hasUnlockedImport ? "Gotowe do wczytania" : "Import zablokowany"}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ActionCard
                t={t}
                icon={<Upload size={18} />}
                title="Plik"
                subtitle="JSON albo zaszyfrowana baza."
              >
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
                  <Upload size={16} /> {importing ? "Sprawdzam..." : "Wybierz plik"}
                </button>

                {selectedImport && (
                  <div className={cx("mt-3 rounded-2xl border px-3 py-2 text-xs font-bold", t.buttonSoft)}>
                    <p className="truncate" title={selectedImport.sourceName}>{selectedImport.sourceName}</p>
                    <button type="button" onClick={clearSelectedImport} className={cx("mt-2 inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[11px] font-black transition hover:-translate-y-0.5", t.buttonSoft)}>
                      <X size={13} /> Zmień plik
                    </button>
                  </div>
                )}
              </ActionCard>

              <ActionCard
                t={t}
                icon={<BookOpen size={18} />}
                title="Wklej treść"
                subtitle="Awaryjnie, gdy nie wybierasz pliku."
                muted
              >
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Wklej treść JSON albo zaszyfrowanej bazy..."
                  className={cx("h-32 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                />
                <button type="button" onClick={submitTextInspection} disabled={!text.trim() || importing} className={cx("mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonSoft)}>
                  <BookOpen size={15} /> Sprawdź treść
                </button>
              </ActionCard>
            </div>

            {hasLockedEncryptedImport && (
              <ActionCard
                t={t}
                icon={<ShieldCheck size={18} />}
                title="Hasło"
                subtitle="Odblokuj zaszyfrowaną bazę."
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="password"
                    value={databasePassword}
                    onChange={(event) => setDatabasePassword(event.target.value)}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                    placeholder="Hasło do bazy"
                  />
                  <button type="button" onClick={unlockEncryptedImport} disabled={!databasePassword.trim() || importing} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}>
                    <ShieldCheck size={15} /> {importing ? "Odszyfrowuję..." : "Odszyfruj"}
                  </button>
                </div>
              </ActionCard>
            )}

            <section className={cx("mt-4 rounded-3xl border p-4", hasUnlockedImport ? t.cardSolid : t.buttonSoft)}>
              <div className="mb-3 flex items-center gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><CheckCircle2 size={18} /></span>
                <div>
                  <h3 className="text-sm font-black">Wczytanie</h3>
                  <p className={cx("text-xs font-semibold", t.textSoft)}>{hasUnlockedImport ? "Baza gotowa." : "Najpierw wybierz albo odblokuj bazę."}</p>
                </div>
              </div>

              {hasUnlockedImport ? (
                <>
                  <TextPreview t={t} label="Pokaż podgląd danych">
                    <textarea
                      value={selectedImport.previewText}
                      readOnly
                      spellCheck={false}
                      className={cx("h-56 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none", t.inputSolid)}
                      onFocus={(event) => event.target.select()}
                    />
                  </TextPreview>
                  <button type="button" onClick={commitSelectedImport} disabled={importing} className={cx("mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}>
                    <RotateCcw size={16} /> {importing ? "Wczytuję..." : "Wczytaj bazę"}
                  </button>
                </>
              ) : (
                <div className={cx("rounded-2xl border px-3 py-2 text-xs font-bold", t.buttonSoft)}>
                  Import jest zablokowany.
                </div>
              )}
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
