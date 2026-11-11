import { changes, plain, sourceURL, trials, version } from './data/corpus.mjs';

export { version };
export const instruction = 'Read the reference rule and the illustrative draft independently for each ID. Return "flag" if the draft conflicts with this rule, "pass" if it preserves it, or "abstain" if you cannot decide. Judge only the stated rule.';

export function fixtures() {
  return changes.flatMap(change => ['conflict', 'clean'].map((variant, index) => {
    const trial = trials[change.trial];
    return {
      id: change.ids[index], trial: trial.name, registry: trial.registry,
      amendment: change.amendment, document_type: change.artifact,
      reference_rule: plain(change.rule), draft: plain(change[variant]),
      source: sourceURL(change), locator: change.locator,
    };
  })).sort((a, b) => a.id.localeCompare(b.id));
}

export function answerKey() {
  return changes.flatMap(change => change.ids.map((id, index) => ({
    id, pair: change.slug, expected: index === 0 ? 'flag' : 'pass',
    rationale: index === 0 ? change.impact : change.cleanWhy,
    correction: index === 0 ? change.fix : null, source: sourceURL(change), locator: change.locator,
  }))).sort((a, b) => a.id.localeCompare(b.id));
}

export function template() {
  return { pack_version: version, decisions: fixtures().map(({ id }) => ({ id, decision: null })) };
}

export function score(submission) {
  if (!submission || submission.pack_version !== version) throw Error('Use a predictions file for pack v' + version + '.');
  if (!Array.isArray(submission.decisions)) throw Error('The file needs a decisions array. Start with predictions-template.json.');
  const key = answerKey();
  const known = new Set(key.map(row => row.id));
  const values = new Map();
  for (const row of submission.decisions) {
    if (!row || !known.has(row.id)) throw Error('Unknown or missing case ID: ' + String(row?.id ?? '(blank)') + '.');
    if (values.has(row.id)) throw Error('Repeated case ID: ' + row.id + '. Keep one decision per case.');
    if (!['flag', 'pass', 'abstain', null].includes(row.decision)) {
      throw Error('Use flag, pass, abstain or null for ' + row.id + '.');
    }
    values.set(row.id, row.decision);
  }
  const results = key.map(({ id, expected, pair }) => {
    const decision = values.get(id) ?? 'missing';
    let outcome = decision === expected ? 'correct' : 'missed';
    if (decision === 'abstain' || decision === 'missing') outcome = decision;
    else if (decision === 'flag' && expected === 'pass') outcome = 'false-alarm';
    return { id, pair, expected, decision, outcome };
  });
  const tally = outcome => results.filter(row => row.outcome === outcome).length;
  return {
    pack_version: version, total: results.length, correct: tally('correct'),
    caught: results.filter(row => row.expected === 'flag' && row.outcome === 'correct').length,
    conflicts: key.filter(row => row.expected === 'flag').length,
    faithful: key.filter(row => row.expected === 'pass').length,
    missed: tally('missed'), falseAlarms: tally('false-alarm'), abstained: tally('abstain'),
    missing: tally('missing'), answered: results.filter(row => ['flag', 'pass'].includes(row.decision)).length,
    pairsCorrect: changes.filter(change => change.ids.every(id => results.find(row => row.id === id).outcome === 'correct')).length,
    pairs: changes.length, results,
  };
}

export function compare(earlier, later) {
  const oldResults = new Map(earlier.results.map(row => [row.id, row]));
  return later.results.reduce((out, row) => {
    const before = oldResults.get(row.id);
    if (before.outcome === 'correct' && row.outcome !== 'correct') out.lost.push(row.id);
    if (before.outcome !== 'correct' && row.outcome === 'correct') out.gained.push(row.id);
    return out;
  }, { gained: [], lost: [] });
}

function numericTokens(text) {
  return [...new Set(text.match(/\d+(?:\.\d+)?/g) || [])].sort().join('|');
}

export function numericBaseline() {
  // Deliberately literal. Equivalent wordings and identical figures can both fool it.
  return {
    pack_version: version,
    decisions: fixtures().map(row => ({
      id: row.id,
      decision: numericTokens(row.reference_rule) === numericTokens(row.draft) ? 'pass' : 'flag',
    })),
  };
}
