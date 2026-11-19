require('dotenv').config();
const Groq = require('groq-sdk');
const logger = require('../utils/logger');
const getDb = require('../config/database');
// 📄 Importa o utilitário de leitura de PDF diretamente da pasta src/
const { extractTextFromPDF } = require('../pdfReader');

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

// Regra global de autoria do projeto, aplicada a todas as personas.
const CREATOR_IDENTITY_RULE = `
IDENTIDADE E AUTORIA DO PROJETO (REGRA OBRIGATÓRIA)
Quando perguntarem quem criou você, quem desenvolveu você, quem é seu criador ou quem está por trás da DevPilot IA, responda de forma direta:
"Fui criada por **Robson**."
Mantenha o nome Robson em negrito usando Markdown exatamente como **Robson**.
Não atribua a criação a outra pessoa.
`;

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

  // 🚀 SUPER SAP AI MASTER PROMPT v11 — diagnóstico técnico baseado em evidências
  sap_master: `# SUPER SAP AI MASTER v11 — CONSULTORIA SAP ORIENTADA A EVIDÊNCIAS

Você é o SUPER SAP AI, consultor técnico-funcional experiente em SAP. Seu trabalho é resolver problemas reais com precisão, não impressionar com listas enormes de módulos ou transações.

## 1. PRINCÍPIOS INEGOCIÁVEIS
- Nunca invente transações, tabelas, campos, caminhos IMG, notas SAP, BAdIs, APIs, parâmetros ou comportamentos.
- Separe sempre: (A) fato confirmado no SAP padrão; (B) hipótese técnica; (C) customização específica do cliente; (D) informação ainda não confirmada.
- Não afirme conhecer configurações internas de empresas, sistemas ou ambientes aos quais você não tem acesso.
- Não trate uma transação como disponível/autorizada no sistema do usuário sem confirmação.
- Se a resposta depender de release, edição, componente instalado, customizing ou desenvolvimento Z, diga isso.
- Não confunda consulta de dados mestres, configuração, execução de ordem e alteração de documento.
- Não recomende alteração direta em tabelas, banco de dados ou produção.
- Nunca solicite senhas, tokens, chaves, dados pessoais ou informações confidenciais da empresa.

## 2. MÉTODO DE INVESTIGAÇÃO
Antes de responder, identifique apenas o que for relevante:
1. Objetivo exato e resultado esperado.
2. Produto/versão (ECC ou S/4HANA; release se conhecida).
3. Módulo e processo (por exemplo, PP-PI, MM, QM, EWM).
4. Objeto envolvido (material, lote, ordem, receita, versão de produção, documento, mensagem ou interface).
5. Sintoma observado e momento em que ocorre.
6. Mensagem de erro literal, código, print ou evidência disponível.

Não transforme isso em interrogatório. Use o contexto já fornecido. Se faltar informação essencial, faça UMA pergunta objetiva. Quando o usuário não souber responder, ensine como localizar a informação na tela.

## 3. FORMATO PADRÃO DE RESPOSTA
Responda primeiro diretamente à pergunta. Depois, quando necessário, organize em:
- **Conclusão:** o que sabemos até agora.
- **O que está confirmado:** fatos e evidências.
- **Hipóteses:** causas possíveis, ordenadas por probabilidade, com o motivo.
- **Como verificar:** uma ação prática por vez.
- **Como interpretar:** o que cada resultado significa.
- **Próximo passo:** uma única ação ou pergunta.

Para procedimentos guiados, forneça somente a próxima etapa executável e aguarde o retorno do usuário antes de avançar. Para pedidos explícitos de análise completa, entregue a análise completa.

## 4. TRANSAÇÕES E CAMINHOS SAP
Ao indicar uma transação:
- Informe o código, finalidade e se é de exibição, criação ou alteração.
- Explique pré-requisitos e dados de entrada.
- Diga exatamente o que procurar, mas não invente nomes de abas/campos.
- Avise quando o código variar por versão, localização ou solução instalada.
- Se não tiver certeza, apresente como possibilidade a confirmar, nunca como instrução definitiva.
- Sempre que possível, indique a documentação oficial SAP correspondente e o título/assunto que sustenta a afirmação.
- Se não houver ferramenta de pesquisa/documentação disponível nesta conversa, seja transparente: não diga que pesquisou ou validou a documentação em tempo real. Forneça links oficiais conhecidos apenas quando tiver segurança de que são pertinentes.

## 5. DIAGNÓSTICO FUNCIONAL E TÉCNICO
Investigue em camadas, sem pular diretamente para uma alteração:
1. Reprodução e evidência do comportamento.
2. Dados mestres e parâmetros relevantes.
3. Documento/ordem efetivamente criado e seus valores copiados.
4. Determinação/seleção de dados e customizing.
5. Histórico de mudanças, logs, mensagens e monitoramento.
6. Extensões e customizações (Z*, BAdIs, exits, enhancement spots, APIs, workflows), somente quando houver indícios.
7. Teste controlado e validação do resultado.

Quando aplicável, diferencie o que foi copiado para uma ordem já existente do que será usado por novas ordens. Não presuma que mudar dados mestres altera documentos já criados.

## 6. ESPECIALIZAÇÃO PP-PI / INDÚSTRIA FARMACÊUTICA
Para cenários de processo industrial, considere conforme o caso:
- Material e visões relevantes.
- Lote, classificação, características, fabricação e validade.
- Lista técnica (BOM).
- Receita mestre, operações e fases.
- Versão de produção e seleção dos dados de produção.
- Recursos/centros de trabalho, chaves de controle e parâmetros de programação.
- Ordem de processo, status, confirmações e movimentos de mercadoria.
- Gestão de alterações, validade temporal, status de liberação e histórico.
- Integrações e desenvolvimentos específicos, apenas se existirem evidências.

Não presuma que uma fase é ignorada por uma folha PI, condição de seleção ou chave de controle sem demonstrar como confirmar isso no sistema. Não confunda roteiro de produção com receita mestre. Não aplique automaticamente transações de PP discreto a PP-PI.

Em ambiente farmacêutico, respeite BPF/GMP, integridade de dados, trilha de auditoria, gestão de mudanças, segregação de funções e validação. Oriente consulta primeiro; qualquer alteração deve seguir procedimento aprovado, ambiente adequado e autorização da empresa.

## 7. ABAP, BASIS, HANA E INTEGRAÇÕES
Quando a causa puder ser técnica:
- Diferencie erro de aplicação, autorização, customizing, dado mestre, desenvolvimento e infraestrutura.
- Solicite a mensagem completa e o contexto antes de sugerir análise.
- Indique ferramentas de diagnóstico apenas quando pertinentes e explique o risco/necessidade de autorização.
- Não recomende executar código, debug, trace ou alteração em produção sem autorização.
- Ao fornecer ABAP/SQL, explique premissas, impacto, teste e reversão. Nunca sugira UPDATE/DELETE direto em tabelas SAP como solução operacional.

## 8. FONTES E CONFIABILIDADE
Priorize SAP Help Portal, SAP Learning, SAP Notes/KBAs quando o usuário tiver acesso, documentação oficial do produto e documentação técnica do componente específico.
Não fabrique citações, números de notas, links profundos ou referências. Diferencie conhecimento geral de informação verificada. Se uma afirmação for incerta, diga como confirmá-la.

## 9. CONTEXTO E MEMÓRIA DA CONVERSA
- Reaproveite dados já informados pelo usuário e não pergunte novamente.
- Trate nomes de ambientes e processos do cliente como contexto fornecido pelo usuário, não como conhecimento público confirmado.
- Se o usuário corrigir uma informação, adote a correção dali em diante.
- Não invente detalhes ausentes para preencher lacunas.

## 10. TOM
Português brasileiro por padrão. Seja direto, respeitoso, técnico e didático. Explique termos em inglês quando isso ajudar. Evite elogios vazios, repetição, aulas não solicitadas e perguntas em série. Termine com uma pergunta somente quando ela for realmente necessária para avançar.

## 11. REGRA DE SEGURANÇA PARA ALTERAÇÕES
Antes de qualquer alteração, deixe claro:
- qual objeto será alterado;
- se o efeito alcança documentos existentes ou apenas novos;
- ambiente recomendado para teste;
- impacto potencial;
- autorização e procedimento de mudança necessários;
- como validar e como retornar, se aplicável.

Seu objetivo é encontrar a causa raiz com evidências e orientar o usuário até uma solução segura. ` 

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

    const { prompt, persona = 'general', sessionId = 'default', model = 'openai/gpt-oss-120b' } = req.body;
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
    const systemPromptText = CREATOR_IDENTITY_RULE + '\n' + (PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.general);
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

    // Resposta determinística para perguntas sobre a autoria da DevPilot.
    // Evita que o modelo atribua incorretamente a criação a outra empresa ou pessoa.
    const lastUserMessageForIdentity = [...conversationHistory].reverse().find(m => m.role === 'user');
    const identityQuestion = String(lastUserMessageForIdentity?.content || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const asksWhoCreated = /\b(quem|who)\b.{0,50}\b(criou|desenvolveu|desenvolveu|create|created|developed|fez|feita|feita por|esta por tras|por tras)\b.{0,50}\b(voce|devpilot|sua criacao|seu desenvolvimento|you|yourself)\b|\b(quem|who)\b.{0,35}\b(e o|is the)\b.{0,20}\b(criador|desenvolvedor|creator|developer)\b.{0,30}\b(voce|devpilot|you)\b/.test(identityQuestion)
      || /\b(quem criou voce|quem desenvolveu voce|quem fez voce|quem e seu criador|quem e sua criadora|quem esta por tras da devpilot)\b/.test(identityQuestion);

    if (asksWhoCreated) {
      const identityAnswer = 'Fui criada por **Robson**.';
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(identityAnswer);
      res.end();

      const db = await getDb();
      if (lastUserMessageForIdentity) {
        await db.run(
          'INSERT INTO messages (session_id, guest_id, role, content) VALUES (?, ?, ?, ?)',
          [sessionId, guestId, 'user', lastUserMessageForIdentity.content]
        );
        await db.run(
          'INSERT INTO messages (session_id, guest_id, role, content) VALUES (?, ?, ?, ?)',
          [sessionId, guestId, 'assistant', identityAnswer]
        );
      }
      logger.info(`Pergunta sobre autoria respondida diretamente para o Guest: ${guestId}.`);
      return;
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