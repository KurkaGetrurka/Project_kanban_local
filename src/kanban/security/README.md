# Bezpieczna baza Kanbana

Ten folder zawiera warstwę szyfrowania bazy Kanbana.

Założenia:

- dane robocze Kanbana są szyfrowane przed zapisem do pliku,
- hasło bazy nie jest zapisywane w przeglądarce,
- stara, niezabezpieczona baza z przeglądarki ma być migrowana do zaszyfrowanego pliku,
- localStorage / IndexedDB / cache nie powinny być docelowym magazynem danych wrażliwych.

Docelowy format pliku to koperta JSON z metadanymi kryptograficznymi i zaszyfrowanym polem `payload`.
