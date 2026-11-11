import { mkdirSync, writeFileSync } from 'node:fs';
import { fixtures, answerKey, instruction, template, version } from '../scoring.mjs';
const out = new URL('../pack/', import.meta.url);
mkdirSync(out, { recursive: true });
const write = (name, value) => writeFileSync(new URL(name, out), value + '\n');
write('cases.jsonl', fixtures().map(row => JSON.stringify(row)).join('\n'));
write('answer-key.json', JSON.stringify({ pack_version: version, cases: answerKey() }, null, 2));
write('predictions-template.json', JSON.stringify(template(), null, 2));
write('reviewer-instructions.txt', [
  'Amendment Replay | pack v' + version, '',
  instruction, '',
  'Supply each line of cases.jsonl to your reviewer in a fresh context. Preserve the ID.',
  'Keep answer-key.json, the website verdicts and sibling examples out of the reviewer context.',
  'In predictions-template.json replace null with each resulting decision, leaving the IDs and pack_version as supplied.',
  'Retain the reviewer version, prompt and date privately if you plan to compare runs.',
  'Upload the predictions to the scoring page or use: node tools/score.mjs predictions.json',
  'Prior knowledge of this public set can inflate scores. Use separate unseen cases for performance estimates.',
].join('\n'));
