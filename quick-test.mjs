import { fixtures, instruction } from './scoring.mjs';

const byId = new Map(fixtures().map(row => [row.id, row]));

export function reviewerPrompt(id) {
  const item = byId.get(id);
  if (!item) throw new Error('Unknown case ID.');
  return [
    instruction,
    'Give one decision and a brief reason.',
    '',
    'Case: ' + item.id,
    'Trial: ' + item.trial,
    'Reference rule: ' + item.reference_rule,
    item.document_type + ' draft: ' + item.draft,
  ].join('\n');
}

export function pairOrder(change, reverse) {
  return reverse ? [...change.ids].reverse() : [...change.ids];
}
