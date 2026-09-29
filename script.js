(async () => {
  // West to east along the Jiu, with real longitudes (used to place towns on the valley line)
  const TOWNS = [
    { name: "Uricani", lon: 23.115 },
    { name: "Lupeni", lon: 23.224 },
    { name: "Vulcan", lon: 23.293 },
    { name: "Aninoasa", lon: 23.314 },
    { name: "Petroșani", lon: 23.37 },
    { name: "Petrila", lon: 23.404 },
  ];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  /* Example events get dates relative to today, so the agenda never looks stale. */
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
  const dayLabel = (d) => d.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });

  /* ------------------------------------------------------------------
   * CONTENT lives in content.json, so it can be edited without touching
   * code (e.g. from the Organizator app, which commits that file).
   * "example: true" = demo item, clearly labelled on the site.
   * Event dates: "2026-10-10" (fixed), {"inDays": 12} or {"weekday": 0}
   * (0 = Sunday; next such day), so example events never look stale.
   * ------------------------------------------------------------------ */
  const eventDate = (spec) => {
    if (spec && typeof spec === "object") {
      if (spec.weekday != null) return nextDay(spec.weekday, spec.minDays ?? 1);
      return inDays(spec.inDays ?? 0);
    }
    const [y, m, d] = String(spec).split("-").map(Number);
    return new Date(y, m - 1, d, 12);
  };
  let CONTENT = { texts: {}, facts: [], utile: [], steps: [], items: [] };
  try {
    const res = await fetch("content.json", { cache: "no-store" });
    if (res.ok) CONTENT = await res.json();
  } catch { /* offline or file:// — the page still works, just empty */ }
  const ITEMS = CONTENT.items.map((i) => (i.kind === "event" ? { ...i, date: eventDate(i.date) } : i));

  /* ---------- Editable texts and small lists ---------- */
  $$("[data-text]").forEach((el) => {
    const t = CONTENT.texts?.[el.dataset.text];
    if (t != null) el.textContent = t;
  });
  if (CONTENT.facts?.length) {
    $(".valley-facts").innerHTML = CONTENT.facts
      .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd><p>${esc(f.note)}</p></div>`)
      .join("");
  }
  if (CONTENT.utile?.length) {
    $(".utile-grid").innerHTML = CONTENT.utile
      .map((u) => {
        const external = /^https?:/.test(u.href) ? ' target="_blank" rel="noopener"' : "";
        return `<a class="utile-card${u.urgent ? " utile-urgent" : ""}" href="${esc(u.href)}"${external}><span class="u-icon" aria-hidden="true">${esc(u.icon)}</span><strong>${esc(u.title)}</strong><small>${esc(u.subtitle)}</small></a>`;
      })
      .join("");
  }
  if (CONTENT.steps?.length) {
    $(".steps").innerHTML = CONTENT.steps.map((st) => `<li><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p></li>`).join("");
  }

  /* ---------- Toast ---------- */
  const toast = $("#toast");
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
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

  /* ---------- Filters: town (valley line), kind (chips), text ---------- */
  const state = { town: null, kind: "all", q: "" };
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  function matches(i) {
    if (state.town && i.town !== state.town) return false;
    if (state.kind !== "all" && i.kind !== state.kind) return false;
    if (state.q) {
      const hay = norm([i.title, i.town, i.kicker, i.text, ...(i.tags || [])].join(" "));
      if (!norm(state.q).split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  // Towns on the valley line, positioned by longitude along the river path
  const townsRoot = $("[data-towns]");
  const jiu = $("#jiu-path");
  const LON_MIN = 23.08;
  const LON_MAX = 23.44;
  townsRoot.innerHTML = TOWNS.map((t, n) => {
    const count = ITEMS.filter((i) => i.town === t.name).length;
    return `<button type="button" class="town${n % 2 ? " town-below" : ""}" data-town="${t.name}" aria-pressed="false" style="--i:${n}">
      <span class="town-dot" aria-hidden="true"></span>
      <span class="town-name">${t.name}</span>
      <span class="town-count">${count ? `${count} ${count === 1 ? "lucru" : "lucruri"}` : "în curând"}</span>
    </button>`;
  }).join("");
  function placeTowns() {
    const total = jiu.getTotalLength();
    const samples = [];
    for (let k = 0; k <= 200; k++) samples.push(jiu.getPointAtLength((k / 200) * total));
    $$(".town", townsRoot).forEach((el, n) => {
      const x = ((TOWNS[n].lon - LON_MIN) / (LON_MAX - LON_MIN)) * 1000;
      const pt = samples.reduce((best, p) => (Math.abs(p.x - x) < Math.abs(best.x - x) ? p : best));
      el.style.left = `${(pt.x / 1000) * 100}%`;
      el.style.top = `${(pt.y / 120) * 100}%`;
    });
  }
  placeTowns();

  townsRoot.addEventListener("click", (e) => {
    const b = e.target.closest("[data-town]");
    if (!b) return;
    state.town = state.town === b.dataset.town ? null : b.dataset.town;
    render();
    if (state.town) $("#agenda").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
  $$(".kind").forEach((k) => k.addEventListener("click", () => {
    state.kind = k.dataset.kind;
    render();
  }));
  const qInput = $("#q");
  qInput.addEventListener("input", () => { state.q = qInput.value.trim(); render(); });
  $("[data-search]").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#agenda").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
  $("[data-filter-clear]").addEventListener("click", () => {
    state.town = null;
    state.kind = "all";
    state.q = "";
    qInput.value = "";
    render();
  });

  /* ---------- Rendering ---------- */
  const media = (i, cls = "") =>
    i.img ? `<img class="${cls}" src="${i.img}" alt="" loading="lazy">` : `<span class="${cls} noimg" aria-hidden="true">${i.icon ?? "✦"}</span>`;
  const example = (i) => (i.example ? '<span class="badge-example">Exemplu</span>' : "");

  function agendaRow(i) {
    const d = i.date;
    return `<li><button type="button" class="agenda-row" data-open="${i.id}">
      <span class="ag-date"><strong>${d.getDate()}</strong><span>${d.toLocaleDateString("ro-RO", { month: "short" })}</span><small>${d.toLocaleDateString("ro-RO", { weekday: "short" })}</small></span>
      <span class="ag-main">
        <span class="ag-kicker">${esc(i.kicker)} ${example(i)}</span>
        <span class="ag-title">${esc(i.title)}</span>
        <span class="ag-meta">${esc(i.time)} · ${esc(i.where)}, ${esc(i.town)}</span>
      </span>
      ${media(i, "ag-thumb")}
    </button></li>`;
  }
  function placeCard(i, lead) {
    return `<button type="button" class="place${lead ? " place-lead" : ""}" data-open="${i.id}">
      ${media(i, "place-img")}
      <span class="place-body">
        <span class="place-town">${esc(i.town)} · ${esc(i.kicker)}</span>
        <span class="place-title">${esc(i.title)}</span>
        ${lead ? `<span class="place-text">${esc(i.text)}</span>` : ""}
      </span>
    </button>`;
  }
  function tripCard(i) {
    return `<button type="button" class="trip" data-open="${i.id}">
      ${media(i, "trip-img")}
      <span class="trip-body"><span class="place-town">${esc(i.kicker)}</span><span class="trip-title">${esc(i.title)}</span><span class="trip-text">${esc(i.text)}</span></span>
    </button>`;
  }
  function listingRow(i) {
    return `<button type="button" class="listing" data-open="${i.id}">
      ${media(i, "listing-img")}
      <span class="listing-main">
        <span class="listing-kicker">${esc(i.kicker)}</span>
        <span class="listing-title">${esc(i.title)}</span>
        <span class="listing-meta">${esc(i.town)} · ${i.tags.map(esc).join(" · ")}</span>
      </span>
      <strong class="listing-price">${esc(i.price)}</strong>
    </button>`;
  }

  const filterBar = $("[data-filter-bar]");
  function render() {
    const list = ITEMS.filter(matches);
    const events = list.filter((i) => i.kind === "event").sort((a, b) => a.date - b.date);
    const places = list.filter((i) => i.kind === "place");
    const trips = list.filter((i) => i.kind === "trip");
    const listings = list.filter((i) => i.kind === "listing");

    $("[data-agenda]").innerHTML = events.map(agendaRow).join("");
    $("[data-places]").innerHTML = places.map((i, n) => placeCard(i, n === 0)).join("");
    $("[data-trips]").innerHTML = trips.map(tripCard).join("");
    $("[data-listings]").innerHTML =
      listings.map(listingRow).join("") +
      `<button type="button" class="listing listing-cta" data-open-publish><span class="cta-plus" aria-hidden="true">+</span><span class="listing-main"><span class="listing-title">Ai ceva de oferit sau cauți ceva?</span><span class="listing-meta">Publică gratuit, pentru oamenii din Vale.</span></span></button>`;

    $("#agenda").hidden = !events.length && state.kind !== "all" && state.kind !== "event";
    $("#locuri").hidden = !places.length;
    $("#excursii").hidden = !trips.length;
    $("#anunturi").hidden = state.kind !== "all" && state.kind !== "listing";
    if (!events.length) $("[data-agenda]").innerHTML = `<li class="agenda-empty">Nimic în agendă${state.town ? ` pentru ${esc(state.town)}` : ""} deocamdată. Ai un eveniment? Propune-l.</li>`;
    $("[data-empty]").hidden = list.length > 0;

    $$(".town").forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.town === state.town)));
    $$(".kind").forEach((k) => k.setAttribute("aria-pressed", String(k.dataset.kind === state.kind)));
    const filtering = state.town || state.kind !== "all" || state.q;
    filterBar.hidden = !filtering;
    if (filtering) {
      const parts = [state.town ? `în ${state.town}` : "în toată Valea", state.q ? `„${state.q}”` : null].filter(Boolean);
      $("[data-filter-text]").textContent = `${list.length} ${list.length === 1 ? "rezultat" : "rezultate"} ${parts.join(", ")}.`;
    }
    observeReveal();
  }

  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    const pub = e.target.closest("[data-open-publish]");
    if (open) { e.preventDefault(); openDetail(open.dataset.open); }
    else if (pub) { e.preventDefault(); openPublish(); }
  });

  /* ---------- Detail ---------- */
  const detail = $("#detail");
  let detailId = null;
  function openDetail(id) {
    const i = ITEMS.find((x) => x.id === id);
    if (!i) return;
    detailId = id;
    const img = $("#detail-img");
    img.src = i.img ?? "images/parang-vale.jpg";
    img.alt = i.img ? i.title : "";
    detail.classList.toggle("detail-noimg", !i.img);
    $("#detail-kicker").textContent = i.example ? `${i.kicker} · Exemplu` : `${i.kicker} · ${i.town}`;
    $("#detail-title").textContent = i.title;
    $("#detail-text").textContent = i.text;
    const metaItems = [
      i.kind === "event" ? `${dayLabel(i.date)}, ora ${i.time}` : null,
      i.where ? `${i.where}, ${i.town}` : null,
      i.price ?? null,
      ...i.tags,
    ].filter(Boolean);
    $("#detail-meta").innerHTML = metaItems.map((m) => `<li>${esc(m)}</li>`).join("");
    $("#detail-gallery").innerHTML = (i.gallery || []).map((g) => `<img src="${g}" alt="" loading="lazy">`).join("");
    $("[data-detail-map]").href = maps(i.map);
    const more = ITEMS.filter((x) => x.id !== id && x.town === i.town).slice(0, 4);
    $("#detail-more-title").textContent = more.length ? `Tot din ${i.town}` : "";
    $("#detail-more").innerHTML = more
      .map((x) => `<li><button type="button" data-open="${x.id}">${media(x, "more-img")}<span><strong>${esc(x.title)}</strong><small>${esc(x.kicker)}</small></span></button></li>`)
      .join("");
    if (!detail.open) detail.showModal();
    detail.scrollTop = 0;
    history.replaceState(null, "", `#${id}`);
  }
  $("[data-detail-close]").addEventListener("click", () => detail.close());
  detail.addEventListener("click", (e) => { if (e.target === detail) detail.close(); });
  detail.addEventListener("close", () => { detailId = null; history.replaceState(null, "", location.pathname + location.search); });
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
  $("[data-publish-close]").addEventListener("click", () => publish.close());
  publish.addEventListener("click", (e) => { if (e.target === publish) publish.close(); });
  $$("[data-publish-choice]").forEach((b) => b.addEventListener("click", () => {
    publish.close();
    showToast("Mulțumim! Publicarea directă vine curând; pregătim anunțul împreună.");
  }));

  /* ---------- Today: date, weather, sunset ---------- */
  const now = new Date();
  $("[data-today]").textContent = dayLabel(now).replace(/^./, (c) => c.toUpperCase());
  $("[data-year]").textContent = now.getFullYear();
  const WMO = (c) =>
    c === 0 ? ["senin", "☀"] : c <= 2 ? ["parțial noros", "⛅"] : c === 3 ? ["înnorat", "☁"] : c <= 48 ? ["ceață", "🌫"] :
    c <= 67 ? ["ploaie", "☂"] : c <= 77 ? ["ninsoare", "❄"] : c <= 82 ? ["averse", "☂"] : c <= 86 ? ["ninsoare", "❄"] : ["furtună", "⚡"];
  (async () => {
    try {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=45.4119,45.3700&longitude=23.3733,23.4900&elevation=nan,1700&current=temperature_2m,weather_code&daily=sunset&forecast_days=1&timezone=Europe%2FBucharest";
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) return;
      const [town, peak] = await res.json();
      const [desc, icon] = WMO(town.current.weather_code);
      const sunset = town.daily?.sunset?.[0]?.slice(11, 16);
      const el = $("[data-weather]");
      el.innerHTML = `<span class="w-card"><span class="w-icon" aria-hidden="true">${icon}</span><span><strong>${Math.round(town.current.temperature_2m)}°</strong> Petroșani, ${desc}</span></span>
        <span class="w-card"><span class="w-icon" aria-hidden="true">▲</span><span><strong>${Math.round(peak.current.temperature_2m)}°</strong> Parâng, 1.700 m</span></span>
        ${sunset ? `<span class="w-card"><span class="w-icon" aria-hidden="true">◐</span><span>Apusul la <strong>${sunset}</strong></span></span>` : ""}`;
      el.hidden = false;
    } catch { /* weather is a nice-to-have; hide on failure */ }
  })();

  /* ---------- Motion: blocks settle in as they arrive ---------- */
  let io = null;
  function observeReveal() {
    if (reduceMotion) return;
    io?.disconnect();
    io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    $$(".agenda-row, .place, .trip, .listing, .utile-card, .valley-facts > div").forEach((el, n) => {
      if (el.classList.contains("in")) return;
      el.classList.add("rv");
      el.style.setProperty("--d", `${(n % 4) * 70}ms`);
      io.observe(el);
    });
  }

  render();
  const hashId = location.hash.slice(1);
  if (ITEMS.some((i) => i.id === hashId)) openDetail(hashId);

  if (reduceMotion) { document.documentElement.classList.add("reduce"); return; }
  document.documentElement.classList.add("motion");

  const today = $(".today");
  const todayImg = $(".today-media img");
  const mtns = $$(".today-mountains .mtn");
  const valleyImg = $(".valley-media img");
  const valley = $(".valley");
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (y < today.offsetHeight + 200) {
      todayImg.style.transform = `scale(${(1.08 + y / 4000).toFixed(4)}) translateY(${(y * 0.2).toFixed(1)}px)`;
      mtns.forEach((m) => { m.style.transform = `translateY(${(-y * Number(m.dataset.depth)).toFixed(1)}px)`; });
    }
    const r = valley.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      valleyImg.style.transform = `scale(${(1.25 - p * 0.25).toFixed(4)})`;
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", () => { placeTowns(); request(); });
  update();
})();
