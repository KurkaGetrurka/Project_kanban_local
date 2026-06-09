import React, { useState } from "react";
import { Activity, Archive, BookOpen, CheckSquare2, ChevronRight, Clock3, GripVertical, Image as ImageIcon, LayoutDashboard, Plus, Sparkles, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { DashboardTitle } from "./shell.jsx";
import { cx } from "../shared.jsx";

export function HelpGuide({ t, onGoToInfo, onGoToTasks, onNewTask, onOpenTimeline, onOpenPerformance, onOpenGallery, onOpenArchive }) {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const quickFlow = [
    { icon: <LayoutDashboard size={32} />, step: "01", title: "Sprawd\u017a status projektu", hint: "Pulpit pokazuje post\u0119p, terminy i najbli\u017csze zadania.", gradient: "from-violet-400 to-fuchsia-500" },
    { icon: <Plus size={32} />, step: "02", title: "Dodaj kart\u0119", hint: "Utw\u00f3rz szybki task albo pe\u0142n\u0105 kart\u0119 z opisem i zdj\u0119ciem.", gradient: "from-sky-400 to-cyan-500" },
    { icon: <GripVertical size={32} />, step: "03", title: "Przesuwaj prac\u0119", hint: "Zmieniaj etap zadania przez przeci\u0105ganie kart mi\u0119dzy kolumnami.", gradient: "from-emerald-400 to-teal-500" },
    { icon: <Archive size={32} />, step: "04", title: "Porz\u0105dkuj", hint: "Gotowe sprawy przenie\u015b do archiwum zamiast od razu usuwa\u0107.", gradient: "from-amber-400 to-orange-500" },
  ];

  const topics = [
    {
      id: "dashboard",
      icon: <LayoutDashboard size={26} />,
      title: "Dashboard",
      hint: "Szybki podgl\u0105d projektu",
      accent: "from-violet-400 to-fuchsia-500",
      details: {
        title: "Dashboard - centrum informacji",
        intro: "Sekcja Informacje s\u0142u\u017cy do szybkiego sprawdzenia stanu pracy bez wchodzenia w ka\u017cd\u0105 kart\u0119 osobno. To miejsce najlepiej traktowa\u0107 jako panel kontrolny projektu.",
        points: [
          "Project Progress pokazuje og\u00f3lny udzia\u0142 zada\u0144 uko\u0144czonych w aktywnej pracy.",
          "Today's Tasks pozwala szybko doda\u0107 nowe zadanie z tytu\u0142em, terminem i etapem.",
          "Calendar pokazuje miesi\u0105c oraz dni, do kt\u00f3rych przypisano zadania.",
          "Tasks Timeline daje wizualny podgl\u0105d bie\u017c\u0105cego tygodnia i prowadzi do pe\u0142nej osi czasu.",
          "Przycisk Uk\u0142ad w g\u00f3rnym pasku pozwala zmienia\u0107 kolejno\u015b\u0107 i rozmiary kafelk\u00f3w pulpitu.",
        ],
        tip: "Najlepiej zaczyna\u0107 dzie\u0144 od Dashboardu: szybko zobaczysz, co jest pilne, co utkn\u0119\u0142o i czy co\u015b zbli\u017ca si\u0119 do terminu.",
      },
    },
    {
      id: "tasks",
      icon: <CheckSquare2 size={26} />,
      title: "Karty zada\u0144",
      hint: "Opis, etap, subtaski i zdj\u0119cia",
      accent: "from-emerald-400 to-teal-500",
      details: {
        title: "Karty zada\u0144 - pojedyncze sprawy do wykonania",
        intro: "Ka\u017cda karta reprezentuje jedno zadanie. Mo\u017ce mie\u0107 nazw\u0119, opis, termin, etap, etykiety, subtaski oraz zdj\u0119cia. Dzi\u0119ki temu jedna karta mo\u017ce przechowywa\u0107 zar\u00f3wno prost\u0105 notatk\u0119, jak i pe\u0142niejszy opis sprawy.",
        points: [
          "Klikni\u0119cie karty otwiera okno edycji.",
          "Zmiana etapu odbywa si\u0119 przez wyb\u00f3r w oknie edycji albo przeci\u0105gni\u0119cie karty mi\u0119dzy kolumnami.",
          "Zak\u0142adka Zadania ma kompaktowy pasek filtr\u00f3w: wyszukiwanie po tre\u015bci, etykiecie, priorytecie i zakresie dat.",
          "Subtaski pomagaj\u0105 rozbi\u0107 wi\u0119ksze zadanie na mniejsze kroki.",
          "Zdj\u0119cia dodane do karty pojawi\u0105 si\u0119 tak\u017ce w galerii zdj\u0119\u0107.",
        ],
        tip: "Dla wi\u0119kszych spraw tw\u00f3rz subtaski i etykiety. Dzi\u0119ki temu post\u0119p i p\u00f3\u017aniejsze filtrowanie s\u0105 du\u017co czytelniejsze.",
      },
    },
    {
      id: "timeline",
      icon: <Clock3 size={26} />,
      title: "Timeline",
      hint: "Planowanie termin\u00f3w na osi czasu",
      accent: "from-sky-400 to-blue-500",
      details: {
        title: "Timeline - planowanie w czasie",
        intro: "Timeline pokazuje zadania wed\u0142ug ich termin\u00f3w. W ma\u0142ej kafelce widzisz szybki podgl\u0105d aktualnego tygodnia, a po klikni\u0119ciu kafelki otwiera si\u0119 szczeg\u00f3\u0142owy widok osi czasu.",
        points: [
          "Mo\u017cesz wybra\u0107 zakres widoku: tydzie\u0144, miesi\u0105c, kwarta\u0142 albo rok.",
          "Przeci\u0105gni\u0119cie paska zadania w szczeg\u00f3\u0142owym widoku zmienia termin w oryginalnej karcie.",
          "Pod\u015bwietlenia pomagaj\u0105 zobaczy\u0107, do kt\u00f3rego dnia przypisane jest zadanie.",
          "Kolor paska odpowiada etapowi, w kt\u00f3rym znajduje si\u0119 zadanie.",
        ],
        tip: "Gdy ustawiasz termin, patrz na pod\u015bwietlon\u0105 dat\u0119 na osi. To ona pokazuje dzie\u0144, do kt\u00f3rego zadanie zostanie przypisane.",
      },
    },
    {
      id: "archive",
      icon: <Archive size={26} />,
      title: "Archiwum",
      hint: "Zadania zako\u0144czone, ale zachowane",
      accent: "from-amber-400 to-orange-500",
      details: {
        title: "Archiwum - bezpieczne od\u0142o\u017cenie zadania",
        intro: "Archiwum s\u0142u\u017cy do przechowywania zada\u0144, kt\u00f3re s\u0105 zako\u0144czone albo chwilowo niepotrzebne, ale nie powinny zosta\u0107 usuni\u0119te. To takie eleganckie pude\u0142ko opisane markerem, a nie czarna dziura.",
        points: [
          "Zarchiwizowane zadania znikaj\u0105 z g\u0142\u00f3wnej tablicy Kanban.",
          "Nadal s\u0105 uwzgl\u0119dniane w raporcie post\u0119p\u00f3w i galerii zdj\u0119\u0107.",
          "Archiwum ma wyszukiwark\u0119 tekstow\u0105 oraz filtry dat: od/do i tryb sprawdzania terminu albo daty archiwizacji.",
          "Mo\u017cesz otworzy\u0107 kart\u0119 z archiwum i przywr\u00f3ci\u0107 j\u0105 do kolumny Gotowe.",
          "Usuwanie jest osobn\u0105 akcj\u0105 i oznacza trwa\u0142e skasowanie karty z aplikacji.",
        ],
        tip: "Archiwum warto stosowa\u0107 do spraw zako\u0144czonych, kt\u00f3re mog\u0105 si\u0119 jeszcze przyda\u0107 jako historia pracy, dow\u00f3d, notatka albo wz\u00f3r.",
      },
    },
    {
      id: "gallery",
      icon: <ImageIcon size={26} />,
      title: "Galeria zdj\u0119\u0107",
      hint: "Wszystkie obrazy z task\u00f3w",
      accent: "from-pink-400 to-rose-500",
      details: {
        title: "Galeria zdj\u0119\u0107 - szybkie odnajdywanie za\u0142\u0105cznik\u00f3w",
        intro: "Galeria zbiera zdj\u0119cia ze wszystkich kart, r\u00f3wnie\u017c tych z archiwum. Dzi\u0119ki temu nie trzeba pami\u0119ta\u0107, w kt\u00f3rym zadaniu by\u0142o konkretne zdj\u0119cie.",
        points: [
          "Klikni\u0119cie miniatury otwiera wi\u0119kszy podgl\u0105d.",
          "Podgl\u0105d pokazuje nazw\u0119 zadania, opis, termin i nazw\u0119 pliku.",
          "Przycisk Zaprowad\u017a mnie do tego zadania otwiera w\u0142a\u015bciw\u0105 kart\u0119.",
          "Zdj\u0119cia s\u0105 zmniejszane przy dodawaniu, aby aplikacja by\u0142a l\u017cejsza.",
        ],
        tip: "To przydatne, gdy zadania s\u0105 dokumentowane zdj\u0119ciami, zrzutami ekranu albo skanami. Galeria dzia\u0142a jak wizualny indeks spraw.",
      },
    },
    {
      id: "backup",
      icon: <Upload size={26} />,
      title: "Kopia zapasowa",
      hint: "Eksport i import danych tablicy",
      accent: "from-violet-400 to-indigo-500",
      details: {
        title: "Kopia zapasowa - zapis i odtwarzanie tablicy",
        intro: "Z g\u00f3rnego paska mo\u017cesz wykona\u0107 eksport oraz import danych tablicy. Kopia zapasowa zapisuje stan aplikacji do pliku JSON albo do tekstu, kt\u00f3ry mo\u017cna r\u0119cznie skopiowa\u0107 i wklei\u0107.",
        points: [
          "Eksport obejmuje zadania, archiwum, zdj\u0119cia, uk\u0142ad kafelk\u00f3w, aktywny widok, tryb kolorystyczny i wielko\u015b\u0107 tekstu.",
          "Import zast\u0119puje aktualne dane zapisane w tej przegl\u0105darce.",
          "Je\u015bli przegl\u0105darka zablokuje pobieranie pliku, mo\u017cna skopiowa\u0107 tre\u015b\u0107 eksportu i zapisa\u0107 j\u0105 r\u0119cznie jako plik .json.",
          "Import dzia\u0142a zar\u00f3wno z pliku JSON, jak i z wklejonej tre\u015bci eksportu.",
        ],
        tip: "Przed wi\u0119kszymi zmianami zr\u00f3b eksport. To najszybsza polisa ubezpieczeniowa dla tablicy.",
      },
    },
    {
      id: "report",
      icon: <Activity size={26} />,
      title: "Raport",
      hint: "Post\u0119p i wydajno\u015b\u0107 pracy",
      accent: "from-cyan-400 to-violet-500",
      details: {
        title: "Raport post\u0119p\u00f3w - liczby bez r\u0119cznego liczenia",
        intro: "Raport zbiera dane z ca\u0142ej aplikacji: zada\u0144 aktywnych, uko\u0144czonych i archiwalnych. Pokazuje nie tylko liczb\u0119 kart, ale te\u017c post\u0119p subtask\u00f3w, rozk\u0142ad po etapach oraz zadania po terminie.",
        points: [
          "Wszystkie karty obejmuj\u0105 tak\u017ce archiwum.",
          "Uko\u0144czenie liczone jest na podstawie kolumny Gotowe oraz post\u0119pu subtask\u00f3w.",
          "Po terminie oznacza aktywne zadania z dat\u0105 wcze\u015bniejsz\u0105 ni\u017c dzisiaj.",
          "Rozk\u0142ad po etapach pokazuje, gdzie gromadzi si\u0119 najwi\u0119cej pracy.",
        ],
        tip: "Raport pomaga zobaczy\u0107, czy projekt idzie p\u0142ynnie, czy zadania zaczynaj\u0105 kumulowa\u0107 si\u0119 w jednym etapie.",
      },
    },
  ];

  const navigationCards = [
    { icon: <LayoutDashboard size={28} />, title: "Dashboard", hint: "Post\u0119p, kalendarz i panel sterowania", action: onGoToInfo, accent: "from-violet-400 to-fuchsia-500", tag: "Informacje" },
    { icon: <Plus size={28} />, title: "Nowe zadanie", hint: "Otwiera pe\u0142n\u0105 kart\u0119 edycji zadania", action: onNewTask, accent: "from-sky-400 to-cyan-500", tag: "Start" },
    { icon: <CheckSquare2 size={28} />, title: "Tablica zada\u0144", hint: "Kolumny Kanban i przesuwanie kart", action: onGoToTasks, accent: "from-emerald-400 to-teal-500", tag: "Zadania" },
    { icon: <Clock3 size={28} />, title: "Timeline", hint: "Szczeg\u00f3\u0142owy widok termin\u00f3w", action: onOpenTimeline, accent: "from-blue-400 to-sky-500", tag: "Plan" },
    { icon: <Activity size={28} />, title: "Raport", hint: "Post\u0119p, wydajno\u015b\u0107 i archiwum", action: onOpenPerformance, accent: "from-cyan-400 to-violet-500", tag: "Analiza" },
    { icon: <ImageIcon size={28} />, title: "Galeria", hint: "Zdj\u0119cia ze wszystkich task\u00f3w", action: onOpenGallery, accent: "from-pink-400 to-rose-500", tag: "Zdj\u0119cia" },
    { icon: <Archive size={28} />, title: "Archiwum", hint: "Zadania od\u0142o\u017cone, ale zachowane", action: onOpenArchive, accent: "from-amber-400 to-orange-500", tag: "Historia" },
  ];

  return (
    <motion.section key="help-section" className="grid gap-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
      <div className={cx("rounded-[2rem] border p-5 shadow-xl backdrop-blur-xl", t.card)}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm", t.buttonPrimary)}>
              <BookOpen size={14} /> Instrukcja obs\u0142ugi
            </div>
            <h2 className="text-2xl font-black">Szybki przewodnik po aplikacji</h2>
            <p className={cx("mt-1 max-w-2xl text-sm leading-6", t.textMuted)}>
              Najwa\u017cniejsze dzia\u0142ania s\u0105 pokazane skr\u00f3towo. Szczeg\u00f3\u0142owy opis znajdziesz po klikni\u0119ciu wybranej kafelki - uwzgl\u0119dnia te\u017c filtry zada\u0144, archiwum oraz kopie zapasowe.
            </p>
          </div>

          <div className={cx("flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ring-1", t.chip)}>
            <Sparkles size={15} /> kliknij kafelk\u0119, \u017ceby rozwin\u0105\u0107
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
          <DashboardTitle t={t} icon={<Sparkles size={12} />} eyebrow="Modu\u0142y" title="Kliknij, aby zobaczy\u0107 szczeg\u00f3\u0142y" />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <button key={topic.id} type="button" onClick={() => setSelectedTopic(topic)} className={cx("group rounded-3xl border p-4 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl", t.cardSolid)}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className={cx("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition group-hover:scale-105", topic.accent)}>{topic.icon}</span>
                  <span className={cx("rounded-full px-2.5 py-1 text-[10px] font-black ring-1", t.chip)}>wi\u0119cej</span>
                </div>
                <h3 className="text-base font-black">{topic.title}</h3>
                <p className={cx("mt-1 text-xs font-semibold leading-5", t.textSoft)}>{topic.hint}</p>
              </button>
            ))}
          </div>
        </section>

        <section className={cx("rounded-[2rem] border p-5 shadow-xl backdrop-blur-xl", t.card)}>
          <DashboardTitle t={t} icon={<LayoutDashboard size={12} />} eyebrow="Skr\u00f3ty" title="Najbardziej u\u017cyteczne miejsca" />

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
                    <BookOpen size={14} /> Szczeg\u00f3\u0142y
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
