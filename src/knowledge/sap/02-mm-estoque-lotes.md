# SAP MM — materiais, estoque, movimentações e lotes

> Guia de referência geral. A disponibilidade de transações e o comportamento dependem da versão, configuração, componentes e autorizações do ambiente.

## 1. Conceitos

- **Material:** cadastro que identifica matéria-prima, produto, embalagem ou outro item controlado.
- **Centro (plant):** unidade organizacional de planejamento/estoque.
- **Depósito (storage location):** subdivisão de estoque dentro do centro.
- **Lote (batch):** identifica uma quantidade de material para rastreabilidade, validade, classificação e controle de qualidade.
- **Unidade de medida:** unidade base e unidades alternativas, com conversões cadastradas.
- **Tipo de estoque:** por exemplo, livre utilização, qualidade ou bloqueado; os tipos e regras dependem do processo.

## 2. Transações comuns

| Transação | Finalidade geral |
|---|---|
| MM03 | Exibir material |
| MMBE | Visão de estoque por material |
| MB52 | Lista de estoques por material |
| MB51 | Lista de documentos de material |
| MIGO | Registrar/consultar movimentos de mercadorias, conforme configuração |
| MSC3N | Exibir lote |
| MSC2N | Alterar lote, sujeito a autorização e regras |
| ME23N | Exibir pedido de compra |
| ME21N | Criar pedido de compra |
| ME51N | Criar requisição de compra |

Em ambientes S/4HANA, use também os aplicativos Fiori correspondentes quando disponibilizados.

## 3. Movimentos de mercadorias

Exemplos conhecidos de tipos de movimento SAP:

- **101:** entrada de mercadoria referente a pedido ou ordem, conforme processo.
- **102:** estorno de entrada 101, respeitando documento original e regras.
- **261:** saída de componentes para ordem.
- **262:** estorno de saída 261.
- **311:** transferência entre depósitos de um mesmo centro em cenários padrão.
- **301:** transferência entre centros em cenários padrão, conforme configuração.

Não escolha um tipo de movimento apenas pelo número. Confirme referência, estoque de origem/destino, lote, motivo, período, documento e procedimento interno. Movimentos especiais e tipos Z podem existir.

## 4. Roteiro de análise de divergência de estoque

1. Confirmar material, centro, depósito e lote.
2. Consultar saldo e tipo de estoque.
3. Consultar documentos de material e sequência cronológica.
4. Verificar unidade de medida e conversões.
5. Conferir status do lote e inspeções de qualidade.
6. Verificar reservas, ordens, entregas ou documentos pendentes.
7. Conferir interfaces/WMS se houver diferença entre sistemas.
8. Só depois avaliar correção autorizada e documentada.

## 5. Lote e rastreabilidade

Ao investigar lote, confira:
- Material e lote exatos.
- Centro e depósito.
- Data de fabricação e validade, quando aplicável.
- Status e classificação do lote.
- Estoque por tipo e documentos de movimentação.
- Lote de origem/destino em transferências ou derivações.
- Documentos de qualidade associados.

Não presuma que um lote bloqueado significa falta física de estoque: pode haver quantidade em estoque de qualidade, bloqueado, em transferência ou com status que impede determinada utilização.

## 6. Segurança operacional

Em ambiente regulado, movimentações podem afetar rastreabilidade, reconciliação e integridade de dados. Não recomende lançar, estornar ou desbloquear estoque sem verificar documento de referência, autorização, procedimento aprovado e impacto em sistemas integrados.

## Fontes oficiais

- SAP Help Portal: https://help.sap.com/
- SAP Learning: https://learning.sap.com/
- SAP S/4HANA — documentação de Inventory Management: https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE
