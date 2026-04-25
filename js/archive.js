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

    const featured = filtered.find(post => post.featured) || filtered[0];
    const rest = filtered.filter(post => post !== featured);
    const cards = featured ? card(featured, true) + rest.slice(0, 3).map(post => card(post)).join('') : '';
    const list = rest.slice(3).map(listItem).join('');

    mount.innerHTML = `
      <div class="articles-grid">${cards}</div>
      ${list ? '<div class="divider-text">更多文章</div><div class="article-list">' + list + '</div>' : ''}
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

  function renderPostDetail() {
    const mount = document.querySelector('[data-post-detail]');
    if (!mount) return;
    const post = posts.find(item => item.id === mount.dataset.postDetail);
    if (!post) {
      mount.innerHTML = '<p class="page-lede">找不到這篇文章。</p>';
      return;
    }
    document.title = `${post.title} — ByteLog`;
    mount.innerHTML = `
      <div class="article-page-meta">${topicLink(post.theme)}${post.tags.map(tagLink).join('')}</div>
      <h1 class="article-page-title">${escapeHTML(post.title)}</h1>
      <div class="article-page-submeta"><span>${escapeHTML(post.date)}</span><span>${escapeHTML(post.read)}</span></div>
      <p class="article-page-excerpt">${escapeHTML(post.excerpt)}</p>
      <div class="article-page-body">
        ${post.paragraphs.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('')}
      </div>
    `;
  }

  renderArchive();
  renderTopicCloud();
  renderTagCloud();
  renderPostDetail();
})();
