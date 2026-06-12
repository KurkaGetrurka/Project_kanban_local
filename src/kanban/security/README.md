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
- obsługa błędnego hasła bez ujawniania danych.

## Do zrobienia w kolejnych etapach

1. Przenieść główny zapis z `localStorage` do wybranego pliku bazy przez File System Access API.
2. Dodać ekran startowy: `Otwórz bazę`, `Utwórz bazę`, `Zaszyfruj istniejącą bazę`.
3. Dodać status bazy: `zaszyfrowana`, `niezapisane zmiany`, `zapisano`, `stare dane w przeglądarce`.
4. Dodać przycisk `Wyczyść stare dane z przeglądarki` po udanym zapisie zaszyfrowanej bazy.
5. Dodać blokadę bazy, która czyści odszyfrowane dane z pamięci aplikacji.
