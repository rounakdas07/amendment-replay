// Each rule paraphrases one documented change. Both downstream excerpts are authored examples.
export const version = '1.0.0';

export const trials = {
  checkmate: {
    name: 'CheckMate 214', area: 'Kidney cancer', registry: 'NCT02231749',
    publisher: 'Bristol Myers Squibb', document: 'Revised protocol 03',
    url: 'https://cdn.clinicaltrials.gov/large-docs/49/NCT02231749/Prot_001.pdf',
  },
  indigo: {
    name: 'INDIGO', area: 'Glioma', registry: 'NCT04164901',
    publisher: 'European Medicines Agency', document: 'Voranigo assessment report',
    url: 'https://www.ema.europa.eu/en/documents/assessment-report/voranigo-epar-public-assessment-report_en.pdf',
  },
  keynote: {
    name: 'KEYNOTE-024', area: 'Lung cancer', registry: 'NCT02142738',
    publisher: 'MSD', document: 'MK-3475-024 study report synopsis',
    url: 'https://portal.dimdi.de/data/ctr/O-2145_01-2-0-CE336C-20220110151635.pdf',
  },
  flaura: {
    name: 'FLAURA2', area: 'Lung cancer', registry: 'NCT04035486',
    publisher: 'European Medicines Agency', document: 'Tagrisso variation assessment',
    url: 'https://www.ema.europa.eu/en/documents/variation-report/tagrisso-h-c-004124-ii-0053-epar-assessment-report-variation_en.pdf',
  },
};

const cm14 = { trial: 'checkmate', amendment: 'Amendment 14', date: '2017-11-13', locator: 'Document history, p. 3', anchor: '#page=3' };
const cm13 = { ...cm14, amendment: 'Amendment 13', date: '2016-08-04' };
const ig1 = { trial: 'indigo', amendment: 'Amendment 1', date: '2020-03-09', locator: 'Table 20, p. 72', anchor: '#page=72' };
const ig2 = { ...ig1, amendment: 'Amendment 2', date: '2020-12-17', locator: 'Table 20, p. 73', anchor: '#page=73' };
const kn = { trial: 'keynote', anchor: '#search=Amendments%20to%20Protocol' };

export const changes = [
  {
    ...cm14, slug: 'two-year-stop', title: 'Stopping treatment at two years', area: 'Treatment duration', artifact: 'Site handbook',
    rule: 'Arm A patients [[may stop]] treatment after two years even if their cancer has not progressed and toxicity is acceptable.',
    conflict: 'Arm A patients who are doing well [[must stop]] treatment after two years.',
    clean: 'After two years, an Arm A patient without progression or unacceptable toxicity [[can choose to stop]] treatment.',
    impact: 'A site following this draft would take a choice away from patients who could continue treatment.',
    cleanWhy: 'The site keeps the two-year stopping option and leaves the decision open.',
    fix: 'Make stopping optional for Arm A patients who reach two years without progression or unacceptable toxicity.',
    ids: ['AR-617', 'AR-284'],
  },
  {
    ...ig1, slug: 'lamotrigine', title: 'A retired screening exclusion', area: 'Eligibility', artifact: 'Screening checklist',
    rule: 'Taking lamotrigine was [[removed as an exclusion]] from INDIGO.',
    conflict: 'A candidate taking lamotrigine [[fails medication screening]] on that basis alone.',
    clean: 'Lamotrigine use alone [[does not rule out]] a candidate. Continue checking the other criteria.',
    impact: 'The checklist could turn away a candidate who should still be assessed.',
    cleanWhy: 'The checklist removes this single exclusion while keeping the rest of screening intact.',
    fix: 'Remove the automatic screen failure for lamotrigine alone.',
    ids: ['AR-458', 'AR-903'],
  },
  {
    ...kn, amendment: 'P024-02 · Germany', date: '2014-11-07', locator: 'Amendments to Protocol, row P024-02',
    slug: 'germany-tb', title: 'A screening rule with a country boundary', area: 'Country scope', artifact: 'Site activation checklist',
    rule: 'The [[German amendment]] requires a tuberculosis test for everyone entering the trial at German sites.',
    conflict: 'Activate [[every site worldwide]] with a mandatory TB test for each entrant under P024-02.',
    clean: 'Under P024-02, [[all German sites]] must arrange a TB test for each participant at screening.',
    impact: 'The checklist exports a German requirement to sites outside that amendment’s scope.',
    cleanWhy: 'All entrants at German sites are covered, and the claim is confined to that amendment.',
    fix: 'Limit this amendment-specific instruction to German sites. Check other sites against their own requirements.',
    ids: ['AR-791', 'AR-346'],
  },
  {
    trial: 'flaura', amendment: 'Amendment 1', date: '2021-08-26', locator: 'Table 15, p. 57', anchor: '#page=57',
    slug: 'analysis-trigger', title: 'Two conditions for an analysis', area: 'Analysis timing', artifact: 'Data-cut checklist',
    rule: 'The primary analysis needs about 278 progression-free survival events [[and at least 16 months]] since the last patient entered.',
    conflict: 'Release the primary analysis at roughly 278 events [[or]] 16 months after the last patient entered, whichever occurs first.',
    clean: 'Release the analysis only when [[both]] the approximate 278-event target and the 16-month minimum since last enrolment have been met.',
    impact: 'Either trigger on its own could release the analysis before the amended conditions are met.',
    cleanWhy: 'The checklist requires both the event target and the follow-up minimum measured from last enrolment.',
    fix: 'Require both conditions and retain the last enrolment as the start of the follow-up clock.',
    ids: ['AR-238', 'AR-859'],
  },
  {
    ...cm14, slug: 'crossover-offer', title: 'An offer of crossover', area: 'Treatment assignment', artifact: 'Crossover worksheet',
    rule: 'Eligible participants originally assigned to sunitinib [[can enter]] the extension to receive nivolumab plus ipilimumab.',
    conflict: '[[Automatically transfer all]] participants originally assigned to sunitinib to nivolumab plus ipilimumab in the extension.',
    clean: '[[Offer eligible]] participants from the sunitinib arm the opportunity to enter the combination-treatment extension.',
    impact: 'The worksheet bypasses eligibility and treats an available crossover as an automatic transfer.',
    cleanWhy: 'The worksheet preserves eligibility and offers the extension as a choice.',
    fix: 'Check crossover eligibility and describe entry as an option.',
    ids: ['AR-524', 'AR-167'],
  },
  {
    ...ig1, slug: 'age-boundary', title: 'Which performance scale at age 16?', area: 'Age boundary', artifact: 'Screening form',
    rule: 'The Lansky performance scale was added for participants [[younger than 16]].',
    conflict: 'Assign the Lansky scale to participants [[aged 16 or younger]].',
    clean: 'Use the Lansky scale for participants [[aged 15 or younger]].',
    impact: 'A 16-year-old would be assigned a scale intended here for the younger group.',
    cleanWhy: 'Using age in completed years, 15 or younger is the same boundary as under 16.',
    fix: 'Set the Lansky threshold to under 16, in completed years.',
    ids: ['AR-682', 'AR-473'],
  },
  {
    ...kn, amendment: 'P024-01 · Global', date: '2014-10-16', locator: 'Amendments to Protocol, row P024-01',
    corroboration: 'https://www.clinicaltrialsregister.eu/ctr-search/trial/2014-000323-25/results',
    slug: 'kras-test', title: 'An obsolete optional test', area: 'Lab procedure', artifact: 'Laboratory manual',
    rule: 'The amendment [[removed optional KRAS testing]] from the study procedures.',
    conflict: 'Sites may [[still order the optional study KRAS test]] under this protocol.',
    clean: '[[Remove the optional KRAS order]] from the trial’s laboratory menu.',
    impact: 'Sites could order a research procedure that this amendment removed.',
    cleanWhy: 'The lab menu removes the study-specific order without making a claim about routine care.',
    fix: 'Remove the optional study KRAS order from this manual.',
    ids: ['AR-312', 'AR-948'],
  },
  {
    ...ig2, slug: 'death-as-event', title: 'Does death count as an event?', area: 'Endpoint definition', artifact: 'Analysis plan',
    rule: 'For time to next intervention, [[death counts as an event]].',
    conflict: 'If a participant dies before the next intervention, [[censor at death]] for this endpoint.',
    clean: 'For this endpoint, [[record an event]] if death occurs before a further intervention.',
    impact: 'The analysis would treat a defined endpoint event as a censored observation.',
    cleanWhy: 'Death before another intervention contributes an event under the revised definition.',
    fix: 'Count death as an event in the time-to-next-intervention analysis.',
    ids: ['AR-835', 'AR-291'],
  },
  {
    ...cm13, slug: 'co-primary-endpoint', title: 'Adding a co-primary endpoint', area: 'Endpoint hierarchy', artifact: 'Protocol synopsis',
    rule: 'Objective response rate was [[added as a co-primary endpoint]].',
    conflict: 'List objective response rate [[only among the secondary endpoints]].',
    clean: 'List objective response rate [[alongside the other co-primary endpoints]].',
    impact: 'The synopsis would give a primary measure the wrong standing.',
    cleanWhy: 'The synopsis gives response rate its revised rank alongside the existing co-primary endpoints.',
    fix: 'Identify objective response rate as an additional co-primary endpoint.',
    ids: ['AR-769', 'AR-153'],
  },
  {
    ...ig2, slug: 'repeat-assessment', title: 'Who needs a repeat Tanner assessment?', area: 'Assessment schedule', artifact: 'Visit schedule',
    rule: 'At cycle 1 day 1, assess Tanner stage in entrants aged 12–17. Repeat at intervals [[only if baseline stage is below 5]].',
    conflict: 'For entrants aged 12–17 assessed on cycle 1 day 1, repeat Tanner staging at intervals [[regardless of baseline stage]].',
    clean: 'Stage all entrants aged 12–17 on cycle 1 day 1. Schedule repeats for [[baseline Tanner stages 1 to 4]].',
    impact: 'The schedule would add repeat assessments for participants already at stage 5 at baseline.',
    cleanWhy: 'The schedule distinguishes the initial assessment from the subgroup needing repeats.',
    fix: 'Limit interval reassessment to those below stage 5 at the initial assessment.',
    ids: ['AR-426', 'AR-807'],
  },
  {
    ...kn, amendment: 'P024-06 · Global', date: '2016-07-29', locator: 'Amendments to Protocol, row P024-06',
    corroboration: 'https://www.clinicaltrialsregister.eu/ctr-search/trial/2014-000323-25/results',
    slug: 'progression-crossover', title: 'A removed crossover prerequisite', area: 'Crossover eligibility', artifact: 'Crossover request form',
    rule: 'Crossover from chemotherapy to pembrolizumab [[no longer required documented progression]].',
    conflict: '[[Reject a crossover request]] from chemotherapy to pembrolizumab if documented progression is missing.',
    clean: 'For chemotherapy-to-pembrolizumab crossover, [[documented progression is no longer a prerequisite]]. Check the other conditions.',
    impact: 'The form would block requests on a condition the amendment removed.',
    cleanWhy: 'The form removes the progression hurdle and leaves other conditions in place.',
    fix: 'Remove the mandatory progression-documentation field as a gate to crossover.',
    ids: ['AR-975', 'AR-368'],
  },
  {
    ...cm13, slug: 'survival-window', title: 'Follow-up outside a visit window', area: 'Visit windows', artifact: 'Follow-up instructions',
    rule: 'Additional survival data [[may be collected outside]] the original visit windows.',
    conflict: '[[Discard all]] additional survival updates received outside the original visit windows.',
    clean: '[[Accept supplementary]] survival updates obtained outside the scheduled windows.',
    impact: 'A site would discard survival information that the amendment allows it to collect.',
    cleanWhy: 'Additional survival information can be recorded outside the usual schedule.',
    fix: 'Allow out-of-window supplementary survival data while preserving the scheduled visits.',
    ids: ['AR-584', 'AR-632'],
  },
];

export const plain = text => text.replaceAll('[[', '').replaceAll(']]', '');
export const sourceURL = change => trials[change.trial].url + change.anchor;
