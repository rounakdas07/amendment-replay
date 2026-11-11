import { changes, plain, sourceURL, trials } from './data/corpus.mjs';
import { readings } from './data/reading.mjs?v=2.1';
import { score, compare, numericBaseline, version } from './scoring.mjs';
import { pairOrder, reviewerPrompt } from './quick-test.mjs';

const $ = id => document.getElementById(id);
const outcomes = { correct: 'Correct', missed: 'Missed error', 'false-alarm': 'False alarm', abstain: 'Abstained', missing: 'Missing' };
const decisionLabel = { flag: 'Flag', pass: 'Pass', missing: '—', abstain: 'Abstain' };
const caseURL = (change, variant = 'conflict') => '#case/' + change.slug + (variant === 'clean' ? '/clean' : '');
const formatDate = new Intl.DateTimeFormat('en-GB', { day:'numeric', month:'short', year:'numeric', timeZone:'UTC' });
const decisions = document.querySelector('.decisions');

let active = changes[0];
let activeIndex = 0;
let selectedVariant = 'conflict';
let scoringView = false;
let currentReport;
let currentLabel;
let currentComparison;
let quickRun;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function setPhrase(node, text) {
  node.textContent = text;
  node.classList.toggle('long', text.length > 13 && text.length <= 20);
  node.classList.toggle('longer', text.length > 20);
}

function renderCase(index, variant) {
  const change = changes[index];
  const trial = trials[change.trial];
  const reading = readings[change.slug];
  const clean = variant === 'clean';
  if (active !== change) $('evidence').open = false;
  active = change;
  activeIndex = index;
  selectedVariant = variant;
  $('trial-name').textContent = trial.name;
  $('trial-area').textContent = trial.area;
  $('case-question').textContent = reading.question;
  $('browse').textContent = (index + 1) + ' of ' + changes.length;
  $('browse').setAttribute('aria-label', 'Choose an example, ' + $('browse').textContent);
  $('previous').disabled = index === 0;
  $('next').disabled = index === changes.length - 1;
  setPhrase($('rule-phrase'), reading.rule);
  setPhrase($('draft-phrase'), reading[variant]);
  $('word-change').classList.toggle('fixed', clean);
  document.querySelector('.case-sheet').classList.toggle('fixed', clean);
  $('draft-label').textContent = clean ? 'Corrected draft' : (change.artifact === 'Site handbook' ? 'Sample handbook' : 'Sample draft');
  $('effect').textContent = clean ? reading.cleanImpact : reading.impact;
  $('toggle-draft').textContent = clean ? 'Show the error' : 'Show the fix';
  $('rule-full').textContent = plain(change.rule);
  $('draft-full').textContent = plain(change[variant]);
  $('draft-full-heading').textContent = 'Illustrative ' + change.artifact.toLowerCase();
  $('source-caption').textContent = [trial.publisher, change.amendment, formatDate.format(new Date(change.date))].join(' · ');
  $('source-link').href = sourceURL(change);
  $('source-link').textContent = change.locator;
  $('registry-link').href = 'https://clinicaltrials.gov/study/' + trial.registry;
  $('registry-link').textContent = 'Trial registry · ' + trial.registry;
  document.title = reading.question + ' | Amendment Replay';
}

function route(event) {
  const parts = location.hash.slice(1).split('/');
  const previousView = scoringView;
  scoringView = parts[0] === 'score';
  $('replay-view').hidden = scoringView;
  $('score-view').hidden = !scoringView;
  if (scoringView) {
    document.title = 'Test all 24 drafts | Amendment Replay';
  } else {
    const index = parts[0] === 'case' ? changes.findIndex(change => change.slug === parts[1]) : 0;
    renderCase(Math.max(0, index), parts[2] === 'clean' ? 'clean' : 'conflict');
  }
  const header = $('header-link');
  header.href = scoringView ? caseURL(active, selectedVariant) : '#score';
  header.replaceChildren(scoringView ? 'Back to example ' : 'Full test pack ', element('span', undefined, 'arrow'));
  header.lastElementChild.setAttribute('aria-hidden', 'true');
  if (event && previousView !== scoringView) {
    window.scrollTo(0, 0);
    $('workspace').focus({preventScroll:true});
  } else if (event && !scoringView) {
    $('case-announcement').textContent = trials[active.trial].name + '. ' + $('case-question').textContent + ' ' + $('draft-label').textContent + '. ' + $('effect').textContent;
  }
}

$('toggle-draft').onclick = () => { location.hash = caseURL(active, selectedVariant === 'clean' ? 'conflict' : 'clean'); };
$('previous').onclick = () => { if (activeIndex > 0) location.hash = caseURL(changes[activeIndex - 1]); };
$('next').onclick = () => { if (activeIndex + 1 < changes.length) location.hash = caseURL(changes[activeIndex + 1]); };
document.querySelector('.skip').onclick = event => {
  event.preventDefault();
  $('workspace').focus();
  $('workspace').scrollIntoView();
};

$('browse').onclick = () => {
  const list = $('case-list');
  list.replaceChildren();
  for (const [id, trial] of Object.entries(trials)) {
    list.append(element('h3', trial.name + ' · ' + trial.area));
    for (const change of changes.filter(item => item.trial === id)) {
      const link = element('a', readings[change.slug].question, 'case-link');
      link.href = caseURL(change);
      if (change === active) link.setAttribute('aria-current', 'true');
      link.onclick = () => $('library').close();
      list.append(link);
    }
  }
  $('library').showModal();
};

for (const button of document.querySelectorAll('[data-close]')) {
  button.onclick = () => $(button.dataset.close).close();
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
}

function showQuickPrompt() {
  const index = quickRun.answers.length;
  $('quick-context').textContent = trials[quickRun.change.trial].name + ' · Draft ' + (index + 1) + ' of 2';
  $('prompt-text').value = reviewerPrompt(quickRun.order[index]);
  $('prompt-area').hidden = true;
  $('view-prompt').setAttribute('aria-expanded', 'false');
  $('view-prompt').textContent = 'View prompt';
  $('copy-prompt').textContent = 'Copy prompt';
  $('copy-status').textContent = index ? 'First answer saved. This is a different draft of the same rule.' : '';
  decisions.hidden = true;
  $('copy-prompt').focus({preventScroll:true});
}

$('start-quick').onclick = () => {
  const coin = crypto.getRandomValues(new Uint8Array(1))[0] % 2;
  quickRun = { change: active, order: pairOrder(active, Boolean(coin)), answers: [] };
  $('quick-stage').hidden = false;
  $('quick-result').hidden = true;
  $('quick').showModal();
  showQuickPrompt();
};
$('quick').addEventListener('close', () => { quickRun = null; });
$('quick-pack').onclick = () => $('quick').close();

function viewPrompt(visible) {
  $('prompt-area').hidden = !visible;
  $('view-prompt').setAttribute('aria-expanded', String(visible));
  $('view-prompt').textContent = visible ? 'Hide prompt' : 'View prompt';
  if (visible) decisions.hidden = false;
}
$('view-prompt').onclick = () => viewPrompt($('prompt-area').hidden);

$('copy-prompt').onclick = async () => {
  const run = quickRun;
  const step = run.answers.length;
  const stillCurrent = () => quickRun === run && run.answers.length === step && $('quick').open;
  try {
    await navigator.clipboard.writeText($('prompt-text').value);
    if (!stillCurrent()) return;
    $('copy-prompt').textContent = 'Copied';
    $('copy-status').textContent = 'Paste the prompt into your reviewer, then choose its answer.';
    decisions.hidden = false;
  } catch {
    if (!stillCurrent()) return;
    viewPrompt(true);
    $('prompt-text').focus();
    $('prompt-text').select();
    $('copy-status').textContent = 'Copy the selected text using your device’s copy command.';
  }
};

function showQuickResult(run) {
  const report = score({ pack_version:version, decisions:run.answers });
  const answers = run.change.ids.map(id => report.results.find(row => row.id === id));
  const correct = answers.filter(row => row.outcome === 'correct').length;
  $('quick-result-context').textContent = trials[run.change.trial].name + ' · Your reviewer’s answers';
  $('quick-total').textContent = correct + ' of 2 correct';
  const copy = {
    caught: 'Caught the error', missed: 'Missed the error', accepted: 'Passed the correct draft',
    falseAlarm: 'Flagged a correct draft', withheld: 'Abstained on this draft',
  };
  $('quick-findings').replaceChildren(...answers.map(row => {
    const node = element('div', undefined, 'quick-finding');
    let title = copy.withheld;
    if (row.decision === 'flag') title = row.expected === 'flag' ? copy.caught : copy.falseAlarm;
    if (row.decision === 'pass') title = row.expected === 'pass' ? copy.accepted : copy.missed;
    const draft = row.expected === 'flag' ? 'Draft with the error' : 'Correctly worded draft';
    node.append(element('strong', title), element('span', draft + ' · Expected ' + row.expected + ', received ' + row.decision + '.'));
    return node;
  }));
  $('quick-stage').hidden = true;
  $('quick-result').hidden = false;
  $('quick-total').focus({preventScroll:true});
}
for (const button of document.querySelectorAll('[data-decision]')) {
  button.onclick = () => {
    if (!quickRun || decisions.hidden || quickRun.answers.length >= 2) return;
    const id = quickRun.order[quickRun.answers.length];
    quickRun.answers.push({id, decision:button.dataset.decision});
    if (quickRun.answers.length === 2) showQuickResult(quickRun);
    else showQuickPrompt();
  };
}

function renderRows() {
  const filter = $('result-filter').value;
  const rows = currentReport.results.filter(row => filter === 'all' || filter === row.outcome || (filter === 'unanswered' && ['missing', 'abstain'].includes(row.outcome)));
  $('result-rows').replaceChildren(...rows.map(row => {
    const change = changes.find(item => item.slug === row.pair);
    const variant = row.expected === 'flag' ? 'conflict' : 'clean';
    const link = element('a', change.title);
    link.href = caseURL(change, variant);
    const titleCell = element('td');
    titleCell.append(link, element('small', trials[change.trial].name + ' · ' + row.id));
    const badge = element('span', outcomes[row.outcome], 'outcome ' + (row.outcome === 'correct' ? 'good' : 'warn'));
    const result = element('td'); result.append(badge);
    const tr = element('tr');
    tr.append(titleCell, element('td', decisionLabel[row.expected]), element('td', decisionLabel[row.decision]), result);
    return tr;
  }));
  $('empty-results').hidden = rows.length > 0;
}

function showReport(report, label, sample = false) {
  currentReport = report;
  currentLabel = label;
  currentComparison = null;
  $('results').hidden = false;
  $('result-context').hidden = !sample;
  $('detail-results').open = false;
  $('comparison').hidden = true;
  $('score-error').hidden = true;
  $('result-title').textContent = label;
  const tiles = [
    [report.caught + ' / ' + report.conflicts, 'Errors caught'],
    [report.falseAlarms + ' / ' + report.faithful, 'False alarms'],
    [report.pairsCorrect + ' / ' + report.pairs, 'Pairs correct'],
  ];
  $('metrics').replaceChildren(...tiles.map(([value, label]) => {
    const tile = element('div'); tile.append(element('strong', value), element('span', label)); return tile;
  }));
  $('coverage').textContent = report.correct + ' of ' + report.total + ' correct overall. ' + report.answered + ' decisions, ' + report.abstained + ' abstentions, ' + report.missing + ' missing.';
  $('result-filter').value = 'all';
  renderRows();
  $('results').focus({preventScroll:true});
  $('results').scrollIntoView({block:'start'});
}

function showComparison(later, label) {
  const delta = compare(currentReport, later);
  currentComparison = { name: label, report: later, changes: delta };
  const lines = [
    label + ' compared with ' + currentLabel + ' scored ' + later.correct + '/' + later.total + ' correct (previously ' + currentReport.correct + '/' + currentReport.total + ').',
    delta.gained.length + ' newly correct' + (delta.gained.length ? ' (' + delta.gained.join(', ') + ')' : '') + '.',
    delta.lost.length + ' previously correct cases lost' + (delta.lost.length ? ' (' + delta.lost.join(', ') + ')' : '') + '.',
  ];
  $('comparison').textContent = lines.join(' ');
  $('comparison').hidden = false;
  $('comparison').scrollIntoView({block:'nearest'});
}

let latestUpload = 0;
async function readPredictions(event, comparing) {
  const input = event.currentTarget;
  const file = input.files[0];
  if (!file) return;
  input.value = '';
  const request = ++latestUpload;
  $('score-error').hidden = true;
  try {
    if (file.size > 1048576) throw Error('Use a predictions file under 1 MB.');
    let submission;
    try { submission = JSON.parse(await file.text()); }
    catch { throw Error('This file is not valid JSON. Use the predictions template from the kit.'); }
    const report = score(submission);
    if (request !== latestUpload) return;
    if (comparing) showComparison(report, file.name);
    else showReport(report, file.name);
  } catch (error) {
    if (request !== latestUpload) return;
    $('score-error').textContent = error.message;
    $('score-error').hidden = false;
    $('score-error').scrollIntoView({block:'nearest'});
  }
}

$('upload').onchange = event => readPredictions(event, false);
$('compare-file').onchange = event => readPredictions(event, true);
$('result-filter').onchange = renderRows;
$('baseline').onclick = () => { latestUpload++; showReport(score(numericBaseline()), 'Number-only check', true); };
$('download-result').onclick = () => {
  const report = { name:currentLabel, ...currentReport, comparison:currentComparison };
  const blob = new Blob([JSON.stringify(report, null, 2)], {type:'application/json'});
  const link = element('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'amendment-replay-results.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
};

document.documentElement.classList.add('js');
window.addEventListener('hashchange', route);
route();
