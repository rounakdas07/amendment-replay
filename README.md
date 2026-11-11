# Amendment Replay

Would a protocol reviewer notice that a site handbook changed **may stop treatment** to **must stop treatment**? In CheckMate 214, that one word would take a choice away from a patient who could continue. [Open the worked example](https://rounakdas07.github.io/amendment-replay/) · [Original amendment, page 3](https://cdn.clinicaltrials.gov/large-docs/49/NCT02231749/Prot_001.pdf#page=3)

A public test pack for clinical trial teams evaluating a protocol reviewer. Each real rule change has two original downstream excerpts, one with a consequential discrepancy and one that faithfully restates it. Run both to catch misses and false alarms after a prompt, model or workflow update.

## Try the pack

1. [Download the blind reviewer kit](https://rounakdas07.github.io/amendment-replay/pack/reviewer-kit.zip). It contains 24 cases as JSON Lines, a short reviewer instruction and a predictions template. Each case includes the rule, an illustrative draft, a source link and a locator.
2. Give your reviewer **one case at a time** in fresh contexts, using the same instructions. Fill the supplied template with `flag`, `pass` or `abstain`. Keep sibling examples and the answer key out of the reviewer context.
3. [Score the predictions locally in your browser](https://rounakdas07.github.io/amendment-replay/#score). Click a decision to inspect the case. Load a second run to identify newly correct and newly lost cases. Results can be exported as JSON.

The example **number-only check** runs real, deterministic code. It compares the sets of digit sequences in the reference and draft. It catches 2 of 12 conflicts and incorrectly flags 3 of 12 faithful drafts. It illustrates why “may” versus “must” and “under 16” versus “15 or younger” need meaning-aware review.

## Evidence

| Trial | Changes | Primary amendment evidence |
| --- | ---: | --- |
| CheckMate 214 · renal cell carcinoma | 4 | [Bristol Myers Squibb, revised protocol 03, document history p. 3](https://cdn.clinicaltrials.gov/large-docs/49/NCT02231749/Prot_001.pdf#page=3) |
| INDIGO · glioma | 4 | [EMA Voranigo assessment, table 20, pp. 72–73](https://www.ema.europa.eu/en/documents/assessment-report/voranigo-epar-public-assessment-report_en.pdf#page=72) |
| KEYNOTE-024 · non-small cell lung cancer | 3 | [Sponsor study report, “Amendments to Protocol”, P024-01, -02 and -06](https://portal.dimdi.de/data/ctr/O-2145_01-2-0-CE336C-20220110151635.pdf#search=Amendments%20to%20Protocol) · [EU trial results, global amendments](https://www.clinicaltrialsregister.eu/ctr-search/trial/2014-000323-25/results) |
| FLAURA2 · non-small cell lung cancer | 1 | [EMA Tagrisso variation assessment, table 15, p. 57](https://www.ema.europa.eu/en/documents/variation-report/tagrisso-h-c-004124-ii-0053-epar-assessment-report-variation_en.pdf#page=57) |

The twelve items are individual rule changes. Several belong to the same formal amendment. Amendment dates follow the cited document. For KEYNOTE-024, these are the sponsor's finalisation dates. The scope of the German screening case is the country-specific instrument.

## Reproducibility

The static app has no backend, accounts, analytics, build step or API keys. The browser and command line import the same scoring module. Serve the repository root with `python3 -m http.server 8000`, then open `http://localhost:8000`.

With Node 18 or later, run:

~~~sh
node tools/score.mjs --baseline
node tools/score.mjs predictions.json
node --test tools/tests.mjs
~~~

Metrics use the complete pack as denominator, including missing cases. “Conflicts caught” counts correct flags on the 12 conflicting drafts. “False alarms” counts flags on the 12 faithful drafts. Both members must be correct for a matched pair to pass. Missing and explicit abstentions earn no credit and are reported separately. A comparison lists IDs that changed from incorrect or unanswered to correct, and vice versa. Results say nothing about failures to retrieve evidence from a full protocol. Here the reference rule is supplied.

The versioned public inputs are in [pack/cases.jsonl](pack/cases.jsonl). The [answer key](pack/answer-key.json) includes a decision, a reason, a locator and a correction for each conflict. The blind ZIP excludes the answer key. To regenerate the pack from [the source ledger](data/corpus.mjs), run `node tools/build-pack.mjs` followed by `python3 tools/package_kit.py`.

## Scope

Independent research prototype by Rounak Das, inspired by [Cori Clinical’s public description of amendment-based reviewer evaluation](https://www.cori-clinical.com/news/cori-clinical-raises-4m-seed-round). The reference rules paraphrase historical documents. All downstream examples were written for the exercise. They do not document actual errors by the sponsors, sites or Cori. This small public practice set has no independent clinical adjudication. Use unseen, independently reviewed examples for performance claims. It is not for patient care or trial conduct.
