// Renders post archives, topic/tag pages, and article pages from posts-data.js.

(() => {
  const posts = window.BYTELOG_POSTS || [];
  const escapeHTML = (text = '') => String(text).replace(/[&<>'"]/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[ch]);

  const topicUrl = slug => `/post/${slug}/`;
  const tagUrl = slug => `/tag/?tag=${encodeURIComponent(slug)}`;
  const tagLink = tag => `<a class="tag" href="${tagUrl(tag.slug)}">${escapeHTML(tag.name)}</a>`;
  const topicLink = topic => `<a class="tag accent" href="${topicUrl(topic.slug)}">${escapeHTML(topic.name)}</a>`;
  const slugify = text => String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

  const sectionTitles = {
    'rust-ownership': ['所有權模型解決什麼', 'Lifetime 的真正角色', '實務上的借用邊界'],
    'docker-multistage': ['把建構與執行拆開', '縮小體積之外的收益', '避免把不該留下的東西留下'],
    'ebpf-tracing': ['eBPF 如何掛上系統事件', '不中斷服務的觀測能力', '控制 tracing 的觀測成本'],
    'go-channel-patterns': ['用 Channel 表達工作流', 'Fan-out 與 Pipeline', '關閉責任與取消訊號'],
    'wasm-2025': ['從瀏覽器走向跨平台 Sandbox', '適合移植的計算核心', '評估工具鏈與部署限制'],
    'postgres-explain-analyze': ['EXPLAIN ANALYZE 會告訴你什麼', '先看估算再看瓶頸', '索引不是免費午餐'],
    'nix-flakes': ['鎖定輸入以重現環境', '多語言專案的環境描述', '從 Dev Shell 漸進導入'],
    'typescript-advanced-types': ['把資料約束變成規則', '條件型別、映射型別與 satisfies', '讓型別技巧保持可讀'],
    'linux-io-model': ['等待外部事件的演進', '從 epoll 到 io_uring', '選型時要看團隊可維護性']
  };

  function card(post, featured = false) {
    return `
      <article class="card${featured ? ' featured' : ''} fade-up visible" data-url="${post.url}" data-post-id="${post.id}">
        ${featured ? `<div class="card-icon">${escapeHTML(post.icon || '✦')}</div>` : ''}
        <div class="${featured ? 'card-content' : ''}">
          <div class="card-tags">${topicLink(post.theme)}${post.tags.map(tagLink).join('')}</div>
          <h2 class="card-title"><a href="${post.url}">${escapeHTML(post.title)}</a></h2>
          <p class="card-excerpt">${escapeHTML(post.excerpt)}</p>
          <div class="card-footer">
            <time class="card-time">${escapeHTML(post.date)}</time>
            <span class="card-read">${escapeHTML(post.read)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function listItem(post) {
    const day = post.date.split(' ').pop();
    const month = post.date.split(' ')[0];
    return `
      <article class="article-item fade-up visible" data-url="${post.url}" data-post-id="${post.id}">
        <div class="article-date-block"><div class="date-month">${escapeHTML(month)}</div><div class="date-day">${escapeHTML(day)}</div></div>
        <div>
          <h3 class="article-title"><a href="${post.url}">${escapeHTML(post.title)}</a></h3>
          <div class="article-tags">${topicLink(post.theme)}${post.tags.map(tagLink).join('')}</div>
        </div>
        <span class="article-read">${escapeHTML(post.read)}</span>
      </article>
    `;
  }

  function renderArchive() {
    const mount = document.querySelector('[data-post-list]');
    if (!mount) return;

    const params = new URLSearchParams(window.location.search);
    const theme = mount.dataset.filterTheme;
    const tag = mount.dataset.filterTag || params.get('tag');
    const filtered = posts.filter(post => {
      const matchesTheme = !theme || post.theme.slug === theme;
      const matchesTag = !tag || post.tags.some(item => item.slug === tag);
      return matchesTheme && matchesTag;
    });

    const cards = filtered.map(post => card(post, true)).join('');

    mount.innerHTML = `
      <div class="articles-grid">${cards}</div>
      ${document.querySelector('.pagination') ? '' : '<div class="pagination"></div>'}
    `;

    const count = document.querySelector('.section-count');
    if (count) count.textContent = `共 ${filtered.length} 篇`;
    const tagTitle = document.querySelector('[data-tag-title]');
    if (tagTitle && tag) {
      const tagInfo = posts.flatMap(post => post.tags).find(item => item.slug === tag);
      tagTitle.textContent = tagInfo ? tagInfo.name : tag;
      document.title = `${tagInfo ? tagInfo.name : tag} 標籤 — ByteLog`;
    }
  }

  function renderTopicCloud() {
    const mount = document.querySelector('[data-topic-cloud]');
    if (!mount) return;
    const topics = [...new Map(posts.map(post => [post.theme.slug, post.theme])).values()];
    mount.innerHTML = topics.map(topic => topicLink(topic)).join('');
  }

  function renderTagCloud() {
    const mount = document.querySelector('[data-tag-cloud]');
    if (!mount) return;
    const tags = new Map();
    posts.forEach(post => post.tags.forEach(tag => tags.set(tag.slug, tag)));
    mount.innerHTML = [...tags.values()].map(tagLink).join('');
  }

  function getPostSections(post) {
    const titles = sectionTitles[post.id] || [];
    return (post.paragraphs || []).map((paragraph, index) => {
      const title = titles[index] || `小節 ${index + 1}`;
      return {
        id: `${post.id}-${slugify(title)}`,
        title,
        paragraph
      };
    });
  }

  function renderTopicNavigator(activePost) {
    const topics = [...new Map(posts.map(post => [post.theme.slug, post.theme])).values()];
    return `
      <aside class="article-side article-side-left" aria-label="文章主題">
        <div class="article-nav-card">
          <div class="article-nav-title">主題</div>
          <div class="topic-tree">
            ${topics.map(topic => {
              const topicPosts = posts.filter(post => post.theme.slug === topic.slug);
              const isOpen = topic.slug === activePost.theme.slug;
              return `
                <details class="topic-group" ${isOpen ? 'open' : ''}>
                  <summary>
                    <span>${escapeHTML(topic.name)}</span>
                    <span class="topic-count">${topicPosts.length}</span>
                  </summary>
                  <div class="topic-posts">
                    ${topicPosts.map(post => `
                      <a class="topic-post-link${post.id === activePost.id ? ' active' : ''}" href="${post.url}" ${post.id === activePost.id ? 'aria-current="page"' : ''}>
                        ${escapeHTML(post.title)}
                      </a>
                    `).join('')}
                  </div>
                </details>
              `;
            }).join('')}
          </div>
        </div>
      </aside>
    `;
  }

  function renderTableOfContents(sections) {
    return `
      <aside class="article-side article-side-right" aria-label="文章目錄">
        <div class="article-nav-card">
          <div class="article-nav-title">目錄</div>
          <nav class="toc-list">
            ${sections.map((section, index) => `
              <a class="toc-link${index === 0 ? ' active' : ''}" href="#${section.id}">${escapeHTML(section.title)}</a>
            `).join('')}
          </nav>
        </div>
      </aside>
    `;
  }

  function bindTableOfContents(mount) {
    const links = [...document.querySelectorAll('.toc-link')];
    const sections = [...mount.querySelectorAll('.article-page-section')];
    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      links.forEach(link => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0.01 });

    sections.forEach(section => observer.observe(section));
  }

  function scrollToInitialSection() {
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }

  function renderPostDetail() {
    let mount = document.querySelector('[data-post-detail]');
    if (!mount) return;
    const post = posts.find(item => item.id === mount.dataset.postDetail);
    if (!post) {
      mount.innerHTML = '<p class="page-lede">找不到這篇文章。</p>';
      return;
    }
    const shell = mount.closest('.main-wrap');
    const sections = getPostSections(post);
    document.title = `${post.title} — ByteLog`;
    if (shell) {
      shell.classList.remove('no-sidebar');
      shell.classList.add('article-shell');
      shell.innerHTML = `${renderTopicNavigator(post)}<main data-post-detail="${escapeHTML(post.id)}"></main>${renderTableOfContents(sections)}`;
      mount = shell.querySelector('[data-post-detail]');
    }
    mount.innerHTML = `
      <div class="article-page-meta">${topicLink(post.theme)}${post.tags.map(tagLink).join('')}</div>
      <h1 class="article-page-title">${escapeHTML(post.title)}</h1>
      <div class="article-page-submeta"><span>${escapeHTML(post.date)}</span><span>${escapeHTML(post.read)}</span></div>
      <p class="article-page-excerpt">${escapeHTML(post.excerpt)}</p>
      <div class="article-page-body">
        ${sections.map(section => `
          <section class="article-page-section" id="${section.id}">
            <h2>${escapeHTML(section.title)}</h2>
            <p>${escapeHTML(section.paragraph)}</p>
          </section>
        `).join('')}
      </div>
    `;
    bindTableOfContents(mount);
    scrollToInitialSection();
  }

  renderArchive();
  renderTopicCloud();
  renderTagCloud();
  renderPostDetail();
})();
