(() => {
  const TOWNS = ["Petroșani", "Petrila", "Aninoasa", "Vulcan", "Lupeni", "Uricani"];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  /* Example events get dates relative to today, so the calendar never looks stale. */
  function nextDay(weekday, minDays = 1) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + minDays);
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
    return d;
  }
  const inDays = (n) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
  };
  const dayLabel = (d) => d.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" });

  /* ------------------------------------------------------------------
   * CONTENT. "example: true" = demo item, clearly labelled on the site.
   * Places and the apartment listing are real.
   * ------------------------------------------------------------------ */
  const ITEMS = [
    {
      id: "parang", kind: "place", title: "Munții Parâng", town: "Petroșani", img: "images/parang-creasta.jpg",
      kicker: "Loc de văzut", tags: ["Munte", "Trasee", "Telescaun"],
      text: "Creasta care veghează Valea, cu Vârful Parângu Mare la 2.519 m. Vara, trasee de creastă și lacuri glaciare; iarna, pârtiile stațiunii Parâng, deasupra Petroșaniului.",
      map: "Stațiunea Parâng", gallery: ["images/parang-varf.jpg", "images/parang-vale.jpg"],
    },
    {
      id: "straja", kind: "place", title: "Stațiunea Straja", town: "Lupeni", img: "images/partie-noapte.jpg",
      kicker: "Loc de văzut", tags: ["Schi", "Pârtii iluminate", "Priveliște"],
      text: "Stațiunea de deasupra Lupeniului, cu pârtii iluminate seara în sezonul de iarnă și priveliște peste toată Valea Jiului.",
      map: "Stațiunea Straja Lupeni",
    },
    {
      id: "calcescu", kind: "place", title: "Lacul Câlcescu", town: "Petroșani", img: "images/lac-glaciar.jpg",
      kicker: "Traseu de o zi", tags: ["Lac glaciar", "1.935 m", "Drumeție"],
      text: "Cel mai cunoscut lac glaciar din Parâng, la capătul unui traseu frumos de o zi. Pleacă devreme și verifică vremea pe creastă.",
      map: "Lacul Câlcescu",
    },
    {
      id: "defileu", kind: "place", title: "Defileul Jiului", town: "Petroșani", img: "images/drum-vale.jpg",
      kicker: "Parc național", tags: ["Natură", "Cicloturism", "Mănăstirea Lainici"],
      text: "Drumul spre Oltenia se strecoară printre stânci, pe lângă Jiu. Parc național, cu popasuri, poteci și Mănăstirea Lainici pe traseu.",
      map: "Parcul Național Defileul Jiului",
    },
    {
      id: "muzeu", kind: "place", title: "Muzeul Mineritului", town: "Petroșani", img: null, icon: "⛏",
      kicker: "Istoria locului", tags: ["Muzeu", "Istorie", "Minerit"],
      text: "Povestea mineritului din Valea Jiului, cu echipamente, fotografii și documente care arată cum s-a construit viața de aici.",
      map: "Muzeul Mineritului Petroșani",
    },
    {
      id: "transalpina", kind: "trip", title: "Transalpina", town: "Petroșani", img: "images/serpentine.jpg",
      kicker: "Excursie de o zi", tags: ["Cel mai înalt drum din țară", "Serpentine", "Doar vara"],
      text: "Drumul care urcă peste Parâng la peste 2.100 m. Deschis doar în sezonul cald; verifică dacă e deschis înainte să pleci.",
      map: "Transalpina DN67C",
    },
    {
      id: "corvin", kind: "trip", title: "Castelul Corvinilor", town: "Hunedoara", img: "images/castelul-corvinilor.jpg",
      kicker: "Excursie de o zi", tags: ["Castel gotic", "Hunedoara", "~1 h 30 min"],
      text: "Unul dintre cele mai frumoase castele gotice din Europa, la aproximativ o oră și jumătate cu mașina din Valea Jiului.",
      map: "Castelul Corvinilor Hunedoara",
    },
    {
      id: "apartament", kind: "listing", title: "Apartament 2 camere de închiriat", town: "Petroșani", img: "images/living.jpeg",
      kicker: "Se oferă · chirie", tags: ["2 camere", "Mobilat", "Disponibil acum"], price: "200 € / lună",
      text: "Apartament cu două camere, mobilat și utilat, disponibil acum pentru închiriere în Petroșani.",
      map: "Petroșani", gallery: ["images/dormitor.jpeg", "images/bucatarie.jpeg", "images/baie.jpeg"],
    },
    {
      id: "carmeet", kind: "event", example: true, title: "Valea Jiului Car Meet", town: "Petroșani", img: "images/car-meet.jpg",
      kicker: "Comunitate auto", date: nextDay(6), time: "19:00", where: "Parcarea din Livezeni", tags: ["Mașini", "Muzică", "Intrare liberă"],
      text: "Mașini, muzică și oameni care iubesc drumurile din Vale. Adu-ți mașina sau vino doar să te uiți.",
      map: "Livezeni Petroșani",
    },
    {
      id: "dnb", kind: "event", example: true, title: "Night Shift: DNB Party", town: "Vulcan", img: "images/concert.jpg",
      kicker: "Muzică live", date: nextDay(5), time: "22:00", where: "Vulcan", tags: ["Drum & bass", "18+", "Bilete la intrare"],
      text: "O noapte cu bass, prieteni și energie bună până dimineață.",
      map: "Vulcan Hunedoara",
    },
    {
      id: "creasta", kind: "event", example: true, title: "Tură pe creasta Parângului", town: "Petroșani", img: "images/parang-varf.jpg",
      kicker: "Ieșire în natură", date: nextDay(0), time: "07:30", where: "Telescaunul Parâng", tags: ["Drumeție", "Nivel mediu", "~7 ore"],
      text: "Urcăm cu telescaunul, apoi pe creastă spre Vârful Parângu Mare. Echipament de munte obligatoriu.",
      map: "Telescaun Parâng Petroșani",
    },
    {
      id: "zile", kind: "event", example: true, title: "Zilele orașului", town: "Lupeni", img: "images/festival.jpg",
      kicker: "Pentru toți", date: inDays(12), time: "10:00", where: "Centrul orașului", tags: ["Târg", "Concerte", "Copii"],
      text: "Târg local, concerte, activități pentru copii și gust de sărbătoare.",
      map: "Lupeni centru",
    },
  ];

  const BILLBOARD = ["parang", "carmeet", "apartament", "straja", "calcescu"];

  const RAILS = [
    { id: "mylist", title: "Lista mea", filter: (i) => saved.has(i.id), note: "Ce ai salvat, pe acest dispozitiv." },
    { id: "events", title: "În curând în Vale", filter: (i) => i.kind === "event", sort: (a, b) => a.date - b.date, cta: { text: "Ai un eveniment?", sub: "Propune-l și apare aici.", kind: "Eveniment" } },
    { id: "places", title: "Locuri de văzut", filter: (i) => i.kind === "place" },
    { id: "trips", title: "Excursii de o zi", filter: (i) => i.kind === "trip" },
    { id: "listings", title: "Anunțuri", filter: (i) => i.kind === "listing", cta: { text: "Ai ceva de oferit?", sub: "Publică gratuit.", kind: "Ofer" } },
  ];

  let cardObserver = null;

  /* ---------- Saved list (Netflix "My List"), per device ---------- */
  const saved = new Set();
  try { JSON.parse(localStorage.getItem("nest-saved") || "[]").forEach((id) => saved.add(id)); } catch { /* storage unavailable */ }
  const persist = () => { try { localStorage.setItem("nest-saved", JSON.stringify([...saved])); } catch { /* ignore */ } };

  /* ---------- Toast ---------- */
  const toast = $("#toast");
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function toggleSave(id) {
    if (saved.has(id)) { saved.delete(id); showToast("Scos din Lista mea."); }
    else { saved.add(id); showToast("Salvat în Lista mea."); }
    persist();
    renderRails();
    syncSaveButtons();
    // Billboard and "more like this" buttons live outside the rails
    const on = saved.has(id);
    $$(`[data-save="${id}"]`).forEach((b) => {
      b.setAttribute("aria-pressed", String(on));
      b.textContent = b.classList.contains("round-btn") ? (on ? "✓" : "+") : on ? "✓ În Lista mea" : "+ Lista mea";
    });
  }

  /* ---------- Header ---------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const menuButton = $(".menu-button");
  const setMenu = (open) => {
    header.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Închide meniul" : "Deschide meniul");
    menuButton.textContent = open ? "×" : "☰";
  };
  menuButton.addEventListener("click", () => setMenu(!header.classList.contains("menu-open")));
  $$(".main-nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Cards ---------- */
  const meta = (i) =>
    i.kind === "event"
      ? `${dayLabel(i.date)} · ${i.time} · ${i.town}`
      : i.kind === "listing"
        ? `${i.town} · ${i.price}`
        : i.town;

  function cardHTML(i) {
    const media = i.img
      ? `<img src="${i.img}" alt="" loading="lazy">`
      : `<span class="card-icon" aria-hidden="true">${i.icon ?? "✦"}</span>`;
    return `<article class="card${i.img ? "" : " card-noimg"}" data-id="${i.id}">
      <button type="button" class="card-open" data-open="${i.id}" aria-label="${esc(i.title)}: vezi detalii">
        <span class="card-media">${media}</span>
        ${i.example ? '<span class="badge-example">Exemplu</span>' : ""}
        ${i.kind === "event" ? `<span class="card-date"><strong>${i.date.getDate()}</strong>${i.date.toLocaleDateString("ro-RO", { month: "short" })}</span>` : ""}
        <span class="card-title">${esc(i.title)}</span>
      </button>
      <div class="card-more">
        <p class="card-meta">${esc(meta(i))}</p>
        <p class="card-tags">${i.tags.slice(0, 3).map(esc).join(" · ")}</p>
        <div class="card-actions">
          <button type="button" class="round-btn" data-open="${i.id}" aria-label="Detalii: ${esc(i.title)}">i</button>
          <button type="button" class="round-btn save-btn" data-save="${i.id}" aria-pressed="${saved.has(i.id)}" aria-label="Lista mea: ${esc(i.title)}">${saved.has(i.id) ? "✓" : "+"}</button>
        </div>
      </div>
    </article>`;
  }
  const ctaCard = (c) => `<article class="card card-cta">
      <button type="button" class="card-open" data-publish-kind="${c.kind}">
        <span class="cta-plus" aria-hidden="true">+</span>
        <span class="cta-text"><strong>${c.text}</strong><small>${c.sub}</small></span>
      </button>
    </article>`;

  /* ---------- Search ---------- */
  const form = $("[data-search]");
  const townSelect = $("[data-town-select]");
  townSelect.innerHTML = `<option value="all">Toată Valea</option>` + TOWNS.map((t) => `<option>${t}</option>`).join("") + `<option value="Hunedoara">În afara Văii</option>`;
  const status = $("[data-search-status]");
  const resetBtn = $("[data-search-reset]");
  const query = () => {
    const f = new FormData(form);
    return { town: f.get("town"), kind: f.get("kind"), q: String(f.get("q") || "").trim().toLowerCase() };
  };
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  function matches(i, { town, kind, q }) {
    if (town !== "all" && i.town !== town) return false;
    if (kind !== "all" && i.kind !== kind) return false;
    if (q) {
      const hay = norm([i.title, i.town, i.kicker, i.text, ...(i.tags || [])].join(" "));
      if (!norm(q).split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  /* ---------- Rails ---------- */
  const railsRoot = $("[data-rails]");
  function renderRails() {
    const qy = query();
    const filtering = qy.town !== "all" || qy.kind !== "all" || qy.q;
    let total = 0;
    railsRoot.innerHTML = RAILS.map((r) => {
      let list = ITEMS.filter(r.filter).filter((i) => matches(i, qy));
      if (r.sort) list = [...list].sort(r.sort);
      total += r.id === "mylist" ? 0 : list.length;
      const showCta = r.cta && !filtering;
      if (!list.length && !showCta) return "";
      return `<section class="rail" id="rail-${r.id}" aria-labelledby="rail-${r.id}-t">
        <div class="rail-head">
          <h2 id="rail-${r.id}-t">${r.title}</h2>
          ${r.note ? `<p>${r.note}</p>` : ""}
          <div class="rail-nav">
            <button type="button" class="rail-btn" data-dir="-1" aria-label="${r.title}: înapoi">‹</button>
            <button type="button" class="rail-btn" data-dir="1" aria-label="${r.title}: înainte">›</button>
          </div>
        </div>
        <div class="rail-track" tabindex="-1">${list.map(cardHTML).join("")}${showCta ? ctaCard(r.cta) : ""}</div>
      </section>`;
    }).join("");
    $("[data-empty]").hidden = total > 0;
    resetBtn.hidden = !filtering;
    status.textContent = filtering ? (total ? `${total} ${total === 1 ? "rezultat" : "rezultate"}` : "Niciun rezultat") : "";
    const myCount = saved.size;
    $("[data-mylist-link]").hidden = myCount === 0;
    $("[data-mylist-count]").textContent = myCount;
    setupRails();
    observeCards();
  }

  function setupRails() {
    $$(".rail").forEach((rail) => {
      const track = $(".rail-track", rail);
      const [prev, next] = $$(".rail-btn", rail);
      const update = () => {
        const max = track.scrollWidth - track.clientWidth - 2;
        rail.classList.toggle("rail-static", max <= 0);
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
      };
      [prev, next].forEach((b) => b.addEventListener("click", () => track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.85, behavior: reduceMotion ? "auto" : "smooth" })));
      track.addEventListener("scroll", update, { passive: true });
      update();
    });
  }
  window.addEventListener("resize", () => $$(".rail-track").forEach((t) => t.dispatchEvent(new Event("scroll"))));

  // Event delegation for all cards (rails, modal)
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    const save = e.target.closest("[data-save]");
    const pub = e.target.closest("[data-publish-kind]");
    if (save) { e.preventDefault(); toggleSave(save.dataset.save); return; }
    if (open) { e.preventDefault(); openDetail(open.dataset.open); return; }
    if (pub) { e.preventDefault(); openPublish(); }
  });

  form.addEventListener("input", renderRails);
  form.addEventListener("change", renderRails);
  form.addEventListener("submit", (e) => { e.preventDefault(); $("#rails").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); });
  form.addEventListener("reset", () => setTimeout(renderRails, 0));

  /* ---------- Detail modal ---------- */
  const detail = $("#detail");
  let detailId = null;
  function syncSaveButtons() {
    const b = $("[data-detail-save]");
    if (detailId) {
      b.textContent = saved.has(detailId) ? "✓ În Lista mea" : "+ Lista mea";
      b.setAttribute("aria-pressed", String(saved.has(detailId)));
    }
  }
  function openDetail(id) {
    const i = ITEMS.find((x) => x.id === id);
    if (!i) return;
    detailId = id;
    const img = $("#detail-img");
    img.src = i.img ?? "images/parang-vale.jpg";
    img.alt = i.img ? i.title : "";
    detail.classList.toggle("detail-noimg", !i.img);
    $("#detail-kicker").textContent = i.example ? `${i.kicker} · Exemplu` : i.kicker;
    $("#detail-title").textContent = i.title;
    $("#detail-text").textContent = i.text;
    const metaItems = [
      i.kind === "event" ? `${dayLabel(i.date)}, ora ${i.time}` : null,
      i.where ? `${i.where}, ${i.town}` : i.town,
      i.price ?? null,
      ...i.tags,
    ].filter(Boolean);
    $("#detail-meta").innerHTML = metaItems.map((m) => `<li>${esc(m)}</li>`).join("");
    $("#detail-gallery").innerHTML = (i.gallery || []).map((g) => `<img src="${g}" alt="" loading="lazy">`).join("");
    const map = $("[data-detail-map]");
    map.href = maps(i.map);
    const more = ITEMS.filter((x) => x.id !== id && (x.kind === i.kind || x.town === i.town)).slice(0, 4);
    $("#detail-more").innerHTML = more.map(cardHTML).join("");
    syncSaveButtons();
    if (!detail.open) detail.showModal();
    detail.scrollTop = 0;
    history.replaceState(null, "", `#${id}`);
  }
  $("[data-detail-close]").addEventListener("click", () => detail.close());
  detail.addEventListener("click", (e) => { if (e.target === detail) detail.close(); });
  detail.addEventListener("close", () => { detailId = null; history.replaceState(null, "", location.pathname + location.search); });
  $("[data-detail-save]").addEventListener("click", () => detailId && toggleSave(detailId));
  $("[data-detail-share]").addEventListener("click", async () => {
    const i = ITEMS.find((x) => x.id === detailId);
    const url = `${location.origin}${location.pathname}#${detailId}`;
    try {
      if (navigator.share) await navigator.share({ title: `${i.title} | NEST`, url });
      else { await navigator.clipboard.writeText(url); showToast("Linkul a fost copiat."); }
    } catch { /* user cancelled */ }
  });

  /* ---------- Publish ---------- */
  const publish = $("#publish");
  function openPublish() { publish.showModal(); }
  $$("[data-open-publish]").forEach((b) => b.addEventListener("click", openPublish));
  $("[data-publish-close]").addEventListener("click", () => publish.close());
  publish.addEventListener("click", (e) => { if (e.target === publish) publish.close(); });
  $$("[data-publish-choice]").forEach((b) => b.addEventListener("click", () => {
    publish.close();
    showToast("Mulțumim! Publicarea directă vine curând; pregătim anunțul împreună.");
  }));

  /* ---------- Billboard ---------- */
  const bb = $("[data-billboard]");
  const slidesRoot = $("[data-bb-slides]");
  const content = $("[data-bb-content]");
  const progress = $("[data-bb-progress]");
  const pauseBtn = $("[data-bb-pause]");
  const featured = BILLBOARD.map((id) => ITEMS.find((i) => i.id === id));
  const SLIDE_MS = 7000;
  let bbIndex = 0;
  let bbStart = performance.now();
  let bbPaused = reduceMotion;
  let bbHover = false;

  slidesRoot.innerHTML = featured.map((i, n) => `<div class="bb-slide${n === 0 ? " active" : ""}"><img src="${i.img}" alt="" ${n === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></div>`).join("");
  progress.innerHTML = featured.map((i, n) => `<button type="button" role="tab" class="bb-seg" aria-label="${esc(i.title)}" aria-selected="${n === 0}"><i></i></button>`).join("");
  const slides = $$(".bb-slide", slidesRoot);
  const segs = $$(".bb-seg", progress);

  function showSlide(n) {
    bbIndex = (n + featured.length) % featured.length;
    const i = featured[bbIndex];
    slides.forEach((s, k) => s.classList.toggle("active", k === bbIndex));
    segs.forEach((s, k) => {
      s.setAttribute("aria-selected", String(k === bbIndex));
      $("i", s).style.transform = `scaleX(${k < bbIndex ? 1 : 0})`;
    });
    content.innerHTML = `<p class="bb-kicker">${esc(i.kicker)}${i.example ? ' <span class="badge-example">Exemplu</span>' : ""}</p>
      <h1 class="bb-title">${esc(i.title)}</h1>
      <p class="bb-meta">${esc(i.kind === "event" ? `${dayLabel(i.date)} · ${i.time} · ${i.where}, ${i.town}` : i.kind === "listing" ? `${i.town} · ${i.price}` : i.tags.join(" · "))}</p>
      <p class="bb-text">${esc(i.text)}</p>
      <div class="bb-actions">
        <button type="button" class="play-button" data-open="${i.id}"><span aria-hidden="true">▶</span> Vezi detalii</button>
        <button type="button" class="ghost-button" data-save="${i.id}" aria-pressed="${saved.has(i.id)}">${saved.has(i.id) ? "✓ În Lista mea" : "+ Lista mea"}</button>
      </div>`;
    content.classList.remove("in");
    void content.offsetWidth;
    content.classList.add("in");
    bbStart = performance.now();
  }
  segs.forEach((s, k) => s.addEventListener("click", () => showSlide(k)));
  const setBbPaused = (p) => {
    bbPaused = p;
    pauseBtn.textContent = p ? "▶" : "❚❚";
    pauseBtn.setAttribute("aria-label", p ? "Pornește derularea" : "Oprește derularea");
    bb.classList.toggle("paused", p);
  };
  pauseBtn.addEventListener("click", () => setBbPaused(!bbPaused));
  bb.addEventListener("mouseenter", () => { bbHover = true; });
  bb.addEventListener("mouseleave", () => { bbHover = false; });
  bb.addEventListener("focusin", () => { bbHover = true; });
  bb.addEventListener("focusout", () => { bbHover = false; });
  let bbElapsed = 0;
  function tickBillboard(now) {
    if (bbPaused || bbHover || document.hidden) {
      bbStart = now - bbElapsed;
    } else {
      bbElapsed = now - bbStart;
      const p = clamp(bbElapsed / SLIDE_MS, 0, 1);
      $("i", segs[bbIndex]).style.transform = `scaleX(${p})`;
      if (p >= 1) { bbElapsed = 0; showSlide(bbIndex + 1); }
    }
    requestAnimationFrame(tickBillboard);
  }
  showSlide(0);
  setBbPaused(reduceMotion);
  requestAnimationFrame(tickBillboard);

  /* ---------- Live strip: date, weather, this week ---------- */
  const now = new Date();
  $("[data-today]").textContent = now.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, (c) => c.toUpperCase());
  const week = ITEMS.filter((i) => i.kind === "event" && i.date - now < 7 * 864e5).length;
  $("[data-week-count]").innerHTML = `<strong>${week}</strong> ${week === 1 ? "eveniment" : "evenimente"} în următoarele 7 zile`;
  $("[data-year]").textContent = now.getFullYear();

  const WMO = (c) =>
    c === 0 ? ["senin", "☀"] : c <= 2 ? ["parțial noros", "⛅"] : c === 3 ? ["înnorat", "☁"] : c <= 48 ? ["ceață", "🌫"] :
    c <= 67 ? ["ploaie", "☂"] : c <= 77 ? ["ninsoare", "❄"] : c <= 82 ? ["averse", "☂"] : c <= 86 ? ["ninsoare", "❄"] : ["furtună", "⚡"];
  (async () => {
    try {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=45.4119,45.3700&longitude=23.3733,23.4900&elevation=nan,1700&current=temperature_2m,weather_code&timezone=Europe%2FBucharest";
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) return;
      const [town, peak] = await res.json();
      const [tDesc, tIcon] = WMO(town.current.weather_code);
      const el = $("[data-weather]");
      el.innerHTML = `<span class="w-icon" aria-hidden="true">${tIcon}</span><span><strong>Petroșani ${Math.round(town.current.temperature_2m)}°</strong> ${tDesc}</span><span class="w-sep" aria-hidden="true"></span><span>Parâng, 1.700 m: <strong>${Math.round(peak.current.temperature_2m)}°</strong></span>`;
      el.hidden = false;
    } catch { /* weather is a nice-to-have; hide on failure */ }
  })();

  /* ---------- Initial render + deep link ---------- */
  renderRails();
  const hashId = location.hash.slice(1);
  if (ITEMS.some((i) => i.id === hashId)) openDetail(hashId);

  /* ---------- Cinematic motion ---------- */
  function observeCards() {
    if (reduceMotion) return;
    cardObserver?.disconnect();
    cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("seen");
          cardObserver.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rails .rail").forEach((r, n) => {
      r.style.setProperty("--rail-delay", `${Math.min(n, 3) * 60}ms`);
      cardObserver.observe(r);
    });
  }
  if (reduceMotion) { document.documentElement.classList.add("reduce"); return; }
  document.documentElement.classList.add("motion");

  const mtns = $$(".bb-mountains .mtn");
  const valleyImg = $(".valley-media img");
  const valley = $(".valley");
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (y < bb.offsetHeight + 200) {
      mtns.forEach((m) => { m.style.transform = `translateY(${(-y * Number(m.dataset.depth)).toFixed(1)}px)`; });
      content.style.transform = `translateY(${(y * 0.25).toFixed(1)}px)`;
      content.style.opacity = String(clamp(1 - y / (bb.offsetHeight * 0.7), 0, 1));
    }
    const r = valley.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      valleyImg.style.transform = `scale(${(1.25 - p * 0.25).toFixed(4)})`;
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  update();
})();
