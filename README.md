# Kalkulator Mebli – szafa wnękowa

Aplikacja webowa do wyliczania materiałów i listy zakupów pod **szafę wnękową** (garderobę w ścianie). Na podstawie wymiarów wnęki, liczby boxów oraz konfiguracji każdego boxa (półki, szuflady, drzwi) generuje raport z:

- **Płyty meblowe** (korpus, szuflady) i **HDF** (dna szuflad)
- **Prowadnice, sprzęgła, uchwyty, zawiasy**
- **Drzwi** – wymiary i ilość (lewe/prawe)
- **Półki** – głębokość i liczba w każdym boxie
- **Blendy/wnęki** – półka i listwy, gdy są włączone

Konfiguracja jest w trzech krokach: wymiary wnęki (i opcjonalnie blendy), liczba boxów, a potem dla każdego boxa – szerokość wnętrza, rodzaj drzwi, półki, drążki, szuflady. Aplikacja pilnuje, żeby suma szerokości wnętrz boxów zgadzała się z dostępnym miejscem.

---

## Wymagania

- **Node.js** (np. 18+)
- **npm**

---

## Uruchomienie aplikacji

### Tryb deweloperski (na lokalnej maszynie)

```bash
npm install
npm run dev
```

W terminalu pojawi się adres (zazwyczaj **http://localhost:5173**). Otwórz go w przeglądarce.

### Build produkcyjny

```bash
npm install
npm run build
```

Wynik trafia do katalogu `dist/`. Aby podejrzeć zbudowaną wersję lokalnie:

```bash
npm run preview
```

---

## Struktura projektu

| Ścieżka   | Opis |
|-----------|------|
| `src/`    | Komponenty, hooki, logika (`lib/`), stałe, walidacja |
| `dist/`   | Zbudowana wersja (po `npm run build`) |

Raport jest generowany w przeglądarce – nie jest potrzebny backend do działania kalkulatora.
