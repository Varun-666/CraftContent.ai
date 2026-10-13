const form = document.querySelector('#listing-form');
const button = document.querySelector('#generate-button');
const emptyState = document.querySelector('#empty-state');
const loadingState = document.querySelector('#loading-state');
const results = document.querySelector('#results');
const errorState = document.querySelector('#error-state');
const badge = document.querySelector('#result-badge');
let latestResult = null;

function showState(state) {
  emptyState.classList.toggle('hidden', state !== 'empty');
  loadingState.classList.toggle('hidden', state !== 'loading');
  results.classList.toggle('hidden', state !== 'results');
  errorState.classList.toggle('hidden', state !== 'error');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function renderResult(data) {
  latestResult = data;
  document.querySelector('#out-title').value = data.title || '';
  document.querySelector('#out-description').value = data.description || '';
  document.querySelector('#out-social_caption').value = data.social_caption || '';
  document.querySelector('#out-alt_text').value = data.alt_text || '';
  document.querySelector('#out-tags').innerHTML = (data.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  document.querySelector('#notice').textContent = data.notice || 'Review and edit the draft before publishing.';
  badge.textContent = data.model === 'template-fallback' ? 'Template mode' : 'Local AI draft';
  showState('results');
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  button.disabled = true;
  button.querySelector('span').textContent = 'Generating draft';
  badge.textContent = 'Working';
  errorState.textContent = '';
  showState('loading');
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Generation failed. Please try again.');
    renderResult(data);
  } catch (error) {
    errorState.textContent = `${error.message} Make sure the CraftCopy server is running, then try again.`;
    showState('error');
    badge.textContent = 'Could not generate';
  } finally {
    button.disabled = false;
    button.querySelector('span').textContent = 'Generate listing copy';
  }
});

async function copyText(text, buttonEl) {
  try {
    await navigator.clipboard.writeText(text);
    const old = buttonEl.textContent;
    buttonEl.textContent = 'Copied';
    window.setTimeout(() => { buttonEl.textContent = old; }, 1200);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    buttonEl.textContent = 'Copied';
  }
}

document.querySelectorAll('[data-copy]').forEach(buttonEl => {
  buttonEl.addEventListener('click', () => {
    const key = buttonEl.dataset.copy;
    const text = key === 'tags' ? (latestResult?.tags || []).map(tag => `#${tag}`).join(' ') : document.querySelector(`#out-${key}`).value;
    copyText(text, buttonEl);
  });
});

document.querySelector('#copy-all').addEventListener('click', event => {
  if (!latestResult) return;
  const all = [
    `PRODUCT TITLE\n${document.querySelector('#out-title').value}`,
    `DESCRIPTION\n${document.querySelector('#out-description').value}`,
    `SOCIAL CAPTION\n${document.querySelector('#out-social_caption').value}`,
    `TAGS\n${(latestResult.tags || []).map(tag => `#${tag}`).join(' ')}`,
    `IMAGE ALT TEXT\n${document.querySelector('#out-alt_text').value}`,
  ].join('\n\n');
  copyText(all, event.currentTarget);
});

fetch('/api/model-status').then(response => response.json()).then(status => {
  const label = document.querySelector('#model-status');
  label.textContent = status.loaded ? 'Local model ready' : 'Open-weight model · local-first';
}).catch(() => {
  document.querySelector('#model-status').textContent = 'Local-first generation';
});
