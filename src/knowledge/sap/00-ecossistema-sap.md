# Mapa do ecossistema SAP

Este documento orienta a classificação inicial de perguntas SAP. Não substitui documentação oficial, configuração do cliente, procedimentos internos ou validação no ambiente.

## Como classificar
- **PP / PP-PI:** planejamento e execução da produção; PP-PI é voltado a processos industriais por processo, com receitas, fases e recursos.
- **QM:** planejamento da qualidade, inspeções, resultados, decisões de uso e notificações.
- **EWM / WM:** recebimento, armazenagem, movimentação, picking, inventário e expedição. EWM e WM não são sinônimos em todas as arquiteturas.
- **PM / EAM:** manutenção de ativos, notificações, ordens, planos e confirmações.
- **SD:** vendas, entregas, expedição, faturamento e fluxo de documentos comerciais.
- **MM:** compras, dados mestre de materiais, recebimento e gestão de estoque.
- **FI:** contabilidade financeira, contas a pagar/receber, razão e fechamento.
- **CO:** custos, centros de custo, ordens internas, análise de rentabilidade e fechamento gerencial.
- **ABAP:** desenvolvimento, extensões, debugging, objetos e transportes.
- **BASIS:** administração técnica, usuários, autorizações, jobs, transportes, monitoramento e disponibilidade.
- **HANA:** banco de dados, modelagem, desempenho, backup e administração.
- **Integrações:** APIs, IDoc, RFC, eventos, middleware, filas e monitoramento ponta a ponta.

## Método de diagnóstico
1. Identifique produto, versão, implantação (on-premise, private cloud ou public cloud) e sistema/ambiente.
2. Identifique módulo, processo, etapa e resultado esperado.
3. Colete mensagem completa, código de erro, horário, usuário técnico/funcional e identificadores de negócio relevantes.
4. Determine onde o fluxo parou: origem, middleware, destino ou atualização posterior.
5. Separe evidência observada de hipótese.
6. Consulte documentação correspondente à versão e valide em ambiente de teste antes de qualquer alteração.
7. Registre causa raiz, correção, validação e plano de retorno.

## Limites
- Não invente transações, tabelas, APIs, parâmetros, notas SAP ou caminhos de configuração.
- Códigos de transação e objetos variam por produto, release, ativação e customização.
- Nunca recomende alteração direta em produção, tabela ou customizing sem análise de impacto, autorização, teste e plano de retorno.
- Não solicite senhas, tokens ou dados pessoais; peça para mascarar informações sensíveis.

## Fontes oficiais
- SAP Help Portal: https://help.sap.com/
- SAP Learning: https://learning.sap.com/
- SAP Support Portal: https://support.sap.com/ (acesso e conteúdo podem exigir contrato/autorização).
