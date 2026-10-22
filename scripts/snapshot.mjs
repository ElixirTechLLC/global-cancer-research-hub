// Daily snapshot job: builds the per-cancer updates feed (new trials, status changes, results posted, FDA approvals)
// and the drug pipeline tables from ClinicalTrials.gov and openFDA. Run by .github/workflows/snapshot.yml; no dependencies.
//   node scripts/snapshot.mjs            (all cancers)
//   node scripts/snapshot.mjs leukemia   (one cancer)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'snapshot');
const CT = 'https://clinicaltrials.gov/api/v2/studies';
const OPEN = ['RECRUITING', 'NOT_YET_RECRUITING', 'ENROLLING_BY_INVITATION', 'ACTIVE_NOT_RECRUITING'];
const FIELDS = 'NCTId,BriefTitle,OverallStatus,Phase,StudyFirstPostDate,LastUpdatePostDate,ResultsFirstPostDate,InterventionName,InterventionType,LeadSponsorName,Condition,StudyType';
const WINDOW_DAYS = 90;
const TODAY = new Date().toISOString().slice(0, 10);
const SINCE = new Date(Date.now() - WINDOW_DAYS * 864e5).toISOString().slice(0, 10);
const PHASE_RANK = { PHASE4: 4, PHASE3: 3, PHASE2: 2, PHASE1: 1, EARLY_PHASE1: 0.5, NA: 0 };
const GENERIC = ['placebo', 'standard of care', 'standard therapy', 'standard treatment', 'chemotherapy', 'best supportive care', 'supportive care', 'usual care', 'saline', 'vehicle', 'control', 'no intervention', 'observation', 'questionnaire', 'biospecimen', 'biomarker analysis', 'laboratory', 'radiation', 'radiotherapy', "investigator's choice", "physician's choice", 'treatment of physician', 'sham', 'conventional', 'surgery', 'blood draw', 'sample collection', 'quality of life'];

// Load the cancer tree from the browser data file.
const window = {};
new Function('window', readFileSync(join(ROOT, 'data', 'cancers.js'), 'utf8'))(window);
const ROOTS = window.CANCERS.filter((c) => !c.soon);
const only = process.argv[2];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJSON(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'global-cancer-research-hub snapshot (non-profit, daily)' } });
      if (!r.ok) throw new Error(`${r.status} ${url.slice(0, 120)}`);
      return await r.json();
    } catch (err) {
      if (i >= tries) throw err;
      await sleep(2000 * i);
    }
  }
}
const readJSON = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback);
const writeJSON = (p, v) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, JSON.stringify(v)); };

async function fetchAll(params) {
  const out = [];
  let pageToken;
  do {
    const p = new URLSearchParams({ ...params, pageSize: '1000', fields: FIELDS });
    if (pageToken) p.set('pageToken', pageToken);
    const d = await getJSON(`${CT}?${p}`);
    out.push(...(d.studies || []).map(slim));
    pageToken = d.nextPageToken;
    await sleep(300);
  } while (pageToken);
  return out;
}
function slim(s) {
  const p = s.protocolSection || {};
  const phases = p.designModule?.phases || [];
  return {
    id: p.identificationModule?.nctId,
    title: (p.identificationModule?.briefTitle || '').slice(0, 160),
    status: p.statusModule?.overallStatus,
    phase: phases.length ? phases.reduce((a, b) => (PHASE_RANK[b] > PHASE_RANK[a] ? b : a)) : null,
    first: p.statusModule?.studyFirstPostDateStruct?.date,
    updated: p.statusModule?.lastUpdatePostDateStruct?.date,
    results: p.statusModule?.resultsFirstPostDateStruct?.date,
    type: p.designModule?.studyType,
    sponsor: p.sponsorCollaboratorsModule?.leadSponsor?.name,
    cond: (p.conditionsModule?.conditions || []).slice(0, 4),
    drugs: (p.armsInterventionsModule?.interventions || []).filter((i) => ['DRUG', 'BIOLOGICAL', 'GENETIC', 'COMBINATION_PRODUCT'].includes(i.type)).map((i) => i.name)
  };
}
async function statusesFor(ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 100) {
    const p = new URLSearchParams({ 'filter.ids': ids.slice(i, i + 100).join(','), pageSize: '100', fields: 'NCTId,OverallStatus,LastUpdatePostDate,BriefTitle,Phase,Condition' });
    for (const t of (await getJSON(`${CT}?${p}`)).studies || []) { const s = slim(t); out[s.id] = s; }
    await sleep(300);
  }
  return out;
}

// Drug name normalisation for the pipeline table.
function normDrug(name) {
  let s = name.toLowerCase().replace(/\(.*?\)|\[.*?\]/g, ' ');
  s = s.replace(/\b\d+(\.\d+)?\s*(mg|mcg|µg|ug|g|ml|%|iu|units?)\b.*$/, '');
  s = s.replace(/\b(injection|injections|tablet|tablets|capsule|capsules|oral|intravenous|iv|sc|subcutaneous|infusion|solution|suspension|dose|doses|low[- ]dose|high[- ]dose|reduced[- ]dose|arm [a-z]|cohort \w+|level \d+)\b/g, ' ');
  s = s.replace(/[^a-z0-9+\- ]/g, ' ').replace(/\s+/g, ' ').trim();
  return s;
}
const isGeneric = (s) => !s || s.length < 3 || GENERIC.some((g) => s.includes(g));

function buildPipeline(open) {
  const drugs = {};
  for (const t of open) {
    if (t.type !== 'INTERVENTIONAL') continue;
    const seen = new Set();
    for (const raw of t.drugs) {
      const key = normDrug(raw);
      if (isGeneric(key) || seen.has(key)) continue;
      seen.add(key);
      const d = (drugs[key] ||= { key, names: {}, trials: 0, phases: {}, sponsors: new Set(), ids: [] });
      d.names[raw.trim()] = (d.names[raw.trim()] || 0) + 1;
      d.trials++;
      d.phases[t.phase || 'NA'] = (d.phases[t.phase || 'NA'] || 0) + 1;
      if (t.sponsor) d.sponsors.add(t.sponsor);
      d.ids.push({ id: t.id, phase: t.phase });
    }
  }
  return Object.values(drugs)
    .map((d) => ({
      key: d.key,
      name: Object.entries(d.names).sort((a, b) => b[1] - a[1])[0][0],
      trials: d.trials,
      top: Object.keys(d.phases).reduce((a, b) => (PHASE_RANK[b] > PHASE_RANK[a] ? b : a)),
      phases: d.phases,
      sponsors: d.sponsors.size,
      ids: d.ids.sort((a, b) => (PHASE_RANK[b.phase] || 0) - (PHASE_RANK[a.phase] || 0)).slice(0, 6).map((x) => x.id)
    }))
    .sort((a, b) => b.trials - a.trials || (PHASE_RANK[b.top] || 0) - (PHASE_RANK[a.top] || 0))
    .slice(0, 120);
}

const eventKey = (ev) => `${ev.type}:${ev.id || ev.app}:${ev.to || ''}`;
function mergeEvents(prev, fresh) {
  const map = new Map(prev.filter((ev) => ev.date >= SINCE).map((ev) => [eventKey(ev), ev]));
  for (const ev of fresh) if (ev.date && ev.date >= SINCE) map.set(eventKey(ev), ev);
  return [...map.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
const brief = (t) => ({ id: t.id, title: t.title, phase: t.phase, cond: t.cond });

async function runCancer(root) {
  console.log(`[${root.slug}] fetching open trials for "${root.term}"…`);
  const open = await fetchAll({ 'query.cond': root.term, 'filter.overallStatus': OPEN.join(',') });
  console.log(`[${root.slug}] ${open.length} open trials`);
  const withResults = await fetchAll({ 'query.cond': root.term, 'filter.advanced': `AREA[ResultsFirstPostDate]RANGE[${SINCE},MAX]` });

  const statePath = join(OUT, 'state', `${root.slug}.json`);
  const prev = readJSON(statePath, { date: null, trials: {} });
  const cur = Object.fromEntries(open.map((t) => [t.id, { status: t.status, phase: t.phase, updated: t.updated, title: t.title, cond: t.cond }]));

  const events = [];
  for (const t of open) if (t.first >= SINCE) events.push({ type: 'new', date: t.first, status: t.status, ...brief(t) });
  for (const t of withResults) events.push({ type: 'results', date: t.results, status: t.status, ...brief(t) });

  if (prev.date) {
    const gone = [];
    for (const [id, was] of Object.entries(prev.trials)) {
      const now = cur[id];
      if (now && now.status !== was.status) events.push({ type: 'status', date: now.updated || TODAY, id, title: now.title, phase: now.phase, cond: now.cond, from: was.status, to: now.status });
      else if (!now) gone.push(id);
    }
    if (gone.length) {
      console.log(`[${root.slug}] ${gone.length} trials left the open set; checking their status…`);
      const now = await statusesFor(gone);
      for (const id of gone) {
        const t = now[id], was = prev.trials[id];
        if (t && t.status !== was.status) events.push({ type: 'status', date: t.updated || TODAY, id, title: t.title || was.title, phase: t.phase || was.phase, cond: t.cond || was.cond, from: was.status, to: t.status });
      }
    }
  }

  const feedPath = join(OUT, 'feed', `${root.slug}.json`);
  const prevFeed = readJSON(feedPath, { events: [] });
  const feed = { date: TODAY, since: SINCE, previous: prev.date, open: open.length, events: mergeEvents(prevFeed.events || [], events) };
  writeJSON(feedPath, feed);
  writeJSON(join(OUT, 'pipeline', `${root.slug}.json`), { date: TODAY, open: open.filter((t) => t.type === 'INTERVENTIONAL').length, drugs: buildPipeline(open) });
  writeJSON(statePath, { date: TODAY, trials: cur });
  console.log(`[${root.slug}] feed: ${feed.events.length} events (${events.filter((e) => e.type === 'new').length} new, ${events.filter((e) => e.type === 'status').length} status, ${withResults.length} results)`);
  return feed;
}

// FDA approvals (US only): original approvals and efficacy supplements in the window, matched to cancers by the label's indications.
const INDICATION_WORDS = { leukemia: ['leukemia', 'leukaemia'], lymphoma: ['lymphoma', 'macroglobulinemia'], myeloma: ['myeloma'], breast: ['breast cancer'], lung: ['lung cancer', 'non-small cell', 'small cell lung'], colorectal: ['colorectal', 'colon cancer', 'rectal cancer'], prostate: ['prostate cancer'], brain: ['glioma', 'glioblastoma', 'astrocytoma', 'brain tumor'] };
async function fdaApprovals() {
  const since = SINCE.replace(/-/g, ''), today = TODAY.replace(/-/g, '');
  const found = {};
  let skip = 0, total = Infinity;
  while (skip < total && skip < 3000) {
    const p = new URLSearchParams({ search: `submissions.submission_status_date:[${since} TO ${today}] AND submissions.submission_status:AP`, limit: '100', skip: String(skip) });
    const d = await getJSON(`https://api.fda.gov/drug/drugsfda.json?${p}`);
    total = d.meta?.results?.total || 0;
    for (const r of d.results || []) {
      const subs = (r.submissions || []).filter((s) => s.submission_status === 'AP' && s.submission_status_date >= since && /^(EFFICACY|TYPE [1-4])/.test(s.submission_class_code || ''));
      if (!subs.length) continue;
      const app = r.application_number;
      await sleep(300);
      let label;
      const brandName = r.openfda?.brand_name?.[0] || r.products?.[0]?.brand_name;
      for (const q of [`openfda.application_number:"${app}"`, brandName ? `openfda.brand_name:"${brandName}"` : null].filter(Boolean)) {
        try { label = (await getJSON(`https://api.fda.gov/drug/label.json?search=${encodeURIComponent(q)}&limit=1`)).results?.[0]; } catch { label = null; }
        if (label) break;
        await sleep(300);
      }
      if (!label) continue;
      const text = ((label?.indications_and_usage || []).join(' ')).toLowerCase();
      if (!text) continue;
      const names = r.openfda?.generic_name || label?.openfda?.generic_name || (r.products || []).map((x) => x.active_ingredients?.map((a) => a.name).join(' + ')).filter(Boolean);
      const brand = (r.openfda?.brand_name || label?.openfda?.brand_name || [r.products?.[0]?.brand_name]).filter(Boolean)[0];
      for (const [slug, words] of Object.entries(INDICATION_WORDS)) {
        if (!words.some((w) => text.includes(w))) continue;
        for (const s of subs) (found[slug] ||= []).push({
          type: 'approval', date: `${s.submission_status_date.slice(0, 4)}-${s.submission_status_date.slice(4, 6)}-${s.submission_status_date.slice(6, 8)}`,
          app, drug: brand || names?.[0] || app, generic: (names || []).slice(0, 2).join(', ').toLowerCase(), sponsor: r.sponsor_name,
          kind: s.submission_type === 'ORIG' ? 'Original approval' : `Supplement: ${s.submission_class_code_description || s.submission_class_code}`,
          url: `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${app.replace(/\D/g, '')}`
        });
      }
    }
    skip += 100;
    await sleep(300);
  }
  return found;
}

const roots = only ? ROOTS.filter((r) => r.slug === only) : ROOTS;
const feeds = {};
for (const root of roots) {
  try { feeds[root.slug] = await runCancer(root); } catch (err) { console.error(`[${root.slug}] FAILED: ${err.message}`); process.exitCode = 1; }
}
try {
  const approvals = await fdaApprovals();
  for (const [slug, list] of Object.entries(approvals)) {
    const feedPath = join(OUT, 'feed', `${slug}.json`);
    const feed = readJSON(feedPath, null);
    if (!feed) continue;
    feed.events = mergeEvents(feed.events, list);
    writeJSON(feedPath, feed);
    console.log(`[${slug}] ${list.length} FDA approval events`);
  }
} catch (err) { console.error(`FDA step failed: ${err.message}`); }
writeJSON(join(OUT, 'meta.json'), { date: TODAY, since: SINCE, windowDays: WINDOW_DAYS, cancers: ROOTS.map((r) => r.slug) });
console.log('done', TODAY);
