import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Database, Download, ShieldCheck, Trash2, X } from "lucide-react";

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
  hasKanbanBrowserStorage,
  isBrowserPersistenceDisabled,
} from "../security/browserStoragePolicy.js";

function encryptedDatabaseFileName(fileName = "kanban-baza.json") {
  return String(fileName).replace(/\.json$/i, "-zaszyfrowana.kanban.json");
}

export function SecurityDatabaseModal({ t, open, backupText, fileName, onClose }) {
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storageCopyDetected, setStorageCopyDetected] = useState(false);
  const [browserPersistenceDisabled, setBrowserPersistenceDisabled] = useState(false);

  const storageSummary = useMemo(() => {
    const keys = [STORAGE_KEY, ...LEGACY_KEYS];
    return {
      keys,
      currentKey: STORAGE_KEY,
      legacyCount: LEGACY_KEYS.length,
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setPasswordRepeat("");
    setEncryptedText("");
    setNotice("");
    setBusy(false);
    setCopied(false);
    setStorageCopyDetected(hasKanbanBrowserStorage(STORAGE_KEY, LEGACY_KEYS));
    setBrowserPersistenceDisabled(isBrowserPersistenceDisabled());
  }, [open, backupText]);

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
      setNotice("Baza została zaszyfrowana. Pobierz plik albo skopiuj treść, a potem wykonaj test importu.");
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
      "Najpierw upewnij się, że masz pobraną zaszyfrowaną bazę i że import testowy działa. Usunąć starą kopię z pamięci przeglądarki i zatrzymać zapis do localStorage w tej sesji?"
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
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}>
                  <ShieldCheck size={14} /> Bezpieczeństwo bazy
                </div>
                <h2 className="text-2xl font-black">Zaszyfruj istniejącą bazę</h2>
                <p className={cx("mt-1 text-sm leading-6", t.textMuted)}>
                  Ten panel służy do migracji danych stworzonych przed etapem szyfrowania. Najpierw pobierz zaszyfrowaną bazę, potem sprawdź import, a dopiero na końcu czyść starą kopię z przeglądarki.
                </p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}>
                <X />
              </button>
            </div>

            {notice && (
              <div className={cx("mb-4 rounded-3xl border px-4 py-3 text-xs font-bold leading-5", t.buttonSoft)}>
                {notice}
              </div>
            )}

            <section className={cx("mb-4 rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-3 flex items-center gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}>
                  <Database size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-black">1. Status zapisu w przeglądarce</h3>
                  <p className={cx("text-xs font-semibold", t.textSoft)}>
                    Sprawdzam główny klucz bazy oraz {storageSummary.legacyCount} starsze klucze migracyjne.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className={cx("rounded-2xl border p-3 text-xs leading-5", t.buttonSoft)}>
                  <p className="font-black">Kopia w localStorage</p>
                  <p className={cx("mt-1", t.textMuted)}>
                    {storageCopyDetected ? "Wykryto dane zapisane w przeglądarce." : "Nie wykryto danych w znanych kluczach localStorage."}
                  </p>
                </div>
                <div className={cx("rounded-2xl border p-3 text-xs leading-5", t.buttonSoft)}>
                  <p className="font-black">Zapis do localStorage w tej sesji</p>
                  <p className={cx("mt-1", t.textMuted)}>
                    {browserPersistenceDisabled ? "Zatrzymany po czyszczeniu." : "Aktywny do czasu pełnego przepięcia zapisu na plik."}
                  </p>
                </div>
              </div>
            </section>

            <section className={cx("mb-4 rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-3 flex items-center gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}>
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-black">2. Zaszyfruj aktualny stan tablicy</h3>
                  <p className={cx("text-xs font-semibold", t.textSoft)}>
                    Hasło szyfruje zawartość pliku. Bez niego plik będzie nieczytelny.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-black">
                  Hasło do bazy
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
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
                    value={passwordRepeat}
                    onChange={(event) => {
                      setPasswordRepeat(event.target.value);
                      setEncryptedText("");
                    }}
                    className={cx("rounded-2xl border px-3 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                    placeholder="To samo hasło"
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadEncryptedDatabase}
                  disabled={busy}
                  className={cx("inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}
                >
                  <Download size={15} /> {busy ? "Szyfruję..." : "Zaszyfruj i pobierz"}
                </button>
                <button
                  type="button"
                  onClick={copyEncryptedDatabase}
                  disabled={busy}
                  className={cx("inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonSoft)}
                >
                  {copied ? <CheckCircle2 size={15} /> : <ShieldCheck size={15} />} {copied ? "Skopiowano" : "Kopiuj zaszyfrowaną treść"}
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
            </section>

            <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-3 flex items-center gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}>
                  <Trash2 size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-black">3. Wyczyść starą kopię z przeglądarki</h3>
                  <p className={cx("text-xs font-semibold", t.textSoft)}>
                    Użyj dopiero po pobraniu zaszyfrowanego pliku i pozytywnym teście importu.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearBrowserCopy}
                className={cx("inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.dangerButton)}
              >
                <Trash2 size={15} /> Usuń starą kopię i zatrzymaj zapis w tej sesji
              </button>

              <p className={cx("mt-3 text-xs font-semibold leading-5", t.textMuted)}>
                Ważne: to jest etap migracyjny. Pełne docelowe rozwiązanie to zapis zaszyfrowanej bazy do wybranego pliku/folderu zamiast automatycznego localStorage.
              </p>
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
