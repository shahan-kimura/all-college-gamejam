(() => {
  const catalog = Array.isArray(window.GAMEJAM_CATALOG) ? window.GAMEJAM_CATALOG : [];
  const grid = document.querySelector("#worksGrid");
  const yearFilters = document.querySelector("#yearFilters");
  const campusFilters = document.querySelector("#campusFilters");
  const searchInput = document.querySelector("#searchInput");
  const resultCount = document.querySelector("#resultCount");
  const emptyState = document.querySelector("#emptyState");

  const years = [...new Set(catalog.map((work) => String(work.year)))].sort((a, b) => Number(b) - Number(a));
  const campuses = [...new Set(catalog.map((work) => work.campus).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
  const displayName = (campus) => campus?.replace(/校$/, "") || "校舎未確認";
  const initial = new URLSearchParams(location.search);
  let selectedYear = initial.get("year") === "all" || years.includes(initial.get("year")) ? initial.get("year") : "all";
  let selectedCampus = initial.get("campus") === "all" || campuses.includes(initial.get("campus")) ? initial.get("campus") : "all";
  searchInput.value = initial.get("q") || "";

  function syncUrl() {
    const params = new URLSearchParams();
    if (selectedYear !== "all") params.set("year", selectedYear);
    if (selectedCampus !== "all") params.set("campus", selectedCampus);
    if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
    const query = params.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
  }

  function makePlaceholder(mark = "ACJ") {
    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.setAttribute("aria-label", "作品サムネイルはありません");
    placeholder.textContent = mark;
    return placeholder;
  }

  function makeFilterButton(parent, value, label, selected, onSelect) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-chip${selected ? " is-active" : ""}`;
    button.textContent = label;
    button.setAttribute("aria-pressed", String(selected));
    button.addEventListener("click", () => onSelect(value));
    parent.append(button);
  }

  function makeCard(work, index) {
    const card = document.createElement("a");
    card.className = "work-card";
    const detailParams = new URLSearchParams({ id: work.id, year: selectedYear, campus: selectedCampus });
    if (searchInput.value.trim()) detailParams.set("q", searchInput.value.trim());
    card.href = `team.html?${detailParams.toString()}`;
    card.setAttribute("aria-label", `${work.title}、${work.year}年、${work.campus}。作品詳細を開く`);

    const imageBox = document.createElement("div");
    imageBox.className = "card-image";
    imageBox.setAttribute("aria-hidden", "true");
    if (work.thumbnail) {
      const image = document.createElement("img");
      image.src = work.thumbnail;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => image.replaceWith(makePlaceholder("GAME")), { once: true });
      imageBox.append(image);
    } else {
      imageBox.append(makePlaceholder("GAME"));
    }
    const number = document.createElement("span");
    number.className = "card-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const year = document.createElement("span");
    year.className = "card-year";
    year.textContent = String(work.year);
    imageBox.append(number, year);
    if (work.video) {
      const play = document.createElement("span");
      play.className = "card-play";
      play.textContent = "▶";
      imageBox.append(play);
    }

    const body = document.createElement("div");
    body.className = "card-body";
    const campus = document.createElement("p");
    campus.className = "card-campus";
    campus.textContent = displayName(work.campus);
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = work.title || "作品名未確認";
    const genre = document.createElement("p");
    genre.className = "card-genre";
    genre.textContent = work.genre || "ジャンル未確認";
    const concept = document.createElement("p");
    concept.className = "card-concept";
    concept.textContent = work.concept || "作品紹介はありません。";
    body.append(campus, title, genre, concept);
    card.append(imageBox, body);
    return card;
  }

  function renderFilterChips(withinYear) {
    yearFilters.replaceChildren();
    makeFilterButton(yearFilters, "all", `すべて (${catalog.length})`, selectedYear === "all", (value) => { selectedYear = value; render(); });
    for (const year of years) {
      const count = catalog.filter((work) => String(work.year) === year).length;
      makeFilterButton(yearFilters, year, `${year} (${count})`, selectedYear === year, (value) => { selectedYear = value; render(); });
    }

    campusFilters.replaceChildren();
    makeFilterButton(campusFilters, "all", `すべて (${withinYear.length})`, selectedCampus === "all", (value) => { selectedCampus = value; render(); });
    for (const campus of campuses) {
      const count = withinYear.filter((work) => work.campus === campus).length;
      makeFilterButton(campusFilters, campus, `${displayName(campus)} (${count})`, selectedCampus === campus, (value) => { selectedCampus = value; render(); });
    }
  }

  function render() {
    const term = searchInput.value.trim().normalize("NFC").toLocaleLowerCase("ja");
    const withinYear = selectedYear === "all" ? catalog : catalog.filter((work) => String(work.year) === selectedYear);
    const visible = withinYear.filter((work) => {
      if (selectedCampus !== "all" && work.campus !== selectedCampus) return false;
      if (!term) return true;
      const haystack = [work.title, work.genre, work.concept, work.campus, work.year].join(" ").normalize("NFC").toLocaleLowerCase("ja");
      return haystack.includes(term);
    });

    renderFilterChips(withinYear);
    grid.replaceChildren(...visible.map((work, index) => makeCard(work, index)));
    resultCount.textContent = String(visible.length).padStart(2, "0");
    emptyState.hidden = visible.length !== 0;
    syncUrl();
  }

  searchInput.addEventListener("input", render);
  render();
})();
