/**
 * WA Dispatcher — script.js
 * Lógica principal da aplicação
 */

// ─── Constantes de storage ────────────────────────────────────────────────────
const STORAGE_KEY = 'wa_dispatcher_state';

// ─── Estado da aplicação ──────────────────────────────────────────────────────
let state = {
  numbers:  [],   // Array de strings com os números
  used:     [],   // Índices já marcados como enviados
  current:  0,    // Índice do número atual
  message:  '',   // Mensagem a ser enviada
};

// ─── Seletores de DOM ─────────────────────────────────────────────────────────
const setupScreen    = document.getElementById('setup-screen');
const dispatchScreen = document.getElementById('dispatch-screen');

const numbersInput   = document.getElementById('numbers-input');
const messageInput   = document.getElementById('message-input');
const btnStart       = document.getElementById('btn-start');
const btnRestore     = document.getElementById('btn-restore');

const btnBack        = document.getElementById('btn-back');
const btnReset       = document.getElementById('btn-reset');
const btnOpen        = document.getElementById('btn-open');
const btnCopyLink    = document.getElementById('btn-copy-link');
const btnPrev        = document.getElementById('btn-prev');
const btnNext        = document.getElementById('btn-next');
const btnExport      = document.getElementById('btn-export');

const currentNumber  = document.getElementById('current-number');
const currentLink    = document.getElementById('current-link');
const counterText    = document.getElementById('counter-text');
const listStats      = document.getElementById('list-stats');
const numbersList    = document.getElementById('numbers-list');
const progressBar    = document.getElementById('progress-bar');

const toast          = document.getElementById('toast');
const modal          = document.getElementById('modal');
const modalContent   = document.getElementById('modal-content');
const btnCopyRemaining = document.getElementById('btn-copy-remaining');
const btnCloseModal  = document.getElementById('btn-close-modal');

// ─── Utilitários ──────────────────────────────────────────────────────────────

/**
 * Gera a URL do WhatsApp para um número e mensagem.
 * @param {string} number - número com DDI
 * @param {string} message - texto da mensagem
 * @returns {string} URL wa.me
 */
function buildWaLink(number, message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Parseia o textarea de números, removendo linhas vazias e espaços.
 * @param {string} raw - texto bruto
 * @returns {string[]} array de números
 */
function parseNumbers(raw) {
  return raw
    .split('\n')
    .map(n => n.replace(/\D/g, ''))   // remove tudo que não for dígito
    .filter(n => n.length > 0);
}

/**
 * Exibe um toast temporário na tela.
 * @param {string} msg - mensagem a exibir
 * @param {number} duration - tempo em ms (padrão 2000)
 */
function showToast(msg, duration = 2000) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/**
 * Copia texto para a área de transferência.
 * @param {string} text
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback para ambientes sem permissão de clipboard
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

// ─── Persistência ─────────────────────────────────────────────────────────────

/** Salva o estado atual no localStorage. */
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Carrega o estado salvo do localStorage. Retorna null se não houver nada. */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Remove o estado salvo. */
function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Renderização ─────────────────────────────────────────────────────────────

/** Renderiza toda a tela de disparo com base no estado atual. */
function renderDispatch() {
  const { numbers, used, current, message } = state;
  const total    = numbers.length;
  const usedCount = used.length;
  const remaining = total - usedCount;

  // Número e link atuais
  const num  = numbers[current] || '—';
  const link = (numbers[current] && message)
    ? buildWaLink(numbers[current], message)
    : '—';

  currentNumber.textContent = num;
  currentLink.textContent   = link;

  // Barra de progresso
  const pct = total > 0 ? (usedCount / total) * 100 : 0;
  progressBar.style.width = pct + '%';

  // Contador
  counterText.textContent = `${usedCount} de ${total} enviados`;
  listStats.textContent   = `${remaining} restante${remaining !== 1 ? 's' : ''}`;

  // Botões de navegação
  btnPrev.disabled = (current <= 0);
  btnNext.disabled = (current >= total - 1 && used.includes(current));

  // Lista de números
  renderList();
}

/** Renderiza os itens da lista lateral. */
function renderList() {
  const { numbers, used, current } = state;
  numbersList.innerHTML = '';

  numbers.forEach((num, i) => {
    const item = document.createElement('div');
    item.classList.add('number-item');

    const dot = document.createElement('span');
    dot.classList.add('status-dot');

    if (i === current) {
      item.classList.add('current');
      dot.classList.add('current');
    } else if (used.includes(i)) {
      item.classList.add('used');
      dot.classList.add('used');
    } else {
      dot.classList.add('pending');
    }

    item.textContent = num;
    item.appendChild(dot);

    // Clicar em um número da lista navega até ele
    item.addEventListener('click', () => {
      state.current = i;
      saveState();
      renderDispatch();
      scrollToCurrentItem();
    });

    numbersList.appendChild(item);
  });

  scrollToCurrentItem();
}

/** Scrolla a lista para deixar o item atual visível. */
function scrollToCurrentItem() {
  const items = numbersList.querySelectorAll('.number-item');
  const currentItem = items[state.current];
  if (currentItem) {
    currentItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ─── Navegação entre telas ────────────────────────────────────────────────────

/** Exibe a tela de configuração e esconde a de disparo. */
function showSetup() {
  setupScreen.classList.add('active');
  dispatchScreen.classList.remove('active');
}

/** Exibe a tela de disparo e esconde a de configuração. */
function showDispatch() {
  setupScreen.classList.remove('active');
  dispatchScreen.classList.add('active');
  renderDispatch();
}

// ─── Inicialização ────────────────────────────────────────────────────────────

/** Verifica se há sessão salva e exibe botão de restauração. */
function checkSavedSession() {
  const saved = loadState();
  if (saved && saved.numbers && saved.numbers.length > 0) {
    btnRestore.classList.remove('hidden');
  }
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

// Iniciar nova sessão
btnStart.addEventListener('click', () => {
  const rawNumbers = numbersInput.value.trim();
  const message    = messageInput.value.trim();

  if (!rawNumbers) {
    showToast('⚠ Cole pelo menos um número');
    return;
  }
  if (!message) {
    showToast('⚠ Digite a mensagem antes de iniciar');
    return;
  }

  const numbers = parseNumbers(rawNumbers);
  if (numbers.length === 0) {
    showToast('⚠ Nenhum número válido encontrado');
    return;
  }

  state = { numbers, used: [], current: 0, message };
  saveState();
  showDispatch();
});

// Restaurar sessão salva
btnRestore.addEventListener('click', () => {
  const saved = loadState();
  if (saved) {
    state = saved;
    showDispatch();
  }
});

// Voltar para configuração
btnBack.addEventListener('click', () => {
  showSetup();
  // Pre-preenche os campos com os valores da sessão atual
  if (state.numbers.length > 0) {
    numbersInput.value = state.numbers.join('\n');
    messageInput.value = state.message;
  }
});

// Resetar lista (confirma antes)
btnReset.addEventListener('click', () => {
  if (confirm('Resetar toda a lista? O progresso atual será perdido.')) {
    clearState();
    state = { numbers: [], used: [], current: 0, message: '' };
    showSetup();
    numbersInput.value = '';
    messageInput.value = '';
    btnRestore.classList.add('hidden');
  }
});

// Abrir link atual no WhatsApp
btnOpen.addEventListener('click', () => {
  const { numbers, current, message } = state;
  if (!numbers[current]) return;
  const link = buildWaLink(numbers[current], message);
  window.open(link, '_blank');
});

// Copiar link atual
btnCopyLink.addEventListener('click', async () => {
  const { numbers, current, message } = state;
  if (!numbers[current]) return;
  const link = buildWaLink(numbers[current], message);
  await copyToClipboard(link);
  showToast('✓ Link copiado!');
});

// Próximo número (marca atual como usado)
btnNext.addEventListener('click', () => {
  const { numbers, used, current } = state;

  // Marca o atual como usado (se ainda não estiver)
  if (!used.includes(current)) {
    state.used = [...used, current];
  }

  // Avança para o próximo não usado, se existir
  if (current < numbers.length - 1) {
    state.current = current + 1;
  } else {
    showToast('🎉 Todos os números foram percorridos!', 3000);
  }

  saveState();
  renderDispatch();
});

// Número anterior
btnPrev.addEventListener('click', () => {
  if (state.current > 0) {
    state.current -= 1;
    saveState();
    renderDispatch();
  }
});

// Exportar números restantes
btnExport.addEventListener('click', () => {
  const { numbers, used } = state;
  const remaining = numbers.filter((_, i) => !used.includes(i));

  if (remaining.length === 0) {
    showToast('Não há números restantes!');
    return;
  }

  modalContent.value = remaining.join('\n');
  modal.classList.remove('hidden');
});

// Copiar números restantes do modal
btnCopyRemaining.addEventListener('click', async () => {
  await copyToClipboard(modalContent.value);
  showToast('✓ Números copiados!');
});

// Fechar modal
btnCloseModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Fechar modal clicando fora
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
checkSavedSession();
