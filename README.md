# 🤖 DevPilot IA

> Assistente inteligente e interativo focado em desenvolvimento de software, automação Python, rotinas DevOps e ecossistema SAP (PP/MM).

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.style?flat)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.style?flat)
![Groq](https://img.shields.io/badge/API-Groq_Cloud-orange.style?flat)
![License](https://img.shields.io/badge/License-MIT-brightgreen.style?flat)

---

## 📌 Sobre o Projeto

O **DevPilot IA** é uma plataforma de chat interativa desenvolvida para auxiliar desenvolvedores e profissionais de tecnologia no dia a dia. A aplicação conta com suporte a **múltiplos modelos de LLM via Groq API**, gerenciamento de sessões com banco **SQLite**, streaming de respostas em tempo real, suporte a anexo de múltiplos arquivos de código e controle total por atalhos de teclado.

---

## 🚀 Funcionalidades Chave

* ⚡ **Streaming de Resposta:** Respostas geradas via SSE (Server-Sent Events) sem travamento de tela.
* 🧠 **Seletor de Modelos em Tempo Real:** Alternância dinâmica entre **Llama 3.3 70B**, **DeepSeek R1** e **Mixtral 8x7b**.
* 🎭 **Personas Especializadas:**
  * 🌐 **DevPilot Geral:** Assistente focado em tecnologia e boas práticas.
  * 🐍 **Python & Dados:** Automação, análise de dados e PEP 8.
  * 🛠️ **DevOps:** CI/CD, Docker, Linux e Infraestrutura como Código.
  * 🔍 **Revisor de Código:** Mentoria, refatoração e limpeza de código.
  * 📦 **SAP Specialist (PP/MM):** Processos, movimentações (MIGO), ordens de produção e transações.
* 📁 **Anexo de Múltiplos Arquivos:** Leitura e análise conjunta de código e arquivos de configuração.
* 🎙️ **Reconhecimento de Voz:** Ditado nativo em português (Web Speech API).
* 💾 **Persistência de Dados:** Salva e recupera o histórico das conversas via SQLite.
* ⌨️ **Atalhos de Teclado:**
  * `Ctrl + Enter`: Envia a mensagem.
  * `Ctrl + Shift + O`: Abre uma nova sessão de chat.
  * `Esc`: Cancela gravação de voz ou limpa arquivos anexados.

---

## 🛠️ Tecnologias Utilizadas

* **Backend:** Node.js, Express, SQLite3, Groq SDK, Winston Logger.
* **Frontend:** HTML5, CSS3, JavaScript (ES6+), Marked.js (Markdown), Highlight.js (Sintaxe de código).
* **DevOps & CI/CD:** Docker, Docker Compose, GitHub Actions.

---

## 🐳 Como Rodar com Docker

### Pré-requisitos
* **Docker** e **Docker Compose** instalados.
* Chave de API da Groq (`GROQ_API_KEY`).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/devpilot-ia.git](https://github.com/seu-usuario/devpilot-ia.git)
   cd devpilot-ia
