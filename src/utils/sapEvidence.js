const MAX_INPUT_CHARS = 20000;
const MAX_LINES = 500;
const MAX_EVIDENCE_LINES = 12;

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function analyzeSapEvidence(input) {
  const source = String(input || '').slice(0, MAX_INPUT_CHARS);
  if (!source.trim()) {
    return { analyzed: false, lineCount: 0, timestamps: [], severities: [], idocs: [], messageCodes: [], evidenceLines: [], truncated: false };
  }

  const allLines = source.split(/\r?\n/);
  const lines = allLines.slice(0, MAX_LINES);
  const timestamps = [];
  const severities = [];
  const idocs = [];
  const messageCodes = [];
  const evidenceLines = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const timestamp = line.match(/\b(?:20\d{2}[-/]\d{2}[-/]\d{2}[ T]\d{2}:\d{2}:\d{2}|\d{2}\.\d{2}\.20\d{2}\s+\d{2}:\d{2}:\d{2})\b/);
    if (timestamp) timestamps.push(timestamp[0]);

    const severity = line.match(/\b(ERROR|FATAL|CRITICAL|WARNING|WARN|INFO|SUCCESS|ABEND)\b/i);
    if (severity) severities.push(severity[1].toUpperCase());

    const idoc = line.match(/\bIDoc\s*(?:n[ºo.]?\s*)?[:#=-]?\s*(\d{6,16})\b/i)
      || line.match(/\b(?:DOCNUM|DOC_NUM)\s*[=:]\s*(\d{6,16})\b/i);
    if (idoc) idocs.push(idoc[1]);

    const status = line.match(/\b(?:status|status code)\s*[=:]\s*(\d{1,3})\b/i);
    if (status) idocs.push('status ' + status[1]);

    const code = line.match(/\b[A-Z][A-Z0-9]\s?\d{3}\b/);
    if (code) messageCodes.push(code[0].replace(/\s+/g, ' '));

    if (/(error|erro|falha|failed|exception|abend|timeout|rejeitad|bloquead|status\s*[=:])/i.test(line)
      && evidenceLines.length < MAX_EVIDENCE_LINES) {
      evidenceLines.push(line.slice(0, 300));
    }
  }

  return {
    analyzed: true,
    lineCount: lines.length,
    timestamps: unique(timestamps).slice(0, 8),
    severities: unique(severities),
    idocs: unique(idocs).slice(0, 12),
    messageCodes: unique(messageCodes).slice(0, 12),
    evidenceLines,
    truncated: allLines.length > MAX_LINES || String(input || '').length > MAX_INPUT_CHARS
  };
}

function formatSapEvidenceContext(input) {
  const result = analyzeSapEvidence(input);
  if (!result.analyzed) return '';
  const hasSignals = result.timestamps.length || result.severities.length
    || result.idocs.length || result.messageCodes.length || result.evidenceLines.length;
  if (!hasSignals) return '';

  return [
    '[RESUMO AUTOMÁTICO DE EVIDÊNCIAS SAP — EXTRAÇÃO HEURÍSTICA, NÃO É DIAGNÓSTICO CONFIRMADO]',
    'Linhas examinadas: ' + result.lineCount + (result.truncated ? ' (entrada limitada para análise)' : ''),
    result.timestamps.length ? 'Datas/horários encontrados: ' + result.timestamps.join(', ') : '',
    result.severities.length ? 'Níveis encontrados: ' + result.severities.join(', ') : '',
    result.idocs.length ? 'Referências de IDoc/status encontradas: ' + result.idocs.join(', ') : '',
    result.messageCodes.length ? 'Códigos com padrão SAP encontrados: ' + result.messageCodes.join(', ') : '',
    result.evidenceLines.length ? 'Linhas candidatas para investigação:\n- ' + result.evidenceLines.join('\n- ') : '',
    'Confirme cada referência no sistema e no monitor correspondente. Não presuma que todo número ou código extraído tenha significado SAP.'
  ].filter(Boolean).join('\n');
}

module.exports = { analyzeSapEvidence, formatSapEvidenceContext };
