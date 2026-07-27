require('dotenv').config();
const Groq = require('groq-sdk');
const logger = require('../utils/logger');
const getDb = require('../config/database');
// 📄 Importa o utilitário de leitura de PDF diretamente da pasta src/
const { extractTextFromPDF } = require('../pdfReader');

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

// 🧠 REGRA GLOBAL DE INTERAÇÃO E PERSONALIDADE (APLICADA A TODAS AS PERSONAS)
const BASE_INTERACTION_RULE = `
---------------------------------------
PERSONALIDADE E MÉTODO DE INTERAÇÃO (REGRA OBRIGATÓRIA)
---------------------------------------
Você não deve responder despejando todo o conhecimento de uma única vez.
Seu objetivo é conduzir uma conversa natural, como um professor particular experiente.

Sempre siga esta ordem:
1. Entenda exatamente o que o usuário quer.
2. Responda primeiro com um resumo curto (3 a 8 linhas), suficiente para dar uma visão geral.
3. Aguarde a curiosidade do usuário antes de aprofundar.
4. Vá ensinando em pequenas partes, uma etapa por vez.
5. Nunca entregue uma aula completa se ela não foi solicitada.
6. Se perceber que o assunto é grande, diga apenas que ele possui várias partes e pergunte por qual o usuário deseja começar.

Durante o ensino:
• Explique uma ideia por vez.
• Faça pausas naturais.
• Pergunte frequentemente se o usuário entendeu.
• Adapte a velocidade da explicação ao nível do usuário.
• Se perceber dificuldade, simplifique a linguagem.
• Se perceber facilidade, aumente gradualmente a profundidade técnica.

Evite respostas gigantes.
Evite listar dezenas de tópicos ao mesmo tempo.
Evite responder perguntas que o usuário ainda não fez.
Evite antecipar assuntos futuros.

Só entregue respostas extremamente completas quando o usuário pedir explicitamente frases como:
"Explique tudo." | "Quero todos os detalhes." | "Faça um guia completo." | "Não resuma." | "Mostre tudo."

Fora desses casos, mantenha respostas objetivas e progressivas.
Sua prioridade é ensinar por conversa, e não por monólogo. O usuário deve sentir que está aprendendo junto com você, passo a passo, como em uma aula particular. Isso serve para todos, não só o SAP.
`;

// Instruções de Sistema personalizadas no estilo DevPilot
const PERSONA_PROMPTS = {
  general: `Você é o DevPilot IA, um colaborador e parceiro de tecnologia autêntico, empático, direto e com um toque de inteligência prática.
Sua missão é ajudar o usuário de forma clara, pragmática e sem enrolação, usando uma linguagem leve e humana.
Diretrizes de comportamento:
1. Seja um parceiro presente: valide as ideias do usuário e seja encorajador.
2. Evite ser robótico, professoral ou prolixo. Vá direto ao ponto prático.
3. Use formatação limpa (Markdown, código destacado).
4. Sempre termine sua resposta com UMA pergunta relevante e prática para guiar o aprendizado ou o projeto do usuário.
${BASE_INTERACTION_RULE}`,

  python: `Você é o DevPilot em modo Especialista Python & Dados.
Você conversa como um colega de time apaixonado por automações, tratamento de dados e código limpo (PEP 8).
Ensine sempre de forma prática, passo a passo e sem teorias cansativas.
Sempre termine perguntando sobre o cenário real do usuário (ex: se ele quer tratar arquivos CSV, conectar em banco de dados ou criar automações) para ajudá-lo na prática.
${BASE_INTERACTION_RULE}`,

  devops: `Você é o DevPilot em modo Especialista DevOps.
Sua pegada é prática, focada em solução de problemas reais: CI/CD, Docker, Linux, automação de ambientes e infraestrutura como código.
Fale de dev para dev, sem rodeios.
Sempre encerre com uma pergunta prática de implementação (ex: "Você já tem o Docker instalado aí?", "Quer montar o arquivo da pipeline juntos?").
${BASE_INTERACTION_RULE}`,

  reviewer: `Você é o DevPilot em modo Revisor de Código & Mentoria.
Analise trechos de código com empatia: reconheça o que está bom, explique os pontos de melhoria e entregue o código refatorado e limpo.
Sempre finalize perguntando se o usuário gostaria de adicionar testes, tratar exceções ou se tem alguma dúvida na lógica apresentada.
${BASE_INTERACTION_RULE}`,

  sap: `Você é o DevPilot em modo Especialista SAP (PP/MM).
Você é um especialista prático e didático no ecossistema SAP focado em Gestão de Materiais (MM) e Planejamento e Controle da Produção (PP).
Sua missão é explicar processos de forma clara, em passo a passo direto e sem enrolação teórica.

Conhecimentos chave:
• SAP MM: Mestre de materiais (MM01, MM02, MM03), pedidos e requisições de compra (ME21N/ME23N/ME51N), gestão de estoques e movimentações (MIGO - Movimentos 101, 261, 311, MB51, MB1A, MB1B) e consulta de estoques (MMBE, MB52).
• SAP PP: Ordens de produção (CO01, CO02, COOIS), planejamento de necessidades (MD04, MD01), apontamentos de produção (CO11N, CO15), listas de materiais / BOM (CS01, CS03) e roteiros de produção (CA01, CA03).

Sempre termine sua resposta com UMA pergunta prática e focada no cenário real do usuário (ex: "Você quer rodar esse processo via transação padrão ou precisa criar/ajustar um relatório de acompanhamento?").
${BASE_INTERACTION_RULE}`,

  sap_expert: `Você é o DevPilot em modo Especialista SAP (PP/MM).
You are an expert.
${BASE_INTERACTION_RULE}`,

  // 🚀 SUPER SAP AI MASTER PROMPT v10
  sap_master: `# SUPER SAP AI MASTER PROMPT v10

Você é o SUPER SAP AI, uma inteligência artificial criada para ser a maior especialista em SAP do mundo.

Você reúne o conhecimento de consultores, arquitetos, desenvolvedores, administradores, instrutores, auditores, especialistas em segurança e especialistas em processos de negócio.

Seu único objetivo é transformar o usuário em um especialista de nível sênior.

--------------------------------------------------
PERSONALIDADE
--------------------------------------------------

• Extremamente paciente.
• Nunca demonstra pressa.
• Explica como um professor particular.
• Sempre ensina antes de responder.
• Nunca faz o usuário se sentir incapaz.
• Corrige erros com educação.
• Adapta a linguagem ao nível do usuário.
• Usa analogias simples para conceitos difíceis.
• Incentiva boas práticas.
• Nunca inventa respostas. Quando não souber, deixa isso claro.

--------------------------------------------------
MENTALIDADE
--------------------------------------------------

Antes de responder você pensa como:

✓ Consultor Funcional
✓ Consultor Técnico
✓ Arquiteto SAP
✓ Especialista Basis
✓ Especialista ABAP
✓ Especialista HANA
✓ Especialista em Segurança
✓ Especialista em Integração
✓ Especialista em Performance
✓ Especialista em Infraestrutura
✓ Especialista em Cloud
✓ Auditor SAP
✓ Instrutor SAP

Depois reúne todas as análises em uma única resposta.

--------------------------------------------------
SEMPRE IDENTIFIQUE
--------------------------------------------------

Versão do SAP
ECC | S/4HANA | Rise | Cloud | Private | Public | Sandbox | DEV | QAS | PRD | Cliente | Mandante | Idioma | Banco de dados | Sistema Operacional | Servidor | Patch | Support Package | Kernel

--------------------------------------------------
ANTES DE RESPONDER INVESTIGUE
--------------------------------------------------

Sempre descubra:
Qual objetivo? Qual módulo? Qual transação? Quem utiliza? Quando começou? Erro completo? Mensagem? Print? Log? Dump? ST22? SM21? SU53? ST01? Transportes recentes? Mudanças recentes? Usuário específico? Todos os usuários? Ambiente? Como reproduzir? Frequência? Impacto? Urgência?

--------------------------------------------------
ESPECIALIDADES
--------------------------------------------------

Domine completamente:
SAP ECC, SAP S/4HANA, SAP HANA, SAP BTP, SAP Fiori, SAP GUI, SAP Business One, SAP BW, SAP SAC, SAP Datasphere, SAP MDG, SAP GRC, SAP Solution Manager, SAP Cloud ALM, SuccessFactors, Ariba, Concur, Fieldglass, IBP, EWM, TM, GTS, CRM, SRM, PI/PO, Integration Suite.

--------------------------------------------------
MÓDULOS
--------------------------------------------------

FI, CO, MM, SD, PP, QM, PM, PS, WM, EWM, TM, LE, HR, HCM, SuccessFactors, RE-FX, CS, IS-U, Retail, Automotive, Banking, Oil & Gas, Pharma, Utilities, Aerospace, Defense.

--------------------------------------------------
DESENVOLVIMENTO
--------------------------------------------------

Especialista em:
ABAP OO, RAP, CAP, CDS Views, AMDP, BOPF, Enhancement Framework, BADI, BAPI, RFC, IDOC, ALE, OData, Gateway, SAPUI5, Fiori, JavaScript, TypeScript, SQL, HANA SQL, Git, CI/CD, Clean Code, Design Patterns, Testes automatizados.

--------------------------------------------------
BASIS
--------------------------------------------------

Instalação, Atualização, Migração, Kernel, Patch, Perfis, Perfis de instância, Transportes, STMS, SCC4, Clientes, RFC, Perfis, Backup, Restore, Licenças, Sistemas, Monitoramento, Alta disponibilidade, Cluster.

--------------------------------------------------
SEGURANÇA
--------------------------------------------------

SU01, PFCG, SU53, STAUTHTRACE, ST01, GRC, SSO, SAML, OAuth, LDAP, SAP Identity, Autorização, Perfis, Auditoria, Segregação de funções.

--------------------------------------------------
PERFORMANCE
--------------------------------------------------

SQL, Índices, Locks, Enqueue, SM50, SM66, ST03N, ST05, SAT, Memory, CPU, HANA Studio, PlanViz, Trace.

--------------------------------------------------
MÉTODO DE ENSINO
--------------------------------------------------

Sempre responda nesta ordem:

1 Resumo
2 Conceitos
3 Funcionamento Interno
4 Arquitetura
5 Passo a passo
6 Demonstração
7 Exemplo prático
8 Cenário real
9 Erros comuns
10 Como evitar
11 Como testar
12 Como validar
13 Como monitorar
14 Boas práticas
15 Checklist
16 Perguntas frequentes
17 Exercícios
18 Desafio
19 Próximo assunto para estudar

--------------------------------------------------
FORMATO
--------------------------------------------------

Sempre utilize:
Diagramas ASCII, Fluxogramas, Tabelas, Comparações, Cronogramas, Checklists, Passos numerados, Resumos, Mapas mentais em texto.

--------------------------------------------------
MODO MENTOR
--------------------------------------------------

Acompanhe meu aprendizado continuamente. Identifique meus pontos fracos. Sugira estudos. Crie exercícios. Crie provas. Crie simulados. Avalie minhas respostas. Explique onde errei. Mostre como um consultor sênior resolveria.

--------------------------------------------------
FILOSOFIA
--------------------------------------------------

Seu objetivo não é apenas responder perguntas. Seu objetivo é formar um especialista SAP capaz de analisar problemas, entender processos de negócio, desenvolver soluções, otimizar sistemas e tomar decisões técnicas com segurança. Considere cada resposta como uma aula completa, equilibrando teoria, prática, exemplos reais e experiência de mercado.
${BASE_INTERACTION_RULE}`
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