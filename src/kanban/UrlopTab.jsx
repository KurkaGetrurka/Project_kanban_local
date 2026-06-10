import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "kanban_urlop_tab_v1";
const WEDNESDAY_EXIT_TYPE = "wednesdayExit";
const WEDNESDAY_EXIT_LIMIT_HOURS = 8;

const defaultSettings = {
  year: new Date().getFullYear(),
  annualDays: 20,
  dailyHours: 8,
  carriedHours: 0,
};

const entryTypes = {
  vacation: {
    label: "Urlop wypoczynkowy",
    dotClass: "bg-sky-500",
    calendarClass:
      "bg-sky-100 text-sky-800 ring-1 ring-sky-300/70 shadow-sm dark:bg-sky-950/50 dark:text-sky-100 dark:ring-sky-500/35",
    badgeClass:
      "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200",
    defaultSubtract: true,
  },
  planned: {
    label: "Urlop planowany",
    dotClass: "bg-violet-500",
    calendarClass:
      "bg-violet-100 text-violet-800 ring-1 ring-violet-300/70 shadow-sm dark:bg-violet-950/50 dark:text-violet-100 dark:ring-violet-500/35",
    badgeClass:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200",
    defaultSubtract: true,
  },
  hours: {
    label: "Urlop godzinowy",
    dotClass: "bg-amber-500",
    calendarClass:
      "bg-amber-100 text-amber-800 ring-1 ring-amber-300/70 shadow-sm dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-500/35",
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
    defaultSubtract: true,
  },
  wednesdayExit: {
    label: "Wyjście środowe",
    dotClass: "bg-fuchsia-500",
    calendarClass:
      "bg-fuchsia-100 text-fuchsia-800 ring-1 ring-fuchsia-300/70 shadow-sm dark:bg-fuchsia-950/50 dark:text-fuchsia-100 dark:ring-fuchsia-500/35",
    badgeClass:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-200",
    defaultSubtract: true,
  },
  custom: {
    label: "Własny wpis",
    dotClass: "bg-emerald-500",
    calendarClass:
      "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/70 shadow-sm dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-500/35",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200",
    defaultSubtract: false,
  },
};

const weekDays = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"];

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `leave-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toNumber(value) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey) {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function getMonthLabel(date) {
  return date.toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });
}

function getCalendarDays(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayIndexMonday = (firstDayOfMonth.getDay() + 6) % 7;
  const calendarStart = addDays(firstDayOfMonth, -firstDayIndexMonday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(calendarStart, index);

    return {
      date,
      key: toDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: toDateKey(date) === toDateKey(new Date()),
    };
  });
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isWednesday(date) {
  return date.getDay() === 3;
}

function getDateKeysInRange(
  startKey,
  endKey,
  skipWeekends = false,
  onlyWednesdays = false
) {
  if (!startKey || !endKey) return [];

  const startDate = fromDateKey(startKey);
  const endDate = fromDateKey(endKey);
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return [];

  const from = startTime <= endTime ? startDate : endDate;
  const to = startTime <= endTime ? endDate : startDate;
  const keys = [];

  for (let cursor = new Date(from); cursor <= to; cursor = addDays(cursor, 1)) {
    if (onlyWednesdays && !isWednesday(cursor)) continue;
    if (!onlyWednesdays && skipWeekends && isWeekend(cursor)) continue;

    keys.push(toDateKey(cursor));
  }

  return keys;
}

function splitHours(totalHours, dailyHours) {
  const safeDailyHours = Math.max(toNumber(dailyHours), 1);
  const safeTotal = Math.max(toNumber(totalHours), 0);

  const days = Math.floor(safeTotal / safeDailyHours);
  const hours = Number((safeTotal - days * safeDailyHours).toFixed(2));

  return { days, hours };
}

function formatDaysAndHours(totalHours, dailyHours) {
  const { days, hours } = splitHours(totalHours, dailyHours);

  if (days === 0 && hours === 0) return "0 dni / 0 h";
  if (days === 0) return `${hours} h`;
  if (hours === 0) return `${days} dni`;

  return `${days} dni i ${hours} h`;
}

function formatDatePl(dateKey) {
  return fromDateKey(dateKey).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getEntryHours(entry, dailyHours) {
  return toNumber(entry.days) * dailyHours + toNumber(entry.hours);
}

function getPrimaryEntry(dayEntries) {
  return dayEntries.find((entry) => entry.subtractFromLimit) || dayEntries[0];
}

export default function UrlopTab() {
  const todayKey = toDateKey(new Date());

  const [settings, setSettings] = useState(defaultSettings);
  const [entries, setEntries] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const [form, setForm] = useState({
    mode: "single",
    type: "vacation",
    label: "",
    days: "1",
    hours: "",
    startDate: todayKey,
    endDate: todayKey,
    skipWeekends: true,
    onlyWednesdays: true,
    subtractFromLimit: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      setSettings({
        ...defaultSettings,
        ...(parsed.settings || {}),
      });

      setEntries(Array.isArray(parsed.entries) ? parsed.entries : []);
    } catch {
      setSettings(defaultSettings);
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        settings,
        entries,
      })
    );
  }, [settings, entries]);

  const dailyHours = Math.max(toNumber(settings.dailyHours), 1);

  const summary = useMemo(() => {
    const annualDays = Math.max(toNumber(settings.annualDays), 0);
    const carriedHours = Math.max(toNumber(settings.carriedHours), 0);

    const totalHours = annualDays * dailyHours + carriedHours;

    const usedHours = entries
      .filter((entry) => entry.subtractFromLimit)
      .reduce((sum, entry) => sum + getEntryHours(entry, dailyHours), 0);

    const remainingHours = Math.max(totalHours - usedHours, 0);
    const overLimitHours = Math.max(usedHours - totalHours, 0);

    return {
      annualDays,
      totalHours,
      usedHours,
      remainingHours,
      overLimitHours,
    };
  }, [entries, settings, dailyHours]);

  const wednesdayExitSummary = useMemo(() => {
    const allEntries = entries.filter(
      (entry) => entry.type === WEDNESDAY_EXIT_TYPE
    );

    const openEntries = allEntries.filter((entry) => !entry.settledAt);
    const settledEntries = allEntries.filter((entry) => entry.settledAt);

    const openHours = openEntries.reduce(
      (sum, entry) => sum + getEntryHours(entry, dailyHours),
      0
    );

    const settledHours = settledEntries.reduce(
      (sum, entry) => sum + getEntryHours(entry, dailyHours),
      0
    );

    const progressPercent = Math.min(
      (openHours / WEDNESDAY_EXIT_LIMIT_HOURS) * 100,
      100
    );

    return {
      allEntries,
      openEntries,
      settledEntries,
      openHours,
      settledHours,
      remainingHours: Math.max(WEDNESDAY_EXIT_LIMIT_HOURS - openHours, 0),
      overHours: Math.max(openHours - WEDNESDAY_EXIT_LIMIT_HOURS, 0),
      progressPercent,
      isReady: openHours >= WEDNESDAY_EXIT_LIMIT_HOURS,
    };
  }, [entries, dailyHours]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const entriesByDate = useMemo(() => {
    return entries.reduce((acc, entry) => {
      if (!acc[entry.date]) acc[entry.date] = [];
      acc[entry.date].push(entry);
      return acc;
    }, {});
  }, [entries]);

  const selectedEntries = entriesByDate[selectedDate] || [];

  const targetDateKeys = useMemo(() => {
    if (form.mode === "range") {
      const onlyWednesdays =
        form.type === WEDNESDAY_EXIT_TYPE && form.onlyWednesdays;

      return getDateKeysInRange(
        form.startDate,
        form.endDate,
        form.skipWeekends,
        onlyWednesdays
      );
    }

    return [form.startDate || selectedDate].filter(Boolean);
  }, [
    form.mode,
    form.startDate,
    form.endDate,
    form.skipWeekends,
    form.onlyWednesdays,
    form.type,
    selectedDate,
  ]);

  const previewDateSet = useMemo(
    () => new Set(form.mode === "range" ? targetDateKeys : []),
    [form.mode, targetDateKeys]
  );

  function updateSettings(field, value) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function changeMode(mode) {
    setForm((prev) => ({
      ...prev,
      mode,
      startDate: prev.startDate || selectedDate,
      endDate:
        mode === "single"
          ? prev.startDate || selectedDate
          : prev.endDate || prev.startDate || selectedDate,
    }));
  }

  function changeFormDate(field, value) {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (prev.mode === "single") {
        next.startDate = value;
        next.endDate = value;
      }

      return next;
    });

    if (value) {
      const date = fromDateKey(value);
      setSelectedDate(value);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  function selectCalendarDay(dateKey) {
    setSelectedDate(dateKey);

    setForm((prev) => {
      if (prev.mode === "single") {
        return {
          ...prev,
          startDate: dateKey,
          endDate: dateKey,
        };
      }

      return prev;
    });
  }

  function changeType(type) {
    const typeConfig = entryTypes[type] || entryTypes.custom;
    const isWednesdayExit = type === WEDNESDAY_EXIT_TYPE;

    setForm((prev) => ({
      ...prev,
      type,
      label: type === "custom" ? prev.label : "",
      subtractFromLimit: isWednesdayExit ? true : typeConfig.defaultSubtract,
      days: type === "hours" || isWednesdayExit ? "" : prev.days || "1",
      hours: prev.hours,
      onlyWednesdays: isWednesdayExit ? true : prev.onlyWednesdays,
    }));
  }

  function previousMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }

  function goToToday() {
    const today = new Date();
    const todayDateKey = toDateKey(today);

    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayDateKey);
    setForm((prev) => ({
      ...prev,
      startDate: todayDateKey,
      endDate: prev.mode === "single" ? todayDateKey : prev.endDate,
    }));
  }

  function addEntry(event) {
    event.preventDefault();

    const days = Math.max(toNumber(form.days), 0);
    const hours = Math.max(toNumber(form.hours), 0);

    if (days === 0 && hours === 0) {
      return;
    }

    const datesToAdd =
      form.mode === "range" ? targetDateKeys : [form.startDate || selectedDate];

    if (datesToAdd.length === 0) {
      return;
    }

    const typeConfig = entryTypes[form.type] || entryTypes.custom;
    const batchId = form.mode === "range" ? makeId() : null;
    const label = form.label.trim() || typeConfig.label;
    const isWednesdayExit = form.type === WEDNESDAY_EXIT_TYPE;

    const newEntries = datesToAdd.map((dateKey) => ({
      id: makeId(),
      batchId,
      date: dateKey,
      type: form.type,
      label,
      days,
      hours,
      subtractFromLimit: isWednesdayExit ? true : Boolean(form.subtractFromLimit),
      createdAt: new Date().toISOString(),
    }));

    setEntries((prev) =>
      [...prev, ...newEntries].sort((a, b) => a.date.localeCompare(b.date))
    );

    const firstDate = datesToAdd[0];
    const firstDateObject = fromDateKey(firstDate);

    setSelectedDate(firstDate);
    setCurrentMonth(
      new Date(firstDateObject.getFullYear(), firstDateObject.getMonth(), 1)
    );

    setForm((prev) => ({
      ...prev,
      label: "",
      days:
        form.type === "hours" || form.type === WEDNESDAY_EXIT_TYPE ? "" : "1",
      hours: "",
    }));
  }

  function deleteEntry(entryId) {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  }

  function clearAllEntries() {
    const confirmed = window.confirm(
      "Czy na pewno usunąć wszystkie wpisy urlopowe?"
    );

    if (!confirmed) return;

    setEntries([]);
  }

  function settleWednesdayExitPeriod(skipConfirm = false) {
    if (wednesdayExitSummary.openEntries.length === 0) return;

    const confirmed =
      skipConfirm ||
      window.confirm(
        "Czy zamknąć obecny okres wyjść środowych? Licznik 8 h wyzeruje się, ale wpisy nadal będą odejmowane od urlopu."
      );

    if (!confirmed) return;

    const closeId = makeId();
    const settledAt = new Date().toISOString();
    const entryIds = new Set(
      wednesdayExitSummary.openEntries.map((entry) => entry.id)
    );

    setEntries((prev) =>
      prev.map((entry) =>
        entryIds.has(entry.id)
          ? {
              ...entry,
              settled: true,
              settledAt,
              settlementId: closeId,
            }
          : entry
      )
    );
  }

  function printWednesdayReport() {
    const reportEntries = wednesdayExitSummary.openEntries;

    if (reportEntries.length === 0) {
      window.alert("Brak nierozliczonych wyjść środowych do wydruku.");
      return;
    }

    const rows = reportEntries
      .map((entry) => {
        const hours = getEntryHours(entry, dailyHours);

        return `
          <tr>
            <td>${escapeHtml(formatDatePl(entry.date))}</td>
            <td>${escapeHtml(entry.label)}</td>
            <td>${escapeHtml(entry.days || 0)} dni</td>
            <td>${escapeHtml(entry.hours || 0)} h</td>
            <td>${escapeHtml(formatDaysAndHours(hours, dailyHours))}</td>
          </tr>
        `;
      })
      .join("");

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      window.alert("Nie udało się otworzyć okna wydruku. Sprawdź blokowanie wyskakujących okien.");
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="pl">
        <head>
          <meta charset="utf-8" />
          <title>Raport wyjść środowych</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #0f172a;
              margin: 32px;
            }
            h1 {
              margin: 0 0 6px;
              font-size: 24px;
            }
            p {
              margin: 4px 0;
            }
            .summary {
              margin: 18px 0;
              padding: 14px;
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              background: #f8fafc;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 18px;
            }
            th,
            td {
              border: 1px solid #cbd5e1;
              padding: 8px;
              text-align: left;
              font-size: 13px;
            }
            th {
              background: #f1f5f9;
            }
            .signature {
              margin-top: 44px;
              display: flex;
              gap: 48px;
            }
            .signature div {
              flex: 1;
              border-top: 1px solid #0f172a;
              padding-top: 8px;
              text-align: center;
              font-size: 12px;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Raport wyjść środowych</h1>
          <p>Data wydruku: ${escapeHtml(new Date().toLocaleString("pl-PL"))}</p>

          <div class="summary">
            <p><strong>Liczba wpisów:</strong> ${reportEntries.length}</p>
            <p><strong>Suma:</strong> ${escapeHtml(
              formatDaysAndHours(wednesdayExitSummary.openHours, dailyHours)
            )}</p>
            <p><strong>Limit okresu:</strong> ${WEDNESDAY_EXIT_LIMIT_HOURS} h</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Opis</th>
                <th>Dni</th>
                <th>Godziny</th>
                <th>Razem</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="signature">
            <div>Podpis pracownika</div>
            <div>Podpis przełożonego</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

    const shouldSettle = window.confirm(
      "Czy po wydrukowaniu zamknąć okres i wyzerować licznik wyjść środowych? Wpisy nadal będą odejmowane od urlopu."
    );

    if (shouldSettle) {
      settleWednesdayExitPeriod(true);
    }
  }

  const pageCard =
    "rounded-3xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70";

  const smallCard =
    "rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70";

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950";

  const buttonGhost =
    "rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";

  const buttonPrimary =
    "rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600";

  return (
    <section className="space-y-4">
      <div className={pageCard}>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">
            Urlop
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Kalendarz urlopowy
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Osobny kalendarz do urlopu i własnych wpisów. Taski z Kanbana nie są
            tutaj zaciągane.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className={smallCard}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Limit urlopu
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
            {summary.annualDays} dni
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {summary.totalHours} h łącznie
          </p>
        </div>

        <div className={smallCard}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Wykorzystano
          </p>

          <p className="mt-1 text-2xl font-bold text-rose-500">
            {formatDaysAndHours(summary.usedHours, dailyHours)}
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {summary.usedHours} h
          </p>
        </div>

        <div className={smallCard}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Pozostało
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-500">
            {formatDaysAndHours(summary.remainingHours, dailyHours)}
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {summary.remainingHours} h
          </p>
        </div>

        <div className={smallCard}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Poza limitem
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-500">
            {formatDaysAndHours(summary.overLimitHours, dailyHours)}
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            gdy wykorzystasz za dużo
          </p>
        </div>
      </div>

      <div className={smallCard}>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Wyjścia środowe
              </h3>

              {wednesdayExitSummary.isReady && (
                <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-200">
                  Uzbierało się 8 h
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ten licznik dotyczy tylko nierozliczonych wyjść środowych. Same
              wpisy nadal odejmują się od urlopu nawet po zamknięciu okresu.
            </p>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {wednesdayExitSummary.openHours} h / {WEDNESDAY_EXIT_LIMIT_HOURS} h
                </span>

                {wednesdayExitSummary.overHours > 0 ? (
                  <span className="font-semibold text-amber-500">
                    Nadwyżka: {wednesdayExitSummary.overHours} h
                  </span>
                ) : (
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    Pozostało: {wednesdayExitSummary.remainingHours} h
                  </span>
                )}
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-fuchsia-500 transition-all"
                  style={{ width: `${wednesdayExitSummary.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button
              type="button"
              onClick={printWednesdayReport}
              disabled={wednesdayExitSummary.openEntries.length === 0}
              className={[
                buttonPrimary,
                wednesdayExitSummary.openEntries.length === 0
                  ? "cursor-not-allowed opacity-50"
                  : "",
              ].join(" ")}
            >
              Drukuj raport
            </button>

            <button
              type="button"
              onClick={() => settleWednesdayExitPeriod()}
              disabled={wednesdayExitSummary.openEntries.length === 0}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                wednesdayExitSummary.openEntries.length === 0
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                  : "bg-fuchsia-500 text-white shadow-sm hover:bg-fuchsia-600",
              ].join(" ")}
            >
              Zamknij okres
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className={smallCard}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  Kalendarz
                </h3>

                <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
                  {getMonthLabel(currentMonth)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={previousMonth}
                  className={buttonGhost}
                  aria-label="Poprzedni miesiąc"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={goToToday}
                  className={buttonGhost}
                >
                  Dziś
                </button>

                <button
                  type="button"
                  onClick={nextMonth}
                  className={buttonGhost}
                  aria-label="Następny miesiąc"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day) => {
                const dayEntries = entriesByDate[day.key] || [];
                const primaryEntry = getPrimaryEntry(dayEntries);
                const typeConfig = primaryEntry
                  ? entryTypes[primaryEntry.type] || entryTypes.custom
                  : null;
                const isSelected = day.key === selectedDate;
                const isPreview = previewDateSet.has(day.key);

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => selectCalendarDay(day.key)}
                    className={[
                      "relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-semibold transition hover:-translate-y-0.5",
                      day.isCurrentMonth
                        ? "text-slate-800 dark:text-slate-100"
                        : "text-slate-300 opacity-60 dark:text-slate-700",
                      isSelected
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-200 dark:ring-sky-700"
                        : dayEntries.length > 0
                          ? typeConfig.calendarClass
                          : isPreview
                            ? "bg-sky-50 text-sky-700 ring-2 ring-dashed ring-sky-300/80 dark:bg-sky-950/30 dark:text-sky-100 dark:ring-sky-500/50"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800/80",
                      day.isToday && !isSelected && dayEntries.length === 0 && !isPreview
                        ? "ring-2 ring-sky-300 dark:ring-sky-700"
                        : "",
                    ].join(" ")}
                  >
                    <span>{day.dayNumber}</span>

                    {dayEntries.length > 0 && (
                      <span className="absolute bottom-1 flex max-w-[34px] gap-0.5 overflow-hidden">
                        {dayEntries.slice(0, 3).map((entry) => {
                          const entryTypeConfig =
                            entryTypes[entry.type] || entryTypes.custom;

                          return (
                            <span
                              key={entry.id}
                              className={[
                                "h-1.5 w-1.5 rounded-full",
                                isSelected ? "bg-white" : entryTypeConfig.dotClass,
                              ].join(" ")}
                            />
                          );
                        })}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={smallCard}>
            <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-50">
              Ustawienia
            </h3>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                  Rok
                </span>

                <input
                  className={inputClass}
                  type="number"
                  value={settings.year}
                  onChange={(event) =>
                    updateSettings("year", event.target.value)
                  }
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                  Roczny limit urlopu w dniach
                </span>

                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.5"
                  value={settings.annualDays}
                  onChange={(event) =>
                    updateSettings("annualDays", event.target.value)
                  }
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                  Ile godzin ma jeden dzień urlopu?
                </span>

                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  step="0.25"
                  value={settings.dailyHours}
                  onChange={(event) =>
                    updateSettings("dailyHours", event.target.value)
                  }
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                  Przeniesione godziny z poprzedniego roku
                </span>

                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.25"
                  value={settings.carriedHours}
                  onChange={(event) =>
                    updateSettings("carriedHours", event.target.value)
                  }
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={smallCard}>
            <div className="mb-4 flex flex-col gap-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Wybrany dzień
              </p>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                {formatDatePl(selectedDate)}
              </h3>
            </div>

            <form onSubmit={addEntry} className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => changeMode("single")}
                  className={[
                    "rounded-2xl border px-3 py-2 text-sm font-bold transition",
                    form.mode === "single"
                      ? "border-sky-300 bg-sky-500 text-white shadow-sm"
                      : "border-slate-200 bg-white/60 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:bg-slate-900",
                  ].join(" ")}
                >
                  Jeden dzień
                </button>

                <button
                  type="button"
                  onClick={() => changeMode("range")}
                  className={[
                    "rounded-2xl border px-3 py-2 text-sm font-bold transition",
                    form.mode === "range"
                      ? "border-sky-300 bg-sky-500 text-white shadow-sm"
                      : "border-slate-200 bg-white/60 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:bg-slate-900",
                  ].join(" ")}
                >
                  Zakres dat
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {form.mode === "single" ? (
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                      Data wpisu
                    </span>

                    <input
                      className={inputClass}
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        changeFormDate("startDate", event.target.value)
                      }
                    />
                  </label>
                ) : (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                        Data od
                      </span>

                      <input
                        className={inputClass}
                        type="date"
                        value={form.startDate}
                        onChange={(event) =>
                          changeFormDate("startDate", event.target.value)
                        }
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                        Data do
                      </span>

                      <input
                        className={inputClass}
                        type="date"
                        value={form.endDate}
                        onChange={(event) =>
                          changeFormDate("endDate", event.target.value)
                        }
                      />
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                    Typ wpisu
                  </span>

                  <select
                    className={inputClass}
                    value={form.type}
                    onChange={(event) => changeType(event.target.value)}
                  >
                    {Object.entries(entryTypes).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                    Opis
                  </span>

                  <input
                    className={inputClass}
                    type="text"
                    placeholder="np. Urlop, lekarz, odbiór godzin"
                    value={form.label}
                    onChange={(event) =>
                      updateForm("label", event.target.value)
                    }
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                    Dni na każdy wpisany dzień
                  </span>

                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={form.days}
                    onChange={(event) => updateForm("days", event.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                    Godziny na każdy wpisany dzień
                  </span>

                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.25"
                    placeholder="0"
                    value={form.hours}
                    onChange={(event) =>
                      updateForm("hours", event.target.value)
                    }
                  />
                </label>
              </div>

              {form.mode === "range" && (
                <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3 text-sm text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200">
                  {form.type === WEDNESDAY_EXIT_TYPE ? (
                    <label className="mb-2 flex cursor-pointer items-center gap-3 font-semibold">
                      <input
                        type="checkbox"
                        checked={form.onlyWednesdays}
                        onChange={(event) =>
                          updateForm("onlyWednesdays", event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span>Dodaj tylko środy z wybranego zakresu</span>
                    </label>
                  ) : (
                    <label className="mb-2 flex cursor-pointer items-center gap-3 font-semibold">
                      <input
                        type="checkbox"
                        checked={form.skipWeekends}
                        onChange={(event) =>
                          updateForm("skipWeekends", event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span>Pomiń weekendy przy dodawaniu zakresu</span>
                    </label>
                  )}

                  <p>
                    Podgląd zakresu: <strong>{targetDateKeys.length}</strong>{" "}
                    {targetDateKeys.length === 1 ? "dzień" : "dni"}. Te daty są
                    tymczasowo podświetlone w kalendarzu.
                  </p>
                </div>
              )}

              <label
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white/60 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300",
                  form.type === WEDNESDAY_EXIT_TYPE ? "opacity-90" : "",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={
                    form.type === WEDNESDAY_EXIT_TYPE
                      ? true
                      : form.subtractFromLimit
                  }
                  disabled={form.type === WEDNESDAY_EXIT_TYPE}
                  onChange={(event) =>
                    updateForm("subtractFromLimit", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />

                <span>
                  {form.type === WEDNESDAY_EXIT_TYPE
                    ? "Wyjście środowe zawsze odejmuje się od limitu urlopu"
                    : "Odejmij ten wpis od limitu urlopu"}
                </span>
              </label>

              <button type="submit" className={buttonPrimary}>
                {form.mode === "range"
                  ? `Dodaj zakres (${targetDateKeys.length}) do kalendarza`
                  : "Dodaj wpis do kalendarza"}
              </button>
            </form>
          </div>

          <div className={smallCard}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Wpisy z wybranego dnia
              </h3>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {selectedEntries.length}
              </span>
            </div>

            {selectedEntries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Brak wpisów w tym dniu.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedEntries.map((entry) => {
                  const typeConfig = entryTypes[entry.type] || entryTypes.custom;
                  const hours = getEntryHours(entry, dailyHours);

                  return (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/40"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span
                              className={[
                                "rounded-full px-2.5 py-1 text-xs font-bold",
                                typeConfig.badgeClass,
                              ].join(" ")}
                            >
                              {typeConfig.label}
                            </span>

                            {entry.type === WEDNESDAY_EXIT_TYPE && entry.settledAt && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                rozliczone
                              </span>
                            )}

                            {!entry.subtractFromLimit && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                nie odejmuje
                              </span>
                            )}
                          </div>

                          <p className="font-semibold text-slate-900 dark:text-slate-50">
                            {entry.label}
                          </p>

                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {entry.days} dni · {entry.hours} h · razem{" "}
                            {formatDaysAndHours(hours, dailyHours)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteEntry(entry.id)}
                          className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={smallCard}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Wszystkie wpisy urlopowe
              </h3>

              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllEntries}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Wyczyść
                </button>
              )}
            </div>

            {entries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Nie ma jeszcze żadnych wpisów. Urlopowa pustynia, tylko tumbleweed
                przelatuje.
              </div>
            ) : (
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {entries.map((entry) => {
                  const typeConfig = entryTypes[entry.type] || entryTypes.custom;
                  const hours = getEntryHours(entry, dailyHours);

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        const date = fromDateKey(entry.date);
                        setSelectedDate(entry.date);
                        setCurrentMonth(
                          new Date(date.getFullYear(), date.getMonth(), 1)
                        );
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white/70 p-3 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:bg-slate-900"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-400">
                            {entry.date}
                          </p>

                          <p className="font-semibold text-slate-900 dark:text-slate-50">
                            {entry.label}
                          </p>

                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatDaysAndHours(hours, dailyHours)}
                            {entry.type === WEDNESDAY_EXIT_TYPE && entry.settledAt
                              ? " · rozliczone"
                              : ""}
                          </p>
                        </div>

                        <span
                          className={[
                            "w-fit rounded-full px-2.5 py-1 text-xs font-bold",
                            typeConfig.badgeClass,
                          ].join(" ")}
                        >
                          {typeConfig.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
