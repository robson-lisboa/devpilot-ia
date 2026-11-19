# SAP BASIS — administração técnica

## Escopo
Disponibilidade, instâncias, usuários, autorizações, jobs, spool, transportes, monitoramento, certificados, conectividade e administração do ambiente.

## Investigar
- SID, cliente, instância, sistema operacional e release (sem expor segredos).
- Horário, componente, servidor e transação/serviço afetado.
- Logs relevantes, dumps, jobs, filas, work processes e monitoramento.
- Alterações recentes, transportes, certificados e dependências de rede.
- Impacto, criticidade, abrangência e plano de retorno.

## Perguntas de diagnóstico
É indisponibilidade geral ou de um usuário? Afeta um sistema ou vários? Houve transporte, atualização ou mudança de infraestrutura? Qual mensagem e horário?

## Cuidado
Não reiniciar serviços, liberar usuários, alterar parâmetros ou executar comandos em produção sem autorização e avaliação de impacto. Nunca solicitar senha ou token.

## Fonte oficial
SAP Help Portal: https://help.sap.com/ — pesquisar por SAP NetWeaver, SAP S/4HANA Administration ou SAP Basis conforme a plataforma.
