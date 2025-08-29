// ========= Estado =========
const elements = {};
const state = { isTyping: false, messageHistory: [] };
const config = { typingDelay: 50, aiResponseDelay: 1000, aiName: 'EssentIA', userName: '' };

// Mock de histórico
const sampleHistory = [
  { title: 'Sugestões de perfumes cítricos', subtitle: 'Ontem' },
  { title: 'Fixação x concentração', subtitle: 'Semana passada' },
  { title: 'Perfume para noite fria', subtitle: 'Há 2 semanas' }
];

// ========= Init =========
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
  // Map
  elements.chatMessages  = document.getElementById('chat-column');
  elements.messageInput  = document.getElementById('message-input');
  elements.sendBtn       = document.getElementById('send-btn');
  elements.newChatBtn    = document.getElementById('new-chat-btn');
  elements.sidebar       = document.querySelector('.chat-sidebar');
  elements.chatMain      = document.querySelector('.chat-main');
  elements.chatFullpage  = document.querySelector('.chat-fullpage');
  elements.hamburgerBtn  = document.getElementById('hamburger-btn');
  elements.historyList   = document.getElementById('history-list');
  elements.historySearch = document.getElementById('history-search');
  elements.welcomeHero   = document.getElementById('welcome-hero');
  elements.heroTitle     = document.getElementById('hero-title');

  // Nome do usuário (se tiver salvo)
  config.userName = getUserName() || 'Usuário';
  updateWelcomeHeroText();

  // Medir altura real da pílula e salvar na CSS var (garante transição correta)
  updateInputHeightVar();
  window.addEventListener('resize', updateInputHeightVar);

  // Listeners
  setupHamburger();
  setupChat();
  setupHistory();
  renderHistory();

  // Tela inicial sempre ao entrar/atualizar
  forceWelcomeOnLoad();
  window.addEventListener('pageshow', forceWelcomeOnLoad); // bfcache
}

// ===== Utils =====
function getUserName() {
  const n = document.querySelector('.sidebar-footer .name');
  if (n && n.textContent.trim()) return n.textContent.trim();
  try { return localStorage.getItem('userName') || ''; } catch { return ''; }
}

function updateWelcomeHeroText() {
  if (elements.heroTitle) {
    const nome = config.userName || 'Usuário';
    elements.heroTitle.textContent = `Olá, ${nome}! Qual sua dúvida de perfume?`;
  }
  if (elements.messageInput) {
    elements.messageInput.placeholder = 'Pergunte sobre fragrâncias, notas, fixação, ocasiões...';
  }
}

/** Mede a altura da pílula e injeta em --input-height (para animar top com precisão) */
function updateInputHeightVar(){
  const row = document.querySelector('.input-row');
  if (!row) return;
  const h = Math.round(row.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--input-height', `${h}px`);
}

/** Força o estado "tela inicial": hero visível + pílula central (via compose-center) */
function forceWelcomeOnLoad() {
  // Fecha sidebar e reseta botão
  elements.sidebar?.classList.remove('open');
  document.body.classList.remove('sidebar-open');
  elements.hamburgerBtn?.setAttribute('aria-expanded', 'false');

  // Limpa mensagens e ativa classes
  elements.chatMessages && (elements.chatMessages.innerHTML = '');
  elements.chatMessages?.classList.add('empty');
  elements.chatMain?.classList.add('compose-center');
  elements.chatFullpage?.classList.add('compose-center');

  // Mostra hero
  elements.welcomeHero?.classList.remove('hidden');
  updateWelcomeHeroText();

  // Foco no input
  setTimeout(() => elements.messageInput?.focus(), 0);
}

// ===== Hamburger =====
function setupHamburger() {
  const btn = elements.hamburgerBtn, sb = elements.sidebar;
  if (!btn || !sb) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    sb.classList.toggle('open');
    const isOpen = sb.classList.contains('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('sidebar-open', isOpen);
  });

  document.addEventListener('click', (e) => {
    const out = !sb.contains(e.target) && !btn.contains(e.target);
    if (sb.classList.contains('open') && out) {
      sb.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sidebar-open');
    }
  });
}

// ===== Chat =====
function setupChat() {
  elements.sendBtn?.addEventListener('click', handleSendMessage);

  elements.messageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  });

  // "+ Nova conversa" volta para o hero (animando de baixo → meio)
  elements.newChatBtn?.addEventListener('click', () => forceWelcomeOnLoad());
}

function handleSendMessage() {
  if (!elements.messageInput || state.isTyping) return;
  const text = elements.messageInput.value.trim();
  if (!text) return;

  // Sai do modo tela inicial (meio → baixo), anima porque só removemos a classe
  elements.chatMain?.classList.remove('compose-center');
  elements.chatFullpage?.classList.remove('compose-center');
  elements.welcomeHero?.classList.add('hidden');

  addMessage('Você', text);
  elements.messageInput.value = '';

  // Simula resposta
  setTimeout(() => {
    addMessage(config.aiName, 'Entendi! Me conte mais sobre o que você busca: notas, ocasião de uso ou fixação?', true);
  }, config.aiResponseDelay);
}

// ===== Mensagens =====
function typeWriter(text, el) {
  let i = 0; el.textContent = ''; state.isTyping = true;
  (function t(){ if(i<text.length){ el.textContent += text.charAt(i++); setTimeout(t, config.typingDelay); }
  else{ state.isTyping = false; el.parentElement.classList.remove('typing'); } })();
}

function createMessageElement(isAI) {
  const wrap = document.createElement('div');
  wrap.className = `message-wrapper ${isAI ? 'ai-message' : 'user-message'}`;
  const logo = 'assets/img/logo.png';
  wrap.innerHTML = isAI
    ? `<div class="message-row ai"><div class="avatar-container"><img class="avatar" src="${logo}" alt="AI"/></div><div class="message-bubble ai typing"><p></p></div></div>`
    : `<div class="message-row user"><div class="message-bubble user"><p></p></div><div class="avatar-container"><img class="avatar" src="${logo}" alt="Você"/></div></div>`;
  return wrap;
}

function addMessage(sender, text, isAI=false) {
  if (!elements.chatMessages) return;
  elements.chatMessages.classList.remove('empty');

  const wrap = createMessageElement(isAI);
  const p = wrap.querySelector('.message-bubble p');
  elements.chatMessages.appendChild(wrap);

  if (isAI) typeWriter(text, p); else p.textContent = text;
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  state.messageHistory.push({ sender, text, isAI });
}

// ===== Histórico (mock) =====
function setupHistory(){ /* opcional: busca etc. */ }

function renderHistory(list = sampleHistory) {
  if (!elements.historyList) return;
  elements.historyList.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <img src="assets/img/logo.png" alt="icon" />
      <div class="meta"><div class="title">${item.title}</div><div class="subtitle">${item.subtitle}</div></div>`;
    li.addEventListener('click', () => {
      loadChat(item);
      elements.sidebar?.classList.remove('open');
      elements.hamburgerBtn?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sidebar-open');
    });
    elements.historyList.appendChild(li);
  });
}

function loadChat(chat) {
  if (!elements.chatMessages) return;
  elements.chatMessages.innerHTML = '';
  addMessage('Sistema', `Carregando conversa: ${chat.title}`);
  addMessage(config.aiName, 'Conversa carregada do histórico.', true);

  elements.chatMain?.classList.remove('compose-center');
  elements.chatFullpage?.classList.remove('compose-center');
  elements.welcomeHero?.classList.add('hidden');
}
