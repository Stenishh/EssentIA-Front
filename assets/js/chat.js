// Estado da aplicação
const elements = {};
const state = {
    isTyping: false,
    messageHistory: []
};

const config = {
    typingDelay: 50,
    aiResponseDelay: 1000,
    aiName: 'EssentIA'
};

// Inicialização quando o DOM estiver pronto
function initialize() {
    console.log('Inicializando aplicação...');
    
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

    // Configurar event listeners
    setupHamburger();
    setupChat();
    setupHistory();
    
    // Iniciar chat
    renderHistory();
    startNewChat();
    // Garantir que o layout esteja em modo de composição centralizada ao iniciar
    if (elements.chatMain && !elements.chatMain.classList.contains('compose-center')) {
        elements.chatMain.classList.add('compose-center');
    }
    if (elements.chatFullpage && !elements.chatFullpage.classList.contains('compose-center')) {
        elements.chatFullpage.classList.add('compose-center');
    }
    
    console.log('Inicialização completa!');
}

// Configuração do botão hamburger
function setupHamburger() {
    if (!elements.hamburgerBtn || !elements.sidebar) {
        console.error('Elementos do hamburger não encontrados');
        return;
    }

    // Click no hamburger
    elements.hamburgerBtn.addEventListener('click', (e) => {
        console.log('Click no hamburger');
        e.preventDefault();
        e.stopPropagation();
        
        elements.sidebar.classList.toggle('open');
        const isOpen = elements.sidebar.classList.contains('open');
        elements.hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Fechar ao clicar fora (em telas pequenas)
    document.addEventListener('click', (e) => {
        if (window.innerWidth >= 900) return;
        
        const clickedOutside = !elements.sidebar.contains(e.target) && 
                             !elements.hamburgerBtn.contains(e.target);
                             
        if (elements.sidebar.classList.contains('open') && clickedOutside) {
            elements.sidebar.classList.remove('open');
            elements.hamburgerBtn.setAttribute('aria-expanded', false);
        }
    });
}

// Configuração do chat
function setupChat() {
    if (elements.sendBtn) {
        elements.sendBtn.addEventListener('click', handleSendMessage);
    }

    if (elements.messageInput) {
        elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    if (elements.newChatBtn) {
        elements.newChatBtn.addEventListener('click', startNewChat);
    }
}

// Envio de mensagem
function handleSendMessage() {
    if (!elements.messageInput || state.isTyping) return;
    
    const text = elements.messageInput.value.trim();
    if (!text) return;

    // Remove a classe empty quando enviar mensagem
    if (elements.chatMessages) {
        elements.chatMessages.classList.remove('empty');
    }

    // If composing first message, remove compose-center from chatMain
    if (elements.chatMain && elements.chatMain.classList.contains('compose-center')) {
        elements.chatMain.classList.remove('compose-center');
    }
    if (elements.chatFullpage && elements.chatFullpage.classList.contains('compose-center')) {
        elements.chatFullpage.classList.remove('compose-center');
    }

    // Adicionar mensagem do usuário
    addMessage('Você', text);
    elements.messageInput.value = '';

}

// Animação de digitação
function typeWriter(text, element) {
    let i = 0;
    element.textContent = '';
    state.isTyping = true;

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, config.typingDelay);
        } else {
            state.isTyping = false;
            element.parentElement.classList.remove('typing');
        }
    }

    type();
}

// Criar elemento de mensagem
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

// Adicionar mensagem ao chat
function addMessage(sender, text, isAI = false) {
    if (!elements.chatMessages) return;

    // Remove a classe empty quando houver mensagens
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


// Iniciar novo chat: centraliza o input até a primeira mensagem
function startNewChat() {
    if (!elements.chatMessages) return;

    // Limpa mensagens e aplica classes que centralizam o input
    elements.chatMessages.innerHTML = '';
    elements.chatMessages.classList.add('empty');
    if (elements.chatMain) elements.chatMain.classList.add('compose-center');

    // Foca no input
    if (elements.messageInput) elements.messageInput.focus();

    // Opcional: podemos adicionar uma mensagem de boas-vindas só depois do usuário enviar a primeira
}



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
            // Fechar sidebar em telas pequenas após selecionar
            if (window.innerWidth < 900) {
                elements.sidebar.classList.remove('open');
            }
        });
        
        elements.historyList.appendChild(li);
    });
}

function loadChat(chat) {
    if (!elements.chatMessages) return;
    elements.chatMessages.innerHTML = '';
    addMessage('Sistema', `Carregando conversa: ${chat.title}`);
    addMessage(config.aiName, 'Conversa carregada do histórico.', true);
}

function setupHistory() {
    if (!elements.historySearch) return;
    
    elements.historySearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = sampleHistory.filter(item => 
            item.title.toLowerCase().includes(query)
        );
        renderHistory(filtered);
    });
}



// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initialize);
