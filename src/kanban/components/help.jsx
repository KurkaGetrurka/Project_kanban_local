import React, { useState } from "react";
import { Activity, Archive, BookOpen, CheckSquare2, ChevronRight, Clock3, GripVertical, HardDrive, Image as ImageIcon, LayoutDashboard, Plus, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { DashboardTitle } from "./shell.jsx";
import { cx } from "../shared.jsx";

export function HelpGuide({ t, onGoToInfo, onGoToTasks, onNewTask, onOpenTimeline, onOpenPerformance, onOpenGallery, onOpenArchive }) {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const quickFlow = [
    { icon: <HardDrive size={32} />, step: "01", title: "Otwórz bazę", hint: "Na starcie wybierz istniejący plik albo utwórz nową zaszyfrowaną bazę.", gradient: "from-emerald-400 to-teal-500" },
    { icon: <Plus size={32} />, step: "02", title: "Dodaj kartę", hint: "Utwórz szybki task albo pełną kartę z opisem, terminem i zdjęciem.", gradient: "from-sky-400 to-cyan-500" },
    { icon: <GripVertical size={32} />, step: "03", title: "Pracuj na tablicy", hint: "Przesuwaj karty, ustawiaj terminy i korzystaj z filtrów zadań.", gradient: "from-violet-400 to-fuchsia-500" },
    { icon: <ShieldCheck size={32} />, step: "04", title: "Zablokuj po pracy", hint: "Panel Baza pozwala zamknąć sesję i usunąć hasło z pamięci strony.", gradient: "from-amber-400 to-orange-500" },
  ];

  const topics = [
    {
      id: "security",
      icon: <ShieldCheck size={26} />,
      title: "Bezpieczna baza",
      hint: "Plik, hasło, autosave i blokada",
      accent: "from-emerald-400 to-teal-500",
      details: {
        title: "Bezpieczna baza - praca na zaszyfrowanym pliku",
        intro: "Aplikacja może pracować na zaszyfrowanym pliku bazy. Dzięki temu dane nie muszą być przechowywane jako zwykła, czytelna kopia w przeglądarce. Hasło służy tylko do otwarcia pliku i nie jest zapisywane w aplikacji.",
        points: [
          "Po uruchomieniu aplikacji pojawia się ekran wyboru bazy: możesz otworzyć istniejący plik, utworzyć nową bazę albo zaimportować starą kopię JSON.",
          "Po otwarciu zaszyfrowanego pliku aplikacja zatrzymuje zapis do localStorage w tej sesji i zapisuje zmiany do wybranego pliku roboczego.",
          "Automatyczny zapis działa w tle po zmianach na tablicy. Gdy zapis się wykona, przycisk Baza krótko miga na zielono.",
          "Przycisk Baza w prawym dolnym rogu otwiera panel stanu bazy: widać tam aktywny plik, status zapisu, opcje eksportu, importu i blokady.",
          "Opcja Zablokuj otwartą bazę zamyka sesję plikową, usuwa hasło z pamięci strony, czyści starą kopię przeglądarkową i przeładowuje widok.",
        ],
        tip: "Najbezpieczniejszy rytm pracy to: otwórz zaszyfrowany plik na starcie, pracuj normalnie, poczekaj na zapis, a po zakończeniu użyj Baza → Zablokuj otwartą bazę.",
      },
    },
    {
      id: "dashboard",
      icon: <LayoutDashboard size={26} />,
      title: "Dashboard",
      hint: "Szybki podgląd projektu",
      accent: "from-violet-400 to-fuchsia-500",
      details: {
        title: "Dashboard - centrum informacji",
        intro: "Sekcja Informacje służy do szybkiego sprawdzenia stanu pracy bez wchodzenia w każdą kartę osobno. To miejsce najlepiej traktować jako panel kontrolny projektu.",
        points: [
          "Project Progress pokazuje ogólny udział zadań ukończonych w aktywnej pracy.",
          "Today's Tasks pozwala szybko dodać nowe zadanie z tytułem, terminem i etapem.",
          "Calendar pokazuje miesiąc oraz dni, do których przypisano zadania.",
          "Tasks Timeline daje wizualny podgląd bieżącego tygodnia i prowadzi do pełnej osi czasu.",
          "Przycisk Układ w górnym pasku pozwala zmieniać kolejność i rozmiary kafelków pulpitu.",
        ],
        tip: "Najlepiej zaczynać dzień od Dashboardu: szybko zobaczysz, co jest pilne, co utknęło i czy coś zbliża się do terminu.",
      },
    },
    {
      id: "tasks",
      icon: <CheckSquare2 size={26} />,
      title: "Karty zadań",
      hint: "Opis, etap, subtaski i zdjęcia",
      accent: "from-emerald-400 to-teal-500",
      details: {
        title: "Karty zadań - pojedyncze sprawy do wykonania",
        intro: "Każda karta reprezentuje jedno zadanie. Może mieć nazwę, opis, termin, etap, etykiety, subtaski oraz zdjęcia. Dzięki temu jedna karta może przechowywać zarówno prostą notatkę, jak i pełniejszy opis sprawy.",
        points: [
          "Kliknięcie karty otwiera okno edycji.",
          "Zmiana etapu odbywa się przez wybór w oknie edycji albo przeciągnięcie karty między kolumnami.",
          "Zakładka Zadania ma kompaktowy pasek filtrów: wyszukiwanie po treści, etykiecie, priorytecie i zakresie dat.",
          "Subtaski pomagają rozbić większe zadanie na mniejsze kroki.",
          "Zdjęcia dodane do karty pojawią się także w galerii zdjęć.",
        ],
        tip: "Dla większych spraw twórz subtaski i etykiety. Dzięki temu postęp i późniejsze filtrowanie są dużo czytelniejsze.",
      },
    },
    {
      id: "timeline",
      icon: <Clock3 size={26} />,
      title: "Timeline",
      hint: "Planowanie terminów na osi czasu",
      accent: "from-sky-400 to-blue-500",
      details: {
        title: "Timeline - planowanie w czasie",
        intro: "Timeline pokazuje zadania według ich terminów. W małej kafelce widzisz szybki podgląd aktualnego tygodnia, a po kliknięciu kafelki otwiera się szczegółowy widok osi czasu.",
        points: [
          "Możesz wybrać zakres widoku: tydzień, miesiąc, kwartał albo rok.",
          "Przeciągnięcie paska zadania w szczegółowym widoku zmienia termin w oryginalnej karcie.",
          "Podświetlenia pomagają zobaczyć, do którego dnia przypisane jest zadanie.",
          "Kolor paska odpowiada etapowi, w którym znajduje się zadanie.",
        ],
        tip: "Gdy ustawiasz termin, patrz na podświetloną datę na osi. To ona pokazuje dzień, do którego zadanie zostanie przypisane.",
      },
    },
    {
      id: "archive",
      icon: <Archive size={26} />,
      title: "Archiwum",
      hint: "Zadania zakończone, ale zachowane",
      accent: "from-amber-400 to-orange-500",
      details: {
        title: "Archiwum - bezpieczne odłożenie zadania",
        intro: "Archiwum służy do przechowywania zadań, które są zakończone albo chwilowo niepotrzebne, ale nie powinny zostać usunięte. To takie eleganckie pudełko opisane markerem, a nie czarna dziura.",
        points: [
          "Zarchiwizowane zadania znikają z głównej tablicy Kanban.",
          "Nadal są uwzględniane w raporcie postępów i galerii zdjęć.",
          "Archiwum ma wyszukiwarkę tekstową oraz filtry dat: od/do i tryb sprawdzania terminu albo daty archiwizacji.",
          "Możesz otworzyć kartę z archiwum i przywrócić ją do kolumny Gotowe.",
          "Usuwanie jest osobną akcją i oznacza trwałe skasowanie karty z aplikacji.",
        ],
        tip: "Archiwum warto stosować do spraw zakończonych, które mogą się jeszcze przydać jako historia pracy, dowód, notatka albo wzór.",
      },
    },
    {
      id: "gallery",
      icon: <ImageIcon size={26} />,
      title: "Galeria zdjęć",
      hint: "Wszystkie obrazy z tasków",
      accent: "from-pink-400 to-rose-500",
      details: {
        title: "Galeria zdjęć - szybkie odnajdywanie załączników",
        intro: "Galeria zbiera zdjęcia ze wszystkich kart, również tych z archiwum. Dzięki temu nie trzeba pamiętać, w którym zadaniu było konkretne zdjęcie.",
        points: [
          "Kliknięcie miniatury otwiera większy podgląd.",
          "Podgląd pokazuje nazwę zadania, opis, termin i nazwę pliku.",
          "Przycisk Zaprowadź mnie do tego zadania otwiera właściwą kartę.",
          "Zdjęcia są zmniejszane przy dodawaniu, aby aplikacja była lżejsza.",
        ],
        tip: "To przydatne, gdy zadania są dokumentowane zdjęciami, zrzutami ekranu albo skanami. Galeria działa jak wizualny indeks spraw.",
      },
    },
    {
      id: "backup",
      icon: <Upload size={26} />,
      title: "Eksport i import",
      hint: "Kopie zapasowe i migracja danych",
      accent: "from-violet-400 to-indigo-500",
      details: {
        title: "Eksport i import - kopie oraz odtwarzanie tablicy",
        intro: "Eksport tworzy zabezpieczony plik kopii zapasowej, a import pozwala wczytać wcześniej zapisaną bazę. Stare pliki JSON mogą być użyte do migracji, ale bieżące kopie powinny być zapisywane jako pliki szyfrowane.",
        points: [
          "Eksport kopii tworzy zaszyfrowany plik zabezpieczony hasłem.",
          "Import rozpoznaje zarówno zaszyfrowany plik bazy, jak i starszą kopię JSON.",
          "Przy zaszyfrowanym pliku trzeba podać hasło, zanim aplikacja pokaże podgląd i odblokuje wczytanie.",
          "Wczytanie importu zastępuje aktualną zawartość tablicy, dlatego warto upewnić się, że wybrany plik jest właściwy.",
          "Po imporcie starego JSON najlepiej od razu zapisać dane jako nową zaszyfrowaną bazę plikową.",
        ],
        tip: "Do codziennej pracy używaj zaszyfrowanego pliku bazy. Eksport traktuj jako dodatkową kopię przed większymi zmianami albo przeniesieniem danych.",
      },
    },
    {
      id: "report",
      icon: <Activity size={26} />,
      title: "Raport",
      hint: "Postęp i wydajność pracy",
      accent: "from-cyan-400 to-violet-500",
      details: {
        title: "Raport postępów - liczby bez ręcznego liczenia",
        intro: "Raport zbiera dane z całej aplikacji: zadań aktywnych, ukończonych i archiwalnych. Pokazuje nie tylko liczbę kart, ale też postęp subtasków, rozkład po etapach oraz zadania po terminie.",
        points: [
          "Wszystkie karty obejmują także archiwum.",
          "Ukończenie liczone jest na podstawie kolumny Gotowe oraz postępu subtasków.",
          "Po terminie oznacza aktywne zadania z datą wcześniejszą niż dzisiaj.",
          "Rozkład po etapach pokazuje, gdzie gromadzi się najwięcej pracy.",
        ],
        tip: "Raport pomaga zobaczyć, czy projekt idzie płynnie, czy zadania zaczynają kumulować się w jednym etapie.",
      },
    },
  ];

  const navigationCards = [
    { icon: <LayoutDashboard size={28} />, title: "Dashboard", hint: "Postęp, kalendarz i panel sterowania", action: onGoToInfo, accent: "from-violet-400 to-fuchsia-500", tag: "Informacje" },
    { icon: <Plus size={28} />, title: "Nowe zadanie", hint: "Otwiera pełną kartę edycji zadania", action: onNewTask, accent: "from-sky-400 to-cyan-500", tag: "Start" },
    { icon: <CheckSquare2 size={28} />, title: "Tablica zadań", hint: "Kolumny Kanban i przesuwanie kart", action: onGoToTasks, accent: "from-emerald-400 to-teal-500", tag: "Zadania" },
    { icon: <Clock3 size={28} />, title: "Timeline", hint: "Szczegółowy widok terminów", action: onOpenTimeline, accent: "from-blue-400 to-sky-500", tag: "Plan" },
    { icon: <Activity size={28} />, title: "Raport", hint: "Postęp, wydajność i archiwum", action: onOpenPerformance, accent: "from-cyan-400 to-violet-500", tag: "Analiza" },
    { icon: <ImageIcon size={28} />, title: "Galeria", hint: "Zdjęcia ze wszystkich tasków", action: onOpenGallery, accent: "from-pink-400 to-rose-500", tag: "Zdjęcia" },
    { icon: <Archive size={28} />, title: "Archiwum", hint: "Zadania odłożone, ale zachowane", action: onOpenArchive, accent: "from-amber-400 to-orange-500", tag: "Historia" },
  ];

  return (
    <motion.section key="help-section" className="grid gap-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
      <div className={cx("rounded-[2rem] border p-5 shadow-xl backdrop-blur-xl", t.card)}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}>
              <BookOpen size={14} /> Instrukcja obsługi
            </div>
            <h2 className="text-2xl font-black">Szybki przewodnik po aplikacji</h2>
            <p className={cx("mt-1 max-w-2xl text-sm leading-6", t.textMuted)}>
              Najważniejsze działania są pokazane skrótowo. Szczegółowy opis znajdziesz po kliknięciu wybranej kafelki - uwzględnia też bezpieczną bazę, autosave, import, eksport, filtry zadań i archiwum.
            </p>
          </div>

          <div className={cx("flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ring-1", t.chip)}>
            <Sparkles size={15} /> kliknij kafelkę, żeby rozwinąć
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {quickFlow.map((item, index) => (
            <div key={item.step} className="relative">
              {index > 0 && <ChevronRight className="absolute -left-5 top-1/2 z-10 hidden -translate-y-1/2 text-sky-400 md:block" size={22} />}
              <div className={cx("h-full rounded-3xl border p-4 text-center shadow-lg", t.cardSolid)}>
                <div className={cx("mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-lg", item.gradient)}>{item.icon}</div>
                <div className={cx("mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black", t.buttonPrimary)}>{item.step}</div>
                <h3 className="text-base font-black">{item.title}</h3>
                <p className={cx("mt-1 text-xs font-semibold leading-5", t.textSoft)}>{item.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className={cx("rounded-[2rem] border p-5 shadow-xl backdrop-blur-xl", t.card)}>
          <DashboardTitle t={t} icon={<Sparkles size={12} />} eyebrow="Moduły" title="Kliknij, aby zobaczyć szczegóły" />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <button key={topic.id} type="button" onClick={() => setSelectedTopic(topic)} className={cx("group rounded-3xl border p-4 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl", t.cardSolid)}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className={cx("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition group-hover:scale-105", topic.accent)}>{topic.icon}</span>
                  <span className={cx("rounded-full px-2.5 py-1 text-[10px] font-black ring-1", t.chip)}>więcej</span>
                </div>
                <h3 className="text-base font-black">{topic.title}</h3>
                <p className={cx("mt-1 text-xs font-semibold leading-5", t.textSoft)}>{topic.hint}</p>
              </button>
            ))}
          </div>
        </section>

        <section className={cx("rounded-[2rem] border p-5 shadow-xl backdrop-blur-xl", t.card)}>
          <DashboardTitle t={t} icon={<LayoutDashboard size={12} />} eyebrow="Skróty" title="Najbardziej użyteczne miejsca" />

          <div className="grid gap-3">
            {navigationCards.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={item.action}
                className={cx("group rounded-3xl border p-3 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl", t.cardSolid)}
              >
                <div className="flex items-center gap-3">
                  <span className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition group-hover:scale-105", item.accent)}>{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="truncate text-sm font-black">{item.title}</h3>
                      <span className={cx("rounded-full px-2 py-0.5 text-[9px] font-black ring-1", t.chip)}>{item.tag}</span>
                    </div>
                    <p className={cx("text-xs font-semibold leading-5", t.textSoft)}>{item.hint}</p>
                  </div>
                  <ChevronRight size={20} className={cx("shrink-0 transition group-hover:translate-x-1", t.textSoft)} />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <HelpDetailModal t={t} topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
    </motion.section>
  );
}

export function HelpDetailModal({ t, topic, onClose }) {
  return (
    <AnimatePresence>
      {topic && (
        <motion.div className={cx("fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm", t.overlay)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            className={cx("max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border p-5 shadow-2xl sm:p-6", t.modal)}
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className={cx("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", topic.accent)}>{topic.icon}</span>
                <div>
                  <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}>
                    <BookOpen size={14} /> Szczegóły
                  </div>
                  <h2 className="text-2xl font-black leading-tight">{topic.details.title}</h2>
                </div>
              </div>

              <button type="button" onClick={onClose} className={cx("shrink-0 rounded-2xl p-2 transition", t.hoverSoft, t.textMuted)}>
                <X />
              </button>
            </div>

            <p className={cx("rounded-3xl border p-4 text-sm leading-7", t.cardSolid, t.textMuted)}>{topic.details.intro}</p>

            <div className="mt-4 grid gap-3">
              {topic.details.points.map((point, index) => (
                <div key={point} className={cx("flex gap-3 rounded-2xl border p-3", t.buttonSoft)}>
                  <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black", t.buttonPrimary)}>{index + 1}</span>
                  <p className="text-sm font-semibold leading-6">{point}</p>
                </div>
              ))}
            </div>

            <div className={cx("mt-4 rounded-3xl border p-4", t.cardSolid)}>
              <div className="mb-2 flex items-center gap-2 text-sm font-black">
                <Sparkles size={16} /> Dobra praktyka
              </div>
              <p className={cx("text-sm leading-7", t.textMuted)}>{topic.details.tip}</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button type="button" onClick={onClose} className={cx("rounded-2xl px-4 py-2.5 text-xs font-black shadow-lg transition hover:-translate-y-0.5", t.buttonPrimary)}>
                Rozumiem
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
