#!/usr/bin/env node
// scripts/qa-longplay.mjs — ONE-OFF QA tool (not committed to CI, not a
// gameplay change). The first full-campaign longplay: drives an entire
// 40-quarter (10-year charter) run in headless Chromium through the REAL
// engine — real panels, real button clicks, real SortieManager/CombatScene
// flow — so every year-gated system (act-4 unlock at year 7, retainer
// unlocks, Chartered Partner, prestige commissions, charter buyback,
// Levi-Maxwell stages, stress thresholds, deck-cap swaps, dividend
// escalation, the ending screen) gets exercised for the first time outside
// isolated unit tests / the pure CampaignSimulator.
//
// Follows the qa-spawn.mjs / ci-smoke.mjs harness pattern: a tiny static
// file server + puppeteer, with all the actual driving logic living in an
// in-page `page.evaluate` async function (so it can poll/emit synthetic
// Phaser events the same way SmokeTest.ts does).
//
// Usage: node scripts/qa-longplay.mjs   (build first: npm run build)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// 25-minute wall-clock cap per the task brief, plus headroom for boot/report.
// Overridable via QA_LONGPLAY_BUDGET_MS for a quick smoke run of the driver
// itself before committing to a full 25-minute pass.
const RUN_BUDGET_MS = Number(process.env.QA_LONGPLAY_BUDGET_MS) || 25 * 60 * 1000;
const OVERALL_TIMEOUT_MS = RUN_BUDGET_MS + 5 * 60 * 1000;
const BOOT_TIMEOUT_MS = 60 * 1000;
// QA_LONGPLAY_TIMEWARP=1: compress idle weeks between sorties through the
// real CampaignUiState.advanceWeeks API so year-gated content (act 4 @ y7,
// buyback @ y8, Levi-Maxwell stages, charter expiry @ y11) is reachable
// within the wall-clock budget. See the in-page driver's TIMEWARP comment.
const TIMEWARP = process.env.QA_LONGPLAY_TIMEWARP === '1';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.map': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.ogg': 'audio/ogg', '.css': 'text/css; charset=utf-8',
};
const contentTypeFor = p => MIME_TYPES[path.extname(p).toLowerCase()] ?? 'application/octet-stream';

function startServer() {
    const server = http.createServer((req, res) => {
        try {
            const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
            const resolved = path.normalize(path.join(REPO_ROOT, urlPath === '/' ? '/index.html' : urlPath));
            if (!resolved.startsWith(REPO_ROOT)) { res.writeHead(403); res.end(); return; }
            fs.readFile(resolved, (err, data) => {
                if (err) { res.writeHead(404); res.end(); return; }
                res.writeHead(200, { 'Content-Type': contentTypeFor(resolved) });
                res.end(data);
            });
        } catch (e) { res.writeHead(500); res.end(String(e)); }
    });
    return new Promise((resolve, reject) => {
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}

// ---------------------------------------------------------------------------
// In-page driver. Everything below runs inside the browser via page.evaluate,
// so it can only use browser globals + the window.* debug hooks registered in
// src/screens/CombatAndMapScene.ts. Kept as one big function (rather than
// several evaluate() round-trips) so state (findings log, iteration counter)
// stays local without needing to round-trip through page.exposeFunction.
// ---------------------------------------------------------------------------
async function runLongplayInPage(runBudgetMs, bootTimeoutMs, timewarp) {
    /* eslint-disable no-undef */
    const startedAt = Date.now();
    const timeLeft = () => runBudgetMs - (Date.now() - startedAt);

    const findings = [];
    const note = (kind, detail) => {
        findings.push({ t: Date.now() - startedAt, kind, detail });
        console.log(`[LONGPLAY:${kind}] ${detail}`);
    };

    const wait = (pred, ms, desc) => new Promise((resolve, reject) => {
        const t0 = Date.now();
        const tick = () => {
            try {
                if (pred()) { resolve(); return; }
            } catch (e) {
                reject(e); return;
            }
            if (Date.now() - t0 > ms) { reject(new Error('timeout waiting for: ' + desc)); return; }
            setTimeout(tick, 120);
        };
        tick();
    });
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const findIn = (list, pred) => {
        for (const o of list) {
            if (!o) continue;
            try { if (pred(o)) return o; } catch { /* ignore */ }
            if (Array.isArray(o.list)) {
                const found = findIn(o.list, pred);
                if (found) return found;
            }
        }
        return null;
    };
    const activeScene = () => window.game.scene.getScenes(true)[0];
    const sceneKey = () => activeScene() ? activeScene().scene.key : '(none)';
    const findInActiveScene = pred => {
        const s = activeScene();
        return s ? findIn(s.children.list, pred) : null;
    };

    const gs = () => window.getGameState();
    const cs = () => window.getCampaignState();

    // -----------------------------------------------------------------
    // Milestone tracking: recorded once each, the first time observed.
    // -----------------------------------------------------------------
    const milestones = {};
    const markMilestone = (key, detail) => {
        if (milestones[key]) return;
        milestones[key] = { t: Date.now() - startedAt, detail };
        note('MILESTONE', `${key}: ${detail}`);
    };

    function checkYearMilestones() {
        const campaign = cs();
        const year = campaign.calendar.year;
        const gameState = gs();

        if (year >= 3) {
            const anyPrestige = campaign.availableContracts.some(c => c.isPrestige);
            if (anyPrestige) markMilestone('prestige_seen', `Prestige Commission on board at year ${year}`);
        }
        if (year >= 4) {
            const lm = [...campaign.availableStrategicProjects, ...campaign.ownedStrategicProjects]
                .find(p => p.name === 'Levi-Maxwell Ascension Protocol');
            if (lm) markMilestone('levimaxwell_pool', `Levi-Maxwell in pool/owned at year ${year}`);
        }
        // Act 4 unlocks at year >= 7 OR contractsCompleted >= 28
        // (ContractGenerator's act ladder, line ~482) — check unconditionally.
        const anyAct4 = campaign.availableContracts.some(c => c.act === 4);
        if (anyAct4) markMilestone('act4_seen',
            `Act-4 (Brimstone Badlands) contract on board at year ${year} (${campaign.contractsCompleted} contracts completed)`);
        // Retainer standing orders actually enacted (not just threshold met).
        const RETAINER_ORDER_IDS = ['civil-works-schedule', 'underwriting-retainer', 'preferred-lading-rates',
            'officers-mess-account', 'plant-and-equipment-lease', 'ossuary-death-benefit'];
        try {
            const ordersState = window.getStandingOrdersState();
            (ordersState.activeOrderIds || []).filter(id => RETAINER_ORDER_IDS.includes(id)).forEach(id =>
                markMilestone('retainer_enacted_' + id, `Client retainer order "${id}" is ACTIVE at year ${year}`));
        } catch { /* hook absent */ }
        // Levi-Maxwell stage purchases.
        const lmOwned = campaign.ownedStrategicProjects.find(p => p.name === 'Levi-Maxwell Ascension Protocol');
        if (lmOwned && typeof lmOwned.stagesPurchased === 'number' && lmOwned.stagesPurchased > 0) {
            markMilestone('levimaxwell_stage_' + lmOwned.stagesPurchased,
                `Levi-Maxwell stage ${lmOwned.stagesPurchased} purchased (year ${year})`);
        }
        if (year >= 8 && campaign.isCharterBuybackUnlocked()) {
            markMilestone('buyback_unlocked', `Charter Buyback unlocked at year ${year}`);
        }
        Object.entries(campaign.contractsCompletedByClient || {}).forEach(([client, count]) => {
            if (count >= 3) markMilestone('retainer_threshold_' + client, `${client}: ${count} completions (retainer unlock threshold met)`);
            if (count >= 6) markMilestone('chartered_partner_' + client, `${client}: ${count} completions (Chartered Partner +10% threshold met)`);
        });
        (campaign.roster || []).forEach(soldier => {
            const trauma = (soldier.cardsInMasterDeck || []).find(c =>
                ['Berserk', 'Greedy', 'Idolatrous', 'Vain', 'Paranoid'].includes(c.name));
            if (trauma) markMilestone('trauma_' + soldier.name, `${soldier.name} carries trauma card "${trauma.name}" (stress threshold fired)`);
        });
        if (gameState.moneyInVault < 0) note('ANOMALY', `Negative vault: £${gameState.moneyInVault} at year ${year} q${campaign.calendar.quarterOfYear}`);
        if (Number.isNaN(gameState.moneyInVault)) note('ANOMALY', `NaN vault at year ${year}`);
    }

    // -----------------------------------------------------------------
    // Small UI helpers, modeled on SmokeTest.ts's patterns.
    // -----------------------------------------------------------------
    function dismissBlockingPopups() {
        const scene = activeScene();
        if (!scene) return [];
        const dismissed = [];
        const doneButton = findIn(scene.children.list, o => o.textBoxName === 'doneButton');
        if (doneButton) { doneButton.emit('pointerdown'); dismissed.push('reward-done'); }
        const eventChoice = findIn(scene.children.list, o => o.constructor && o.constructor.name === 'EventButton');
        if (eventChoice) { eventChoice.emit('pointerdown'); dismissed.push('event-choice'); }
        return dismissed;
    }

    function mapButtonReadyToAdvance() {
        const btn = findInActiveScene(o => o.textBoxName === 'mapButton');
        const label = btn && btn.getText ? btn.getText() : '';
        return label.includes('Continue') || label.includes('Return to HQ');
    }

    async function winActiveSortie() {
        let guard = 0;
        const GUARD_MAX = 1200; // generous: hidden-tab timers can be slow (see CLAUDE.md sharp edges); outer wall-clock budget is the real backstop.
        while (sceneKey() === 'CombatScene' && guard < GUARD_MAX) {
            guard++;
            try {
                const state = gs();
                (state.combatState.enemies || []).forEach(e => { e.hitpoints = 0; });
            } catch (e) { note('ERROR', 'zeroing enemies: ' + String(e && e.message || e)); }
            dismissBlockingPopups();
            if (mapButtonReadyToAdvance()) {
                dismissBlockingPopups();
                await sleep(120);
                dismissBlockingPopups();
                const mb = findInActiveScene(o => o.textBoxName === 'mapButton');
                if (mb) { mb.emit('pointerdown'); mb.emit('pointerup'); }
            }
            await sleep(150);
        }
        if (sceneKey() === 'CombatScene') {
            throw new Error('winActiveSortie: still in CombatScene after guard exhausted');
        }
    }

    async function fileDebriefIfPending() {
        for (let i = 0; i < 60; i++) {
            const scene = activeScene();
            if (!scene) { await sleep(150); continue; }
            const btn = findIn(scene.children.list, o => o.getText && typeof o.getText === 'function'
                && (o.getText() || '').includes('File the Report'));
            if (btn) { btn.emit('pointerdown'); await sleep(150); continue; }
            // no button found: either not mounted yet, or already filed.
            break;
        }
    }

    /** Resolves all pending promotions via the REAL PromotionPanel flow:
     *  click the first card choice, dismiss any perk-reveal Continue button,
     *  repeat until the queue is empty. Falls back to window.applyPromotion
     *  only if the panel never renders a clickable choice within budget
     *  (reported as a finding either way). */
    async function resolvePromotionsViaPanel() {
        const campaign = cs();
        const pendingLevelsOf = c => window.Leveling.pendingLevels(c);
        const totalPending = () => campaign.roster.reduce((sum, c) => sum + pendingLevelsOf(c), 0);
        const startingPending = totalPending();
        if (startingPending === 0) return { resolved: 0, method: 'none' };

        let resolvedCount = 0;
        let usedFallback = false;
        const budgetMs = Math.max(20000, startingPending * 20000);
        const t0 = Date.now();

        while (totalPending() > 0 && (Date.now() - t0) < budgetMs) {
            // Make sure we're actually on the promotion panel.
            if (sceneKey() === 'HqScene') {
                const hq = window.game.scene.getScene('HqScene');
                hq.events.emit('navigate', 'promotion');
            }
            await sleep(200);
            const scene = activeScene();
            if (!scene) { await sleep(200); continue; }

            const continueBtn = findIn(scene.children.list, o => o.textBoxName === 'promotionContinue');
            if (continueBtn) { continueBtn.emit('pointerdown'); await sleep(200); continue; }

            const cardChoice = findIn(scene.children.list, o => o.name === 'promotionCardChoice');
            if (cardChoice) { cardChoice.emit('pointerdown'); resolvedCount++; await sleep(250); continue; }

            const swapChoice = findIn(scene.children.list, o => o.name === 'promotionSwapCardChoice');
            if (swapChoice) {
                markMilestone('deck_cap_swap', 'Deck-at-cap swap picker hit during a real promotion (a card must be mustered out)');
                swapChoice.emit('pointerdown');
                await sleep(250);
                continue;
            }

            // Nothing clickable found yet — either still mounting or queue
            // actually empty (loop condition will exit next check).
            await sleep(200);
        }

        if (totalPending() > 0) {
            // Fallback: mutate directly via window.applyPromotion, picking
            // the first generated reward card each time, so the run isn't
            // blocked on a UI-driving bug. Reported as a finding.
            usedFallback = true;
            let guard = 0;
            while (totalPending() > 0 && guard < 200) {
                guard++;
                const soldier = campaign.roster.find(c => pendingLevelsOf(c) > 0);
                if (!soldier) break;
                const newLevel = soldier.level + 1;
                const rewards = window.CardRewardsGenerator.getInstance().generateCardRewardsForLevelUp(soldier, newLevel);
                const pick = rewards[0];
                if (!pick) break;
                window.applyPromotion(soldier, pick);
                resolvedCount++;
            }
            note('FALLBACK', `promotions: panel-driving stalled after ${resolvedCount} picks; fell back to window.applyPromotion for the remainder`);
        }

        return { resolved: resolvedCount, method: usedFallback ? 'fallback' : 'panel' };
    }

    // -----------------------------------------------------------------
    // Strategic-layer actions, each using the real panel's button objects.
    // -----------------------------------------------------------------

    function navigate(dest) {
        if (sceneKey() !== 'HqScene') return false;
        window.game.scene.getScene('HqScene').events.emit('navigate', dest);
        return true;
    }

    /** Heals wounds: prefers the real Rush Treatment purchase path
     *  (Barracks button) when the vault can afford it; falls back to a
     *  direct mutation (documented fallback per task brief) for anyone the
     *  vault can't cover, so the roster doesn't rot waiting on funds. */
    async function healWoundsPreferringPurchase() {
        const campaign = cs();
        const wounded = campaign.roster.filter(c => c.weeksWoundedRemaining > 0);
        if (wounded.length === 0) return;
        navigate('barracks');
        await sleep(150);
        const barracks = window.game.scene.getScene('HqScene').children.list
            .find(o => o.constructor && o.constructor.name === 'BarracksPanel');
        // BarracksPanel requires clicking the soldier row first to select
        // them, then the rush-treatment row appears. Do this for every
        // wounded soldier the vault can afford, several clicks each
        // (rush treatment removes 1 week per click).
        for (const soldier of wounded) {
            let attempts = 0;
            while (soldier.weeksWoundedRemaining > 0 && attempts < 30) {
                attempts++;
                const scene = window.game.scene.getScene('HqScene');
                const rows = scene.children.list;
                // Re-find the panel each loop (it rebuilds on every click).
                const soldierRow = findIn(rows, o => o.getText && typeof o.getText === 'function'
                    && (o.getText() || '').includes(soldier.name) && (o.getText() || '').includes(soldier.characterClass.name));
                if (soldierRow) { soldierRow.emit('pointerdown'); await sleep(120); }
                const rushRow = findIn(scene.children.list, o => o.getText && typeof o.getText === 'function'
                    && (o.getText() || '').includes('Rush Treatment') && (o.getText() || '').includes(soldier.name));
                if (rushRow && gs().moneyInVault >= 20) {
                    rushRow.emit('pointerdown');
                    await sleep(150);
                } else {
                    break; // can't afford via purchase path; fall back below.
                }
            }
            if (soldier.weeksWoundedRemaining > 0) {
                soldier.weeksWoundedRemaining = 0;
                note('FALLBACK', `${soldier.name}: rush-treatment purchase path insufficient (funds/UI); healed via direct mutation`);
            }
        }
    }

    /** Hires via the real Barracks flow while roster < 6 and vault affords it. */
    async function ensureMinRosterViaHiring(minRoster) {
        const campaign = cs();
        let guard = 0;
        while (campaign.roster.length < minRoster && guard < 10) {
            guard++;
            navigate('barracks');
            await sleep(200);
            campaign.ensureRecruitsPopulated();
            const scene = window.game.scene.getScene('HqScene');
            const hireBtn = findIn(scene.children.list, o => o.getText && typeof o.getText === 'function'
                && (o.getText() || '').startsWith('Hire ('));
            if (!hireBtn) { note('FINDING', 'ensureMinRosterViaHiring: no Hire button found'); break; }
            const before = campaign.roster.length;
            hireBtn.emit('pointerdown');
            await sleep(200);
            if (campaign.roster.length === before) {
                note('FINDING', `ensureMinRosterViaHiring: hire click did not grow roster (vault £${gs().moneyInVault}); stopping hiring this pass`);
                break;
            }
        }
    }

    /** Enacts one Standing Order via the real Investment panel if a slot is free. */
    async function enactStandingOrderIfSlotFree() {
        navigate('investment');
        await sleep(150);
        const scene = window.game.scene.getScene('HqScene');
        const investmentPanel = scene.children.list.find(o => o.constructor && o.constructor.name === 'InvestmentPanel');
        if (!investmentPanel) return;
        // Switch to the STANDING ORDERS tab.
        const tabBtn = findIn(scene.children.list, o => o.getText && typeof o.getText === 'function' && o.getText() === 'STANDING ORDERS');
        if (tabBtn) { tabBtn.emit('pointerdown'); await sleep(200); }
        const enactBtn = findIn(scene.children.list, o => o.getText && typeof o.getText === 'function' && o.getText() === 'ENACT');
        if (enactBtn) {
            enactBtn.emit('pointerdown');
            await sleep(200);
            note('ACTION', 'Enacted a Standing Order via InvestmentPanel');
        }
    }

    /** Buys the cheapest affordable Capital Work / staged project, preferring
     *  Levi-Maxwell stages once available (per task brief). */
    async function buyOneStrategicProjectIfAffordable() {
        navigate('investment');
        await sleep(150);
        const scene = window.game.scene.getScene('HqScene');
        const capitalTab = findIn(scene.children.list, o => o.getText && typeof o.getText === 'function' && o.getText() === 'CAPITAL WORKS');
        if (capitalTab) { capitalTab.emit('pointerdown'); await sleep(200); }

        const campaign = cs();
        const year = campaign.calendar.year;
        const funds = gs().moneyInVault;

        // Levi-Maxwell first if it's owned and its next stage is purchasable,
        // or if it's in the available pool and affordable.
        const lm = [...campaign.availableStrategicProjects, ...campaign.ownedStrategicProjects]
            .find(p => p.name === 'Levi-Maxwell Ascension Protocol');
        let target = null;
        if (lm) {
            const owned = campaign.ownedStrategicProjects.includes(lm);
            const gate = owned ? lm.canPurchaseNextStage(campaign.calendar.week) : { ok: true };
            const poolOk = owned || (year >= 4);
            if (poolOk && gate.ok && funds >= lm.getMoneyCost()) target = lm;
        }
        if (!target) {
            const candidates = campaign.availableStrategicProjects.filter(p => {
                if (p.isStaged && p.isStaged()) return false; // handled above generically enough; avoid double logic
                const prereqsMet = p.getPrerequisites().length === 0 ||
                    p.getPrerequisites().every(pr => campaign.ownedStrategicProjects.some(o => o.name === pr.name));
                return prereqsMet && p.getMoneyCost() <= funds;
            }).sort((a, b) => a.getMoneyCost() - b.getMoneyCost());
            target = candidates[0] || null;
        }
        if (!target) return;

        // Click the matching PhysicalProjectCard via its emitted event (the
        // panel wires 'projectClicked' from PhysicalProjectCard instances).
        const clicked = window.game.scene.getScene('HqScene').events.emit('projectClicked', target);
        await sleep(250);
        note('ACTION', `Attempted purchase of strategic project "${target.name}" (£${target.getMoneyCost()})`);
    }

    /** Buys one consumable from the Quartermaster if affordable and stock isn't full. */
    async function buyOneConsumableIfAffordable() {
        navigate('quartermaster');
        await sleep(150);
        const scene = window.game.scene.getScene('HqScene');
        const requisitionBtn = findIn(scene.children.list, o => o.getText && typeof o.getText === 'function'
            && o.getText() === 'REQUISITION');
        if (requisitionBtn) {
            requisitionBtn.emit('pointerdown');
            await sleep(150);
            note('ACTION', 'Requisitioned a consumable via QuartermasterPanel');
        }
    }

    /** Charter Buyback: once unlocked (year 8+), clicks RETIRE SHARES via the
     *  real InvestmentPanel button whenever the vault holds a comfortable
     *  buffer over the cost (so dividends stay payable). Exercises the £100
     *  -> 130 VP conversion end to end. */
    async function retireSharesIfSensible() {
        const campaign = cs();
        if (!campaign.isCharterBuybackUnlocked()) return;
        if (gs().moneyInVault < 400) return; // keep a dividend buffer
        navigate('investment');
        await sleep(150);
        const scene = window.game.scene.getScene('HqScene');
        const vpBefore = campaign.charterVictoryPoints;
        const retireBtn = findIn(scene.children.list, o => o.getText && typeof o.getText === 'function'
            && (o.getText() || '').startsWith('RETIRE SHARES:'));
        if (!retireBtn) return;
        retireBtn.emit('pointerdown');
        await sleep(200);
        if (campaign.charterVictoryPoints > vpBefore) {
            markMilestone('buyback_exercised',
                `Charter Buyback exercised via RETIRE SHARES (VP ${vpBefore} -> ${campaign.charterVictoryPoints})`);
            note('ACTION', `Retired shares: £100 -> 130 VP (running VP ${campaign.charterVictoryPoints})`);
        }
    }

    /** Equips + insures relics onto squad members with a free slot, from the armoury. */
    async function equipAndInsureRelics() {
        const campaign = cs();
        if (campaign.armoury.length === 0) return;
        navigate('barracks');
        await sleep(150);
        for (const soldier of campaign.roster) {
            let guard = 0;
            while (campaign.armoury.length > 0 && guard < 4) {
                guard++;
                const scene = window.game.scene.getScene('HqScene');
                // Select the soldier row first.
                const soldierRow = findIn(scene.children.list, o => o.getText && typeof o.getText === 'function'
                    && (o.getText() || '').includes(soldier.name) && (o.getText() || '').includes(soldier.characterClass.name));
                if (soldierRow) { soldierRow.emit('pointerdown'); await sleep(150); }
                const emptySlotBtn = findIn(window.game.scene.getScene('HqScene').children.list,
                    o => o.getText && typeof o.getText === 'function' && (o.getText() || '').includes('empty slot'));
                if (!emptySlotBtn) break; // no free slot on this soldier
                emptySlotBtn.emit('pointerdown');
                await sleep(150);
                // Armoury picker: click the first relic entry.
                const relicEntry = findIn(window.game.scene.getScene('HqScene').children.list,
                    o => o.getText && typeof o.getText === 'function' && (o.getText() || '').includes('[color=gold]')
                        && o.onClick !== undefined && o !== emptySlotBtn);
                if (relicEntry) {
                    relicEntry.emit('pointerdown');
                    await sleep(150);
                    note('ACTION', `Equipped a relic onto ${soldier.name}`);
                } else {
                    // close picker if nothing clickable
                    const closeBtn = findIn(window.game.scene.getScene('HqScene').children.list,
                        o => o.getText && typeof o.getText === 'function' && o.getText() === 'Close');
                    if (closeBtn) closeBtn.emit('pointerdown');
                    break;
                }
            }
            // Insure any equipped-but-uninsured relics for this soldier if affordable.
            if (soldier.equippedRelics && soldier.equippedRelics.length > 0) {
                let insureGuard = 0;
                while (insureGuard < 4) {
                    insureGuard++;
                    const insureBtn = findIn(window.game.scene.getScene('HqScene').children.list,
                        o => o.getText && typeof o.getText === 'function' && (o.getText() || '').startsWith('Insure ('));
                    if (!insureBtn) break;
                    if (gs().moneyInVault < 40) break;
                    insureBtn.emit('pointerdown');
                    await sleep(150);
                }
            }
        }
    }

    /** Picks the highest-payout contract, mustering fit-for-duty soldiers,
     *  preferring trade runs at full crates and prestige commissions when on
     *  offer (per task brief), then dispatches via the real ContractBoardPanel. */
    async function dispatchHighestPayoutContract() {
        navigate('contracts');
        await sleep(200);
        const campaign = cs();
        campaign.ensureContractsPopulated();
        const hq = window.game.scene.getScene('HqScene');
        const panel = hq.contractBoardPanel;

        const fitCount = campaign.roster.filter(c => c.isFitForDuty).length;
        const dispatchable = campaign.availableContracts.filter(c => c.squadSize <= fitCount);
        if (dispatchable.length === 0) {
            note('FINDING', `No dispatchable contract: ${campaign.availableContracts.length} on board, ${fitCount} fit-for-duty soldiers.`);
            return false;
        }

        // Preference order: prestige (VP is scarce/valuable) > trade run > highest £ payout.
        const scoreOf = c => {
            if (c.isPrestige) return 100000 + c.vpReward;
            if (c.isTradeRun) return 50000 + c.projectedPayout;
            return c.payout;
        };
        dispatchable.sort((a, b) => scoreOf(b) - scoreOf(a));
        const contract = dispatchable[0];

        if (contract.isTradeRun) {
            contract.cratesLoaded = contract.maxCrates;
        }
        campaign.selectedContract = contract;

        // Muster: fit-for-duty soldiers, highest level first (mirrors a
        // player fielding their best available squad).
        const squad = campaign.roster
            .filter(c => c.isFitForDuty)
            .sort((a, b) => b.level - a.level)
            .slice(0, contract.squadSize);
        panel.selectedSquad = squad;

        note('ACTION', `Dispatching "${contract.name}" (${contract.isPrestige ? 'PRESTIGE ' + contract.vpReward + 'VP' : contract.isTradeRun ? 'TRADE RUN £' + contract.projectedPayout : '£' + contract.payout}), act ${contract.act}, squad ${squad.map(s => s.name).join(', ')}`);

        panel.handleLaunch();
        await wait(() => sceneKey() === 'CombatScene', 20000, 'CombatScene to launch after dispatch');
        return true;
    }

    // -----------------------------------------------------------------
    // Main loop.
    // -----------------------------------------------------------------
    await wait(() => sceneKey() === 'HqScene', bootTimeoutMs, 'HqScene active at boot');
    note('INFO', `Longplay starting. Vault £${gs().moneyInVault}, roster ${cs().roster.length}, week ${cs().calendar.week}, timewarp=${!!timewarp}`);

    let iteration = 0;
    let endReason = null;
    let errorQueueBaseline = window.getActionQueueErrors().length;

    while (true) {
        iteration++;
        if (timeLeft() <= 0) { endReason = 'wall-clock budget exhausted'; break; }

        const campaign = cs();
        if (campaign.calendar.isSacked) { endReason = 'sacked by the board (satisfaction 0)'; break; }
        if (campaign.calendar.isCharterExpired) { endReason = 'charter expired (past year 10 / quarter 40)'; break; }
        if (campaign.roster.length === 0) { endReason = 'roster wiped out entirely'; break; }

        checkYearMilestones();

        try {
            // 1. Heal wounds.
            await healWoundsPreferringPurchase();

            // 2. Resolve pending promotions via the real panel.
            const promoResult = await resolvePromotionsViaPanel();
            if (promoResult.resolved > 0) note('ACTION', `Resolved ${promoResult.resolved} promotion(s) via ${promoResult.method}`);

            // 3. Keep roster >= 6 via real hiring.
            await ensureMinRosterViaHiring(6);

            // 4. Enact a standing order if a slot is free.
            await enactStandingOrderIfSlotFree();

            // 5. Buy a strategic project every few quarters.
            if (iteration % 3 === 0) {
                await buyOneStrategicProjectIfAffordable();
            }

            // 6. Buy consumables occasionally.
            if (iteration % 4 === 0) {
                await buyOneConsumableIfAffordable();
            }

            // 7. Equip + insure relics.
            await equipAndInsureRelics();

            // 7b. Charter Buyback once unlocked (year 8+) and the vault has slack.
            await retireSharesIfSensible();

            // 8. Dispatch the highest-payout contract.
            navigate('contracts');
            await sleep(150);
            const dispatched = await dispatchHighestPayoutContract();
            if (!dispatched) {
                // Nothing dispatchable (funds/roster too thin). Advance by
                // resting: there's no explicit "wait a week" HQ action, so
                // record the stall as a finding and break to avoid an
                // infinite loop that never advances calendar time.
                note('FINDING', 'Stalled: nothing dispatchable this iteration. Ending run early rather than spin.');
                endReason = 'stalled — no dispatchable contract (insufficient funds/roster)';
                break;
            }

            // 9. Win the sortie's combat(s).
            let combatGuard = 0;
            while (sceneKey() === 'CombatScene' && combatGuard < 10) {
                combatGuard++;
                await winActiveSortie();
                // A won combat can chain into another (multi-combat sortie)
                // or an event can swap in a fresh one; give the scene a beat
                // to settle before checking again.
                await sleep(300);
            }

            // 10. Return to HQ, file the debrief.
            await wait(() => sceneKey() === 'HqScene', 20000, 'return to HqScene after sortie').catch(e => {
                note('ERROR', 'return-to-HQ wait: ' + String(e && e.message || e));
            });
            await fileDebriefIfPending();

            // Resolve any promotion the debrief filing surfaced immediately,
            // so next loop's dispatch isn't blocked behind it.
            const promoResult2 = await resolvePromotionsViaPanel();
            if (promoResult2.resolved > 0) note('ACTION', `Post-debrief: resolved ${promoResult2.resolved} promotion(s) via ${promoResult2.method}`);

            // 11. TIMEWARP (opt-in, QA_LONGPLAY_TIMEWARP=1): a real-engine
            // sortie loop advances ~2.5 weeks per ~35s iteration — a 10-year
            // charter (520+ weeks) would need hours of wall clock, so the
            // year-gated content this longplay exists to test would never be
            // reached. Compress the idle weeks between sorties through the
            // REAL CampaignUiState.advanceWeeks API (real board meetings,
            // wages, dividend escalation, contract expiry/refill, wound and
            // stress ticking), sized adaptively so the run crosses year 11 as
            // the budget runs out. This is a documented driver-policy
            // decision, NOT the organic pace: quarterly economics under warp
            // run on ~1 sortie of income per quarter, so satisfaction decay /
            // sacking is an expected (and itself informative) outcome.
            if (timewarp) {
                const cal = cs().calendar;
                const targetWeek = 533; // first week of year 11 -> charter expired
                const remainingWeeks = targetWeek - cal.week;
                if (remainingWeeks > 0) {
                    const elapsed = Date.now() - startedAt;
                    const avgIterMs = elapsed / iteration;
                    const itersLeft = Math.max(1, Math.floor(timeLeft() / Math.max(avgIterMs, 1000)));
                    const extra = Math.min(13, Math.max(0, Math.ceil(remainingWeeks / itersLeft)));
                    if (extra > 0) {
                        cs().advanceWeeks(extra);
                        note('TIMEWARP', `advanced ${extra} extra week(s) -> week ${cs().calendar.week} (y${cs().calendar.year} q${cs().calendar.quarterOfYear}), vault £${gs().moneyInVault}, satisfaction ${cs().calendar.shareholderSatisfaction}`);
                    }
                }
            }

        } catch (e) {
            note('ERROR', `iteration ${iteration} threw: ${String(e && e.stack || e)} (scene=${sceneKey()})`);
            // Try to recover to HQ so the loop can keep going rather than dying outright.
            try {
                if (sceneKey() === 'CombatScene') {
                    gs().combatState.enemies.forEach(en => { en.hitpoints = 0; });
                    await sleep(500);
                }
            } catch { /* best effort */ }
            await sleep(500);
            if (sceneKey() !== 'HqScene' && sceneKey() !== 'CombatScene') {
                note('ERROR', `Unrecoverable scene state "${sceneKey()}" after error; ending run.`);
                endReason = `unrecoverable error: ${String(e && e.message || e)}`;
                break;
            }
        }

        const newErrors = window.getActionQueueErrors().slice(errorQueueBaseline);
        if (newErrors.length > 0) {
            newErrors.forEach(err => note('ACTION_QUEUE_ERROR', JSON.stringify(err)));
            errorQueueBaseline = window.getActionQueueErrors().length;
        }
    }

    checkYearMilestones();
    const finalCampaign = cs();
    const finalGameState = gs();

    const result = {
        endReason,
        timewarp: !!timewarp,
        iterations: iteration,
        finalWeek: finalCampaign.calendar.week,
        finalYear: finalCampaign.calendar.year,
        finalQuarterOfYear: finalCampaign.calendar.quarterOfYear,
        quartersSurvived: Math.floor((finalCampaign.calendar.week - 1) / 13),
        finalVault: finalGameState.moneyInVault,
        finalRosterSize: finalCampaign.roster.length,
        finalSatisfaction: finalCampaign.calendar.shareholderSatisfaction,
        contractsCompleted: finalCampaign.contractsCompleted,
        contractsCompletedByClient: finalCampaign.contractsCompletedByClient,
        charterVictoryPoints: finalCampaign.charterVictoryPoints,
        ownedStrategicProjects: finalCampaign.ownedStrategicProjects.map(p => p.name),
        milestones,
        findings,
        actionQueueErrorsTotal: window.getActionQueueErrors().length,
        journalSummary: window.playtestJournal ? window.playtestJournal.summary() : null,
        endedAtSceneKey: sceneKey(),
    };
    return result;
}

async function main() {
    const server = await startServer();
    const { port } = server.address();
    const url = `http://127.0.0.1:${port}/index.html`;
    console.log(`[qa-longplay] serving at ${url}`);

    // protocolTimeout must exceed the single page.evaluate() call below,
    // which runs the ENTIRE campaign loop (up to RUN_BUDGET_MS) inside one
    // CDP round-trip. Puppeteer's default (180s) fires a
    // "Runtime.callFunctionOn timed out" ProtocolError long before a real
    // multi-quarter run finishes — found the hard way on the first full run
    // (died at week 22, ~3 minutes in). Pad generously past OVERALL_TIMEOUT_MS.
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        protocolTimeout: OVERALL_TIMEOUT_MS + 5 * 60 * 1000,
    });
    let exitCode = 1;
    try {
        const page = await browser.newPage();
        page.on('console', msg => {
            const t = msg.text();
            // Pipe everything through — this IS the record per the task brief.
            console.log(`[page:${msg.type()}] ${t}`);
        });
        page.on('pageerror', err => console.log(`[page:pageerror] ${err.message}`));
        page.on('requestfailed', req => console.log(`[page:requestfailed] ${req.url()} - ${req.failure()?.errorText}`));

        await page.goto(url, { waitUntil: 'load', timeout: BOOT_TIMEOUT_MS });
        await page.waitForFunction('typeof window.runSmokeTest === "function"', { timeout: BOOT_TIMEOUT_MS });
        await page.waitForFunction(
            "window.game && window.game.scene.getScenes(true).some(s => s.scene.key === 'HqScene')",
            { timeout: BOOT_TIMEOUT_MS }
        );

        console.log('[qa-longplay] boot confirmed; starting the campaign drive...');
        const driverSource = runLongplayInPage.toString();

        const result = await page.evaluate(
            new Function('runBudgetMs', 'bootTimeoutMs', 'timewarp', `return (${driverSource})(runBudgetMs, bootTimeoutMs, timewarp);`),
            RUN_BUDGET_MS,
            BOOT_TIMEOUT_MS,
            TIMEWARP
        );

        console.log('[qa-longplay] RESULT:');
        console.log(JSON.stringify(result, null, 2));

        exitCode = 0; // This is a QA/report tool — a bad run is a FINDING, not a script failure.
    } catch (e) {
        console.error('[qa-longplay] harness failed:', e instanceof Error ? e.stack ?? e.message : e);
        exitCode = 1;
    } finally {
        await browser.close();
        server.close();
    }
    process.exit(exitCode);
}

const watchdog = setTimeout(() => {
    console.error('[qa-longplay] overall timeout exceeded; forcing exit.');
    process.exit(1);
}, OVERALL_TIMEOUT_MS);
watchdog.unref();

main().catch(e => { console.error('[qa-longplay] unhandled:', e); process.exit(1); });
