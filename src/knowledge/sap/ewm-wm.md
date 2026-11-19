# SAP EWM e WM — gestão de armazém

## Escopo
Recebimento, putaway, movimentações internas, picking, packing, inventário e expedição. EWM e Warehouse Management clássico têm objetos e processos diferentes; confirmar qual solução está ativa.

## Investigar
- Depósito, tipo de depósito, posição, unidade de manuseio (HU) e produto.
- Documento de entrega, warehouse task/order e status de execução, quando aplicável.
- Tipo de processo, determinação de depósito e disponibilidade de estoque.
- Filas, qRFC, mensagens, logs de integração e bloqueios ERP.
- Diferenças entre quantidade física, estoque no ERP e estoque no EWM.

## Perguntas de diagnóstico
É EWM embedded, decentralizado ou WM clássico? Qual documento e etapa? A tarefa foi criada, confirmada ou bloqueada? O estoque está disponível no sistema de origem e no destino?

## Cuidado
Não tratar códigos de movimento, tipos de depósito ou tipos de processo como universais. Validar mapeamentos e configuração do cliente.

## Fonte oficial
SAP Help Portal: https://help.sap.com/ — pesquisar por Extended Warehouse Management (EWM) ou Warehouse Management (WM), conforme a arquitetura.
