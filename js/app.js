// ByteLog interactions

(() => {
  const html = document.documentElement;
  const track = document.getElementById('pill-track');
  const label = document.getElementById('pill-label');
  const searchWrap = document.getElementById('search-wrap');
  const searchInput = document.getElementById('search-input');
  const sectionCount = document.querySelector('.section-count');
  const articlesGrid = document.querySelector('.articles-grid');
  const pagination = document.querySelector('.pagination');
  const articleModal = document.getElementById('article-modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  const composeModal = document.getElementById('compose-modal');
  const composeOpen = document.getElementById('compose-open');
  const composeClose = document.getElementById('compose-close');
  const composeCancel = document.getElementById('compose-cancel');
  const composeForm = document.getElementById('compose-form');
  const toast = document.getElementById('toast');
  const pageSize = 4;
  const storageKey = 'bytelog:user-posts';
  const authorModeKey = 'bytelog:author-mode';

  let currentPage = 1;
  let activeTag = null;
  let toastTimer = null;
  let dark = localStorage.getItem('theme') !== 'light';
  let isAuthor = localStorage.getItem(authorModeKey) === 'true';
  let posts = [];

  const clean = (text = '') => text.replace(/\s+/g, ' ').trim();
  const normalize = (text = '') => text.toLowerCase().trim();
  const escapeHTML = (text = '') => text.replace(/[&<>'"]/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[ch]);

  const main = document.querySelector('main');
  const isDetailPage = !!document.querySelector('[data-post-detail]');
  const divider = document.querySelector('.divider-text');
  const isPostRoot = window.location.pathname === '/post/' || window.location.pathname === '/post/index.html';
  const noResults = document.createElement('div');
  noResults.className = 'no-results';
  noResults.textContent = '找不到符合條件的文章。試著換個關鍵字或點其他標籤。';
  if (!isDetailPage && divider?.parentNode) divider.parentNode.insertBefore(noResults, divider);
  else if (!isDetailPage && main) main.appendChild(noResults);

  function syncAuthorModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('author');
    if (mode !== '1' && mode !== '0') return;
    isAuthor = mode === '1';
    localStorage.setItem(authorModeKey, isAuthor ? 'true' : 'false');
    params.delete('author');
    const query = params.toString();
    const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', cleanUrl);
  }

  function applyAuthorMode() {
    document.documentElement.toggleAttribute('data-author', isAuthor);
    if (composeOpen) {
      composeOpen.hidden = !isAuthor;
      composeOpen.style.display = isAuthor ? '' : 'none';
    }
    if (composeModal) {
      composeModal.hidden = !isAuthor;
      composeModal.style.display = isAuthor ? '' : 'none';
    }
  }

  function showToast(message) {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function applyTheme() {
    if (dark) {
      html.removeAttribute('data-theme');
      track?.classList.add('is-dark');
      if (label) label.textContent = '深色';
    } else {
      html.setAttribute('data-theme', 'light');
      track?.classList.remove('is-dark');
      if (label) label.textContent = '白天';
    }
  }

  window.toggleDark = function toggleDark() {
    dark = !dark;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    applyTheme();
    showToast(dark ? '已切換為深色模式' : '已切換為白天模式');
  };

  window.toggleSearch = function toggleSearch() {
    if (!searchWrap || !searchInput) return;
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

  function formatDate(dateValue) {
    if (!dateValue) return '未標日期';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    const [year, month, day] = dateValue.split('-').map(Number);
    return `${year} 年 ${month} 月 ${day} 日`;
  }

  function todayISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  function estimateReadTime(content) {
    const chars = clean(content).length;
    return `${Math.max(1, Math.ceil(chars / 420))} 分鐘`;
  }

  function safeTags(tags) {
    return (Array.isArray(tags) ? tags : String(tags || '').split(/[,，、]/))
      .map(clean)
      .filter(Boolean)
      .slice(0, 5);
  }

  function tagHTML(tags, accent = false) {
    return safeTags(tags).map(tag => `<span class="tag${accent ? ' accent' : ''}">${escapeHTML(tag)}</span>`).join('');
  }

  function enhancePost(post, index) {
    post.id = post.id || `post-${index}`;
    post.tags = safeTags(post.tags);
    post.searchText = normalize([post.title, post.excerpt, post.content, post.date, post.read, post.tags.join(' ')].join(' '));
    if (post.node) {
      post.node.dataset.postId = post.id;
      post.node.setAttribute('tabindex', '0');
      post.node.setAttribute('role', 'button');
      post.node.setAttribute('aria-label', `開啟文章：${post.title}`);
    }
    return post;
  }

  function collectStaticPosts() {
    const found = [];
    document.querySelectorAll('.card').forEach((node, index) => {
      const title = clean(node.querySelector('.card-title')?.textContent);
      const excerpt = clean(node.querySelector('.card-excerpt')?.textContent);
      const date = clean(node.querySelector('time')?.textContent);
      const read = clean(node.querySelector('.card-read')?.textContent);
      const tags = [...node.querySelectorAll('.tag')].map(t => clean(t.textContent));
      found.push({ id: `static-card-${index}`, node, title, excerpt, date, read, tags, type: index === 0 ? '精選文章' : '最新文章' });
    });

    document.querySelectorAll('.article-item').forEach((node, index) => {
      const title = clean(node.querySelector('.article-title')?.textContent);
      const date = clean(`${node.querySelector('.date-month')?.textContent || ''} ${node.querySelector('.date-day')?.textContent || ''}`);
      const read = clean(node.querySelector('.article-read')?.textContent);
      const tags = [...node.querySelectorAll('.tag')].map(t => clean(t.textContent));
      const excerpt = `這是一篇關於 ${tags.join('、')} 的技術筆記，整理實務脈絡、核心觀念與可操作的檢查清單。`;
      found.push({ id: `static-list-${index}`, node, title, excerpt, date, read, tags, type: '更多文章' });
    });
    return found.map(enhancePost);
  }

  function loadUserPosts() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  }

  function saveUserPosts(userPosts) {
    localStorage.setItem(storageKey, JSON.stringify(userPosts));
  }

  function createUserPostNode(post) {
    const node = document.createElement('article');
    node.className = 'card fade-up visible user-post';
    node.innerHTML = `
      <div class="card-tags">${tagHTML(post.tags)}</div>
      <h2 class="card-title">${escapeHTML(post.title)}</h2>
      <p class="card-excerpt">${escapeHTML(post.excerpt)}</p>
      <div class="card-footer">
        <time class="card-time">${escapeHTML(formatDate(post.date))}</time>
        <span class="card-read">${escapeHTML(post.read)}</span>
      </div>
    `;
    if (!articlesGrid) return node;
    const featured = articlesGrid.querySelector('.card.featured');
    articlesGrid.insertBefore(node, featured?.nextSibling || articlesGrid.firstChild);
    return node;
  }

  function hydrateUserPosts() {
    if (!isAuthor || !isPostRoot) return [];
    return loadUserPosts().map((post, index) => enhancePost({
      ...post,
      node: createUserPostNode(post),
      type: '我的草稿',
      userCreated: true
    }, index));
  }

  function setStats() {
    const statNums = document.querySelectorAll('.stat-num');
    const tags = new Set(posts.flatMap(post => post.tags));
    if (statNums[0]) statNums[0].textContent = String(posts.length);
    if (statNums[1]) statNums[1].textContent = String(tags.size);
  }

  function updateTagState() {
    document.querySelectorAll('.tag').forEach(tag => {
      const selected = !!activeTag && clean(tag.textContent) === activeTag;
      tag.classList.toggle('accent', selected);
      tag.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function getFilteredPosts() {
    const query = normalize(searchInput?.value || '');
    return posts.filter(post => {
      const matchesQuery = !query || post.searchText.includes(query);
      const matchesTag = !activeTag || post.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    if (!pagination) return;
    pagination.innerHTML = '';

    const makeButton = (text, page, options = {}) => {
      const btn = document.createElement('button');
      btn.className = 'page-btn';
      btn.type = 'button';
      btn.textContent = text;
      btn.disabled = !!options.disabled;
      if (page === currentPage && !options.nav) btn.classList.add('active');
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        currentPage = page;
        renderPosts();
        document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagination.appendChild(btn);
    };

    makeButton('‹', Math.max(1, currentPage - 1), { nav: true, disabled: currentPage === 1 });
    for (let page = 1; page <= totalPages; page += 1) makeButton(String(page), page);
    makeButton('›', Math.min(totalPages, currentPage + 1), { nav: true, disabled: currentPage === totalPages });
  }

  function highlightTitle(node, title, query) {
    const target = node.querySelector('.card-title, .article-title');
    if (!target) return;
    if (!query) {
      target.textContent = title;
      return;
    }
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeTitle = escapeHTML(title);
    target.innerHTML = safeTitle.replace(new RegExp(`(${escapedQuery})`, 'ig'), '<mark class="search-hit">$1</mark>');
  }

  function renderPosts() {
    if (isDetailPage) return;
    const filtered = getFilteredPosts();
    const query = clean(searchInput?.value || '');
    const start = (currentPage - 1) * pageSize;
    const visibleIds = new Set(filtered.slice(start, start + pageSize).map(post => post.id));

    posts.forEach(post => {
      const visible = visibleIds.has(post.id);
      post.node.classList.toggle('is-hidden', !visible);
      highlightTitle(post.node, post.title, query);
    });

    updateTagState();
    noResults.classList.toggle('show', filtered.length === 0);
    if (sectionCount) sectionCount.textContent = `符合 ${filtered.length} / 共 ${posts.length} 篇`;
    renderPagination(filtered.length);
    setStats();
  }

  function buildArticleBody(post) {
    if (post.content) {
      return clean(post.content)
        .split(/\n{2,}/)
        .map(paragraph => `<p>${escapeHTML(paragraph).replace(/\n/g, '<br>')}</p>`)
        .join('');
    }

    const primary = post.tags[0] || '技術';
    const secondary = post.tags[1] || '工程實務';
    return `
      <p>這個互動示範會把原本靜態卡片轉成可閱讀的文章預覽。實際專案中，你可以把這裡替換成 Markdown、CMS API 或本機 JSON 載入的完整內容。</p>
      <p>本文聚焦 <code>${escapeHTML(primary)}</code> 與 <code>${escapeHTML(secondary)}</code> 的實務脈絡：先釐清問題邊界，再建立可重複驗證的範例，最後整理成團隊能沿用的 checklist。</p>
      <ul><li>核心概念：定義術語、限制條件與常見誤解。</li><li>實作策略：用最小範例驗證設計。</li><li>除錯方式：保留觀測點，例如 log、benchmark、trace 或查詢計畫。</li><li>延伸練習：把範例改成自己的情境，確認你真的理解取捨。</li></ul>
      <p>你可以繼續點選其他文章、標籤或搜尋框；目前所有互動都在這個單一 HTML 檔內完成，不需要後端。</p>`;
  }

  function openArticle(post) {
    if (!articleModal || !modalBody || !modalClose) return;
    const deleteButton = post.userCreated
      ? '<div class="modal-actions"><button type="button" class="btn-ghost modal-delete" data-delete-post="' + escapeHTML(post.id) + '">刪除此草稿</button></div>'
      : '';
    modalBody.innerHTML = `
      <h2 class="modal-title" id="modal-title">${escapeHTML(post.title)}</h2>
      <div class="modal-meta">
        <span>${escapeHTML(post.type)}</span><span>·</span><span>${escapeHTML(post.date || '未標日期')}</span><span>·</span><span>${escapeHTML(post.read || '約 8 分鐘')}</span>
        <span style="display:flex; gap:6px; flex-wrap:wrap;">${tagHTML(post.tags, true)}</span>
      </div>
      <p class="modal-excerpt">${escapeHTML(post.excerpt)}</p>
      <div class="modal-content">${buildArticleBody(post)}</div>
      ${deleteButton}
    `;
    articleModal.classList.add('open');
    articleModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalClose.focus();
  }

  function closeArticle() {
    if (!articleModal) return;
    articleModal.classList.remove('open');
    articleModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function openCompose() {
    if (!isAuthor) {
      showToast('撰寫功能僅供作者使用');
      return;
    }
    if (!composeForm || !composeModal) return;
    composeForm.reset();
    const dateInput = document.getElementById('post-date');
    if (dateInput) dateInput.value = todayISO();
    composeModal.classList.add('open');
    composeModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.getElementById('post-title')?.focus();
  }

  function closeCompose() {
    if (!composeModal) return;
    composeModal.classList.remove('open');
    composeModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function bindPost(post) {
    post.node.addEventListener('click', event => {
      if (event.target.closest('.tag')) return;
      if (event.target.closest('a')) return;
      if (post.node.dataset.url) {
        window.location.href = post.node.dataset.url;
        return;
      }
      openArticle(post);
    });
    post.node.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openArticle(post);
      }
    });
  }

  function bindPosts() {
    posts.forEach(bindPost);
    document.querySelectorAll('.read-more').forEach(link => {
      link.addEventListener('click', event => {
        if (link.getAttribute('href') && link.getAttribute('href') !== '#') return;
        event.preventDefault();
        openArticle(posts.find(post => post.id === 'static-card-0') || posts[0]);
      });
    });
    document.querySelectorAll('.recent-item').forEach((item, index) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('click', () => openArticle(posts[index + 1] || posts[0]));
      item.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openArticle(posts[index + 1] || posts[0]);
        }
      });
    });
  }

  function bindTags() {
    document.querySelectorAll('.tag').forEach(tag => {
      if (tag.matches('a[href]')) return;
      tag.setAttribute('tabindex', '0');
      tag.setAttribute('role', 'button');
    });

    document.addEventListener('click', event => {
      const tag = event.target.closest('.tag');
      if (!tag || tag.closest('.modal-meta')) return;
      if (tag.closest('a[href]')) return;
      event.preventDefault();
      event.stopPropagation();
      const value = clean(tag.textContent);
      activeTag = activeTag === value ? null : value;
      currentPage = 1;
      renderPosts();
      showToast(activeTag ? `已篩選標籤：${activeTag}` : '已清除標籤篩選');
    });

    document.addEventListener('keydown', event => {
      const tag = event.target.closest?.('.tag');
      if (!tag || (event.key !== 'Enter' && event.key !== ' ')) return;
      if (tag.closest('a[href]')) return;
      event.preventDefault();
      tag.click();
    });
  }

  function bindNav() {
    const navLinks = document.querySelectorAll('nav a[href^="#"], .footer-links a[href^="#"], .logo[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (link.closest('nav')) {
          document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a === link));
        }
        history.replaceState(null, '', link.getAttribute('href'));
      });
    });
  }

  function bindSearch() {
    if (!searchInput) return;
    searchInput.addEventListener('input', () => {
      currentPage = 1;
      renderPosts();
    });
    searchInput.addEventListener('keydown', event => {
      if (event.key === 'Escape') window.toggleSearch();
    });
  }

  function initMobileTopButton() {
    if (document.querySelector('.mobile-top-button')) return;
    const button = document.createElement('button');
    button.className = 'mobile-top-button';
    button.type = 'button';
    button.setAttribute('aria-label', '回到頁面頂端');
    button.textContent = '↑';
    button.addEventListener('click', () => {
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.body.appendChild(button);
  }

  function bindModals() {
    if (!articleModal || !modalBody || !modalClose) {
      composeOpen?.addEventListener('click', openCompose);
      composeClose?.addEventListener('click', closeCompose);
      composeCancel?.addEventListener('click', closeCompose);
      return;
    }
    modalClose.addEventListener('click', closeArticle);
    modalBody.addEventListener('click', event => {
      const deleteButton = event.target.closest('.modal-delete');
      if (!deleteButton) return;
      const post = posts.find(item => item.id === deleteButton.dataset.deletePost);
      if (!post || !window.confirm('確定要刪除這篇本機草稿嗎？這只會移除目前瀏覽器內的草稿。')) return;
      const stored = loadUserPosts().filter(item => item.id !== post.id);
      saveUserPosts(stored);
      post.node.remove();
      posts = posts.filter(item => item.id !== post.id);
      closeArticle();
      currentPage = 1;
      renderPosts();
      showToast('已刪除本機草稿');
    });
    articleModal.addEventListener('click', event => {
      if (event.target === articleModal) closeArticle();
    });
    composeOpen?.addEventListener('click', openCompose);
    composeClose?.addEventListener('click', closeCompose);
    composeCancel?.addEventListener('click', closeCompose);
    composeModal?.addEventListener('click', event => {
      if (event.target === composeModal) closeCompose();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (composeModal?.classList.contains('open')) closeCompose();
        if (articleModal.classList.contains('open')) closeArticle();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        if (!searchWrap || !searchInput) return;
        event.preventDefault();
        if (!searchWrap.classList.contains('open')) window.toggleSearch();
        else searchInput.focus();
      }
    });
  }

  function bindComposeForm() {
    if (!composeForm || !isAuthor) return;
    composeForm.addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(composeForm);
      const content = clean(form.get('content'));
      const post = {
        id: `user-${Date.now()}`,
        title: clean(form.get('title')),
        tags: safeTags(form.get('tags') || '筆記'),
        excerpt: clean(form.get('excerpt')),
        content,
        date: formatDate(form.get('date') || todayISO()),
        read: clean(form.get('read')) || estimateReadTime(content),
        type: '我的草稿',
        userCreated: true
      };

      const stored = loadUserPosts();
      saveUserPosts([{ ...post, node: undefined }, ...stored]);
      post.node = createUserPostNode(post);
      enhancePost(post, posts.length);
      posts.unshift(post);
      bindPost(post);
      document.querySelectorAll('.tag').forEach(tag => {
        if (tag.matches('a[href]')) return;
        tag.setAttribute('tabindex', '0');
        tag.setAttribute('role', 'button');
      });
      currentPage = 1;
      closeCompose();
      renderPosts();
      openArticle(post);
      showToast('文章已新增並保存在這台瀏覽器');
    });
  }

  function initAnimations() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  }

  function init() {
    syncAuthorModeFromUrl();
    applyTheme();
    applyAuthorMode();
    const staticPosts = collectStaticPosts();
    const userPosts = hydrateUserPosts();
    posts = [...userPosts, ...staticPosts];
    bindPosts();
    bindTags();
    bindNav();
    bindSearch();
    initMobileTopButton();
    bindModals();
    bindComposeForm();
    initAnimations();
    renderPosts();
  }

  init();
})();
