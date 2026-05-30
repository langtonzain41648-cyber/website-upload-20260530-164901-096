
(function () {
  const form = document.querySelector('[data-search-form]');
  const result = document.querySelector('[data-search-result]');
  if (!form || !result || !window.MOVIE_INDEX) {
    return;
  }

  const qInput = form.querySelector('[name="q"]');
  const yearSelect = form.querySelector('[name="year"]');
  const regionSelect = form.querySelector('[name="region"]');
  const categorySelect = form.querySelector('[name="category"]');

  const params = new URLSearchParams(window.location.search);
  qInput.value = params.get('q') || '';

  const uniqueValues = function (key) {
    return Array.from(new Set(window.MOVIE_INDEX.map(function (item) {
      return item[key];
    }).filter(Boolean))).sort();
  };

  uniqueValues('region').forEach(function (region) {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    regionSelect.appendChild(option);
  });

  uniqueValues('category').forEach(function (category) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  const years = uniqueValues('year').sort(function (a, b) {
    return b - a;
  });
  years.forEach(function (year) {
    if (!year) {
      return;
    }
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  });

  regionSelect.value = params.get('region') || '';
  yearSelect.value = params.get('year') || '';
  categorySelect.value = params.get('category') || '';

  const render = function () {
    const q = qInput.value.trim().toLowerCase();
    const year = yearSelect.value;
    const region = regionSelect.value;
    const category = categorySelect.value;

    const filtered = window.MOVIE_INDEX.filter(function (item) {
      const haystack = [item.title, item.region, item.type, item.genre, item.category, item.description, (item.tags || []).join(' ')].join(' ').toLowerCase();
      const matchQ = !q || haystack.indexOf(q) !== -1;
      const matchYear = !year || String(item.year) === year;
      const matchRegion = !region || item.region === region;
      const matchCategory = !category || item.category === category;
      return matchQ && matchYear && matchRegion && matchCategory;
    }).sort(function (a, b) {
      return b.hot - a.hot;
    }).slice(0, 120);

    result.innerHTML = filtered.map(function (item) {
      const tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">'
        + '<a class="poster-link" href="' + item.detail + '">'
        + '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />'
        + '<span class="play-dot">▶</span>'
        + '</a>'
        + '<div class="movie-card-body">'
        + '<h3><a href="' + item.detail + '">' + escapeHtml(item.title) + '</a></h3>'
        + '<p class="meta-line">' + item.year + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>'
        + '<p class="card-desc">' + escapeHtml(item.description) + '</p>'
        + '<div class="tag-row">' + tags + '</div>'
        + '</div>'
        + '</article>';
    }).join('');

    if (!filtered.length) {
      result.innerHTML = '<div class="panel-card"><h3>没有匹配结果</h3><p>可以更换关键词、年份、地区或分类继续筛选。</p></div>';
    }
  };

  const escapeHtml = function (text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  form.addEventListener('input', render);
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render();
  });

  render();
})();
