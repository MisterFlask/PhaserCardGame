// Pure, Phaser-free home for the infirmary rush-treatment price — the
// missing healing-throughput lever flagged by the economy balance pass (see
// CampaignSimulator.test.ts's "no-free-hoarding" -> T2 describe block: wound-
// attrition throughput starvation on small rosters is a structural effect
// wages alone can only partially offset). Lives here (not in
// CampaignUiState.ts, where RECRUIT_COST/getTherapyCost's base costs live)
// so CampaignSimulator.ts — which must stay Phaser-free per house rule 1 —
// can import the real constant instead of hand-duplicating it like
// SIM_RECRUIT_COST/SIM_ROSTER_CAP do for their CampaignUiState counterparts.
//
// £ per week of weeksWoundedRemaining removed at the Barracks. Repeatable
// per click: one click = one week = this many £, down to 0 weeks.
//
// Frontier tried against CampaignSimulator.test.ts's T2 ratchet
// (roster-5-vs-roster-8 head-to-head parity, see that file's "no-free-
// hoarding" -> "T2 (rush-healing)" test): £20, £15, and £10/week were all
// measured across large (300-seed-pair), same-process samples and landed
// within noise of each other — none reliably closed the roster-5-vs-8
// parity gap; the mechanism measured flat to slightly negative for
// roster 5's own economy at every price tried (see that test's comment for
// the root-cause analysis — the sim's full-squad-wipe-on-loss rule
// disproportionately taxes the extra sorties this lever unlocks on a small
// roster). Since price didn't move the outcome, £20 was kept as the
// simplest, most legible number rather than chasing a marginal difference
// inside the noise band. See BarracksPanel.ts for the UI that spends it.
export const RUSH_TREATMENT_COST_PER_WEEK = 20;
