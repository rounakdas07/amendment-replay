import { changes, trials, sourceURL } from './data/corpus.mjs';
import { score, compare, numericBaseline } from './scoring.mjs';

const $ = id => document.getElementById(id);
const outcomes = { correct: 'Correct', missed: 'Missed conflict', 'false-alarm': 'False alarm', abstain: 'Abstained', missing: 'Missing' };
const decisionLabel = { flag: 'Flag', pass: 'Pass', missing: '—', abstain: 'Abstain' };
const caseURL = (change, variant = 'conflict') => '#case/' + change.slug + (variant === 'clean' ? '/clean' : '');
let active = changes[0];
let activeIndex = 0;
let currentReport;
let currentLabel;
let currentComparison;
let scoringView = false;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function highlight(target, text) {
  const pieces = text.split(/\[\[(.*?)\]\]/g);
  target.replaceChildren(...pieces.map((piece, i) => i % 2 ? element('mark', piece) : document.createTextNode(piece)));
}

function sourceLabel(change) {
  const page = change.locator.match(/p\. (\d+)/);
  if (page) return 'Read amendment · p. ' + page[1] + ' ↗';
  return 'Read amendment · ' + change.amendment.split(' · ')[0] + ' ↗';
}

function renderCase(index, variant) {
  activeIndex = index;
  active = changes[index];
  const trial = trials[active.trial];
  const clean = variant === 'clean';
  $('position').textContent = String(index + 1).padStart(2, '0') + ' of ' + changes.length;
  $('hero-kicker').replaceChildren(trial.name + ' ', element('span', '·'), ' ' + trial.area);
  $('case-title').textContent = active.title;
  $('hero-sub').textContent = 'Compare a published protocol change with a draft ' + active.artifact.toLowerCase() + '.';
  $('registry').textContent = trial.registry + ' ↗';
  $('registry').href = 'https://clinicaltrials.gov/study/' + trial.registry;
  $('amendment').textContent = active.amendment;
  $('record-date').textContent = new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(active.date));
  $('source').href = sourceURL(active);
  $('source').textContent = sourceLabel(active);
  $('source').title = trial.publisher + ' · ' + trial.document + ' · ' + active.locator;
  $('draft-heading').textContent = active.artifact;
  highlight($('rule'), active.rule);
  highlight($('draft'), active[variant]);
  $('variant-conflict').setAttribute('aria-pressed', String(!clean));
  $('variant-clean').setAttribute('aria-pressed', String(clean));
  document.querySelector('.draft-doc').classList.toggle('faithful', clean);
  $('verdict').classList.toggle('good', clean);
  $('verdict-icon').textContent = clean ? '✓' : '!';
  $('verdict-title').textContent = clean ? 'Pass this draft' : 'Flag this draft';
  $('impact').textContent = clean ? active.cleanWhy : active.impact;
  $('previous').disabled = index === 0;
  $('next').textContent = index === changes.length - 1 ? 'First case ↺' : 'Next case →';
  $('nav-replay').href = caseURL(active, variant);
  document.title = active.title + ' · Amendment Replay';
}

function route() {
  const parts = location.hash.slice(1).split('/');
  const wasScore = scoringView;
  scoringView = parts[0] === 'score';
  $('score-view').hidden = !scoringView;
  $('replay-view').hidden = scoringView;
  for (const [id, current] of [['nav-score', scoringView], ['nav-replay', !scoringView]]) {
    if (current) $(id).setAttribute('aria-current', 'page');
    else $(id).removeAttribute('aria-current');
  }
  if (scoringView) document.title = 'Score a reviewer · Amendment Replay';
  else {
    const index = parts[0] === 'case' ? changes.findIndex(change => change.slug === parts[1]) : 0;
    renderCase(Math.max(0, index), parts[2] === 'clean' ? 'clean' : 'conflict');
  }
  if (wasScore !== scoringView) {
    window.scrollTo(0, 0);
    $('workspace').focus({preventScroll:true});
  }
}

function goToCase(change) {
  location.hash = caseURL(change);
  $('workspace').focus({preventScroll:true});
  window.scrollTo(0, 0);
}

$('variant-conflict').onclick = () => { location.hash = caseURL(active); };
$('variant-clean').onclick = () => { location.hash = caseURL(active, 'clean'); };
$('previous').onclick = () => { if (activeIndex > 0) goToCase(changes[activeIndex - 1]); };
$('next').onclick = () => goToCase(changes[(activeIndex + 1) % changes.length]);
$('browse').onclick = () => {
  const list = $('case-list');
  list.replaceChildren();
  for (const [id, trial] of Object.entries(trials)) {
    list.append(element('h3', trial.name + ' · ' + trial.area));
    for (const change of changes.filter(item => item.trial === id)) {
      const link = element('a', change.title, 'case-link');
      link.href = caseURL(change);
      if (change === active) link.setAttribute('aria-current', 'true');
      link.onclick = () => { $('library').close(); window.scrollTo(0, 0); };
      list.append(link);
    }
  }
  $('library').showModal();
};
$('close-library').onclick = () => $('library').close();
$('library').onclick = event => { if (event.target === $('library')) {
  const box = $('library').getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) $('library').close();
} };

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

function showReport(report, label) {
  currentReport = report;
  currentLabel = label;
  currentComparison = null;
  $('results').hidden = false;
  $('comparison').hidden = true;
  $('score-error').hidden = true;
  $('result-title').textContent = label;
  const tiles = [
    [report.caught + ' / ' + report.conflicts, 'Conflicts caught'],
    [report.falseAlarms + ' / ' + report.faithful, 'Faithful drafts wrongly flagged'],
    [report.pairsCorrect + ' / ' + report.pairs, 'Pairs fully correct'],
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
    label + ' compared with ' + currentLabel + ': ' + later.correct + '/' + later.total + ' correct (previously ' + currentReport.correct + '/' + currentReport.total + ').',
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
$('baseline').onclick = () => { latestUpload++; showReport(score(numericBaseline()), 'Number-only check'); };
$('download-result').onclick = () => {
  const report = { name:currentLabel, ...currentReport, comparison:currentComparison };
  const blob = new Blob([JSON.stringify(report, null, 2)], {type:'application/json'});
  const link = element('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'amendment-replay-results.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
};

window.addEventListener('hashchange', route);
route();
