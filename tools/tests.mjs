import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { changes, trials, plain } from '../data/corpus.mjs';
import { score, compare, answerKey, fixtures, template, numericBaseline, version } from '../scoring.mjs';

const key = answerKey();
const marked = (fn = row => row.expected) => ({
  pack_version: version, decisions: key.map(row => ({ id: row.id, decision: fn(row) })),
});

test('each change has one conflicting draft, one faithful control and a traceable rule', () => {
  assert.equal(changes.length, 12);
  assert.equal(new Set(changes.map(row => row.trial)).size, 4);
  assert.equal(new Set(key.map(row => row.id)).size, 24);
  assert.equal(new Set(changes.map(row => row.slug)).size, 12);
  for (const change of changes) {
    assert.match(trials[change.trial].registry, /^NCT\d{8}$/);
    assert.ok(change.locator && change.date && change.amendment);
    for (const variant of ['rule', 'conflict', 'clean']) {
      assert.match(change[variant], /\[\[.+?\]\]/);
      assert.doesNotMatch(plain(change[variant]), /[\[\]]/);
    }
    assert.deepEqual(key.filter(row => row.pair === change.slug).map(row => row.expected).sort(), ['flag', 'pass']);
  }
});

test('the exported blind inputs carry no labels, selection metadata or display markup', () => {
  const lines = readFileSync(new URL('../pack/cases.jsonl', import.meta.url), 'utf8').trim().split('\n').map(JSON.parse);
  assert.deepEqual(lines, fixtures());
  assert.deepEqual(Object.keys(lines[0]).sort(), ['id','trial','registry','amendment','document_type','reference_rule','draft','source','locator'].sort());
  assert.ok(lines.every(row => !row.draft.includes('[[') && row.source.startsWith('https://')));
  assert.deepEqual(JSON.parse(readFileSync(new URL('../pack/answer-key.json', import.meta.url))).cases, key);
});

test('perfect and reversed submissions score both halves of every pair', () => {
  const perfect = score(marked());
  assert.equal(perfect.correct, 24); assert.equal(perfect.pairsCorrect, 12);
  assert.equal(perfect.caught, 12); assert.equal(perfect.falseAlarms, 0);
  const reversed = score(marked(row => row.expected === 'flag' ? 'pass' : 'flag'));
  assert.equal(reversed.correct, 0); assert.equal(reversed.missed, 12); assert.equal(reversed.falseAlarms, 12);
});

test('always-flag and always-pass each fail all pairs for different reasons', () => {
  const flag = score(marked(() => 'flag'));
  const pass = score(marked(() => 'pass'));
  assert.equal(flag.correct, 12); assert.equal(flag.falseAlarms, 12); assert.equal(flag.pairsCorrect, 0);
  assert.equal(pass.correct, 12); assert.equal(pass.missed, 12); assert.equal(pass.pairsCorrect, 0);
});

test('null, missing and abstain never earn credit', () => {
  const blank = score(template());
  assert.equal(blank.correct, 0); assert.equal(blank.answered, 0); assert.equal(blank.missing, 24);
  const partial = score({ pack_version: version, decisions: [{id:key[0].id, decision:'abstain'}, {id:key[1].id, decision:key[1].expected}] });
  assert.equal(partial.abstained, 1); assert.equal(partial.missing, 22); assert.equal(partial.correct, 1);
  assert.equal(partial.pairsCorrect, 0);
});

test('reject unknown, repeated or malformed decisions and incompatible pack versions', () => {
  for (const row of [null, {}, {id:'unknown',decision:'flag'}, {id:key[0].id,decision:'unclear'}]) {
    assert.throws(() => score({ pack_version:version, decisions:[row] }));
  }
  assert.throws(() => score({ pack_version:version, decisions:[...marked().decisions,marked().decisions[0]] }));
  assert.throws(() => score({ pack_version:'0.0.0', decisions:[] }));
  assert.throws(() => score({ pack_version:version, decisions:{} }));
});

test('the numeric baseline misses the optional stop and falsely flags an equivalent age boundary', () => {
  const baseline = score(numericBaseline());
  assert.equal(baseline.results.find(row => row.id === 'AR-617').outcome, 'missed');
  assert.equal(baseline.results.find(row => row.id === 'AR-473').outcome, 'false-alarm');
  assert.equal(baseline.caught, 2); assert.equal(baseline.falseAlarms, 3); assert.equal(baseline.correct, 11);
});

test('version comparison reports gained and lost decisions separately', () => {
  const a = score(marked(() => 'pass')), b = score(marked(() => 'flag'));
  assert.equal(compare(a,b).gained.length,12); assert.equal(compare(a,b).lost.length,12);
  assert.deepEqual(compare(a,a),{ gained:[], lost:[] });
});

test('every display example has a question, both readings and patient or study consequences', async () => {
  const { readings } = await import('../data/reading.mjs');
  assert.deepEqual(Object.keys(readings).sort(), changes.map(change => change.slug).sort());
  for (const row of Object.values(readings)) {
    for (const field of ['question','rule','conflict','clean','impact','cleanImpact']) assert.ok(row[field]?.length, field);
  }
});

test('the copyable pair uses exactly the blind pack text and withholds its answers', async () => {
  const { pairOrder, reviewerPrompt } = await import('../quick-test.mjs');
  const reference = new Map(fixtures().map(row => [row.id, row]));
  for (const change of changes) {
    assert.deepEqual(pairOrder(change, false), change.ids);
    assert.deepEqual(pairOrder(change, true), [change.ids[1], change.ids[0]]);
    for (const id of change.ids) {
      const row = reference.get(id);
      const prompt = reviewerPrompt(id);
      assert.ok(prompt.includes(row.reference_rule));
      assert.ok(prompt.includes(row.draft));
      assert.equal(prompt.split(row.document_type + ' draft: ').at(-1), row.draft);
      assert.doesNotMatch(prompt, /\[\[|expected:|answer key:|correct answer:/i);
      assert.ok(!prompt.includes(change.impact) && !prompt.includes(change.cleanWhy));
    }
  }
  assert.throws(() => reviewerPrompt('AR-unknown'));
});
