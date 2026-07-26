// --- GESTÃO DE IDENTIDADE ANÔNIMA (GUEST SESSION) ---
function getGuestId() {
  let guestId = localStorage.getItem('devpilot_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('devpilot_guest_id', guestId);
  }
  return guestId;
}

const currentGuestId = getGuestId();

// --- ELEMENTOS DO DOM ---
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const personaSelect = document.getElementById('persona-select');

// Botões de Exportar
const exportMDBtn = document.getElementById('export-md-btn');
const exportPDFBtn = document.getElementById('export-pdf-btn');

// Elementos da Sidebar
const sessionsListEl = document.getElementById('sessions-list');
const newChatBtn = document.getElementById('new-chat-btn');
const currentChatTitle = document.getElementById('current-chat-title');

// Elementos de Anexo e Voz
const attachBtn = document.getElementById('attach-btn');
const micBtn = document.getElementById('mic-btn');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
const fileNameSpan = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file-btn');

// --- ESTADO DA APLICAÇÃO ---
let conversationHistory = [];

// Recupera a lista de sessões salvas
let sessions = JSON.parse(localStorage.getItem('chatSessions')) || [];

// Recupera o ID da sessão que estava ativa antes do refresh
let currentSessionId = localStorage.getItem('activeSessionId');

// Se não houver sessão ativa ou se a lista estiver vazia, cria o primeiro chat
if (!currentSessionId || sessions.length === 0) {
  currentSessionId = `session_${Date.now()}`;
  sessions = [{ id: currentSessionId, title: 'Chat Inicial', persona: personaSelect?.value || 'general' }];
} else {
  const exists = sessions.some(s => s.id === currentSessionId);
  if (!exists) {
    currentSessionId = sessions[0]?.id || `session_${Date.now()}`;
  }
}

let attachedFileContent = null;
let attachedFileName = '';
let isRecording = false;
let recognition = null;

// --- CONFIGURAÇÃO DE RECONHECIMENTO DE VOZ ---
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'pt-BR';

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    userInput.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error('Erro na gravação de voz:', event.error);
    stopRecording();
  };

  recognition.onend = () => {
    stopRecording();
  };
} else if (micBtn) {
  micBtn.style.display = 'none';
}

micBtn?.addEventListener('click', () => {
  if (!recognition) return;

  if (isRecording) {
    recognition.stop();
    stopRecording();
  } else {
    recognition.start();
    isRecording = true;
    micBtn.classList.add('recording');
    userInput.placeholder = 'Ouvindo... Fale agora...';
  }
});

function stopRecording() {
  isRecording = false;
  micBtn?.classList.remove('recording');
  userInput.placeholder = 'Digite sua mensagem, dite ou anexe um arquivo...';
}

// --- EXPORTAR HISTÓRICO ---
exportMDBtn?.addEventListener('click', () => {
  if (conversationHistory.length === 0) {
    alert('Não há mensagens neste chat para exportar.');
    return;
  }

  let mdContent = `# Relatório DevPilot IA\n*Data: ${new Date().toLocaleString('pt-BR')}*\n\n---\n\n`;

  conversationHistory.forEach(item => {
    const roleLabel = item.role === 'user' ? '👤 **Usuário**' : '🤖 **DevPilot IA**';
    mdContent += `${roleLabel}:\n${item.content}\n\n---\n\n`;
  });

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devpilot-chat-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

exportPDFBtn?.addEventListener('click', () => {
  if (conversationHistory.length === 0) {
    alert('Não há mensagens neste chat para salvar em PDF.');
    return;
  }
  window.print();
});

// --- GERENCIAMENTO DE SESSÕES E PERSONAS ---
function saveSessionsToStorage() {
  localStorage.setItem('chatSessions', JSON.stringify(sessions));
  localStorage.setItem('activeSessionId', currentSessionId);
}

async function deleteSession(idToDelete) {
  try {
    await fetch(`/api/ai/history/${idToDelete}`, { 
      method: 'DELETE',
      headers: {
        'X-Guest-ID': currentGuestId
      }
    });
  } catch (err) {
    console.error('Erro ao apagar mensagens no servidor:', err);
  }

  sessions = sessions.filter(s => s.id !== idToDelete);

  if (currentSessionId === idToDelete) {
    if (sessions.length > 0) {
      currentSessionId = sessions[0].id;
      loadHistory();
    } else {
      const newId = `session_${Date.now()}`;
      sessions = [{ id: newId, title: 'Chat Inicial', persona: personaSelect?.value || 'general' }];
      currentSessionId = newId;
      resetChatArea();
    }
  }

  saveSessionsToStorage();
  renderSidebar();
}

function resetChatArea() {
  conversationHistory = [];
  chatMessages.innerHTML = `
    <div class="message assistant">
      <div class="bubble">Este chat está limpo. Mande sua dúvida ou anexe um arquivo!</div>
    </div>
  `;
}

function renderSidebar() {
  sessionsListEl.innerHTML = '';
  const currentSession = sessions.find(s => s.id === currentSessionId);

  if (currentSession && currentSession.persona && personaSelect) {
    personaSelect.value = currentSession.persona;
  }

  sessions.forEach(session => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    const titleSpan = document.createElement('span');
    titleSpan.innerText = session.title;
    titleSpan.style.flex = '1';
    titleSpan.style.cursor = 'pointer';

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.style.background = 'transparent';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.padding = '2px 5px';
    deleteBtn.style.opacity = '0.6';
    deleteBtn.title = 'Apagar esta conversa';

    deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
    deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0.6');

    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Deseja apagar a conversa "${session.title}"?`)) {
        deleteSession(session.id);
      }
    });

    if (session.id === currentSessionId) {
      li.classList.add('active');
      if (currentChatTitle) currentChatTitle.innerText = session.title;
    }

    titleSpan.addEventListener('click', () => {
      if (currentSessionId !== session.id) {
        currentSessionId = session.id;
        saveSessionsToStorage();
        renderSidebar();
        loadHistory();
      }
    });

    li.appendChild(titleSpan);
    li.appendChild(deleteBtn);
    sessionsListEl.appendChild(li);
  });
}

personaSelect?.addEventListener('change', () => {
  const currentSession = sessions.find(s => s.id === currentSessionId);
  if (currentSession) {
    currentSession.persona = personaSelect.value;
    saveSessionsToStorage();
  }
});

newChatBtn?.addEventListener('click', () => {
  const newId = `session_${Date.now()}`;
  const newTitle = `Chat ${sessions.length + 1}`;
  const currentPersona = personaSelect?.value || 'general';

  sessions.unshift({ id: newId, title: newTitle, persona: currentPersona });
  currentSessionId = newId;

  saveSessionsToStorage();
  renderSidebar();
  resetChatArea();
});

// --- RENDERIZAÇÃO DE MENSAGENS E CÓDIGO ---
function appendMessage(role, content, isHtml = false) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', role);

  const bubbleDiv = document.createElement('div');
  bubbleDiv.classList.add('bubble');

  if (isHtml) {
    bubbleDiv.innerHTML = content;
  } else {
    bubbleDiv.textContent = content;
  }

  messageDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(messageDiv);

  if (role === 'assistant' && isHtml) {
    bubbleDiv.querySelectorAll('pre code').forEach((block) => {
      if (window.hljs) hljs.highlightElement(block);
      addCopyButton(block.parentElement);
    });
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageDiv;
}

function addCopyButton(preElement) {
  if (preElement.querySelector('.copy-btn')) return;
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.innerText = 'Copiar';
  btn.addEventListener('click', () => {
    const code = preElement.querySelector('code')?.innerText || preElement.innerText;
    navigator.clipboard.writeText(code);
    btn.innerText = 'Copiado!';
    setTimeout(() => btn.innerText = 'Copiar', 2000);
  });
  preElement.appendChild(btn);
}

// --- GERENCIAMENTO DE ARQUIVOS ANEXADOS ---
attachBtn?.addEventListener('click', () => fileInput.click());

fileInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    attachedFileContent = event.target.result;
    attachedFileName = file.name;
    fileNameSpan.innerText = file.name;
    filePreview.classList.remove('hidden');
  };
  reader.readAsText(file);
});

removeFileBtn?.addEventListener('click', () => clearAttachedFile());

function clearAttachedFile() {
  attachedFileContent = null;
  attachedFileName = '';
  if (fileInput) fileInput.value = '';
  filePreview?.classList.add('hidden');
}

// --- CARREGAR HISTÓRICO DO SERVIDOR ---
async function loadHistory() {
  try {
    const res = await fetch(`/api/ai/history/${currentSessionId}`, {
      headers: {
        'X-Guest-ID': currentGuestId
      }
    });
    const data = await res.json();

    chatMessages.innerHTML = '';
    conversationHistory = [];

    if (data.success && data.history && data.history.length > 0) {
      data.history.forEach(item => {
        conversationHistory.push({ role: item.role, content: item.content });
        if (item.role === 'assistant') {
          const formatted = window.marked ? marked.parse(item.content) : item.content;
          appendMessage('assistant', formatted, true);
        } else {
          appendMessage('user', item.content);
        }
      });
    } else {
      resetChatArea();
    }
  } catch (err) {
    console.error('Erro ao carregar histórico:', err);
    resetChatArea();
  }
}

// Inicializa a interface mantendo o estado
saveSessionsToStorage();
renderSidebar();
loadHistory();

// --- ENVIO DA MENSAGEM COM STREAMING ---
chatForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  let text = userInput.value.trim();

  if (!text && !attachedFileContent) return;

  let finalContentForAi = text;
  if (attachedFileContent) {
    const fileHeader = `\n\n--- INÍCIO DO ARQUIVO ANEXADO (${attachedFileName}) ---\n${attachedFileContent}\n--- FIM DO ARQUIVO ANEXADO ---\n`;
    finalContentForAi = text ? `${text}\n${fileHeader}` : `Por favor, analise este arquivo (${attachedFileName}):\n${fileHeader}`;
  }

  const userDisplayMessage = attachedFileName 
    ? `${text ? text + '\n\n' : ''}📎 *Arquivo anexado: ${attachedFileName}*`
    : text;

  appendMessage('user', userDisplayMessage);
  userInput.value = '';

  const activeSessionObj = sessions.find(s => s.id === currentSessionId);
  if (activeSessionObj && (activeSessionObj.title === 'Chat Inicial' || activeSessionObj.title.startsWith('Chat ')) && text) {
    activeSessionObj.title = text.substring(0, 22) + '...';
    saveSessionsToStorage();
    renderSidebar();
  }

  conversationHistory.push({ role: 'user', content: finalContentForAi });
  clearAttachedFile();

  sendBtn.disabled = true;
  userInput.disabled = true;

  const assistantMessageDiv = appendMessage('assistant', '');
  const bubbleDiv = assistantMessageDiv.querySelector('.bubble');

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Guest-ID': currentGuestId
      },
      body: JSON.stringify({ 
        messages: conversationHistory, 
        persona: personaSelect.value, 
        sessionId: currentSessionId 
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao obter resposta do servidor.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let aiFullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      aiFullResponse += chunk;

      const formatted = window.marked ? marked.parse(aiFullResponse) : aiFullResponse;
      bubbleDiv.innerHTML = formatted;

      bubbleDiv.querySelectorAll('pre code').forEach((block) => {
        if (window.hljs) hljs.highlightElement(block);
        addCopyButton(block.parentElement);
      });

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    conversationHistory.push({ role: 'assistant', content: aiFullResponse });

  } catch (err) {
    bubbleDiv.innerText = '⚠️ Erro ao conectar com o servidor backend.';
    console.error(err);
  } finally {
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }
});

// --- APAGAR SESSÃO ATUAL ---
clearBtn?.addEventListener('click', async () => {
  if (!confirm('Deseja realmente apagar esta conversa da lista?')) return;
  deleteSession(currentSessionId);
});

// --- ATALHOS DE TECLADO ---
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (document.activeElement === userInput) {
      e.preventDefault();
      chatForm?.requestSubmit();
    }
  }

  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
    e.preventDefault();
    newChatBtn?.click();
  }

  if (e.key === 'Escape') {
    if (isRecording) {
      recognition?.stop();
      stopRecording();
    } else if (attachedFileContent) {
      clearAttachedFile();
    }
  }
});