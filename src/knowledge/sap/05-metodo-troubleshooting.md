# SAP — método de troubleshooting e análise de causa raiz

## 1. Regra principal

Não confundir sintoma com causa raiz. Uma mensagem de erro pode ser consequência de dado mestre, documento, autorização, configuração, integração, desenvolvimento ou infraestrutura.

## 2. Coleta mínima de evidências

Sempre que permitido, registrar:
- sistema e ambiente (DEV, QAS, PRD), sem divulgar endereço interno;
- versão/release, se conhecida;
- transação ou aplicativo;
- usuário/função de negócio, sem compartilhar credenciais;
- data/hora e fuso;
- material, lote, ordem ou documento (mascarar identificadores sensíveis antes de compartilhar externamente);
- mensagem completa e código;
- sequência exata de passos;
- comportamento esperado versus observado;
- evidência de um caso correto para comparação.

## 3. Árvore de investigação

1. **Reprodução:** ocorre sempre ou intermitentemente? Em qual etapa?
2. **Dados:** os dados mestres e documentos estão completos, válidos e coerentes?
3. **Status:** existe bloqueio, encerramento, liberação pendente ou período fechado?
4. **Autorização:** o usuário possui autorização para a ação?
5. **Customizing:** a determinação e os parâmetros correspondem ao cenário?
6. **Integração:** a mensagem foi criada, enviada, recebida e processada?
7. **Desenvolvimento:** há objetos Z, BAdIs, exits, enhancement ou regras específicas?
8. **Infraestrutura:** há indisponibilidade, timeout, fila parada ou falha de comunicação?
9. **Validação:** a correção resolve a causa e não gera efeito colateral?

## 4. Ferramentas que podem ser relevantes

- **ST22:** dumps ABAP.
- **SM21:** log do sistema.
- **SLG1:** application log.
- **SU53:** análise de autorização após falha de acesso, quando aplicável.
- **ST05 / SAT:** análise técnica com autorização e cuidado de desempenho.
- **SM37:** jobs em background.
- **SM13:** atualizações terminadas com erro.
- **SMQ1 / SMQ2:** filas qRFC.
- **SM58:** tRFC.
- **WE02 / WE05:** IDocs.

A lista não significa que todas as transações existam ou estejam autorizadas em todo ambiente. Use apenas quando o sintoma justificar e conforme orientação do time responsável.

## 5. Estrutura de análise de causa raiz

- **Problema:** descrição objetiva e impacto.
- **Evidências:** fatos observados e registros.
- **Linha do tempo:** eventos e horários.
- **Causa imediata:** mecanismo que gerou o erro.
- **Causa raiz:** condição sistêmica que permitiu a ocorrência.
- **Fatores contribuintes:** condições adicionais.
- **Contenção:** medida temporária aprovada.
- **Ação corretiva:** elimina a causa identificada.
- **Ação preventiva:** reduz chance de recorrência.
- **Validação de eficácia:** critério mensurável e período de acompanhamento.

## 6. Segurança e ambiente regulado

- Priorize consulta e diagnóstico antes de alteração.
- Não altere tabelas diretamente.
- Não compartilhe senhas, tokens, dados de pacientes, fórmulas ou documentos internos.
- Em produção, siga autorização, gestão de mudança, validação e segregação de funções.
- Em BPF/GMP, preserve integridade de dados e trilha de auditoria.
- Diferencie hipótese de fato confirmado.

## Fontes oficiais

- SAP Help Portal: https://help.sap.com/
- SAP Learning: https://learning.sap.com/
