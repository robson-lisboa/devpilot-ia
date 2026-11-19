# SAP PP e PP-PI — fundamentos e execução da produção

> Material didático independente para apoio à análise. Não substitui documentação oficial, procedimentos internos, especificações funcionais ou validação do ambiente. Transações, telas e funcionalidades variam entre SAP ECC, SAP S/4HANA, componentes instalados e customizações.

## 1. Visão geral

- **PP (Production Planning):** planejamento e controle da produção, ordens, necessidades, listas técnicas e roteiros.
- **PP-PI (Production Planning for Process Industries):** planejamento e execução de processos industriais por meio de ordens de processo, receitas mestre, fases e recursos. É comum em setores químico, farmacêutico, alimentos e bebidas.
- **Ordem de produção:** objeto usado em cenários de manufatura discreta.
- **Ordem de processo:** objeto de execução típico do PP-PI.
- **Receita mestre:** descreve operações/fases e parâmetros de execução de um processo. Não deve ser confundida automaticamente com roteiro de produção.

## 2. Objetos principais do PP-PI

1. **Material:** produto, intermediário, matéria-prima ou embalagem.
2. **Lista técnica (BOM):** componentes e quantidades necessários.
3. **Receita mestre:** operações/fases, recursos, instruções e parâmetros do processo.
4. **Versão de produção:** relaciona alternativas de BOM e receita, com validade e critérios de seleção.
5. **Centro e recurso:** estrutura organizacional e capacidade/equipamento usado no processo.
6. **Ordem de processo:** documento de execução que reúne dados planejados e permite acompanhar status, fases, confirmações e consumo.
7. **Lote:** identifica uma quantidade de material sujeita a rastreabilidade e regras de qualidade.

## 3. Fluxo simplificado

1. Conferir dados mestres e validade.
2. Verificar BOM, receita mestre e versão de produção.
3. Criar ou converter a necessidade em ordem, conforme o cenário.
4. Conferir componentes, quantidades, fases e datas da ordem.
5. Liberar a ordem conforme estratégia e autorização.
6. Executar pesagem, separação, produção e confirmações conforme o processo.
7. Registrar consumo e recebimento de material.
8. Encerrar tecnicamente e concluir atividades de qualidade, estoque e documentação.

O fluxo real pode ter etapas adicionais, workflows, sistemas MES/EBR e controles específicos da empresa.

## 4. Transações frequentemente encontradas

Os códigos abaixo são referências comuns, não garantia de disponibilidade no ambiente:

| Transação | Uso geral |
|---|---|
| CO01 / CO02 / CO03 | Criar, alterar e exibir ordem de produção (PP discreto) |
| COR1 / COR2 / COR3 | Criar, alterar e exibir ordem de processo (PP-PI; confirmar release/configuração) |
| COOIS | Sistema de informação de ordens de produção |
| MD04 | Lista de necessidades/estoque |
| CS03 | Exibir lista técnica |
| CA03 | Exibir roteiro; não substitui consulta à receita mestre PP-PI |
| C223 | Manutenção/consulta de versão de produção em cenários aplicáveis |
| CM03 | Visão de capacidade em cenários aplicáveis |

Em S/4HANA, aplicativos Fiori podem substituir ou complementar transações GUI. Confirme no menu, catálogo e autorização do sistema.

## 5. Investigação de ordem ou fase

Ao investigar uma fase ausente, ignorada ou com dados inesperados, não conclua imediatamente que a receita está errada. Compare:

- Receita mestre efetivamente selecionada e sua validade.
- Versão de produção selecionada na criação da ordem.
- BOM e alternativa efetivamente copiadas para a ordem.
- Status da ordem e da fase.
- Chave de controle, recurso, sequência e dependências.
- Parâmetros de seleção, fórmulas e dados copiados.
- Histórico de alteração e logs disponíveis.
- Integrações ou extensões específicas, quando houver evidência.

**Ponto importante:** alterar um dado mestre não significa que uma ordem já criada será atualizada automaticamente. Verifique o que foi copiado para a ordem e avalie o impacto antes de qualquer mudança.

## 6. Boas práticas

- Comece por exibição e coleta de evidências.
- Registre número da ordem, material, centro, lote, data/hora, status e mensagem literal.
- Compare uma ordem correta com a ordem afetada, controlando diferenças.
- Não altere dados mestres ou ordens produtivas sem autorização e procedimento de mudança.
- Não faça correções diretas em tabelas do banco de dados SAP.

## Fontes oficiais

- SAP Help Portal: https://help.sap.com/
- SAP Learning: https://learning.sap.com/
- SAP S/4HANA — documentação de Manufacturing: https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE
