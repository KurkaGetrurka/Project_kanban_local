import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Archive,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  GripVertical,
  Image as ImageIcon,
  LayoutDashboard,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";

import { cx, backupFileName, countImportableTasks, hasImportableKanbanData, parseBackupText } from "../shared.jsx";

export function ExportBackupModal({ t, open, backupText, fileName, onClose, onDownload }) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState("");

  useEffect(() => {
    setDownloadNotice("");
    setCopied(false);
  }, [open, backupText]);

  function selectBackupText() {
    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
    setDownloadNotice("Zaznaczyłam treść eksportu. Użyj Ctrl+C, wklej do Notatnika i zapisz jako plik .json.");
  }


  async function handleDownloadClick() {
    setDownloadNotice("Próbuję pobrać plik JSON. Jeśli przeglądarka nic nie pokaże, użyj bezpiecznej metody: „Zaznacz całość”.");
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
                <p className={cx("mt-1 text-sm leading-6", t.textMuted)}>Pobierz plik JSON albo skopiuj zawartość ręcznie. Ten eksport obejmuje zadania, archiwum, zdjęcia, układ kafelków, tryb kolorystyczny i ustawienia tekstu.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className={cx("mb-4 rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-black">Nazwa pliku</p>
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
                    <Upload size={15} /> Pobierz
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
                className={cx("h-72 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none", t.inputSolid)}
                onFocus={(event) => event.target.select()}
              />
            </div>

            <div className={cx("rounded-3xl border p-4 text-sm leading-6", t.buttonSoft)}>
              <p className="font-black">Najpewniejsza metoda w podglądzie Canvas:</p>
              <p className={cx("mt-1", t.textMuted)}>Najwygodniej kliknij <strong>Pobierz</strong>. Jeśli przeglądarka zablokuje zapis pliku, użyj <strong>Kopiuj treść</strong>, wklej zawartość do Notatnika i zapisz jako plik z końcówką <strong>.json</strong>. Potem taki plik można wczytać przez Import.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ImportBackupModal({ t, open, onClose, onImportText, onImportFile }) {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) setText("");
  }, [open]);

  function submitTextImport() {
    const ok = onImportText(text);
    if (ok) setText("");
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
                <p className={cx("mt-1 text-sm leading-6", t.textMuted)}>Możesz wybrać plik JSON albo wkleić treść skopiowaną z okna eksportu. Import zastąpi aktualne dane zapisane w tej przeglądarce.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <section className={cx("rounded-3xl border p-4", t.cardSolid)}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={cx("flex h-10 w-10 items-center justify-center rounded-2xl ring-1", t.chip)}><Upload size={18} /></span>
                  <div>
                    <h3 className="text-sm font-black">Import z pliku</h3>
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Najlepsze dla pliku pobranego przez Eksport.</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    onImportFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={cx("inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5", t.buttonPrimary)}>
                  <Upload size={16} /> Wybierz plik JSON
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
                    <p className={cx("text-xs font-semibold", t.textSoft)}>Awaryjna metoda, gdy przeglądarka blokuje pliki.</p>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Wklej tutaj pełną treść kopii JSON z okna Eksport..."
                  className={cx("h-56 w-full resize-none rounded-2xl border p-3 font-mono text-[11px] leading-5 outline-none ring-violet-300 transition focus:ring-4", t.inputSolid)}
                />
                <button type="button" onClick={submitTextImport} disabled={!text.trim()} className={cx("mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.actionPrimary)}>
                  <RotateCcw size={16} /> Wczytaj z wklejonej treści
                </button>
              </section>
            </div>

            <div className={cx("mt-4 rounded-3xl border p-4 text-sm leading-6", t.buttonSoft)}>
              <p className="font-black">Bezpieczna kolejność testu:</p>
              <p className={cx("mt-1", t.textMuted)}>Najpierw zrób Eksport, potem dodaj testowe zadanie, a następnie wykonaj Import. Jeśli testowe zadanie zniknie i wróci stan z eksportu, kopia działa prawidłowo. Mały rytuał, ale bez świec i kadzidła.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
