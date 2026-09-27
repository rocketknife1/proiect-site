# NEST Valea Jiului

Portal comunitar pentru Petroșani, Petrila, Aninoasa, Vulcan, Lupeni și Uricani, gândit ca o platformă de streaming pentru orașul tău.

## 🔗 Site live

**https://rocketknife1.github.io/proiect-site/**

## Ce conține

- Banner mare cu recomandări care se schimbă singure (zoom lent pe poze, munți care se mișcă la scroll)
- Căutare care filtrează după oraș, tip și text (merge și fără diacritice)
- Rânduri orizontale: evenimente, locuri de văzut, excursii de o zi, anunțuri; cardurile se măresc la hover
- „Lista mea”: salvezi ce te interesează (rămâne pe dispozitivul tău)
- Pagină de detalii pentru fiecare element, cu link direct în Google Maps și buton de distribuire (link direct de tip `#parang`)
- Vremea live în Petroșani și pe Parâng (Open-Meteo, fără cheie)
- Numere și locuri utile: 112, Salvamont, autogară, gară, primărie, spital

## Conținut

- Locurile de văzut și anunțul de apartament sunt reale.
- Evenimentele sunt **exemple** (marcate „Exemplu” pe site), cu date calculate față de ziua curentă.
- Totul se editează în lista `ITEMS` de la începutul lui `script.js`.

## Fotografii

Fotografiile apartamentului sunt reale. Restul sunt de pe Unsplash (licență Unsplash, uz comercial permis): Munții Parâng (Bostan Florin Cătălin), iar pentru lac, drumuri, pârtie, concert, festival și car meet sunt **fotografii ilustrative**.

## Rulare locală

```bash
python -m http.server 8000
```
