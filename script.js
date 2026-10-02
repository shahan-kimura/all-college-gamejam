/* ========================================================
   All College Game Jam 2025 — Main Script
   Sidebar Drawer & Campus Filter Controller (40 Teams)
   ======================================================== */

const GCKPortfolio = (() => {
  let config = {};
  let idleSeconds = 0;
  let frameCount = 0;
  let lastFpsTime = performance.now();
  let fpsCount = 0;
  let currentFps = 60;
  let currentVideoIndex = 0;

  let currentSlide = 1;
  let totalSlides = 1;
  let currentTeamKey = null;

  // === 40 ENTRIES DATA ===
  const CATALOG = Array.isArray(window.GAMEJAM_CATALOG) ? window.GAMEJAM_CATALOG : [];
  const TEAM_DATA = Object.fromEntries(CATALOG.map((work, index) => [work.id, {
    ...work,
    num: String(index + 1).padStart(2, '0'),
    documents: Array.isArray(work.documents) ? work.documents : []
  }]));

  function init(options) {
    config = Object.assign({
      pageType: 'index',
      videos: [],
      currentTeam: null,
      autoSwitchInterval: 30
    }, options);

    if (!config.videos.length) {
      if (config.pageType === 'index') {
        config.videos = CATALOG.filter((work) => work.video).map((work) => work.video);
      } else {
        const requestedId = new URLSearchParams(location.search).get('id');
        config.currentTeam = requestedId || CATALOG[0]?.id;
        const selectedWork = TEAM_DATA[config.currentTeam];
        config.videos = selectedWork?.video ? [selectedWork.video] : [];
      }
    }
    renderDirectory();
    initFuiHUD();
    initVideoBackground();
    initMouseReveal();
    initAutoSwitch();
    initCampusDrawer();

    if (config.pageType === 'index') {
      initIndexCards();
      initCampusFilter();
    } else if (config.pageType === 'team') {
      initTeamPage();
    }
  }

  function initCampusDrawer() {
    const trigger = document.getElementById('drawerTrigger');
    const closeBtn = document.getElementById('drawerClose');
    const sidebar = document.getElementById('campusSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (!trigger || !sidebar || !backdrop) return;

    function openSidebar() {
      sidebar.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    trigger.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });
  }

  function initCampusFilter() {
    const yearBox = document.getElementById('yearFilters');
    const campusBox = document.getElementById('campusFilters');
    const cards = Array.from(document.querySelectorAll('.team-card'));
    const years = [...new Set(CATALOG.map((work) => String(work.year)))].sort((a, b) => Number(b) - Number(a));
    const campuses = [...new Set(CATALOG.map((work) => work.campus).filter(Boolean))];
    const params = new URLSearchParams(location.search);
    let selectedYear = years.includes(params.get('year')) ? params.get('year') : 'all';
    let selectedCampus = campuses.includes(params.get('campus')) ? params.get('campus') : 'all';
    const buildButtons = (container, values, selected, dataName, labelFor) => {
      if (!container) return;
      container.replaceChildren();
      const items = [{ value: 'all', label: `ALL (${CATALOG.length})` }, ...values.map((value) => ({ value, label: labelFor(value) }))];
      items.forEach(({ value, label }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `filter-btn${selected === value ? ' active' : ''}`;
        button.dataset[dataName] = value;
        button.setAttribute('aria-pressed', String(selected === value));
        button.textContent = label;
        container.append(button);
      });
    };
    const refresh = () => {
      buildButtons(yearBox, years, selectedYear, 'year', (year) => `${year} (${CATALOG.filter((work) => String(work.year) === year).length})`);
      buildButtons(campusBox, campuses, selectedCampus, 'campus', (campus) => `${campus.replace(/校$/, '')} (${CATALOG.filter((work) => work.campus === campus).length})`);
      cards.forEach((card) => { card.hidden = (selectedYear !== 'all' && card.dataset.year !== selectedYear) || (selectedCampus !== 'all' && card.dataset.campus !== selectedCampus); });
      const visible = cards.filter((card) => !card.hidden).length;
      const count = document.getElementById('entryCount');
      const campusCount = document.getElementById('campusCount');
      const empty = document.getElementById('emptyWorks');
      if (count) count.textContent = `${visible} ACTIVE`;
      const shownCampuses = new Set(cards.filter((card) => !card.hidden).map((card) => card.dataset.campus));
      if (campusCount) campusCount.textContent = `${shownCampuses.size} CAMPUSES`;
      if (empty) empty.hidden = visible > 0;
      const next = new URLSearchParams();
      if (selectedYear !== 'all') next.set('year', selectedYear);
      if (selectedCampus !== 'all') next.set('campus', selectedCampus);
      history.replaceState(null, '', `${location.pathname}${next.size ? `?${next}` : ''}${location.hash}`);
    };
    [yearBox, campusBox].filter(Boolean).forEach((container) => container.addEventListener('click', (event) => {
      const button = event.target.closest('button.filter-btn');
      if (!button) return;
      if (button.dataset.year) selectedYear = button.dataset.year;
      if (button.dataset.campus) selectedCampus = button.dataset.campus;
      refresh();
    }));
    refresh();
  }

  function renderDirectory() {
    const container = document.getElementById('sidebarContent');
    const trigger = document.getElementById('drawerTrigger');
    if (trigger) trigger.textContent = `☰ 校舎別作品リスト (${CATALOG.length}作品)`;
    if (!container) return;
    const byCampus = new Map();
    CATALOG.forEach((work) => { if (!byCampus.has(work.campus)) byCampus.set(work.campus, []); byCampus.get(work.campus).push(work); });
    container.replaceChildren();
    byCampus.forEach((works, campus) => {
      const group = document.createElement('div'); group.className = 'campus-group';
      const heading = document.createElement('div'); heading.className = 'campus-group-title';
      const name = document.createElement('span'); name.textContent = `🏫 ${campus}`;
      const count = document.createElement('span'); count.className = 'campus-badge-count'; count.textContent = String(works.length);
      heading.append(name, count);
      const list = document.createElement('ul'); list.className = 'campus-game-list';
      works.forEach((work) => {
        const item = document.createElement('li'); item.className = 'campus-game-item';
        const link = document.createElement('a'); link.className = 'sidebar-game-link'; link.dataset.id = work.id;
        link.href = `team.html?id=${encodeURIComponent(work.id)}`; link.textContent = work.title;
        item.append(link); list.append(item);
      });
      group.append(heading, list); container.append(group);
    });
  }

  function initFuiHUD() {
    const timeEl = document.getElementById('fuiTime');
    const coordEl = document.getElementById('fuiCoord');
    const fpsEl = document.getElementById('fuiFps');
    const frameEl = document.getElementById('fuiFrame');
    const idleEl = document.getElementById('fuiIdle');

    function updateHUD() {
      const now = new Date();
      if (timeEl) {
        timeEl.textContent = now.getFullYear() + '.' +
          String(now.getMonth() + 1).padStart(2, '0') + '.' +
          String(now.getDate()).padStart(2, '0') + ' ' +
          String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0') + ':' +
          String(now.getSeconds()).padStart(2, '0');
      }

      frameCount++;
      fpsCount++;
      const curTime = performance.now();
      if (curTime - lastFpsTime >= 500) {
        currentFps = Math.round((fpsCount * 1000) / (curTime - lastFpsTime));
        fpsCount = 0;
        lastFpsTime = curTime;
      }

      if (fpsEl) fpsEl.textContent = currentFps;
      if (frameEl) frameEl.textContent = String(frameCount).padStart(6, '0');
      if (idleEl) idleEl.textContent = String(idleSeconds).padStart(2, '0') + 's';

      requestAnimationFrame(updateHUD);
    }
    requestAnimationFrame(updateHUD);

    document.addEventListener('mousemove', (e) => {
      idleSeconds = 0;
      if (coordEl) {
        coordEl.textContent = 'X:' + String(e.clientX).padStart(4, '0') + ' Y:' + String(e.clientY).padStart(4, '0');
      }
    });

    setInterval(() => {
      idleSeconds++;
    }, 1000);
  }

  function initVideoBackground() {
    const bgVideo = document.getElementById('bgVideo');
    const revealVideo = document.getElementById('revealVideo');
    if (!bgVideo) return;

    const initialWork = config.pageType === 'team'
      ? TEAM_DATA[config.currentTeam]
      : CATALOG.find((work) => work.video === config.videos[0]);
    [bgVideo, revealVideo].forEach((video) => {
      if (!video) return;
      if (initialWork?.thumbnail) video.poster = initialWork.thumbnail;
      else video.removeAttribute('poster');
    });

    if (config.videos.length > 0) {
      bgVideo.src = config.videos[0];
      if (revealVideo) revealVideo.src = config.videos[0];
      bgVideo.play().catch(() => {});
      if (revealVideo) revealVideo.play().catch(() => {});
    }
  }

  function initMouseReveal() {
    const revealLayer = document.querySelector('.mouse-reveal-layer');
    if (!revealLayer) return;

    document.addEventListener('mousemove', (e) => {
      revealLayer.style.setProperty('--mouse-x', e.clientX + 'px');
      revealLayer.style.setProperty('--mouse-y', e.clientY + 'px');
    });
  }

  function initAutoSwitch() {
    if (!config.videos || config.videos.length <= 1) return;
    const interval = config.autoSwitchInterval * 1000;
    const bar = document.querySelector('.auto-switch-bar');

    function triggerSwitch() {
      triggerGlitch(() => {
        currentVideoIndex = (currentVideoIndex + 1) % config.videos.length;
        const bgVideo = document.getElementById('bgVideo');
        const revealVideo = document.getElementById('revealVideo');
        const nextVideo = config.videos[currentVideoIndex];
        const nextWork = CATALOG.find((work) => work.video === nextVideo);
        [bgVideo, revealVideo].forEach((video) => {
          if (!video) return;
          if (nextWork?.thumbnail) video.poster = nextWork.thumbnail;
          else video.removeAttribute('poster');
          video.src = nextVideo;
        });
      });
    }

    function restartBar() {
      if (bar) {
        bar.style.animation = 'none';
        void bar.offsetHeight;
        bar.style.animation = 'switchProgress ' + config.autoSwitchInterval + 's linear infinite';
      }
    }

    restartBar();
    setInterval(() => {
      triggerSwitch();
      restartBar();
    }, interval);
  }

  function triggerGlitch(callback) {
    const overlay = document.getElementById('glitchOverlay');
    if (!overlay) {
      if (callback) callback();
      return;
    }
    overlay.classList.add('active');
    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        overlay.classList.remove('active');
      }, 150);
    }, 150);
  }

  function initIndexCards() {
    const grid = document.getElementById('teamGrid');
    if (!grid) return;
    grid.replaceChildren();
    CATALOG.forEach((work, index) => {
      const card = document.createElement('a'); card.className = 'team-card';
      card.dataset.campus = work.campus || ''; card.dataset.year = String(work.year);
      card.href = `team.html?id=${encodeURIComponent(work.id)}`;
      const badge = document.createElement('div'); badge.className = 'team-card-badge'; badge.textContent = String(index + 1).padStart(2, '0');
      const campus = document.createElement('div'); campus.className = 'team-card-campus'; campus.textContent = work.campus || '';
      const video = document.createElement('video'); video.className = 'team-card-thumbnail';
      if (work.thumbnail) video.poster = work.thumbnail;
      video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'none';
      if (work.video) video.src = work.video;
      else { const tag = document.createElement('span'); tag.className = 'no-pv-tag'; tag.textContent = 'NO PV'; card.append(tag); }
      const overlay = document.createElement('div'); overlay.className = 'team-card-overlay';
      const genre = document.createElement('span'); genre.className = 'team-card-genre'; genre.textContent = `${work.year} · ${work.campus || ''} · ${work.genre || ''}`;
      const title = document.createElement('h2'); title.className = 'team-card-title'; title.textContent = work.title;
      overlay.append(genre, title); card.append(badge, campus, video, overlay);
      card.addEventListener('mouseenter', () => video.play().catch(() => {}));
      card.addEventListener('mouseleave', () => video.pause()); grid.append(card);
    });
    const subtitle = document.getElementById('siteSubtitle');
    if (subtitle) subtitle.textContent = `全国 ${new Set(CATALOG.map((work) => work.campus)).size} 校舎 ゲームカレッジ合同チーム制作成果発表展 // 全 ${CATALOG.length} 作品`;
    const title = document.getElementById('siteTitle');
    if (title) title.dataset.text = title.textContent = `ALL COLLEGE GAME JAM ${[...new Set(CATALOG.map((work) => work.year))].sort().join('–')}`;
  }

  function initTeamPage() {
    currentTeamKey = config.currentTeam;
    const data = TEAM_DATA[currentTeamKey];
    if (!data) { const name = document.getElementById('teamName'); if (name) name.textContent = '作品が見つかりません'; return; }
    currentSlide = 1;
    const fields = { teamName: data.title, workTitle: data.genre, teamConcept: data.concept, campusTag: data.campus, teamNumber: data.num, fuiCampus: data.campus, fuiTeam: data.title, docModalTitle: `${data.campus} — ${data.title} / DOCUMENTS` };
    Object.entries(fields).forEach(([id, value]) => { const element = document.getElementById(id); if (element) element.textContent = value || ''; });
    document.title = `${data.campus || ''} — ${data.title} | ALL COLLEGE GAME JAM ${data.year}`;
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
      if (data.download) {
        downloadBtn.href = data.download; downloadBtn.target = '_blank'; downloadBtn.rel = 'noopener'; downloadBtn.classList.remove('is-unavailable');
        downloadBtn.removeAttribute('aria-disabled'); downloadBtn.removeAttribute('tabindex'); downloadBtn.removeAttribute('title'); downloadBtn.textContent = 'DOWNLOAD GAME IN DRIVE';
      } else {
        downloadBtn.removeAttribute('href'); downloadBtn.removeAttribute('target'); downloadBtn.removeAttribute('rel'); downloadBtn.classList.add('is-unavailable');
        downloadBtn.setAttribute('aria-disabled', 'true'); downloadBtn.setAttribute('tabindex', '-1'); downloadBtn.setAttribute('title', 'Game build unavailable'); downloadBtn.textContent = 'GAME BUILD UNAVAILABLE';
      }
    }
    const watch = document.getElementById('watchVideoBtn'); const video = document.getElementById('teamVideo');
    const videoTitle = document.getElementById('videoModalTitle');
    if (watch) watch.hidden = !data.video;
    if (videoTitle) videoTitle.textContent = `PV / DEMO — ${data.campus} ${data.title}`;
    const stream = document.getElementById('fuiStream');
    if (stream) stream.textContent = data.video ? 'LIVE_FOOTAGE' : 'NO_FOOTAGE';
    if (video && data.video) video.dataset.src = data.video;
    const documents = data.documents;
    const openDocuments = document.getElementById('documentOpenBtn');
    if (openDocuments) openDocuments.hidden = !documents.length;
    const tabs = document.getElementById('documentTabs');
    if (tabs) {
      tabs.replaceChildren();
      documents.forEach((documentInfo, index) => {
        documentInfo.pages = Array.isArray(documentInfo.slides) ? documentInfo.slides : [];
        const button = document.createElement('button'); button.type = 'button';
        button.className = `modal-tab-btn document-kind-btn${index === 0 ? ' active' : ''}`;
        button.textContent = documentInfo.label || ({ proposal: '企画資料', planning: '企画資料', interim: '中間報告', final: '最終発表' }[documentInfo.kind] || '資料');
        button.setAttribute('aria-pressed', String(index === 0)); button.addEventListener('click', () => selectDocument(index)); tabs.append(button);
      });
    }
    currentDocumentIndex = 0; totalSlides = documents[0]?.pages.length || 1;
    if (documents.length) selectDocument(0);
    const profileButton = document.getElementById('documentOpenBtn');
    if (profileButton && documents[0]) profileButton.textContent = `VIEW ${documents[0].label || 'PROFILE'}`;
    const works = CATALOG; const currentIndex = works.findIndex((work) => work.id === currentTeamKey);
    const updateRouteLink = (id, work) => {
      const link = document.getElementById(id); if (!link || !work) return;
      link.href = `team.html?id=${encodeURIComponent(work.id)}`; link.textContent = id === 'prevTeamBtn' ? '← PREV' : 'NEXT →';
      link.setAttribute('aria-label', `${id === 'prevTeamBtn' ? '前の作品' : '次の作品'}: ${work.title}`);
    };
    if (currentIndex >= 0 && works.length > 1) {
      updateRouteLink('prevTeamBtn', works[(currentIndex + works.length - 1) % works.length]);
      updateRouteLink('nextTeamBtn', works[(currentIndex + 1) % works.length]);
    }
    updateSlideViewer();
  }

  let currentDocumentIndex = 0;
  function selectDocument(index) {
    const docs = TEAM_DATA[currentTeamKey]?.documents || []; if (!docs[index]) return;
    currentDocumentIndex = index; const documentInfo = docs[index]; const pages = documentInfo.pages || [];
    currentSlide = 1; totalSlides = Math.max(1, pages.length);
    const iframe = document.getElementById('proposalIframe'); const image = document.getElementById('slideImage');
    const pdfTab = document.getElementById('tabPdf'); const slidesTab = document.getElementById('tabSlides'); const hasPdf = Boolean(documentInfo.pdf); const hasSlides = pages.length > 0;
    if (iframe) { iframe.removeAttribute('src'); iframe.dataset.src = hasPdf ? `${documentInfo.pdf}#toolbar=0&view=FitH` : ''; iframe.hidden = !hasPdf; }
    if (pdfTab) pdfTab.hidden = !hasPdf; if (slidesTab) slidesTab.hidden = !hasSlides;
    document.querySelectorAll('.document-kind-btn').forEach((button, buttonIndex) => { button.classList.toggle('active', buttonIndex === index); button.setAttribute('aria-pressed', String(buttonIndex === index)); });
    if (image) image.src = pages[0] || '';
    setProposalViewMode(hasPdf ? 'pdf' : 'slides'); updateSlideViewer();
  }

  function updateSlideViewer() {
    const img = document.getElementById('slideImage');
    const counter = document.getElementById('slideCounter');
    if (img && currentTeamKey) {
      const pages = TEAM_DATA[currentTeamKey]?.documents?.[currentDocumentIndex]?.pages || [];
      if (pages[currentSlide - 1]) img.src = pages[currentSlide - 1];
    }
    if (counter) {
      counter.textContent = 'PAGE ' + currentSlide + ' / ' + totalSlides;
    }
  }

  function changeSlide(delta) {
    currentSlide += delta;
    if (currentSlide < 1) currentSlide = totalSlides;
    if (currentSlide > totalSlides) currentSlide = 1;
    updateSlideViewer();
  }

  function setProposalViewMode(mode) {
    const iframe = document.getElementById('proposalIframe');
    const viewer = document.getElementById('proposalSlidesViewer');
    const tabPdf = document.getElementById('tabPdf');
    const tabSlides = document.getElementById('tabSlides');

    const documentInfo = TEAM_DATA[currentTeamKey]?.documents?.[currentDocumentIndex];
    const hasPdf = Boolean(documentInfo?.pdf);
    const hasSlides = Boolean(documentInfo?.pages?.length);
    if (mode === 'pdf' && hasPdf) {
      if (iframe) { iframe.style.display = 'block'; if (iframe.dataset.src && !iframe.hasAttribute('src') && document.getElementById('proposalModal')?.classList.contains('active')) iframe.src = iframe.dataset.src; }
      if (viewer) viewer.style.display = 'none';
      if (tabPdf) tabPdf.classList.add('active');
      if (tabSlides) tabSlides.classList.remove('active');
    } else if (hasSlides) {
      if (iframe) iframe.style.display = 'none';
      if (viewer) viewer.style.display = 'flex';
      if (tabPdf) tabPdf.classList.remove('active');
      if (tabSlides) tabSlides.classList.add('active');
      updateSlideViewer();
    }
  }

  return {
    init,
    changeSlide,
    setProposalViewMode,
    getTeamData: (k) => TEAM_DATA[k]
  };
})();

function openModal(type) {
  const modal = document.getElementById(type + 'Modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const iframe = modal.querySelector('iframe[data-src]');
    if (iframe && iframe.dataset.src && !iframe.hasAttribute('src')) {
      iframe.src = iframe.dataset.src;
    }
    const video = modal.querySelector('video');
    if (video) {
      if (video.dataset.src && !video.hasAttribute('src')) {
        video.src = video.dataset.src;
      }
      video.play().catch(() => {});
    }
  }
}

function closeModal() {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(m => {
    m.classList.remove('active');
    const video = m.querySelector('video');
    if (video) video.pause();
  });
  document.body.style.overflow = '';
}

function changeSlide(delta) {
  GCKPortfolio.changeSlide(delta);
}

function setProposalViewMode(mode) {
  GCKPortfolio.setProposalViewMode(mode);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
