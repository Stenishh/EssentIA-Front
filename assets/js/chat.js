// ==============================
// Estado da aplicação
// ==============================
const elements = {};
const state = {
  isTyping: false,
  messageHistory: []
};

const config = {
  typingDelay: 50,
  aiResponseDelay: 1000,
  aiName: 'EssentIA',
  userName: '' // preenchido na initialize()
};

// Histórico de exemplo (mock)
const sampleHistory = [
  { title: 'Sugestões de perfumes cítricos', subtitle: 'Ontem' },
  { title: 'Fixação x concentração', subtitle: 'Semana passada' },
  { title: 'Perfume para noite fria', subtitle: 'Há 2 semanas' }
];

// ==============================
// Inicialização quando o DOM estiver pronto
// ==============================
function initialize() {
  // Mapear elementos do DOM
  elements.chatMessages = document.getElementById('chat-column');
  elements.messageInput = document.getElementById('message-input');
  elements.sendBtn = document.getElementById('send-btn');
  elements.newChatBtn = document.getElementById('new-chat-btn');
  elements.sidebar = document.querySelector('.chat-sidebar');
  elements.chatMain = document.querySelector('.chat-main');
  elements.chatFullpage = document.querySelector('.chat-fullpage');
  elements.hamburgerBtn = document.getElementById('hamburger-btn');
  elements.historyList = document.getElementById('history-list');
  elements.historySearch = document.getElementById('history-search');
  elements.welcomeHero = document.getElementById('welcome-hero');
  elements.heroTitle   = document.getElementById('hero-title');

  // Nome do usuário (ajuste a origem como preferir)
  config.userName = getUserName() || 'visitante';

  // Listeners
  setupHamburger();
  setupChat();
  setupHistory();

  // Iniciar chat
  renderHistory();
  startNewChat();

  // Garante estado compose-center na primeira tela
  elements.chatMain?.classList.add('compose-center');
  elements.chatFullpage?.classList.add('compose-center');

  // Atualiza o texto do hero
  updateWelcomeHero();
}

// ==============================
// Utilidades
// ==============================
function getUserName(){
  // tentar pegar da sidebar
  const fromSidebar = document.querySelector('.sidebar-footer .name');
  if (fromSidebar && fromSidebar.textContent.trim()) return fromSidebar.textContent.trim();

  // ou LocalStorage
  try { return localStorage.getItem('userName') || ''; } catch { return ''; }
}

function updateWelcomeHero(){
  if (!elements.heroTitle) return;
  const nome = config.userName || 'visitante';
  elements.heroTitle.textContent = `Olá, ${nome}! Qual sua dúvida de perfume?`;
  if (elements.messageInput) {
    elements.messageInput.placeholder = 'Pergunte sobre fragrâncias, notas, fixação, ocasiões...';
  }
}

// ==============================
// Configuração do botão hamburger
// ==============================
function setupHamburger() {
  if (!elements.hamburgerBtn || !elements.sidebar) return;

  // Click no hamburger
  elements.hamburgerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    elements.sidebar.classList.toggle('open');
    const isOpen = elements.sidebar.classList.contains('open');
    elements.hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Fechar ao clicar fora (em telas pequenas)
  document.addEventListener('click', (e) => {
    const clickedOutside = !elements.sidebar.contains(e.target) &&
                           !elements.hamburgerBtn.contains(e.target);

    if (elements.sidebar.classList.contains('open') && clickedOutside) {
      elements.sidebar.classList.remove('open');
      elements.hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ==============================
// Configuração do chat
// ==============================
function setupChat() {
  elements.sendBtn?.addEventListener('click', handleSendMessage);

  elements.messageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  elements.newChatBtn?.addEventListener('click', startNewChat);
}

// ==============================
// Envio de mensagem
// ==============================
function handleSendMessage() {
  if (!elements.messageInput || state.isTyping) return;

  const text = elements.messageInput.value.trim();
  if (!text) return;

  // Remove a classe empty quando enviar mensagem
  elements.chatMessages?.classList.remove('empty');

  // Ao enviar a primeira mensagem, sai do modo "compose-center"
  elements.chatMain?.classList.remove('compose-center');
  elements.chatFullpage?.classList.remove('compose-center');

  // Esconde o hero
  elements.welcomeHero?.classList.add('hidden');

  // Adicionar mensagem do usuário
  addMessage('Você', text);
  elements.messageInput.value = '';

  // (Opcional) Simular resposta da IA
  setTimeout(() => {
    addMessage(config.aiName, 'Entendi! Me conte mais sobre o que você busca: notas, ocasião de uso ou fixação?', true);
  }, config.aiResponseDelay);
}

// ==============================
// Animação de digitação
// ==============================
function typeWriter(text, element) {
  let i = 0;
  element.textContent = '';
  state.isTyping = true;

  (function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, config.typingDelay);
    } else {
      state.isTyping = false;
      element.parentElement.classList.remove('typing');
    }
  })();
}

// ==============================
// Criar elemento de mensagem
// ==============================
function createMessageElement(sender, isAI) {
  const messageWrapper = document.createElement('div');
  messageWrapper.className = `message-wrapper ${isAI ? 'ai-message' : 'user-message'}`;

  const logoFallback = 'assets/img/logo.png';

  if (isAI) {
    messageWrapper.innerHTML = `
      <div class="message-row ai">
        <div class="avatar-container">
          <img class="avatar" src="${logoFallback}" alt="AI" />
        </div>
        <div class="message-bubble ai typing"><p></p></div>
      </div>`;
  } else {
    messageWrapper.innerHTML = `
      <div class="message-row user">
        <div class="message-bubble user"><p></p></div>
        <div class="avatar-container">
          <img class="avatar" src="${logoFallback}" alt="Você" />
        </div>
      </div>`;
  }

  return messageWrapper;
}

// ==============================
// Adicionar mensagem ao chat
// ==============================
function addMessage(sender, text, isAI = false) {
  if (!elements.chatMessages) return;

  elements.chatMessages.classList.remove('empty');

  const messageWrapper = createMessageElement(sender, isAI);
  const messageBubble = messageWrapper.querySelector('.message-bubble p');

  elements.chatMessages.appendChild(messageWrapper);

  if (isAI) {
    typeWriter(text, messageBubble);
  } else {
    messageBubble.textContent = text;
  }

  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  state.messageHistory.push({ sender, text, isAI });
}

// ==============================
// Iniciar novo chat: centraliza o input até a primeira mensagem
// ==============================
function startNewChat() {
  if (!elements.chatMessages) return;

  elements.chatMessages.innerHTML = '';
  elements.chatMessages.classList.add('empty');

  elements.chatMain?.classList.add('compose-center');
  elements.chatFullpage?.classList.add('compose-center');

  elements.welcomeHero?.classList.remove('hidden');
  updateWelcomeHero();

  elements.messageInput?.focus();
}

// ==============================
// Histórico (mock)
// ==============================
function renderHistory(list = sampleHistory) {
  if (!elements.historyList) return;

  elements.historyList.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <img src="assets/img/logo.png" alt="icon" />
      <div class="meta">
        <div class="title">${item.title}</div>
        <div class="subtitle">${item.subtitle}</div>
      </div>`;

    li.addEventListener('click', () => {
      loadChat(item);
      elements.sidebar.classList.remove('open');
      elements.hamburgerBtn.setAttribute('aria-expanded', 'false');
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

function setupHistory() {
  elements.historySearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = sampleHistory.filter(item =>
      item.title.toLowerCase().includes(query)
    );
    renderHistory(filtered);
  });
}

// ==============================
// Boot
// ==============================
document.addEventListener('DOMContentLoaded', initialize);
