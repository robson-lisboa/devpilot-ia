require('dotenv').config();
const Groq = require('groq-sdk');
const logger = require('../utils/logger');
const getDb = require('../config/database');
// 📄 Importa o utilitário de leitura de PDF diretamente da pasta src/
const { extractTextFromPDF } = require('../pdfReader');

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

// Instruções de Sistema personalizadas no estilo DevPilot
const PERSONA_PROMPTS = {
  general: `Você é o DevPilot IA, um colaborador e parceiro de tecnologia autêntico, empático, direto e com um toque de inteligência prática.
Sua missão é ajudar o usuário de forma clara, pragmática e sem enrolação, usando uma linguagem leve e humana.
Diretrizes de comportamento:
1. Seja um parceiro presente: valide as ideias do usuário e seja encorajador.
2. Evite ser robótico, professoral ou prolixo. Vá direto ao ponto prático.
3. Use formatação limpa (Markdown, código destacado).
4. Sempre termine sua resposta com UMA pergunta relevante e prática para guiar o aprendizado ou o projeto do usuário.`,

  python: `Você é o DevPilot em modo Especialista Python & Dados.
Você conversa como um colega de time apaixonado por automações, tratamento de dados e código limpo (PEP 8).
Ensine sempre de forma prática, passo a passo e sem teorias cansativas.
Sempre termine perguntando sobre o cenário real do usuário (ex: se ele quer tratar arquivos CSV, conectar em banco de dados ou criar automações) para ajudá-lo na prática.`,

  devops: `Você é o DevPilot em modo Especialista DevOps.
Sua pegada é prática, focada em solução de problemas reais: CI/CD, Docker, Linux, automação de ambientes e infraestrutura como código.
Fale de dev para dev, sem rodeios.
Sempre encerre com uma pergunta prática de implementação (ex: "Você já tem o Docker instalado aí?", "Quer montar o arquivo da pipeline juntos?").`,

  reviewer: `Você é o DevPilot em modo Revisor de Código & Mentoria.
Analise trechos de código com empatia: reconheça o que está bom, explique os pontos de melhoria e entregue o código refatorado e limpo.
Sempre finalize perguntando se o usuário gostaria de adicionar testes, tratar exceções ou se tem alguma dúvida na lógica apresentada.`,

  // 🚀 PERSONA SAP EXCLUSIVA (PP/MM)
  sap: `Você é o DevPilot em modo Especialista SAP (PP/MM).
Você é um especialista prático e didático no ecossistema SAP focado em Gestão de Materiais (MM) e Planejamento e Controle da Produção (PP).
Sua missão é explicar processos de forma clara, em passo a passo direto e sem enrolação teórica.

Conhecimentos chave:
• SAP MM: Mestre de materiais (MM01, MM02, MM03), pedidos e requisições de compra (ME21N/ME23N/ME51N), gestão de estoques e movimentações (MIGO - Movimentos 101, 261, 311, MB51, MB1A, MB1B) e consulta de estoques (MMBE, MB52).
• SAP PP: Ordens de produção (CO01, CO02, COOIS), planejamento de necessidades (MD04, MD01), apontamentos de produção (CO11N, CO15), listas de materiais / BOM (CS01, CS03) e roteiros de produção (CA01, CA03).

Sempre termine sua resposta com UMA pergunta prática e focada no cenário real do usuário (ex: "Você quer rodar esse processo via transação padrão ou precisa criar/ajustar um relatório de acompanhamento?").`,

  sap_expert: `Você é o DevPilot em modo Especialista SAP (PP/MM).
Você é um especialista prático e didático no ecossistema SAP focado em Gestão de Materiais (MM) e Planejamento e Controle da Produção (PP).
Sua missão é explicar processos de forma clara, em passo a passo direto e sem enrolação teórica.

Conhecimentos chave:
• SAP MM: Mestre de materiais (MM01, MM02, MM03), pedidos e requisições de compra (ME21N/ME23N/ME51N), gestão de estoques e movimentações (MIGO - Movimentos 101, 261, 311, MB51, MB1A, MB1B) e consulta de estoques (MMBE, MB52).
• SAP PP: Ordens de produção (CO01, CO02, COOIS), planejamento de necessidades (MD04, MD01), apontamentos de produção (CO11N, CO15), listas de materiais / BOM (CS01, CS03) e roteiros de produção (CA01, CA03).

Sempre termine sua resposta com UMA pergunta prática e focada no cenário real do usuário (ex: "Você quer rodar esse processo via transação padrão ou precisa criar/ajustar um relatório de acompanhamento?").`
};

const generateResponse = async (req, res) => {
  try {
    // 🛡️ Captura o guestId enviado pelo cabeçalho
    const guestId = req.headers['x-guest-id'];
    if (!guestId) {
      return res.status(400).json({ success: false, error: 'X-Guest-ID não fornecido.' });
    }

    // 💡 Extrai os campos e obtém o caminho do PDF enviado pelo Multer (req.file)
    let messages = req.body.messages;
    if (typeof messages === 'string') {
      try {
        messages = JSON.parse(messages);
      } catch (e) {
        messages = [];
      }
    }

    const { prompt, persona = 'general', sessionId = 'default', model = 'llama-3.3-70b-versatile' } = req.body;
    const pdfPath = req.file ? req.file.path : req.body.pdfPath;

    if (!req.body || (Object.keys(req.body).length === 0 && !req.file)) {
      logger.warn('Tentativa de requisição com corpo vazio.');
      return res.status(400).json({ 
        success: false,
        error: 'O corpo da requisição não pode estar vazio.' 
      });
    }

    // 📄 Processa o arquivo PDF se o caminho for informado via Multer
    let pdfContext = "";
    if (pdfPath) {
      try {
        const pdfText = await extractTextFromPDF(pdfPath);
        pdfContext = `\n\n[DOCUMENTO PDF ANEXADO PELO USUÁRIO]:\n"""\n${pdfText.slice(0, 4000)}\n"""\n`;
        logger.info(`Texto extraído do PDF com sucesso para a sessão ${sessionId} (Guest: ${guestId}).`);
      } catch (pdfError) {
        logger.error(`Erro ao ler PDF fornecido (${pdfPath}): ${pdfError.message}`);
      }
    }

    let conversationHistory = [];
    const systemPromptText = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.general;
    const systemInstruction = {
      role: 'system',
      content: systemPromptText
    };

    if (messages && Array.isArray(messages)) {
      const formattedMessages = [...messages];
      if (pdfContext && formattedMessages.length > 0) {
        const lastIdx = formattedMessages.length - 1;
        if (formattedMessages[lastIdx].role === 'user') {
          formattedMessages[lastIdx] = {
            ...formattedMessages[lastIdx],
            content: `${pdfContext}${formattedMessages[lastIdx].content}`
          };
        }
      }

      conversationHistory = [systemInstruction, ...formattedMessages];
    } else if (prompt && typeof prompt === 'string') {
      if (prompt.trim().length === 0) {
        logger.warn('Prompt enviado contendo apenas espaços.');
        return res.status(400).json({ 
          success: false,
          error: 'O campo "prompt" não pode conter apenas espaços em branco.' 
        });
      }
      
      const finalPrompt = `${pdfContext}${prompt.trim()}`;

      conversationHistory = [
        systemInstruction,
        { role: 'user', content: finalPrompt }
      ];
    } else {
      logger.warn('Requisição enviada sem os campos obrigatórios.');
      return res.status(400).json({ 
        success: false,
        error: 'É necessário enviar um "prompt" (string) ou um array de "messages".' 
      });
    }

    logger.info(`Iniciando streaming [Guest: ${guestId}] [Modelo: ${model}] [Persona: ${persona}] [Sessão: ${sessionId}]...`);

    // Configura os cabeçalhos para resposta em fluxo contínuo (Streaming)
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Chamada à API Groq utilizando o modelo dinâmico
    const stream = await groq.chat.completions.create({
      messages: conversationHistory,
      model: model,
      temperature: 0.7,
      stream: true,
    });

    let fullAiResponse = '';

    // Transmite cada bloco de texto recebido diretamente para a resposta HTTP
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullAiResponse += content;
        res.write(content);
      }
    }

    // Finaliza o envio do fluxo de dados HTTP
    res.end();

    // --- SALVAR NO SQLITE VINCULADO AO GUEST_ID AO FINAL DA TRANSMISSÃO ---
    const db = await getDb();
    const lastUserMessage = conversationHistory.filter(m => m.role === 'user').pop();

    if (lastUserMessage) {
      await db.run(
        'INSERT INTO messages (session_id, guest_id, role, content) VALUES (?, ?, ?, ?)',
        [sessionId, guestId, 'user', lastUserMessage.content]
      );
      await db.run(
        'INSERT INTO messages (session_id, guest_id, role, content) VALUES (?, ?, ?, ?)',
        [sessionId, guestId, 'assistant', fullAiResponse]
      );
    }

    logger.info(`Streaming concluído com sucesso e histórico salvo no SQLite para o Guest: ${guestId}.`);

  } catch (error) {
    logger.error(`Erro no streaming (aiController): ${error.message}`);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Falha interna ao processar a requisição com a IA.',
        details: error.message
      });
    }
    res.end();
  }
};

const getHistory = async (req, res) => {
  try {
    const guestId = req.headers['x-guest-id'];
    if (!guestId) {
      return res.status(400).json({ success: false, error: 'X-Guest-ID não fornecido.' });
    }

    const { sessionId = 'default' } = req.params;
    const db = await getDb();
    const history = await db.all(
      'SELECT role, content FROM messages WHERE session_id = ? AND guest_id = ? ORDER BY id ASC',
      [sessionId, guestId]
    );
    return res.json({ success: true, history });
  } catch (error) {
    logger.error(`Erro ao carregar histórico: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const clearHistory = async (req, res) => {
  try {
    const guestId = req.headers['x-guest-id'];
    if (!guestId) {
      return res.status(400).json({ success: false, error: 'X-Guest-ID não fornecido.' });
    }

    const { sessionId = 'default' } = req.params;
    const db = await getDb();
    
    await db.run('DELETE FROM messages WHERE session_id = ? AND guest_id = ?', [sessionId, guestId]);
    
    logger.info(`Histórico da sessão ${sessionId} do Guest ${guestId} removido do banco SQLite com sucesso.`);
    return res.json({ success: true, message: 'Histórico apagado com sucesso!' });
  } catch (error) {
    logger.error(`Erro ao apagar histórico: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { generateResponse, getHistory, clearHistory };