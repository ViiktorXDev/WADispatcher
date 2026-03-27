# WA Dispatcher

> Ferramenta web para envio sequencial de mensagens no WhatsApp via links `wa.me`, com controle de progresso, persistência local e navegação entre contatos.

![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Zero dependencies](https://img.shields.io/badge/dependências-zero-25d366?style=flat)
![License](https://img.shields.io/badge/licença-MIT-lightgrey?style=flat)

---

## O que é

WA Dispatcher é uma ferramenta web simples que resolve um problema comum: enviar mensagens personalizadas via WhatsApp para uma lista grande de contatos, sem perder o controle de quem já foi contactado.

Sem bots, sem APIs pagas, sem extensões. Funciona 100% no navegador usando os links oficiais `wa.me`.

---

## Funcionalidades

- **Entrada em lote** — cole centenas de números de uma vez (um por linha, com DDI)
- **Geração dinâmica de links** — URL `wa.me` com mensagem codificada automaticamente
- **Navegação sequencial** — avance número a número, marcando cada um como enviado
- **Controle visual de progresso** — barra de progresso + lista com status de cada contato
- **Persistência com `localStorage`** — recarregue a página sem perder o progresso
- **Exportar restantes** — copie com um clique todos os números ainda não enviados
- **Copiar link** — copie o link gerado para usar em outro contexto
- **Resetar lista** — recomece do zero quando precisar
- **Responsivo** — funciona em desktop e celular

---

## Como usar

### 1. Clone ou baixe os arquivos

```bash
git clone https://github.com/seu-usuario/wa-dispatcher.git
cd wa-dispatcher
```

Ou baixe o ZIP e extraia.

### 2. Abra no navegador

Não há servidor, build ou instalação. Basta abrir:

```
index.html
```

Direto no navegador. Funciona offline.

### 3. Configure o disparo

1. Cole os números no campo **Números de telefone** — um por linha, com DDI:
   ```
   558487259292
   5513997021924
   558598061309
   ```
2. Digite a **mensagem** que será enviada
3. Clique em **Iniciar disparo**

### 4. Envie

- Clique em **Abrir no WhatsApp** para abrir o link do contato atual
- Clique em **Marcar enviado + Próximo** para avançar
- Use **← Anterior** para voltar se precisar
- O progresso é salvo automaticamente — pode fechar e retomar depois

---

## Estrutura do projeto

```
wa-dispatcher/
├── index.html   # Estrutura e marcação HTML
├── style.css    # Estilos e responsividade
└── script.js    # Lógica da aplicação
```

Zero dependências externas. Sem frameworks, sem `npm install`.

---

## Formato dos números

Os números devem incluir o código do país (DDI), sem espaços, traços ou parênteses:

| Formato         | Válido? |
|-----------------|---------|
| `558487259292`  | ✅      |
| `+55 84 87259292` | ❌ (remova `+`, espaços e traços) |
| `84 98765-4321` | ❌ (sem DDI) |

O app remove automaticamente caracteres não-numéricos, mas o DDI deve estar presente.

---

## Tecnologias

- HTML5
- CSS3 (variáveis CSS, flexbox, responsivo)
- JavaScript puro (ES6+)
- `localStorage` para persistência
- API `navigator.clipboard` para cópia (com fallback)

---

## Licença

MIT — use, modifique e distribua à vontade.
