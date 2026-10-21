// Checks the planner and every screen using the app's own code, with no test framework. Run: npm test
// The code before the "Actions" section has no DOM wiring, so it runs as-is inside Node's vm.
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'decided.html'), 'utf8').split('<script>')[1].split('</script>')[0];
let failed = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); if (!ok) failed++; };

try { new vm.Script(src); check('the script parses', true); } catch (e) { check('the script parses', false, e.message); process.exit(1); }
const ctx = vm.createContext({ console, innerWidth: 1200, innerHeight: 800, navigator: { language: 'en-GB', languages: ['en-GB'] } });
vm.runInContext(src.split('/* ---------------- Actions')[0], ctx);
const run = code => vm.runInContext(`(() => { ${code} })()`, ctx);
run(`globalThis.profile = p => Object.assign(state.profile, { sex: 'm', age: 28, heightCm: 178, weightKg: 75, activity: 'moderate', goal: 'leanbulk', units: 'metric', tdeeOverride: null, example: false }, p);
  globalThis.resetPrefs = p => { state.prefs = { ...clone(DEFAULT_PREFS), ...p }; state.days = {}; };
  globalThis.week = () => { state.days = {}; const keys = Array.from({ length: 7 }, (_, n) => addDays(TODAY(), n)); keys.forEach(planDay); return keys; };`);

const missing = run(`return FOODS.filter(f => !BUY[f.id]).map(f => f.id);`);
check('every food has a shop price', !missing.length, missing.join(', '));

// Each planned day should land close to its calorie and protein targets.
const accuracy = run(`
  let worst = 0, label = '';
  for (const [sex, goal, kg] of [['m', 'fastcut', 95], ['m', 'cut', 85], ['f', 'cut', 62], ['m', 'maintain', 75], ['f', 'leanbulk', 58], ['m', 'bulk', 70]]) {
    profile({ sex, goal, weightKg: kg, heightCm: sex === 'm' ? 180 : 165 }); resetPrefs();
    for (let rep = 0; rep < 2; rep++) for (const k of week()) {
      const t = targetsFor(k), pt = plannedTotals(state.days[k]), miss = Math.max(Math.abs(pt.kcal - t.kcal) / t.kcal, Math.abs(pt.p - t.p) / t.p);
      if (miss > worst) { worst = miss; label = sex + ' ' + goal; }
    }
  }
  return { worst, label };`);
check('planned days hit calories and protein within 6%', accuracy.worst <= 0.06, `worst ${(accuracy.worst * 100).toFixed(1)}%, ${accuracy.label}`);

const diet = run(`
  profile(); resetPrefs({ diet: 'vegan', avoid: ['nuts', 'soy'] }); week();
  return Object.values(state.days).flatMap(d => d.plan.filter(Boolean).flatMap(m => m.items)).filter(i => !foodAllowed(i.f, state.prefs)).map(i => i.f);`);
check('vegan, nut-free, soy-free plans contain only allowed foods', !diet.length, [...new Set(diet)].join(', '));

const cycling = run(`
  profile(); resetPrefs({ cycle: true, trainDays: [1, 3, 5] });
  const ts = Array.from({ length: 7 }, (_, n) => targetsFor(addDays(TODAY(), n))), avg = ts.reduce((s, t) => s + t.kcal, 0) / 7;
  return { off: Math.abs(avg - targets().kcal), train: ts.find(t => t.train).kcal, rest: ts.find(t => !t.train).kcal };`);
check('calorie cycling keeps the weekly average', cycling.off <= 15 && cycling.train > cycling.rest, `training ${cycling.train}, rest ${cycling.rest}, average off by ${Math.round(cycling.off)}`);

const batch = run(`
  profile(); resetPrefs({ batch: 2 }); week();
  let copies = 0, broken = 0;
  for (const [k, d] of Object.entries(state.days)) d.plan.forEach((m, i) => { if (m?.cook?.n > 1) { copies++; const src = state.days[m.cook.from]?.plan[i]; if (!src || src.rid !== m.rid || src.cook?.n !== 1) broken++; } });
  return { copies, broken };`);
check('batch cooking links leftovers to the day they were cooked', batch.copies >= 4 && !batch.broken, `${batch.copies} leftover meals, ${batch.broken} broken links`);

const swaps = run(`profile(); resetPrefs(); week(); const o = swapOptions(TODAY(), 1); return { n: o.length, distinct: new Set(o.map(m => m.rid)).size };`);
check('the swap picker offers five different recipes', swaps.n === 5 && swaps.distinct === 5, `${swaps.distinct} of ${swaps.n}`);

const budget = run(`
  profile(); const cost = fit => { let c = 0; for (let r = 0; r < 3; r++) { resetPrefs({ budget: 45, budgetPeriod: 'week', budgetFit: fit }); week(); c += groceryStats('week').cost; } return c / 3; };
  return { free: cost(false), fitted: cost(true) };`);
check('fitting a budget makes the week cheaper', budget.fitted < budget.free * 0.9, `$${budget.free.toFixed(2)} → $${budget.fitted.toFixed(2)}`);

// A monthly budget the food can meet is met over 30 days; one it can't is reported with the real cheapest month.
const monthly = run(`
  profile(); const month = budget => { resetPrefs({ budget, budgetPeriod: 'month', budgetFit: true }); floorMemo = { key: '', v: 0 };
    Array.from({ length: 30 }, (_, n) => addDays(TODAY(), n)).forEach(planDay); return { cost: groceryStats('month').cost, floor: cheapestWeek() * 30 / 7 }; };
  const free = (() => { resetPrefs(); Array.from({ length: 30 }, (_, n) => addDays(TODAY(), n)).forEach(planDay); return groceryStats('month').cost; })();
  const floor = month(1).floor, ok = month(Math.round(floor * 1.05)), tight = month(Math.round(floor * 0.8));
  return { free, floor, okCost: ok.cost, okCap: Math.round(floor * 1.05), tightCost: tight.cost, tightCap: Math.round(floor * 0.8) };`);
check('a monthly budget is met when the food allows it', monthly.okCost <= monthly.okCap * 1.02 && monthly.okCost < monthly.free * 0.8,
  `$${monthly.free.toFixed(0)} unbudgeted, $${monthly.okCost.toFixed(0)} against $${monthly.okCap}`);
check('a budget below the cheapest month is reported, not quietly missed', monthly.floor > monthly.tightCap && monthly.tightCost <= monthly.floor * 1.04,
  `cheapest month $${monthly.floor.toFixed(0)}, $${monthly.tightCost.toFixed(0)} against $${monthly.tightCap}`);

const streak = run(`
  profile(); resetPrefs();
  for (let n = 1; n <= 12; n++) { const k = addDays(TODAY(), -n); planDay(k); state.days[k].eaten = state.days[k].plan.map(() => n !== 6); }
  const c = consistency(); return { streak: c.streak, best: c.best };`);
check('streaks count on-target days', streak.streak === 5 && streak.best === 6, `current ${streak.streak}, best ${streak.best}`);

const quick = run(`
  const q = { ...newQuickStart(), goal: 'cut', age: '30', h: '170', w: '80' }, bad = { ...q, age: '5' };
  return { units: q.units, country: q.country, ok: draftErrors(qsProfile(q)).length, bad: draftErrors(qsProfile(bad)).length, kcal: calc(qsProfile(q)).kcal };`);
check('the quick start guesses units and country and validates answers', quick.units === 'metric' && quick.country === 'GB' && !quick.ok && quick.bad === 1 && quick.kcal > 1200, `${quick.units}, ${quick.country}, ${quick.kcal} kcal`);

const backup = run(`profile(); resetPrefs(); week(); const b = JSON.parse(backupText()); return { app: b.app, days: Object.keys(b.days).length };`);
check('a backup holds the profile and every day', backup.app === 'bulk-cut-kitchen' && backup.days === 7, `${backup.days} days`);

const restore = run(`profile(); resetPrefs(); week(); const good = parseBackup(backupText());
  return { days: Object.keys(good.s?.days || {}).length, junk: parseBackup('hello').err, other: parseBackup('{"app":"other"}').err };`);
check('a backup file reads back, and anything else is refused', restore.days === 7 && !!restore.junk && !!restore.other, `${restore.days} days back`);

// Every screen renders without stray "undefined" or "NaN".
const views = run(`
  profile(); resetPrefs({ cycle: true, trainDays: [1, 3, 5], batch: 2 }); week();
  getDay(TODAY()).water = 1250; getDay(TODAY()).log.push({ id: 'x', name: 'Banana', food: 'banana', q: 120, kcal: 107, p: 1, c: 27, f: 0 });
  ui.planKey = TODAY(); ui.swap = { k: TODAY(), i: 1, opts: swapOptions(TODAY(), 1) };
  ui.draft = clone({ profile: state.profile, prefs: state.prefs }); ui.qs = { ...newQuickStart(), step: 3, goal: 'cut', age: '30', h: '170', w: '80' };
  const out = { today: viewToday(), plan: viewPlan(), groceries: viewGroceries(), progress: viewProgress(), setup: viewSetup(), 'quick start': viewStart() };
  return Object.entries(out).map(([k, v]) => [k, v.length, (v.match(/.{40}(undefined|NaN).{20}/) || [''])[0]]);`);
for (const [name, len, bad] of views) check(`the ${name} screen renders`, len > 1000 && !bad, bad || `${Math.round(len / 1024)} KB`);

console.log(failed ? `\n${failed} check${failed > 1 ? 's' : ''} failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
