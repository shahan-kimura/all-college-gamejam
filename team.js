(() => {
  const catalog = Array.isArray(window.GAMEJAM_CATALOG) ? window.GAMEJAM_CATALOG : [];
  const id = new URLSearchParams(location.search).get("id");
  const workIndex = catalog.findIndex((work) => work.id === id);
  const host = document.querySelector("#detailContent");
  const breadcrumb = document.querySelector("#breadcrumbCurrent");

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  }

  function imagePlaceholder() {
    const placeholder = node("div", "image-placeholder", "GAME");
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", "作品サムネイルはありません");
    return placeholder;
  }

  function makeMedia(work) {
    if (!work.thumbnail) return imagePlaceholder();
    const image = node("img");
    image.src = work.thumbnail;
    image.alt = `${work.title} のサムネイル`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => image.replaceWith(imagePlaceholder()), { once: true });
    return image;
  }

  function actionLink(label, href, secondary = false) {
    const link = node("a", `action-link${secondary ? " secondary" : ""}`, label);
    link.href = href;
    if (/^https?:\/\//i.test(href)) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    return link;
  }

  function stateForReturn(work) {
    const params = new URLSearchParams(location.search);
    const requestedYear = params.get("year");
    const requestedCampus = params.get("campus");
    const years = new Set(catalog.map((item) => String(item.year)));
    const campuses = new Set(catalog.map((item) => item.campus));
    return {
      year: requestedYear === "all" ? "all" : (years.has(requestedYear) ? requestedYear : String(work.year)),
      campus: requestedCampus === "all" || campuses.has(requestedCampus) ? (requestedCampus || "all") : "all",
      query: params.get("q") || "",
    };
  }

  function archiveHref(state) {
    const params = new URLSearchParams();
    if (state.year !== "all") params.set("year", state.year);
    if (state.campus !== "all") params.set("campus", state.campus);
    if (state.query) params.set("q", state.query);
    const query = params.toString();
    return `index.html${query ? `?${query}` : ""}#works`;
  }

  function detailHref(work, state) {
    const params = new URLSearchParams({ id: work.id, year: state.year, campus: state.campus });
    if (state.query) params.set("q", state.query);
    return `team.html?${params.toString()}`;
  }

  function unavailable(label, explanation) {
    const group = node("div", "unavailable-group");
    group.append(node("span", "action-disabled", label), node("small", "availability-note", explanation));
    return group;
  }

  function setupDocumentViewer(section, documents) {
    if (!documents.length) {
      section.append(node("div", "viewer-placeholder", "公開資料はありません。"));
      return;
    }

    const tabList = node("div", "document-tabs");
    tabList.setAttribute("role", "tablist");
    tabList.setAttribute("aria-label", "表示する資料");
    const panel = node("section", "document-panel");
    panel.setAttribute("role", "tabpanel");
    panel.tabIndex = 0;
    section.append(tabList, panel);

    let activeIndex = 0;
    let slideIndex = 0;
    let viewerMode = "pdf";
    let activePanelToken = 0;
    const buttons = documents.map((doc, index) => {
      const button = node("button", "document-tab", doc.label || (doc.kind === "interim" ? "中間報告" : "企画書"));
      button.type = "button";
      button.setAttribute("role", "tab");
      button.id = `document-tab-${index}`;
      button.setAttribute("aria-controls", "document-panel-content");
      button.addEventListener("click", () => activateDocument(index));
      tabList.append(button);
      return button;
    });
    panel.id = "document-panel-content";

    function switchMode(mode) {
      viewerMode = mode;
      renderPanelContent();
    }

    function renderPanelContent() {
      const doc = documents[activeIndex];
      activePanelToken += 1;
      const token = activePanelToken;
      panel.replaceChildren();
      const tools = node("div", "document-tools");
      const name = node("span", "document-kind", doc.label || "公開資料");
      tools.append(name);

      const controls = node("div", "viewer-actions");
      if (doc.pdf && doc.slides?.length) {
        const pdfButton = node("button", "viewer-mode", "PDF");
        pdfButton.type = "button";
        pdfButton.setAttribute("aria-pressed", String(viewerMode === "pdf"));
        pdfButton.addEventListener("click", () => switchMode("pdf"));
        const slidesButton = node("button", "viewer-mode", "SLIDES");
        slidesButton.type = "button";
        slidesButton.setAttribute("aria-pressed", String(viewerMode === "slides"));
        slidesButton.addEventListener("click", () => switchMode("slides"));
        controls.append(pdfButton, slidesButton);
      }
      const download = doc.pdf || doc.slides?.[slideIndex];
      if (download) controls.append(actionLink("資料を開く ↗", download, true));
      tools.append(controls);
      panel.append(tools);
      const noteText = doc.note || (doc.originalTitle ? `当時の作品名：${doc.originalTitle}` : "");
      if (noteText) panel.append(node("p", "document-note", noteText));

      if (viewerMode === "pdf" && doc.pdf) {
        const placeholder = node("div", "viewer-placeholder", "資料を読み込んでいます…");
        panel.append(placeholder);
        requestAnimationFrame(() => {
          if (token !== activePanelToken) return;
          const frame = node("iframe", "pdf-frame");
          frame.src = doc.pdf;
          frame.title = `${doc.label || "作品資料"} PDF`;
          frame.loading = "lazy";
          placeholder.replaceWith(frame);
        });
        return;
      }

      if (doc.slides?.length) {
        slideIndex = Math.min(slideIndex, doc.slides.length - 1);
        const frame = node("div", "slide-frame");
        const image = node("img");
        image.alt = `${doc.label || "作品資料"} ${slideIndex + 1}ページ目`;
        image.loading = "lazy";
        image.decoding = "async";
        image.src = doc.slides[slideIndex];
        image.addEventListener("error", () => frame.replaceChildren(node("div", "viewer-placeholder", "このページの画像を表示できません。")), { once: true });
        frame.append(image);
        panel.append(frame);
        const pager = node("div", "document-tools slide-pager");
        const count = node("span", "slide-count", `${slideIndex + 1} / ${doc.slides.length}`);
        const pagerActions = node("div", "viewer-actions");
        const previous = node("button", "", "← 前へ");
        previous.type = "button";
        previous.disabled = slideIndex === 0;
        previous.addEventListener("click", () => { slideIndex -= 1; renderPanelContent(); });
        const next = node("button", "", "次へ →");
        next.type = "button";
        next.disabled = slideIndex >= doc.slides.length - 1;
        next.addEventListener("click", () => { slideIndex += 1; renderPanelContent(); });
        pagerActions.append(previous, next);
        pager.append(count, pagerActions);
        panel.append(pager);
        return;
      }

      if (doc.pdf) {
        const placeholder = node("div", "viewer-placeholder", "資料を読み込んでいます…");
        panel.append(placeholder);
        requestAnimationFrame(() => {
          if (token !== activePanelToken) return;
          const frame = node("iframe", "pdf-frame");
          frame.src = doc.pdf;
          frame.title = `${doc.label || "作品資料"} PDF`;
          frame.loading = "lazy";
          placeholder.replaceWith(frame);
        });
      } else {
        panel.append(node("div", "viewer-placeholder", "資料は登録されていますが、表示できるファイルはありません。"));
      }
    }

    function activateDocument(index) {
      activeIndex = index;
      slideIndex = 0;
      viewerMode = documents[index].pdf ? "pdf" : "slides";
      buttons.forEach((button, buttonIndex) => {
        button.setAttribute("aria-selected", String(buttonIndex === index));
        button.tabIndex = buttonIndex === index ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", buttons[index].id);
      renderPanelContent();
    }

    activateDocument(0);
  }

  function render() {
    if (workIndex < 0) {
      breadcrumb.textContent = "作品が見つかりません";
      host.append(node("section", "missing-work", ""));
      const missing = host.firstElementChild;
      missing.append(node("h1", "", "作品が見つかりません"), node("p", "", "リンク先をご確認ください。"), actionLink("作品一覧へ戻る", "index.html"));
      document.title = "作品が見つかりません — ALL COLLEGE GAME JAM";
      return;
    }
    const work = catalog[workIndex];
    const returnState = stateForReturn(work);
    document.querySelectorAll('.brand[href="index.html"], .header-meta a[href="index.html"], .breadcrumb a[href="index.html"]').forEach((link) => {
      link.href = archiveHref(returnState);
    });
    breadcrumb.textContent = work.title || "作品詳細";
    document.title = `${work.title || "作品詳細"} — ALL COLLEGE GAME JAM`;

    const hero = node("section", "detail-hero");
    const art = node("div", "detail-art");
    art.append(makeMedia(work));
    const year = node("span", "card-year", String(work.year));
    art.append(year);
    const copy = node("div", "detail-copy");
    copy.append(node("div", "detail-id", `${work.year} / ${String(work.id).replace(/^\d{4}-/, "").toUpperCase()}`));
    copy.append(node("h1", "detail-title", work.title || "作品名未確認"));
    if (work.genre) copy.append(node("p", "detail-genre", work.genre));
    copy.append(node("div", "detail-campus", work.campus || "校舎未確認"));
    if (work.concept) copy.append(node("p", "detail-concept", work.concept));

    const actions = node("div", "detail-actions");
    if (work.download) {
      const label = /unityroom\.com/i.test(work.download) ? "ブラウザでプレイ ↗" : "ゲームをダウンロード ↗";
      actions.append(actionLink(label, work.download));
    } else {
      actions.append(unavailable(work.year === 2026 ? "成果物未確認" : "公開リンク未確認", "ゲームの配布リンクは現在確認できていません。"));
    }
    if (work.video) {
      const button = node("button", "action-link secondary", "映像を再生 ↓");
      button.type = "button";
      button.addEventListener("click", () => {
        const video = host.querySelector(".detail-video");
        video.classList.add("is-visible");
        if (!video.src) video.src = work.video;
        video.focus();
      });
      actions.append(button);
    } else {
      actions.append(unavailable("映像資料なし", "公開されたプレイ映像はありません。"));
    }
    copy.append(actions);
    if (work.downloadNote) copy.append(node("p", "availability-note", work.downloadNote));
    if (work.download && work.downloadAccess === "login_unknown") {
      copy.append(node("p", "availability-note", "Google Driveへのログインが必要な場合があります。"));
    }
    if (work.videoNote) copy.append(node("p", "availability-note", `${work.videoLabel || "プレイ動画"}：${work.videoNote}`));

    const video = node("video", "detail-video");
    video.controls = true;
    video.preload = "none";
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", `${work.title} の映像`);
    hero.append(art, copy, video);
    host.append(hero);

    const docsSection = node("section", "documents-section");
    docsSection.append(node("div", "documents-heading", ""));
    const docsHeading = docsSection.firstElementChild;
    docsHeading.append(node("h2", "", "作品資料"), node("span", "", "PROPOSAL / INTERIM REPORT"));
    const documents = Array.isArray(work.documents) ? work.documents.filter((doc) => doc && (doc.pdf || (Array.isArray(doc.slides) && doc.slides.length) || doc.kind)) : [];
    setupDocumentViewer(docsSection, documents);
    host.append(docsSection);

    const pagination = node("nav", "detail-pagination");
    pagination.setAttribute("aria-label", "作品間の移動");
    const previousWork = catalog[(workIndex - 1 + catalog.length) % catalog.length];
    const nextWork = catalog[(workIndex + 1) % catalog.length];
    const previous = actionLink(`← ${previousWork.title || "前の作品"}`, detailHref(previousWork, returnState), true);
    const next = actionLink(`${nextWork.title || "次の作品"} →`, detailHref(nextWork, returnState), true);
    pagination.append(previous, next);
    host.append(pagination);
  }

  render();
})();
