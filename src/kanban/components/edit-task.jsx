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

import { cx, getTaskImages, labelSwatches, labelSwatchesDark, labelThemes, labelThemesDark, PriorityToggleGroup, priorityChipClass, priorityMeta, progressOf, selectOptionStyle } from "../shared.jsx";

export function EditTaskModal({ t, isDark, draft, columns, draftExists, setDraft, onClose, onSave, onDelete, onArchive, onRestore, onAddLabel, onUpdateLabel, onRemoveLabel, onAddSubtask, onUpdateSubtask, onRemoveSubtask, onAttachImage, onRemoveImage }) {
  const currentColumn = columns.find((column) => column.id === draft?.columnId);
  const doneSubtasks = draft?.subtasks?.filter((item) => item.done).length || 0;
  const allSubtasks = draft?.subtasks?.length || 0;
  const progress = draft ? progressOf(draft) : 0;

  return (
    <AnimatePresence>
      {draft && (
        <motion.div
          className={cx("fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className={cx("max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border p-4 shadow-2xl sm:p-5", t.modal)}
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}>
                  <CheckSquare2 size={14} /> Edycja karty
                </div>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Nazwa zadania..."
                  className={cx("w-full rounded-2xl border px-4 py-3 text-lg font-black outline-none ring-pink-300 transition focus:ring-4", t.input)}
                  autoFocus
                />
              </div>
              <button type="button" onClick={onClose} className={cx("shrink-0 rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <label className={cx("rounded-2xl border p-3", t.buttonSoft)}>
                <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><LayoutDashboard size={14} /> Etap</span>
                <select
                  value={draft.columnId}
                  onChange={(event) => setDraft({ ...draft, columnId: event.target.value })}
                  className={cx("w-full rounded-xl border px-3 py-2 text-xs font-black outline-none ring-pink-300 transition focus:ring-4", t.inputSolid)}
                >
                  {columns.map((column) => <option key={column.id} value={column.id} style={selectOptionStyle(t)}>{column.title}</option>)}
                </select>
              </label>

              <label className={cx("rounded-2xl border p-3", t.buttonSoft)}>
                <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><CalendarDays size={14} /> Termin</span>
                <input
                  type="date"
                  value={draft.dueDate || ""}
                  onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
                  className={cx("w-full rounded-xl border px-3 py-2 text-xs font-black outline-none ring-pink-300 transition focus:ring-4", t.inputSolid)}
                />
              </label>

              <div className={cx("rounded-2xl border p-3", t.buttonSoft)}>
                <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><Sparkles size={14} /> Priorytet</span>
                <PriorityToggleGroup
                  value={draft.priority}
                  onChange={(priority) => setDraft({ ...draft, priority })}
                  isDark={isDark}
                />
              </div>

              <div className={cx("rounded-2xl border p-3", t.buttonSoft)}>
                <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><Activity size={14} /> Postęp</span>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-black">{progress}%</p>
                    <p className={cx("text-[10px] font-bold", t.textSoft)}>{doneSubtasks}/{allSubtasks} subtasków</p>
                  </div>
                  <div className={cx("h-2 flex-1 overflow-hidden rounded-full", t.progressTrack)}>
                    <div className={cx("h-full rounded-full bg-gradient-to-r", currentColumn?.accent || "from-pink-400 to-sky-400")} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <label className={cx("mb-4 block rounded-2xl border p-3", t.buttonSoft)}>
              <span className={cx("mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide", t.textSoft)}><Sparkles size={14} /> Opis</span>
              <textarea
                value={draft.description || ""}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                rows={3}
                placeholder="Krótki opis, notatka albo kontekst zadania..."
                className={cx("w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none ring-pink-300 transition focus:ring-4", t.inputSolid)}
              />
            </label>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-4">
                <EditTaskImage t={t} draft={draft} onAttachImage={onAttachImage} onRemoveImage={onRemoveImage} />
                <EditLabels t={t} isDark={isDark} draft={draft} onAdd={onAddLabel} onUpdate={onUpdateLabel} onRemove={onRemoveLabel} />
              </div>
              <EditSubtasks t={t} draft={draft} onAdd={onAddSubtask} onUpdate={onUpdateSubtask} onRemove={onRemoveSubtask} />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => onDelete(draft.id)} title="Usuń kartę" className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.dangerButton)}><Trash2 size={16} /> Usuń</button>
                {draftExists && (draft.archivedAt ? (
                  <button type="button" onClick={() => onRestore(draft.id, "done")} title="Przywróć z archiwum" className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.successButton)}><RotateCcw size={16} /> Przywróć</button>
                ) : (
                  <button type="button" onClick={() => onArchive(draft.id)} title="Przenieś do archiwum" className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5", t.buttonSoft)}><Archive size={16} /> Archiwum</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className={cx("rounded-2xl border px-4 py-2.5 text-xs font-black transition", t.buttonSoft)}>Anuluj</button>
                <button type="button" onClick={onSave} disabled={!draft.title.trim()} className={cx("inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40", t.buttonPrimary)}><CheckCircle2 size={16} /> Zapisz</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function EditTaskImage({ t, draft, onAttachImage, onRemoveImage }) {
  const images = getTaskImages(draft);
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <section className={cx("rounded-2xl border p-3", t.buttonSoft)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cx("flex h-8 w-8 items-center justify-center rounded-xl", t.chip)}><ImageIcon size={16} /></span>
          <div>
            <h3 className="text-sm font-black">Zdjęcia</h3>
            <p className={cx("text-[10px] font-semibold", t.textSoft)}>{images.length ? `${images.length} dodane · kliknij miniaturę, aby powiększyć` : "Opcjonalne załączniki graficzne"}</p>
          </div>
        </div>
        <label title="Wybierz jedno lub kilka zdjęć" className={cx("inline-flex cursor-pointer items-center justify-center rounded-xl p-2 shadow-sm ring-1 transition hover:-translate-y-0.5", t.chip)}>
          <Upload size={16} />
          <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => { onAttachImage(event.target.files); event.target.value = ""; }} />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => {
            const imageId = image.id || image.dataUrl;
            return (
              <div key={imageId} className={cx("group relative overflow-hidden rounded-2xl border", t.imageBorder)}>
                <button
                  type="button"
                  onClick={() => setPreviewImage({ ...image, index })}
                  title="Otwórz większy podgląd zdjęcia"
                  className="block w-full text-left outline-none transition focus:ring-4 focus:ring-violet-300/50"
                >
                  <img src={image.dataUrl} alt={image.name || `${draft.title || "Zdjęcie"} ${index + 1}`} className="h-24 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2 text-white">
                    <p className="truncate text-[10px] font-black">{image.name || `Zdjęcie ${index + 1}`}</p>
                  </div>
                  <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-xl bg-slate-950/65 px-2 py-1 text-[9px] font-black text-white opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100">
                    Powiększ
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); onRemoveImage(imageId); }}
                  title="Usuń zdjęcie"
                  className="absolute right-1.5 top-1.5 rounded-xl bg-slate-950/70 p-1.5 text-white opacity-90 shadow-lg backdrop-blur transition hover:bg-rose-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={cx("flex min-h-24 items-center justify-center rounded-2xl border border-dashed text-xs font-bold", t.border, t.textMuted)}>
          Brak zdjęć
        </div>
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div
            className={cx("fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-md", t.overlay)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setPreviewImage(null)}
          >
            <motion.div
              className={cx("grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border shadow-2xl lg:grid-cols-[1fr_280px]", t.modal)}
              initial={{ scale: 0.96, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 18, opacity: 0 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex min-h-[52vh] items-center justify-center bg-slate-950/90 p-3">
                <img src={previewImage.dataUrl} alt={previewImage.name || draft.title || "Podgląd zdjęcia"} className="max-h-[82vh] w-full rounded-2xl object-contain" />
              </div>
              <aside className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}><ImageIcon size={14} /> Podgląd zdjęcia</div>
                    <h3 className="text-xl font-black leading-tight">{draft.title || "Nowa karta"}</h3>
                  </div>
                  <button type="button" onClick={() => setPreviewImage(null)} className={cx("shrink-0 rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}><X /></button>
                </div>
                <div className="grid gap-2 text-xs font-black">
                  <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Zdjęcie: {(previewImage.index || 0) + 1}/{images.length}</span>
                  <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Plik: {previewImage.name || "bez nazwy"}</span>
                  <span className={cx("rounded-2xl px-3 py-2 ring-1", t.chip)}>Rozmiar: {previewImage.width || "?"}×{previewImage.height || "?"}</span>
                </div>
                <p className={cx("text-sm leading-6", t.textMuted)}>Podgląd służy tylko do wygodnego sprawdzenia obrazu. Zdjęcie pozostaje przypisane do edytowanej karty.</p>
                <button type="button" onClick={() => setPreviewImage(null)} className={cx("mt-auto inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5", t.buttonPrimary)}>
                  Zamknij podgląd
                </button>
              </aside>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function EditLabels({ t, isDark, draft, onAdd, onUpdate, onRemove }) {
  const labelSet = isDark ? labelThemesDark : labelThemes;
  const swatchSet = isDark ? labelSwatchesDark : labelSwatches;
  const colors = Object.keys(labelSet);
  return (
    <section className={cx("rounded-2xl border p-3", t.buttonSoft)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cx("flex h-8 w-8 items-center justify-center rounded-xl", t.chip)}><Sparkles size={16} /></span>
          <h3 className="text-sm font-black">Etykiety</h3>
        </div>
        <button type="button" onClick={onAdd} title="Dodaj etykietę" className={cx("inline-flex items-center justify-center rounded-xl p-2 shadow-sm ring-1 transition hover:-translate-y-0.5", t.chip)}><Plus size={16} /></button>
      </div>
      <div className="grid gap-2">
        {(draft.labels || []).length === 0 && <p className={cx("rounded-2xl border border-dashed p-3 text-xs font-semibold", t.border, t.textMuted)}>Brak etykiet.</p>}
        {(draft.labels || []).map((label) => (
          <div key={label.id} className="grid grid-cols-[1fr_auto] items-center gap-2">
            <input
              value={label.text}
              onChange={(event) => onUpdate(label.id, { text: event.target.value })}
              placeholder="Etykieta"
              className={cx("rounded-xl border px-3 py-2 text-xs font-bold outline-none ring-pink-300 transition focus:ring-4", t.inputSolid)}
            />
            <button type="button" onClick={() => onRemove(label.id)} title="Usuń etykietę" className={cx("rounded-xl p-2 transition", t.iconDanger)}><Trash2 size={16} /></button>
            <div className="col-span-2 flex flex-wrap gap-1.5">
              {colors.map((color) => {
                const isSelected = label.color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onUpdate(label.id, { color })}
                    aria-label={`Kolor ${color}`}
                    title={color}
                    className={cx(
                      "relative h-7 w-7 rounded-full text-[0px] shadow-lg ring-2 transition hover:scale-110 hover:brightness-110",
                      swatchSet[color],
                      isSelected ? (isDark ? "ring-white scale-110" : "ring-slate-950 scale-110") : "ring-white/70 opacity-95"
                    )}
                  >
                    {color}
                    {isSelected && <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-white shadow ring-1 ring-slate-900/10" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EditSubtasks({ t, draft, onAdd, onUpdate, onRemove }) {
  return (
    <section className={cx("rounded-2xl border p-3", t.buttonSoft)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cx("flex h-8 w-8 items-center justify-center rounded-xl", t.chip)}><CheckSquare2 size={16} /></span>
          <div>
            <h3 className="text-sm font-black">Subtaski</h3>
            <p className={cx("text-[10px] font-semibold", t.textSoft)}>{(draft.subtasks || []).filter((item) => item.done).length}/{(draft.subtasks || []).length} gotowe</p>
          </div>
        </div>
        <button type="button" onClick={onAdd} title="Dodaj subtask" className={cx("inline-flex items-center justify-center rounded-xl p-2 shadow-sm ring-1 transition hover:-translate-y-0.5", t.chip)}><Plus size={16} /></button>
      </div>
      <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
        {(draft.subtasks || []).length === 0 && <p className={cx("rounded-2xl border border-dashed p-3 text-xs font-semibold", t.border, t.textMuted)}>Brak subtasków.</p>}
        {(draft.subtasks || []).map((item) => (
          <div key={item.id} className={cx("grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border p-2", t.border)}>
            <button type="button" onClick={() => onUpdate(item.id, { done: !item.done })} title={item.done ? "Oznacz jako niegotowe" : "Oznacz jako gotowe"} className="text-emerald-500">
              {item.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
            <input
              value={item.text}
              onChange={(event) => onUpdate(item.id, { text: event.target.value })}
              placeholder="Treść subtaska"
              className={cx("min-w-0 rounded-xl border px-3 py-2 text-xs font-semibold outline-none ring-pink-300 transition focus:ring-4", t.inputSolid, item.done && "text-slate-400 line-through")}
            />
            <button type="button" onClick={() => onRemove(item.id)} title="Usuń subtask" className={cx("rounded-xl p-2 transition", t.iconDanger)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
