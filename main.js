const API_URL = 'https://api.jikan.moe/v4/anime/38000/characters';

let allChars = [];
let mainChars = [];
let loaded = false;

// ── Utilitários ────────────────────────────────────────────────

function normName(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getDisplayName(raw) {
  const parts = raw.split(',').map(s => s.trim());
  return parts.length === 2 ? parts[1] + ' ' + parts[0] : raw;
}

function getSurname(raw) {
  return raw.split(',')[0].trim();
}

function getFirstname(raw) {
  const parts = raw.split(',');
  return parts.length > 1 ? parts[1].trim() : '';
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Carregamento de dados ──────────────────────────────────────

async function loadData() {
  const section = document.getElementById('results-section');
  section.innerHTML = '<div class="loading-box"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';

  try {
    const response = await fetch(API_URL);
    const json = await response.json();
    allChars = json.data || [];
    mainChars = allChars.filter(c => c.role === 'Main');
    loaded = true;

    document.getElementById('stat-total').textContent = allChars.length;
    document.getElementById('stat-main').textContent = mainChars.length;
    document.getElementById('stat-support').textContent = allChars.filter(c => c.role !== 'Main').length;

    showMainChars();
  } catch (err) {
    section.innerHTML = `
      <div class="empty">
        <div class="emoji">⚠️</div>
        <p>Erro ao carregar dados. Verifique sua conexão e tente novamente.</p>
      </div>`;
    console.error(err);
  }
}

// ── Busca ──────────────────────────────────────────────────────

function doSearch() {
  const raw = document.getElementById('search-input').value.trim();
  const q = normName(raw);

  if (!loaded) return;

  if (!q) {
    showMainChars();
    return;
  }

  const results = allChars.filter(c => {
    const name = c.character.name;
    const fullNorm = normName(name);
    const firstNorm = normName(getFirstname(name));
    const surnameNorm = normName(getSurname(name));

    return (
      fullNorm.includes(q) ||
      firstNorm.includes(q) ||
      surnameNorm.includes(q)
    );
  });

  if (results.length === 0) {
    renderEmpty(raw);
    return;
  }

  const isFamilySearch = results.length > 1 && results.every(c =>
    normName(getSurname(c.character.name)) === normName(getSurname(results[0].character.name))
  );

  let familyMsg = null;
  if (isFamilySearch) {
    const surname = getSurname(results[0].character.name);
    familyMsg = `Família <strong>${surname}</strong>: ${results.length} personagens encontrados com esse sobrenome.`;
  }

  renderCards(results, `${results.length} resultado(s) para "<strong>${raw}</strong>"`, familyMsg);
}

// ── Renderização ───────────────────────────────────────────────

function showMainChars() {
  renderCards(allChars, `Todos os personagens — ${allChars.length}`, null);
}

function renderEmpty(query) {
  const section = document.getElementById('results-section');
  section.innerHTML = `
    <div class="empty animate-in">
      <div class="emoji">🔍</div>
      <p>Nenhum personagem principal encontrado para "<strong>${query}</strong>".</p>
      <p style="margin-top: 8px; font-size: 13px;">Tente "Tanjiro", "Zenitsu" ou "Rengoku".</p>
    </div>`;
}

function renderCards(chars, title, familyMsg) {
  const section = document.getElementById('results-section');

  let html = `<p class="results-title animate-in">${title}</p>`;

  if (familyMsg) {
    html += `
      <div class="family-notice animate-in">
        <span class="icon">👨‍👩‍👧‍👦</span>
        <span><strong>Família detectada!</strong> ${familyMsg}</span>
      </div>`;
  }

  html += '<div class="cards-grid">';

  chars.forEach((c, index) => {
    const char = c.character;
    const isMain = c.role === 'Main';
    const name = getDisplayName(char.name);
    const imgUrl = char.images?.jpg?.image_url || '';
    const fav = c.favorites || 0;

    const imgHtml = imgUrl
      ? `<img class="char-img" src="${imgUrl}" alt="${name}" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="char-img-placeholder">?</div>`;

    const favHtml = fav > 0
      ? `<div class="char-fav">♡ ${fav.toLocaleString('pt-BR')}</div>`
      : '';

    html += `
      <div class="char-card ${isMain ? 'main-cast' : ''}"
           title="${name}"
           style="animation-delay: ${index * 0.05}s">
        ${imgHtml}
        <div class="char-info">
          <div class="char-name">${name}</div>
          <span class="char-badge ${isMain ? 'badge-main' : 'badge-support'}">
            ${isMain ? 'Principal' : 'Coadjuvante'}
          </span>
          ${favHtml}
        </div>
      </div>`;
  });

  html += '</div>';
  section.innerHTML = html;
}

// ── Eventos ────────────────────────────────────────────────────

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', debounce(doSearch, 300));

// Manter suporte ao Enter para acessibilidade
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// Inicialização
loadData();
