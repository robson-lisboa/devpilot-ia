# SAP — integrações e interfaces

## Escopo
Integração entre SAP e sistemas externos por IDoc/ALE, RFC/BAPI, APIs, OData, SOAP, eventos, filas e middleware, conforme arquitetura implantada.

## Diagnóstico ponta a ponta
1. Identifique sistema de origem, destino, interface, direção e horário com fuso.
2. Colete IDoc/message/correlation ID, tipo de mensagem, status e payload mascarado.
3. Verifique se a mensagem foi criada na origem, enviada, recebida e processada no destino.
4. Separe falha de dados, mapeamento, autenticação, conectividade, fila e regra de negócio.
5. Verifique reprocessamento seguro, duplicidade e idempotência antes de repetir mensagens.
6. Registre evidências dos dois lados e confirme o resultado funcional após correção.

## Perguntas de diagnóstico
Qual tecnologia de integração? Qual mensagem/ID? O erro está na origem, middleware ou destino? Houve timeout, rejeição funcional, falha de autenticação ou fila parada?

## Cuidado
Não reprocessar em massa nem repetir mensagens sem avaliar duplicidade e efeitos no negócio. Mascarar dados pessoais, credenciais e informações confidenciais.

## Fonte oficial
SAP Help Portal: https://help.sap.com/ — pesquisar pela tecnologia (Integration Suite, IDoc/ALE, RFC, OData ou APIs) e pela versão.
