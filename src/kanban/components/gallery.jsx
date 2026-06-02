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

import { cx, formatDate } from "../shared.jsx";

export function GalleryModal({ t, open, images, selected, onSelect, onClose, onClosePreview, onGoToTask }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className={cx("max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)} initial={{ scale: 0.96, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 20, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><ImageIcon size={14} /> Galeria</div>
                <h2 className="text-2xl font-black">Zdjęcia ze wszystkich tasków</h2>
                <p className={cx("mt-1 text-sm", t.textMuted)}>Galeria pokazuje zdjęcia z kart aktywnych i archiwalnych. Archiwum nie chowa dowodów rzeczowych.</p>
              </div>
              <button type="button" onClick={onClose} className={cx("rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            {images.length === 0 ? (
              <div className={cx("rounded-3xl border border-dashed p-8 text-center text-sm", t.border, t.textMuted)}>
                Brak zdjęć w taskach. Galeria jeszcze czeka na swoje pierwsze dzieło sztuki.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((item) => (
                  <button key={item.id} type="button" onClick={() => onSelect(item)} className={cx("group overflow-hidden rounded-3xl border text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl", t.cardSolid)}>
                    <div className="relative h-44 overflow-hidden">
                      <img src={item.image.dataUrl} alt={item.image.name || item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-3 text-white">
                        <h3 className="line-clamp-2 text-sm font-black">{item.title}</h3>
                      </div>
                      {item.archivedAt && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur"><Archive size={11} /> Archiwum</span>}
                    </div>
                    <div className="p-3">
                      <p className={cx("line-clamp-2 text-xs font-semibold", t.textMuted)}>{item.description || "Brak opisu przy zadaniu."}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black">
                        {item.dueDate && <span className={cx("rounded-full px-2 py-1 ring-1", t.chip)}>{formatDate(item.dueDate)}</span>}
                        <span className={cx("rounded-full px-2 py-1 ring-1", t.chip)}>{item.image.width || "?"}×{item.image.height || "?"}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {selected && (
              <motion.div className={cx("fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClosePreview}>
                <motion.div className={cx("grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border shadow-2xl lg:grid-cols-[1fr_320px]", t.modal)} initial={{ scale: 0.96, y: 18, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 18, opacity: 0 }} onMouseDown={(event) => event.stopPropagation()}>
                  <div className="flex min-h-[52vh] items-center justify-center bg-slate-950/90 p-3">
                    <img src={selected.image.dataUrl} alt={selected.image.name || selected.title} className="max-h-[82vh] w-full rounded-2xl object-contain" />
                  </div>
                  <aside className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><ImageIcon size={14} /> Podgląd</div>
                        <h3 className="text-xl font-black leading-tight">{selected.title}</h3>
                      </div>
                      <button type="button" onClick={onClosePreview} className={cx("shrink-0 rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
                    </div>
                    <p className={cx("text-sm leading-6", t.textMuted)}>{selected.description || "To zdjęcie nie ma dodatkowego opisu w karcie."}</p>
                    <div className="grid gap-2 text-xs font-black">
                      {selected.dueDate && <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Termin: {formatDate(selected.dueDate, { day: "2-digit", month: "long", year: "numeric" })}</span>}
                      {selected.archivedAt && <span className={cx("inline-flex items-center gap-2 rounded-2xl px-3 py-2 ring-1", t.chip)}><Archive size={14} /> Z archiwum</span>}
                      <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Plik: {selected.image.name || "bez nazwy"}</span>
                    </div>
                    <button type="button" onClick={() => onGoToTask(selected)} className={cx("mt-auto inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5", t.actionPrimary)}><CheckSquare2 size={17} /> Zaprowadź mnie do tego zadania</button>
                  </aside>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
