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

## Wdrożone w tym etapie

- moduł `encryptedDatabase.js`,
- eksport zaszyfrowanej bazy z poziomu okna eksportu,
- import zaszyfrowanej bazy z pliku lub wklejonej treści,
- obsługa błędnego hasła bez ujawniania danych,
- moduł `browserStoragePolicy.js` do wykrywania i czyszczenia starej kopii z `localStorage`,
- komponent `SecurityDatabaseModal` z procesem migracji: zaszyfruj aktualny stan, przetestuj import, usuń starą kopię z przeglądarki,
- pływający przycisk `Baza`, który otwiera panel migracji bez ingerowania w główny układ aplikacji,
- startowa instalacja blokady zapisu do `localStorage` dla znanych kluczy Kanbana.

## Ważna uwaga o czyszczeniu localStorage

Samo usunięcie kluczy z `localStorage` nie wystarczy, jeśli główny hook aplikacji nadal automatycznie zapisuje stan przy każdej zmianie. Dlatego `browserStoragePolicy.js` ma flagę sesyjną `kanban-browser-persistence-disabled-session` oraz strażnika `installBrowserPersistenceGuard()`.

Strażnik jest instalowany już w `src/main.jsx`, zanim aplikacja zostanie wyrenderowana. Dzięki temu, jeśli po migracji ustawiona jest flaga blokady zapisu w sesji, próby ponownego zapisania starych kluczy Kanbana do `localStorage` są zatrzymywane.

Dalsze docelowe uproszczenie to podpięcie `shouldPersistToBrowserStorage()` bezpośrednio w `useKanbanBoard.jsx`, w miejscu gdzie obecnie wykonywane jest:

```js
safeStorageSetItem(STORAGE_KEY, JSON.stringify(persistedBoardState));
```

Docelowo zapis powinien wyglądać logicznie tak:

```js
if (shouldPersistToBrowserStorage()) {
  safeStorageSetItem(STORAGE_KEY, JSON.stringify(persistedBoardState));
}
```

## Do zrobienia w kolejnych etapach

1. Podpiąć `shouldPersistToBrowserStorage()` w `useKanbanBoard.jsx`, aby logika zapisu była jawna także w hooku aplikacji.
2. Przenieść główny zapis z `localStorage` do wybranego pliku bazy przez File System Access API.
3. Dodać ekran startowy: `Otwórz bazę`, `Utwórz bazę`, `Zaszyfruj istniejącą bazę`.
4. Dodać status bazy: `zaszyfrowana`, `niezapisane zmiany`, `zapisano`, `stare dane w przeglądarce`.
5. Dodać blokadę bazy, która czyści odszyfrowane dane z pamięci aplikacji.
