# SAP — integração, IDoc, MES e PAS-X

> Guia para orientar investigação. A implementação de integração varia por arquitetura, middleware, versão SAP, produto MES/EBR, configuração e desenvolvimentos específicos. Este documento não presume detalhes de qualquer empresa.

## 1. Conceitos de integração

- **IDoc:** formato estruturado de intercâmbio de dados usado em integrações SAP.
- **ALE:** tecnologia/conjunto de mecanismos de distribuição e integração de dados.
- **RFC:** chamada de função remota entre sistemas SAP ou externos, conforme configuração.
- **BAPI:** interface de negócio publicada para operações SAP.
- **Middleware:** camada que pode transformar, rotear, monitorar e entregar mensagens entre sistemas.
- **MES:** sistema de execução da manufatura.
- **EBR:** Electronic Batch Record, registro eletrônico de fabricação/lote.
- **PAS-X:** solução MES/EBR da Körber para execução de processos, com integração possível com SAP.

## 2. Monitoramento de IDoc

Transações frequentemente usadas:
- **WE02 / WE05:** consultar IDocs e status.
- **WE09:** pesquisa de IDocs por conteúdo, conforme disponibilidade.
- **BD87:** reprocessamento de IDocs em cenários autorizados.
- **WE20:** configuração de parceiros (exibição/alteração conforme autorização).
- **WE21:** portas.
- **SM58:** monitor de tRFC.
- **SMQ1 / SMQ2:** filas qRFC de saída/entrada.

O significado de cada status deve ser confirmado no próprio IDoc e na documentação do release. Não reprocessar repetidamente sem entender a causa; isso pode duplicar efeitos ou gerar inconsistência.

## 3. Método para investigar falha SAP → MES

1. Identificar objeto de negócio: ordem, material, lote, inspeção ou evento.
2. Registrar sistema de origem/destino, horário e fuso.
3. Localizar mensagem/IDoc pelo identificador e período.
4. Verificar status, texto de erro, segmentos e dados relevantes.
5. Confirmar se a mensagem chegou ao middleware e ao destino.
6. Verificar logs do sistema receptor e correlação por ID externo.
7. Determinar se falha ocorreu na geração, transporte, transformação, validação ou processamento.
8. Avaliar reprocessamento controlado após corrigir a causa, seguindo procedimento aprovado.
9. Validar consistência nos dois sistemas e prevenir duplicidade.

## 4. Perguntas que ajudam a separar causas

- O objeto foi criado corretamente no SAP?
- O IDoc foi gerado?
- Qual é o status atual e o texto completo?
- Há registro de envio/recebimento no middleware?
- O sistema de destino recebeu a mensagem?
- O erro é de cadastro, mapeamento, autorização, conectividade ou regra de negócio?
- A mensagem foi processada parcialmente?
- Existe chave de idempotência ou prevenção de duplicidade?
- O reprocessamento é seguro e autorizado?

## 5. SAP e PAS-X / EBR

Em uma integração típica, dados mestres e ordens podem ser enviados do ERP para o MES, enquanto confirmações, consumos ou resultados podem retornar ao ERP. O fluxo real depende do desenho da solução. Investigue o contrato de interface e os mapeamentos; não presuma que um campo, status ou tipo de mensagem seja padrão em todos os projetos.

Em ambiente farmacêutico:
- preserve a trilha de auditoria;
- avalie impacto em registro de lote e reconciliação;
- não contorne controles de execução;
- siga gestão de mudanças e procedimentos validados;
- evite compartilhar dados confidenciais, receitas, parâmetros proprietários ou dados pessoais.

## Fontes oficiais

- SAP Help Portal: https://help.sap.com/
- SAP Learning: https://learning.sap.com/
- SAP Help — Integration: https://help.sap.com/docs/
- Körber PAS-X: https://www.koerber-pharma.com/
