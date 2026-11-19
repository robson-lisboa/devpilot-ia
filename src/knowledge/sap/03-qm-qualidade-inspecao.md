# SAP QM — qualidade, inspeções e integração com produção

> Conteúdo conceitual de apoio. Processos de qualidade são altamente dependentes de configuração, plano de inspeção, origem de inspeção, decisões de utilização e integrações locais.

## 1. Conceitos essenciais

- **Lote de inspeção:** objeto que organiza a inspeção de uma quantidade/material.
- **Origem de inspeção:** evento ou processo que gera o lote, como recebimento, produção ou transferência, conforme configuração.
- **Plano de inspeção:** define características, métodos, amostragem e sequência de inspeção.
- **Características de inspeção:** atributos quantitativos ou qualitativos avaliados.
- **Ponto/plano de amostragem:** define como e quanto inspecionar, conforme estratégia configurada.
- **Resultados:** registros obtidos durante a inspeção.
- **Decisão de utilização (UD):** decisão formal sobre o destino/aceitação do lote de inspeção.
- **Estoque de qualidade:** estoque sujeito à inspeção e às regras de liberação.

## 2. Transações frequentemente usadas

| Transação | Uso geral |
|---|---|
| QA32 | Lista/processamento de lotes de inspeção |
| QA33 | Exibir lotes de inspeção |
| QA11 | Registrar decisão de utilização |
| QE51N | Registrar resultados, em cenários aplicáveis |
| QP03 | Exibir plano de inspeção |
| QS23 | Exibir característica mestre de inspeção |
| MSC3N | Exibir lote de material |

Os códigos podem variar por release, configuração e autorização. Em Fiori, os aplicativos podem ter nomes e fluxos diferentes.

## 3. Como investigar um lote de inspeção

1. Confirmar número do lote de inspeção e material.
2. Verificar origem, centro, tipo de inspeção e status.
3. Conferir características e plano efetivamente determinados.
4. Verificar resultados, amostras e registros pendentes.
5. Conferir decisão de utilização e histórico.
6. Avaliar impacto no estoque e nos documentos subsequentes.
7. Se houver integração, verificar mensagens e confirmação entre SAP e sistema externo.

## 4. Amostragem e produção farmacêutica

Em processos farmacêuticos, a amostragem pode ter fluxo próprio e controles específicos. Não confunda:
- lote de inspeção com lote de material;
- amostra física com registro de amostra no sistema;
- inspeção de recebimento com inspeção em processo;
- status de qualidade com status de estoque;
- liberação de lote com encerramento da ordem.

A determinação de amostras pode depender de plano de inspeção, procedimento de amostragem, características, quantidade, configuração e extensões do cliente. Não invente tabelas ou regras sem evidência.

## 5. BPF/GMP e integridade de dados

- Preserve trilha de auditoria e histórico de alterações.
- Não apague ou substitua resultados para contornar uma falha.
- Não recomende liberação manual sem procedimento, avaliação de qualidade e autorização.
- Registre evidências, responsáveis, datas e justificativas.
- Diferencie correção de registro, investigação de desvio e mudança de configuração.

## Fontes oficiais

- SAP Help Portal: https://help.sap.com/
- SAP Learning: https://learning.sap.com/
- SAP S/4HANA — documentação de Quality Management: https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE
