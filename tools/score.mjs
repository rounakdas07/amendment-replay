import { readFileSync } from 'node:fs';
import { numericBaseline, score } from '../scoring.mjs';
const file = process.argv[2];
if (!file) {
  console.error('Usage: node tools/score.mjs predictions.json | --baseline');
  process.exitCode = 2;
} else {
  try {
    const submission = file === '--baseline' ? numericBaseline() : JSON.parse(readFileSync(file, 'utf8'));
    console.log(JSON.stringify(score(submission), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
