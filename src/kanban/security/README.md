# Bezpieczna baza Kanbana

Ten folder zawiera warstwę szyfrowania bazy Kanbana oraz notatki wdrożeniowe dla trybu pracy z danymi wrażliwymi.

## Założenia

- dane robocze Kanbana są szyfrowane przed zapisem do pliku,
- hasło bazy nie jest zapisywane w przeglądarce,
- stara, niezabezpieczona baza z przeglądarki ma być migrowana do zaszyfrowanego pliku,
- `localStorage` / `IndexedDB` / cache nie powinny być docelowym magazynem danych wrażliwych,
- docelowo użytkownik wybiera własny plik bazy i zabezpiecza go własnym hasłem.

## Format pliku

Zaszyfrowana baza nadal jest plikiem JSON, ale dane tablicy nie są zapisane jawnie. Plik zawiera kopertę z metadanymi kryptograficznymi oraz zaszyfrowanym polem `payload`.

Używany schemat:

- AES-GCM do szyfrowania danych,
- PBKDF2 + SHA-256 do wyprowadzenia klucza z hasła,
- losowy `salt`,
- losowy `iv` dla każdego szyfrowania,
- cały eksport Kanbana jest szyfrowany jako jedna całość.

## Wdrożone

- moduł `encryptedDatabase.js`,
- eksport zaszyfrowanej bazy z poziomu okna eksportu,
- import zaszyfrowanej bazy z pliku lub wklejonej treści,
- obsługa błędnego hasła bez ujawniania danych,
- moduł `browserStoragePolicy.js` do wykrywania i czyszczenia starej kopii z `localStorage`,
- komponent `SecurityDatabaseModal` z procesem migracji: zaszyfruj aktualny stan, przetestuj import, usuń starą kopię z przeglądarki,
- pływający przycisk `Baza`, który otwiera panel migracji bez ingerowania w główny układ aplikacji,
- ekran startowy `StartupDatabaseGate`, który prowadzi użytkownika przez utworzenie nowej zaszyfrowanej bazy, otwarcie istniejącej bazy albo import starej kopii JSON,
- startowa instalacja blokady zapisu do `localStorage` dla znanych kluczy Kanbana,
- moduł `fileDatabaseStorage.js` z pomocnikami File System Access API,
- jawna akcja `Zaszyfruj i zapisz do wybranego pliku`, która tworzy zaszyfrowany plik roboczy w miejscu wskazanym przez użytkownika,
- sesja plikowa: `Otwórz zaszyfrowaną bazę`, odblokowanie hasłem i zapis późniejszych zmian do tego samego zaszyfrowanego pliku,
- tworzenie nowej aktywnej sesji plikowej przez `createEncryptedDatabaseSession()`, używane na ekranie startowym,
- moduł `liveBoardSnapshot.js`, który trzyma w pamięci strony ostatnio odblokowany albo zapisany stan sesji plikowej dla panelu `Baza`,
- pływający status bazy pokazujący tryb przeglądarkowy, aktywną sesję plikową, ostatni zapis albo błąd zapisu,
- akcja `Zablokuj otwartą bazę` dostępna z panelu `Baza`, która zamyka sesję plikową, czyści starą kopię przeglądarkową i przeładowuje widok.

## Ważna uwaga o czyszczeniu localStorage

Samo usunięcie kluczy z `localStorage` nie wystarczy, jeśli główny hook aplikacji nadal automatycznie zapisuje stan przy każdej zmianie. Dlatego `browserStoragePolicy.js` ma flagę sesyjną `kanban-browser-persistence-disabled-session` oraz strażnika `installBrowserPersistenceGuard()`.

Strażnik jest instalowany już w `src/main.jsx`, zanim aplikacja zostanie wyrenderowana. Dzięki temu, jeśli po migracji ustawiona jest flaga blokady zapisu w sesji, próby ponownego zapisania starych kluczy Kanbana do `localStorage` są zatrzymywane.

`useKanbanBoard.jsx` dodatkowo sprawdza `shouldPersistToBrowserStorage()`. Gdy aktywna jest sesja plikowa, zapis do `localStorage` nie jest używany — zamiast tego stan tablicy jest szyfrowany i zapisywany do aktywnego pliku.

## Ekran startowy

`StartupDatabaseGate` pojawia się przy starcie aplikacji jako pełnoekranowy wybór bazy. Ma trzy główne ścieżki:

1. `Utwórz nową bazę` — tworzy pusty zaszyfrowany plik i od razu otwiera go jako aktywną sesję plikową.
2. `Otwórz bazę` — pyta o hasło i otwiera istniejący zaszyfrowany plik przez File System Access API.
3. `Importuj kopię` — pozwala wczytać starszy zwykły eksport JSON, głównie jako ścieżkę migracyjną.

Przycisk `Baza` w rogu nadal istnieje, ale jest narzędziem do późniejszych operacji administracyjnych, a nie pierwszym krokiem użytkownika.

## Etap sesji plikowej

Przepływ docelowy w tym etapie:

1. Użytkownik tworzy zaszyfrowany plik przez ekran startowy albo posiada już taki plik.
2. Użytkownik klika `Otwórz zaszyfrowaną bazę` albo wybiera ją na ekranie startowym.
3. Aplikacja pyta o hasło i otwiera plik przez File System Access API.
4. Hasło i uchwyt do pliku są trzymane tylko w pamięci aktywnej strony.
5. Odszyfrowana baza jest przekazywana do głównej tablicy przez zdarzenie `kanban-file-database-opened`.
6. Kolejne zmiany są debounced i zapisywane do tego samego pliku jako nowa zaszyfrowana koperta.
7. Ostatnio odblokowany albo zapisany stan jest dodatkowo trzymany w pamięci przez `liveBoardSnapshot.js`, żeby panel `Baza` nie musiał opierać się na starej kopii z `localStorage`.
8. Po odświeżeniu strony sesja znika i plik trzeba ponownie otworzyć hasłem.

## Status bazy

`SecurityDatabaseLauncher` pokazuje krótkie pływające powiadomienie nad przyciskiem `Baza` tylko przy ważnych zdarzeniach:

- `Tryb przeglądarkowy` — aplikacja nie ma aktywnej sesji plikowej i dane mogą nadal trafiać do lokalnej pamięci przeglądarki,
- `Zapis do przeglądarki zatrzymany` — stara kopia została usunięta albo zapis do `localStorage` zatrzymano w tej sesji,
- `Plik aktywny` — aplikacja pracuje na odblokowanym zaszyfrowanym pliku,
- `Błąd zapisu bazy` — ostatnia próba zapisu do pliku się nie udała.

Autosave do aktywnego pliku aktualizuje status w tle, ale nie pokazuje powiadomienia przy każdym zapisie.

Status reaguje na zdarzenia `kanban-file-database-opened`, `kanban-file-database-applied`, `kanban-file-database-saved`, `kanban-file-database-save-error`, `kanban-file-database-closed`, `kanban-live-board-snapshot-changed`, `kanban-browser-persistence-changed` i `kanban-imported`.

## Do zrobienia w kolejnych etapach

1. Rozważyć trzymanie wyprowadzonego klucza w pamięci sesji zamiast wykonywania PBKDF2 przy każdym autosave, jeżeli zapis będzie odczuwalnie wolny.
2. Dodać bardziej widoczny proces zmiany hasła bazy.
3. Doprecyzować politykę dla przycisku `Pomiń testowo`, jeśli aplikacja ma być wdrożona wyłącznie w trybie plikowym.
