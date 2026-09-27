# NEST Valea Jiului

Portal comunitar pentru Petroșani, Petrila, Aninoasa, Vulcan, Lupeni și Uricani: ce e de văzut, ce urmează și de ce ai nevoie, în Vale.

## 🔗 Site live

**https://rocketknife1.github.io/proiect-site/**

## Ce conține

- „Valea Jiului, azi”: data zilei, vremea live în Petroșani și pe Parâng, ora apusului (Open-Meteo, fără cheie)
- Căutare care filtrează după tip și text (merge și fără diacritice)
- Linia Văii: Jiul desenat de la vest la est, cu cele șase orașe așezate după longitudine; apeși pe oraș și vezi doar ce e acolo (pe telefon devine o grilă)
- Agenda Văii ca un calendar, locuri de văzut, excursii de o zi, anunțuri
- Pagină de detalii pentru fiecare element, cu link direct în Google Maps, buton de distribuire (link de tip `#parang`) și „Tot din {oraș}”
- Numere și locuri utile: 112, Salvamont, autogară, gară, primărie, spital

## Conținut

- Locurile de văzut, excursiile și anunțul de apartament sunt reale.
- Evenimentele sunt **exemple** (marcate „Exemplu” pe site), cu date calculate față de ziua curentă, până vin evenimente trimise de oameni.
- Totul se editează în lista `ITEMS` de la începutul lui `script.js`.

## Fotografii

Fotografiile apartamentului sunt reale. Restul sunt de pe Unsplash (licență Unsplash, uz comercial permis): Munții Parâng (Bostan Florin Cătălin), iar pentru lac, drumuri, pârtie, concert și festival sunt **fotografii ilustrative**.

## Rulare locală

```bash
python -m http.server 8000
```
