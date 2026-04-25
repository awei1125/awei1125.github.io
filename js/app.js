// ByteLog interactions

(() => {
  const html = document.documentElement;
  const track = document.getElementById('pill-track');
  const label = document.getElementById('pill-label');
  const searchWrap = document.getElementById('search-wrap');
  const searchInput = document.getElementById('search-input');
  const sectionCount = document.querySelector('.section-count');
  const modal = document.getElementById('article-modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  const toast = document.getElementById('toast');
  const pageSize = 4;
  let currentPage = 1;
  let activeTag = null;
  let toastTimer = null;
  let dark = localStorage.getItem('theme') !== 'light';

  const clean = (text = '') => text.replace(/\s+/g, ' ').trim();
  const escapeHTML = (text = '') => text.replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const normalize = (text = '') => text.toLowerCase().trim();

  const noResults = document.createElement('div');
  noResults.className = 'no-results';
  noResults.textContent = '找不到符合條件的文章。試著換個關鍵字或點其他標籤。';
  document.querySelector('main').insertBefore(noResults, document.querySelector('.divider-text'));

  function applyTheme() {
    if (dark) {
      html.removeAttribute('data-theme');
      track.classList.add('is-dark');
      label.textContent = '深色';
    } else {
      html.setAttribute('data-theme', 'light');
      track.classList.remove('is-dark');
      label.textContent = '白天';
    }
  }

  window.toggleDark = function toggleDark() {
    dark = !dark;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    applyTheme();
    showToast(dark ? '已切換為深色模式' : '已切換為白天模式');
  };

  window.toggleSearch = function toggleSearch() {
    const visible = searchWrap.classList.toggle('open');
    searchWrap.style.display = visible ? 'block' : 'none';
    if (visible) {
      searchInput.focus();
      showToast('輸入關鍵字即可即時搜尋');
    } else {
      searchInput.value = '';
      currentPage = 1;
      renderPosts();
    }
  };

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function collectPosts() {
    const posts = [];
    document.querySelectorAll('.card').forEach((node, index) => {
      const title = clean(node.querySelector('.card-title')?.textContent);
      const excerpt = clean(node.querySelector('.card-excerpt')?.textContent);
      const date = clean(node.querySelector('time')?.textContent);
      const read = clean(node.querySelector('.card-read')?.textContent);
      const tags = [...node.querySelectorAll('.tag')].map(t => clean(t.textContent));
      posts.push({ node, title, excerpt, date, read, tags, type: index === 0 ? '精選文章' : '最新文章' });
    });
    document.querySelectorAll('.article-item').forEach(node => {
      const title = clean(node.querySelector('.article-title')?.textContent);
      const date = clean(`${node.querySelector('.date-month')?.textContent || ''} ${node.querySelector('.date-day')?.textContent || ''}`);
      const read = clean(node.querySelector('.article-read')?.textContent);
      const tags = [...node.querySelectorAll('.tag')].map(t => clean(t.textContent));
      posts.push({ node, title, excerpt: `這是一篇關於 ${tags.join('、')} 的技術筆記，整理實務脈絡、核心觀念與可操作的檢查清單。`, date, read, tags, type: '更多文章' });
    });
    posts.forEach((post, id) => {
      post.id = id;
      post.searchText = normalize([post.title, post.excerpt, post.date, post.read, post.tags.join(' ')].join(' '));
      post.node.dataset.postId = id;
      post.node.setAttribute('tabindex', '0');
      post.node.setAttribute('role', 'button');
      post.node.setAttribute('aria-label', `開啟文章：${post.title}`);
    });
    return posts;
  }

  const posts = collectPosts();

  function getFilteredPosts() {
    const q = normalize(searchInput.value);
    return posts.filter(post => {
      const matchesQuery = !q || post.searchText.includes(q);
      const matchesTag = !activeTag || post.tags.some(tag => tag === activeTag);
      return matchesQuery && matchesTag;
    });
  }

  function renderPagination(total) {
    const pagination = document.querySelector('.pagination');
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    pagination.innerHTML = '';

    const makeBtn = (text, page, opts = {}) => {
      const btn = document.createElement('button');
      btn.className = 'page-btn';
      btn.textContent = text;
      btn.disabled = !!opts.disabled;
      if (page === currentPage && !opts.nav) btn.classList.add('active');
      btn.addEventListener('click', () => {
        if (opts.disabled) return;
        currentPage = page;
        renderPosts();
        document.querySelector('main').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagination.appendChild(btn);
    };

    makeBtn('‹', Math.max(1, currentPage - 1), { nav: true, disabled: currentPage === 1 });
    for (let page = 1; page <= totalPages; page++) makeBtn(String(page), page);
    makeBtn('›', Math.min(totalPages, currentPage + 1), { nav: true, disabled: currentPage === totalPages });
  }

  function highlightTitle(node, title, query) {
    const target = node.querySelector('.card-title, .article-title');
    if (!target) return;
    if (!query) {
      target.textContent = title;
      return;
    }
    const safe = escapeHTML(title);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\<script>
  // Theme toggle — dark by default
  const html = document.documentElement;
  const track = document.getElementById('pill-track');
  const label = document.getElementById('pill-label');

  let dark = localStorage.getItem('theme') !== 'light';

  function applyTheme() {
    if (dark) {
      html.removeAttribute('data-theme');
      track.classList.add('is-dark');
      label.textContent = '深色';
    } else {
      html.setAttribute('data-theme', 'light');
      track.classList.remove('is-dark');
      label.textContent = '白天';
    }
  }
  function toggleDark() {
    dark = !dark;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    applyTheme();
  }
  applyTheme();

  // Search toggle
  function toggleSearch() {
    const wrap = document.getElementById('search-wrap');
    const visible = wrap.style.display !== 'none';
    wrap.style.display = visible ? 'none' : 'block';
    if (!visible) document.getElementById('search-input').focus();
  }

  // Scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // Pagination interaction
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
      if (!['‹', '›', '…'].includes(this.textContent)) {
        this.classList.add('active');
      }
    });
  });

  // Tag filter (visual only)
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', function() {
      document.querySelectorAll('.tag').forEach(t => t.classList.remove('accent'));
      this.classList.add('accent');
    });
  });
</script>');
    target.innerHTML = safe.replace(new RegExp(`(${escapedQuery})`, 'ig'), '<mark class="search-hit">$1</mark>');
  }

  function renderPosts() {
    const filtered = getFilteredPosts();
    const query = clean(searchInput.value);
    const start = (currentPage - 1) * pageSize;
    const visibleIds = new Set(filtered.slice(start, start + pageSize).map(post => post.id));

    posts.forEach(post => {
      const visible = visibleIds.has(post.id);
      post.node.classList.toggle('is-hidden', !visible);
      highlightTitle(post.node, post.title, query);
    });

    noResults.classList.toggle('show', filtered.length === 0);
    sectionCount.textContent = `符合 ${filtered.length} / 共 ${posts.length} 篇`;
    renderPagination(filtered.length);
  }

  function openArticle(post) {
    const tagHTML = post.tags.map(tag => `<span class="tag accent">${escapeHTML(tag)}</span>`).join('');
    const body = buildArticleBody(post);
    modalBody.innerHTML = `
      <h2 class="modal-title" id="modal-title">${escapeHTML(post.title)}</h2>
      <div class="modal-meta">
        <span>${escapeHTML(post.type)}</span><span>·</span><span>${escapeHTML(post.date || '未標日期')}</span><span>·</span><span>${escapeHTML(post.read || '約 8 分鐘')}</span>
        <span style="display:flex; gap:6px; flex-wrap:wrap;">${tagHTML}</span>
      </div>
      <p class="modal-excerpt">${escapeHTML(post.excerpt)}</p>
      <div class="modal-content">${body}</div>
    `;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalClose.focus();
  }

  function buildArticleBody(post) {
    const primary = post.tags[0] || '技術';
    const secondary = post.tags[1] || '工程實務';
    return `
      <p>這個互動示範會把原本靜態卡片轉成可閱讀的文章預覽。實際專案中，你可以把這裡替換成 Markdown、CMS API 或本機 JSON 載入的完整內容。</p>
      <p>本文聚焦 <code>${escapeHTML(primary)}</code> 與 <code>${escapeHTML(secondary)}</code> 的實務脈絡：先釐清問題邊界，再建立可重複驗證的範例，最後整理成團隊能沿用的 checklist。</p>
      <ul><li>核心概念：定義術語、限制條件與常見誤解。</li><li>實作策略：用最小範例驗證設計，而不是一開始就導入複雜架構。</li><li>除錯方式：保留觀測點，例如 log、benchmark、trace 或查詢計畫。</li><li>延伸練習：把範例改成自己的情境，確認你真的理解取捨。</li></ul>
      <p>你可以繼續點選其他文章、標籤或搜尋框；目前所有互動都在這個單一 HTML 檔內完成，不需要後端。</p>`;
  }

  function closeArticle() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function bindPostInteractions() {
    posts.forEach(post => {
      post.node.addEventListener('click', event => { if (!event.target.closest('.tag')) openArticle(post); });
      post.node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openArticle(post); } });
    });
    document.querySelectorAll('.read-more').forEach(link => link.addEventListener('click', event => { event.preventDefault(); openArticle(posts[0]); }));
    document.querySelectorAll('.recent-item').forEach((item, index) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('click', () => openArticle(posts[index] || posts[0]));
      item.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openArticle(posts[index] || posts[0]); } });
    });
  }

  function bindTags() {
    document.querySelectorAll('.tag').forEach(tag => {
      tag.setAttribute('tabindex', '0');
      tag.setAttribute('role', 'button');
      tag.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const value = clean(tag.textContent);
        activeTag = activeTag === value ? null : value;
        document.querySelectorAll('.tag').forEach(t => t.classList.toggle('accent', activeTag && clean(t.textContent) === activeTag));
        currentPage = 1;
        renderPosts();
        showToast(activeTag ? `已篩選標籤：${activeTag}` : '已清除標籤篩選');
      });
      tag.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') tag.click(); });
    });
  }

  function bindNav() {
    const [articles, categories, projects, about] = document.querySelectorAll('nav a');
    const actions = [
      () => document.querySelector('main').scrollIntoView({ behavior: 'smooth' }),
      () => document.querySelector('.tag-cloud').scrollIntoView({ behavior: 'smooth', block: 'center' }),
      () => showToast('專案頁已保留位置：可接 GitHub repo 或作品集資料'),
      () => document.querySelector('.profile').scrollIntoView({ behavior: 'smooth', block: 'center' })
    ];
    [articles, categories, projects, about].forEach((link, index) => {
      if (!link) return;
      link.addEventListener('click', event => {
        event.preventDefault();
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        actions[index]?.();
      });
    });
    document.querySelectorAll('.profile-link, .footer-links a, .logo').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        showToast(`${clean(link.textContent) || '首頁'} 連結尚未設定，可改成真實 URL`);
      });
    });
  }

  function bindRSS() {
    document.querySelector('.btn-rss').addEventListener('click', () => {
      const items = posts.map(post => `<item><title>${escapeHTML(post.title)}</title><description>${escapeHTML(post.excerpt)}</description><category>${escapeHTML(post.tags.join(', '))}</category></item>`).join('');
      const rss = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>ByteLog</title><description>技術筆記 RSS demo</description>${items}</channel></rss>`;
      const blob = new Blob([rss], { type: 'application/rss+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bytelog-rss.xml';
      a.click();
      URL.revokeObjectURL(url);
      showToast('已產生 RSS XML 檔');
    });
  }

  function bindSearch() {
    searchInput.addEventListener('input', () => { currentPage = 1; renderPosts(); });
    searchInput.addEventListener('keydown', event => { if (event.key === 'Escape') window.toggleSearch(); });
  }

  function bindModal() {
    modalClose.addEventListener('click', closeArticle);
    modal.addEventListener('click', event => { if (event.target === modal) closeArticle(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal.classList.contains('open')) closeArticle();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (!searchWrap.classList.contains('open')) window.toggleSearch();
        else searchInput.focus();
      }
    });
  }

  function initAnimations() {
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible')); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  }

  applyTheme();
  bindPostInteractions();
  bindTags();
  bindNav();
  bindRSS();
  bindSearch();
  bindModal();
  initAnimations();
  renderPosts();
})();
