// These short phrases are display summaries. The full source rule and unlabelled
// test drafts live in corpus.mjs and are used verbatim in reviewer prompts.
export const readings = {
  'two-year-stop': {
    question: 'After two years, does treatment have to stop?',
    rule: 'May stop', conflict: 'Must stop', clean: 'Can choose to stop',
    impact: 'This handbook would make a site stop treatment even when a patient in Arm A could continue.',
    cleanImpact: 'A patient in Arm A can still choose whether to stop after two years.',
  },
  lamotrigine: {
    question: 'Does taking lamotrigine rule someone out?',
    rule: 'Keep screening', conflict: 'Exclude the patient', clean: 'Keep screening',
    impact: 'The checklist could turn away a candidate solely for taking lamotrigine, even though that exclusion was removed.',
    cleanImpact: 'The site can assess the remaining criteria without excluding someone for taking lamotrigine alone.',
  },
  'germany-tb': {
    question: 'Where does this TB screening rule apply?',
    rule: 'German sites', conflict: 'All sites worldwide', clean: 'Sites in Germany',
    impact: 'A site outside Germany could order a TB test solely because of a rule written for German sites.',
    cleanImpact: 'Every entrant at a German site gets the screening test required by the local amendment.',
  },
  'analysis-trigger': {
    question: 'When can the primary analysis begin?',
    rule: 'Both conditions', conflict: 'Either condition', clean: 'Both conditions',
    impact: 'The analysis could start after the event target is reached, before the last enrollee has 16 months of follow-up.',
    cleanImpact: 'The analysis waits for both the event target and the minimum follow-up period.',
  },
  'crossover-offer': {
    question: 'Who moves into the treatment extension?',
    rule: 'Offer to eligible patients', conflict: 'Move everyone', clean: 'Invite eligible patients',
    impact: 'The worksheet would move everyone from the sunitinib arm into the extension without checking eligibility or offering a choice.',
    cleanImpact: 'Eligible participants can decide whether to enter the extension.',
  },
  'age-boundary': {
    question: 'Who should receive the Lansky assessment?',
    rule: 'Under 16', conflict: '16 and under', clean: '15 and under',
    impact: 'The form puts 16-year-olds in the younger assessment group. The published cutoff is under 16.',
    cleanImpact: 'Using age in completed years, “15 and under” assigns exactly the same group as “under 16”.',
  },
  'kras-test': {
    question: 'Can sites still order the optional study KRAS test?',
    rule: 'Remove the test', conflict: 'Keep offering it', clean: 'Remove the order',
    impact: 'A site could order a study test that was removed from the protocol.',
    cleanImpact: 'The lab menu reflects the removal of the optional research test.',
  },
  'death-as-event': {
    question: 'What if someone dies before the next intervention?',
    rule: 'Count an event', conflict: 'Censor at death', clean: 'Record an event',
    impact: 'The analysis would leave a death out of the event count for this endpoint.',
    cleanImpact: 'A death before another intervention counts as an event under the revised definition.',
  },
  'co-primary-endpoint': {
    question: 'How should the trial list objective response rate?',
    rule: 'Co-primary', conflict: 'Secondary only', clean: 'Co-primary',
    impact: 'Readers of the synopsis would see a primary measure presented as secondary.',
    cleanImpact: 'The synopsis gives response rate its amended standing alongside the other co-primary endpoints.',
  },
  'repeat-assessment': {
    question: 'Who needs repeat Tanner staging?',
    rule: 'Baseline stage below 5', conflict: 'Every baseline stage', clean: 'Baseline stages 1–4',
    impact: 'Some adolescents would be scheduled for repeat assessments even though they were already at stage 5.',
    cleanImpact: 'Only adolescents in the specified age group below stage 5 at baseline are scheduled for repeats.',
  },
  'progression-crossover': {
    question: 'Must progression be documented before crossover?',
    rule: 'No longer required', conflict: 'Required to switch', clean: 'No longer required',
    impact: 'The form would block a chemotherapy-to-pembrolizumab request for a prerequisite the amendment removed.',
    cleanImpact: 'The site can consider the request against the remaining crossover conditions.',
  },
  'survival-window': {
    question: 'Can an extra survival update arrive between visits?',
    rule: 'May collect it', conflict: 'Discard it', clean: 'Accept the update',
    impact: 'The site would throw away follow-up information the amended protocol allows it to record.',
    cleanImpact: 'A site can keep supplementary survival updates outside the scheduled windows.',
  },
};
