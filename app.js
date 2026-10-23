(() => {
  const CONFIG0 = window.SITE_CONFIG || {};
  const CANCERS = (window.CANCERS || []).filter((c) => !CONFIG0.cancers || CONFIG0.cancers.includes(c.slug));
  const COUNTRIES = window.COUNTRIES || [];
  const REGISTRIES = window.REGISTRIES || [];
  const WORLD = window.WORLD_STATS || null;
  const STATS = window.CANCER_STATS || {};
  const CONFIG = window.SITE_CONFIG || {};
  const ROOTS = CANCERS.filter((c) => !c.soon);
  const FOCUS = ROOTS.find((c) => c.slug === CONFIG.homeFocus) || null;
  const DEFAULT_COND = FOCUS ? FOCUS.term : 'Cancer';
  const statsSource = WORLD ? `<a href="${WORLD.sourceUrl}" target="_blank" rel="noopener noreferrer">${WORLD.source}</a>, retrieved 5 October 2026` : '';
  const LIT = window.LITERATURE_SOURCES || [];
  const REGIONS = ['Americas', 'Europe', 'Asia-Pacific', 'Middle East & Africa'];
  const main = document.getElementById('main');

  // ---------- helpers ----------
  const e = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => (n == null || n === '' ? '—' : Number(n).toLocaleString('en-US'));
  const titleCase = (s) => String(s || '').toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  const ext = (url, text) => `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(text)}</a>`;
  const country = (code) => COUNTRIES.find((c) => c.code.toLowerCase() === String(code).toLowerCase());

  const cache = new Map();
  function getJSON(url) {
    if (!cache.has(url)) {
      cache.set(url, fetch(url).then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      }).catch((err) => { cache.delete(url); throw err; }));
    }
    return cache.get(url);
  }

  // Run async jobs a few at a time so we stay polite to public APIs.
  async function pool(items, limit, job) {
    let i = 0;
    const run = async () => { while (i < items.length) { const item = items[i++]; await job(item).catch(() => {}); } };
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  }

  const profile = {
    get() { try { return JSON.parse(localStorage.getItem('gcrh-profile') || '{}'); } catch { return {}; } },
    set(p) { try { localStorage.setItem('gcrh-profile', JSON.stringify(p)); } catch { /* storage unavailable */ } }
  };

  // ---------- content tree ----------
  function findNode(slugs) {
    let list = CANCERS, node = null;
    const path = [];
    for (const s of slugs) {
      node = (list || []).find((n) => n.slug === s);
      if (!node) return null;
      path.push(node);
      list = node.children;
    }
    return { node, path };
  }
  const nodeHref = (path) => '#/cancers/' + path.map((n) => n.slug).join('/');
  function flatten(list, depth = 0, out = []) {
    for (const n of list) {
      if (n.soon) continue;
      if (!n.group) out.push({ name: (n.abbr ? `${n.name} (${n.abbr})` : n.name), term: n.term, depth });
      if (n.children) flatten(n.children, n.group ? depth : depth + 1, out);
    }
    return out;
  }

  // ---------- data sources ----------
  // ClinicalTrials.gov (US National Library of Medicine) — lists studies in 200+ countries.
  const CT = 'https://clinicaltrials.gov/api/v2/studies';
  const LIST_FIELDS = 'NCTId,BriefTitle,OverallStatus,Phase,LeadSponsorName,Condition,InterventionName,MinimumAge,MaximumAge,Sex,LocationCountry,EnrollmentCount,StudyType,LastUpdatePostDate';

  function trialQuery(q, extra = {}) {
    const p = new URLSearchParams();
    if (q.cond) p.set('query.cond', q.cond);
    const terms = [];
    if (q.term) terms.push(`(${q.term.replace(/[()]/g, ' ')})`);
    const setting = SETTINGS.find((x) => x[0] === q.setting && x[2]);
    if (setting) terms.push(setting[2]);
    const bio = (q.bio || '').split(',').map((x) => x.trim()).filter(Boolean);
    if (bio.length) terms.push(`(${bio.map((b) => (/\s/.test(b) ? `"${b}"` : b)).join(' OR ')})`);
    if (q.elig) terms.push(`AREA[EligibilityCriteria]"${q.elig.replace(/"/g, '').trim()}"`);
    if (terms.length) p.set('query.term', terms.join(' AND '));
    if (q.intr) p.set('query.intr', q.intr);
    if (q.country) {
      const name = `AREA[LocationCountry]"${q.country.replace(/"/g, '')}"`;
      // For "recruiting now", require a recruiting site in that country, not just a recruiting trial with a closed site there.
      p.set('query.locn', q.status === 'all-open' ? name : `SEARCH[Location](${name} AND AREA[LocationStatus]RECRUITING)`);
    }
    p.set('filter.overallStatus', q.status === 'all-open' ? 'RECRUITING,NOT_YET_RECRUITING,ENROLLING_BY_INVITATION' : 'RECRUITING');
    const adv = [];
    const age = parseFloat(q.age);
    if (!isNaN(age) && age >= 0) {
      // Trials with no stated age limit must still match, hence the MISSING clauses.
      adv.push(`(AREA[MinimumAge]RANGE[MIN, ${age} years] OR AREA[MinimumAge]MISSING)`);
      adv.push(`(AREA[MaximumAge]RANGE[${age} years, MAX] OR AREA[MaximumAge]MISSING)`);
    }
    if (q.sex === 'FEMALE' || q.sex === 'MALE') adv.push(`AREA[Sex](ALL OR ${q.sex})`);
    const phases = (q.phases || '').split(',').filter((x) => /^(EARLY_PHASE1|PHASE[1-4])$/.test(x));
    if (phases.length) adv.push(`AREA[Phase](${phases.join(' OR ')})`);
    if (adv.length) p.set('filter.advanced', adv.join(' AND '));
    p.set('countTotal', 'true');
    for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    return `${CT}?${p}`;
  }
  const searchTrials = (q, pageToken) => getJSON(trialQuery(q, { pageSize: 12, fields: LIST_FIELDS, sort: 'LastUpdatePostDate:desc', pageToken }));
  const countTrials = (q) => getJSON(trialQuery(q, { pageSize: 1, fields: 'NCTId' })).then((d) => d.totalCount || 0);

  // Literature: publications whose authors list an institution in the given country.
  const publications = async (term, c, size = 3) => {
    const aff = c ? ' AND (' + (c.aff || [c.name]).map((a) => `AFF:"${a}"`).join(' OR ') + ')' : '';
    const query = `TITLE:"${term}"${aff} AND SRC:(MED OR PPR)`;
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&resultType=core&pageSize=${size}&sort=${encodeURIComponent('P_PDATE_D desc')}`;
    const d = await getJSON(url);
    return {
      total: d.hitCount || 0, retrieved: stamp(),
      items: (d.resultList?.result || []).map((r) => ({
        title: r.title, authors: r.authorString, journal: r.journalInfo?.journal?.title || r.journalTitle, date: r.firstPublicationDate || r.pubYear,
        url: r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : `https://europepmc.org/article/${r.source}/${r.id}`,
        ...classifyPub(r)
      }))
    };
  };

  // Evidence stage and source type, derived from the index's article types and subject headings (automatic, so imperfect).
  function classifyPub(r) {
    const types = (r.pubTypeList?.pubType || []).map((x) => x.toLowerCase());
    const mesh = (r.meshHeadingList?.meshHeading || []).map((m) => m.descriptorName.toLowerCase());
    const has = (re) => types.some((t) => re.test(t));
    const source = r.source === 'PPR' ? 'Preprint, not peer reviewed' : 'Journal article';
    let stage;
    const phase = types.find((t) => /clinical trial, phase/.test(t));
    if (phase) stage = `Phase ${{ i: 1, ii: 2, iii: 3, iv: 4 }[/phase (iv|iii|ii|i)/.exec(phase)?.[1]] || ''} trial`.replace('  ', ' ');
    else if (has(/clinical trial|randomized controlled/)) stage = 'Clinical trial';
    else if (has(/systematic review|meta-analysis/)) stage = 'Systematic review';
    else if (has(/guideline|consensus/)) stage = 'Guideline';
    else if (has(/review/)) stage = 'Review';
    else if (has(/case report/)) stage = 'Case report';
    else if (has(/observational/)) stage = 'Observational study';
    else {
      const lab = mesh.some((m) => /^animals$|^mice$|^rats$|cell line|in vitro|xenograft|zebrafish/.test(m));
      const human = mesh.includes('humans');
      stage = lab && !human ? 'Lab study' : lab ? 'Lab and patient data' : human ? 'Patient data' : 'Not classified';
    }
    return { stage, source };
  }

  // OpenAlex: number of papers per country (one request per cancer type; keyless quota is small, so cache per session).
  async function paperCounts(term) {
    const key = 'gcrh-oa-' + term;
    try { const hit = sessionStorage.getItem(key); if (hit) return JSON.parse(hit); } catch { /* ignore */ }
    const d = await getJSON(`https://api.openalex.org/works?filter=${encodeURIComponent(`title.search:"${term}"`)}&group_by=authorships.institutions.country_code`);
    const out = {};
    for (const g of d.group_by || []) out[String(g.key).split('/').pop().toUpperCase()] = g.count;
    try { sessionStorage.setItem(key, JSON.stringify(out)); } catch { /* ignore */ }
    return out;
  }

  // ISRCTN registry (UK-based, international). Official XML API; full-text search, so we re-check the condition client-side.
  async function isrctnTrials(term, countryName) {
    const uk = term.replace(/leukemia/gi, 'leukaemia').replace(/tumor/gi, 'tumour');
    const q = `("${term}" OR "${uk}") AND recruitmentStatus:recruiting`;
    const url = `https://www.isrctn.com/api/query/format/default?q=${encodeURIComponent(q)}&limit=30`;
    if (!cache.has(url)) cache.set(url, fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); }).catch((err) => { cache.delete(url); throw err; }));
    const doc = new DOMParser().parseFromString(await cache.get(url), 'application/xml');
    const one = (el, name) => el?.getElementsByTagNameNS('*', name)[0];
    const txt = (el, name) => (one(el, name)?.textContent || '').trim();
    const norm = (x) => x.toLowerCase().replace(/leukaemia|leukemia/g, 'leuk').replace(/tumour/g, 'tumor').replace(/[^a-z0-9 ]+/g, ' ');
    const words = norm(term).split(/\s+/).filter(Boolean);
    return [...doc.getElementsByTagNameNS('*', 'fullTrial')].map((ft) => {
      const countries = [...new Set([...(one(ft, 'recruitmentCountries')?.getElementsByTagNameNS('*', 'country') || [])].map((x) => x.textContent.trim()))];
      return {
        id: 'ISRCTN' + txt(ft, 'isrctn'), updated: (one(ft, 'trial')?.getAttribute('lastUpdated') || '').slice(0, 10), title: txt(one(ft, 'trialDescription'), 'title'), condition: (one(ft, 'conditions')?.textContent || '').replace(/\s+/g, ' ').trim(),
        minAge: txt(ft, 'lowerAgeLimit'), maxAge: txt(ft, 'upperAgeLimit'), sex: txt(ft, 'gender'), phase: txt(ft, 'phase'), countries
      };
    }).filter((t) => {
      const hay = norm(t.title + ' ' + t.condition);
      return words.every((w) => hay.includes(w)) && (!countryName || t.countries.some((c) => c.toLowerCase() === countryName.toLowerCase()));
    });
  }

  const registryLink = (r, term) => (r.search ? r.search.replace('{q}', encodeURIComponent(term || 'cancer')) : r.url);

  // ---------- shared fragments ----------
  const crumbs = (items) => `<div class="crumbs">${items.map(([t, h]) => (h ? `<a href="${h}">${e(t)}</a>` : e(t))).join(' &nbsp;/&nbsp; ')}</div>`;
  const SITE = 'Global Cancer Research Hub';
  // When the site's static content was last checked against its sources.
  const VERIFIED = { citations: '2026-10-04', countryLinks: '2026-10-04', stats: '2026-10-05', registries: '2026-10-04' };
  const longDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const stamp = () => new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const retrieved = (src) => `Retrieved live from ${src} on ${stamp()}.`;
  const SETTINGS = [
    ['', 'Any'],
    ['newly', 'Newly diagnosed / untreated', '("newly diagnosed" OR "previously untreated" OR untreated OR "first-line")'],
    ['relapsed', 'Relapsed or refractory', '(relapsed OR refractory)'],
    ['maintenance', 'Maintenance', '(maintenance)'],
    ['mrd', 'MRD-positive / residual disease', '("measurable residual disease" OR "minimal residual disease" OR MRD)']
  ];
  const BIOMARKERS = window.BIOMARKERS || {};
  const rootOfTerm = (term) => ROOTS.find((r) => r.term === term || flatten(r.children || []).some((t) => t.term === term));
  const pageHead = (title, sub, trail) => { document.title = `${title} | ${SITE}`; return headHtml(title, sub, trail); };
  const headHtml = (title, sub, trail) => `<div class="page-head"><div class="wrap">${trail ? crumbs(trail) : ''}<h1>${e(title)}</h1>${sub ? `<p>${e(sub)}</p>` : ''}</div></div>`;
  const trialsHref = (q) => '#/trials?' + new URLSearchParams(Object.entries(q).filter(([, v]) => v)).toString();
  const reviewNotice = '<p class="source-note">Draft text. The summaries on this page have not yet been reviewed by a medical board or matched to citations.</p>';

  // Cancer picker: one bold, ruled-off group per cancer, with its types and indented subtypes beneath.
  function typeOptions(selected) {
    const opt = (value, label) => `<option value="${e(value)}"${value === selected ? ' selected' : ''}>${label}</option>`;
    return opt('Cancer', 'Any cancer') + ROOTS.map((root) => `<hr><optgroup label="${e(root.name)}">${opt(root.term, `All ${e(root.name.toLowerCase())}`)}${flatten(root.children || []).map((t) => opt(t.term, '\u00a0\u00a0'.repeat(t.depth) + e(t.name))).join('')}</optgroup>`).join('');
  }
  const ALL_COUNTRIES = [...new Set([...COUNTRIES.map((c) => c.name), 'Austria', 'Bangladesh', 'Belgium', 'Bulgaria', 'Chile', 'Colombia', 'Croatia', 'Cuba', 'Czechia', 'Denmark', 'Ethiopia', 'Finland', 'Ghana', 'Greece', 'Hong Kong', 'Hungary', 'Indonesia', 'Ireland', 'Jordan', 'Kenya', 'Kuwait', 'Lebanon', 'Malaysia', 'Morocco', 'New Zealand', 'Norway', 'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Serbia', 'Singapore', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan', 'Tanzania', 'Tunisia', 'Uganda', 'Ukraine', 'United Arab Emirates', 'Vietnam'])].sort((a, b) => a.localeCompare(b));

  // Country picker: opens the full scrollable list on every focus/click; typing narrows it.
  function bindCountryPicker() {
    const input = document.getElementById('f-country'), menu = document.getElementById('country-menu');
    if (!input || !menu) return;
    let active = -1, filtering = false;
    const close = () => { menu.hidden = true; filtering = false; active = -1; input.setAttribute('aria-expanded', 'false'); };
    const pick = (li) => { input.value = li.dataset.v; close(); };
    const draw = () => {
      const q = filtering ? input.value.trim().toLowerCase() : '';
      const names = ALL_COUNTRIES.filter((n) => !q || n.toLowerCase().includes(q));
      menu.innerHTML = (q ? '' : '<li role="option" data-v="">Any country</li>') + (names.map((n) => `<li role="option" data-v="${e(n)}"${n === input.value ? ' class="sel" aria-selected="true"' : ''}>${e(n)}</li>`).join('') || '<li class="none">No matching country</li>');
      menu.hidden = false; active = -1;
      input.setAttribute('aria-expanded', 'true');
      const sel = menu.querySelector('.sel');
      if (sel && !filtering) menu.scrollTop = sel.offsetTop - 80;
    };
    input.addEventListener('focus', draw);
    input.addEventListener('click', draw);
    input.addEventListener('input', () => { filtering = true; draw(); });
    input.addEventListener('blur', close);
    menu.addEventListener('mousedown', (ev) => { ev.preventDefault(); const li = ev.target.closest('li[data-v]'); if (li) pick(li); });
    input.addEventListener('keydown', (ev) => {
      const items = [...menu.querySelectorAll('li[data-v]')];
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (menu.hidden) return draw();
        active = Math.max(0, Math.min(items.length - 1, active + (ev.key === 'ArrowDown' ? 1 : -1)));
        items.forEach((li, i) => li.classList.toggle('act', i === active));
        items[active]?.scrollIntoView({ block: 'nearest' });
      } else if (ev.key === 'Enter' && !menu.hidden && active >= 0) { ev.preventDefault(); pick(items[active]); }
      else if (ev.key === 'Escape') close();
    });
  }

  function finderForm(q, compact) {
    const ph = (q.phases || '').split(',');
    return `<form class="filters" id="finder">
      <label class="field wide">Cancer type<select name="cond">${typeOptions(q.cond || DEFAULT_COND)}</select></label>
      <div class="field combo${compact ? '' : ' wide'}"><label for="f-country">Country</label><input id="f-country" name="country" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="country-menu" aria-autocomplete="list" placeholder="Any country" value="${e(q.country || '')}"><ul id="country-menu" class="combo-menu" role="listbox" hidden></ul></div>
      <label class="field">Patient age<input name="age" type="number" min="0" max="120" placeholder="Years" value="${e(q.age || '')}"></label>
      ${compact ? '' : `
      <label class="field">Sex<select name="sex"><option value="">Any</option><option value="FEMALE"${q.sex === 'FEMALE' ? ' selected' : ''}>Female</option><option value="MALE"${q.sex === 'MALE' ? ' selected' : ''}>Male</option></select></label>
      <label class="field">Status<select name="status"><option value="">Recruiting now</option><option value="all-open"${q.status === 'all-open' ? ' selected' : ''}>Recruiting + opening soon</option></select></label>
      <label class="field wide">Keyword (drug, gene, sponsor…)<input name="term" placeholder="e.g. venetoclax, CAR-T, FLT3" value="${e(q.term || '')}"></label>
      <label class="field">Disease setting<select name="setting">${SETTINGS.map(([v, l]) => `<option value="${v}"${q.setting === v ? ' selected' : ''}>${e(l)}</option>`).join('')}</select></label>
      <label class="field">Eligibility text mentions<input name="elig" placeholder="e.g. venetoclax, transplant" value="${e(q.elig || '')}" title="Searches the trial's eligibility criteria for this word or phrase, whether it is required or excluded"></label>
      <div class="field wide" id="bio-field">Biomarker or genetic feature (any of those ticked)<div class="checks" id="bio-checks">${bioChecks(q.cond || DEFAULT_COND, q.bio)}</div></div>
      <div class="field wide">Phase<div class="checks">${[['EARLY_PHASE1', 'Early 1'], ['PHASE1', '1'], ['PHASE2', '2'], ['PHASE3', '3'], ['PHASE4', '4']].map(([v, l]) => `<label><input type="checkbox" name="phase" value="${v}"${ph.includes(v) ? ' checked' : ''}> Phase ${l}</label>`).join('')}</div></div>`}
      <div><button class="btn btn-orange" type="submit">Search trials</button></div>
    </form>`;
  }
  function bioChecks(cond, selected) {
    const root = rootOfTerm(cond);
    const list = root ? BIOMARKERS[root.slug] || [] : [];
    const on = (selected || '').split(',');
    if (!list.length) return '<span class="source-note">Choose a cancer type to see its biomarkers.</span>';
    return list.map((b) => `<label><input type="checkbox" name="bio" value="${e(b)}"${on.includes(b) ? ' checked' : ''}> ${e(b)}</label>`).join('');
  }
  function bindFinder() {
    const form = document.getElementById('finder');
    if (!form) return;
    bindCountryPicker();
    form.querySelector('select[name=cond]').addEventListener('change', (ev) => {
      const box = document.getElementById('bio-checks');
      if (box) box.innerHTML = bioChecks(ev.target.value, [...form.querySelectorAll('input[name=bio]:checked')].map((x) => x.value).join(','));
    });
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const q = { cond: fd.get('cond'), country: (fd.get('country') || '').trim(), age: fd.get('age'), sex: fd.get('sex'), status: fd.get('status'), term: (fd.get('term') || '').trim(), phases: fd.getAll('phase').join(','), setting: fd.get('setting') || '', bio: fd.getAll('bio').join(','), elig: (fd.get('elig') || '').trim() };
      profile.set({ ...profile.get(), ...(q.age ? { age: q.age } : {}), ...(q.sex ? { sex: q.sex } : {}), ...(q.country ? { country: q.country } : {}) });
      location.hash = trialsHref(q);
    });
  }

  function trialCard(s) {
    const p = s.protocolSection || {};
    const id = p.identificationModule?.nctId;
    const el = p.eligibilityModule || {};
    const countries = [...new Set((p.contactsLocationsModule?.locations || []).map((l) => l.country).filter(Boolean))];
    const phases = (p.designModule?.phases || []).map((x) => x.replace('PHASE', 'Phase ').replace('EARLY_', 'Early ').replace('NA', 'N/A'));
    const drugs = (p.armsInterventionsModule?.interventions || []).map((i) => i.name);
    const ages = [el.minimumAge, el.maximumAge].some(Boolean) ? `${el.minimumAge || 'No minimum'} – ${el.maximumAge || 'no maximum'}` : 'No age limit stated';
    return `<article class="card trial">
      <div class="tags"><span class="tag green">${e(titleCase(p.statusModule?.overallStatus))}</span>${phases.map((x) => `<span class="tag navy">${e(x)}</span>`).join('')}<span class="tag navy">${e(titleCase(p.designModule?.studyType || ''))}</span><span class="tag">Registry record · ClinicalTrials.gov ${e(id)}</span></div>
      <h3><a href="#/trial/${e(id)}">${e(p.identificationModule?.briefTitle)}</a></h3>
      <div class="trial-meta">
        <div><b>Sponsor</b>${e(p.sponsorCollaboratorsModule?.leadSponsor?.name || '—')}</div>
        <div><b>Age / sex</b>${e(ages)} · ${e(titleCase(el.sex || 'All'))}</div>
        <div><b>Countries (${countries.length})</b>${e(countries.slice(0, 6).join(', ') || 'Not listed')}${countries.length > 6 ? ` +${countries.length - 6} more` : ''}</div>
        <div style="grid-column:1/-1"><b>Treatments studied</b>${e(drugs.slice(0, 6).join(', ') || '—')}${drugs.length > 6 ? '…' : ''}</div>
        <div style="grid-column:1/-1"><b>Registry record last updated</b>${e(p.statusModule?.lastUpdatePostDateStruct?.date || 'not stated')} · verified against ClinicalTrials.gov ${e(stamp())}</div>
      </div>
      <p style="margin-top:12px"><a class="btn btn-outline btn-sm" href="#/trial/${e(id)}">Eligibility, sites &amp; how to enroll</a></p>
    </article>`;
  }

  // ---------- pages ----------
  const world = (slug) => STATS[slug]?.WORLD;
  const cancerCard = (c) => `<a class="card" href="#/cancers/${c.slug}"><h3>${e(c.name)}</h3>${world(c.slug) ? `<p>${fmt(world(c.slug).cases)} new cases worldwide in ${e(WORLD.year)}</p>` : ''}<span class="more">${c.children.length} types</span></a>`;

  function home() {
    document.title = SITE;
    const subject = FOCUS ? FOCUS.name : 'Cancer';
    const fw = FOCUS && world(FOCUS.slug);
    main.innerHTML = `
      <section class="hero"><div class="wrap hero-inner">
        <div>
          <h1>${e(subject)} research and open clinical trials, country by country</h1>
          <p>See what hospitals and research groups in ${COUNTRIES.length} countries are studying, which trials are recruiting, and how to contact the teams running them.</p>
          <div class="hero-actions">${FOCUS ? `<a class="btn btn-light" href="#/cancers/${FOCUS.slug}">Explore ${e(FOCUS.name.toLowerCase())}</a>` : '<a class="btn btn-light" href="#/cancers">Explore cancer types</a>'}<a class="btn btn-orange" href="#/countries">Research by country</a></div>
        </div>
        <div class="hero-panel"><h2>Find an open clinical trial</h2>${finderForm(profile.get(), true)}</div>
      </div></section>

      ${ROOTS.length > 1 ? `<section class="band"><div class="wrap">
        <div class="band-title"><h2>Explore by cancer</h2><span class="source-note">Case numbers: IARC GLOBOCAN ${WORLD ? e(WORLD.year) : ''} estimates</span></div>
        <div class="grid c4">${ROOTS.map(cancerCard).join('')}</div>
      </div></section>` : ''}

      ${FOCUS ? `<section class="band alt"><div class="wrap">
        <div class="band-title"><h2>${e(FOCUS.name)} worldwide</h2><a href="#/cancers/${FOCUS.slug}">All ${e(FOCUS.name.toLowerCase())} types</a></div>
        <div class="stats">
          ${fw ? `<div class="stat"><b>${fmt(fw.cases)}</b><span>new ${e(FOCUS.name.toLowerCase())} cases worldwide (${e(WORLD.year)})</span></div><div class="stat"><b>${fmt(fw.deaths)}</b><span>deaths worldwide (${e(WORLD.year)})</span></div>` : ''}
          <div class="stat"><b data-trials="${e(FOCUS.term)}" class="loading">…</b><span>${e(FOCUS.name.toLowerCase())} trials recruiting now</span></div>
          <div class="stat"><b>${REGISTRIES.length || '—'}</b><span>national and regional trial registries linked</span></div>
        </div>
        <p class="source-note" style="margin-top:12px">Incidence and mortality: ${statsSource}. Trial count: live from ClinicalTrials.gov.</p>
        <div class="grid c4" style="margin-top:26px">${FOCUS.children.filter((c) => !c.group).map((c) => `<a class="card" href="#/cancers/${FOCUS.slug}/${c.slug}">${c.abbr ? `<span class="tag green">${e(c.abbr)}</span>` : ''}<h3 style="margin-top:8px">${e(c.name)}</h3>${c.tagline ? `<p>${e(c.tagline)}</p>` : ''}</a>`).join('')}</div>
      </div></section>` : `<section class="band alt"><div class="wrap">
        <div class="band-title"><h2>Cancer worldwide</h2><span class="source-note">${REGISTRIES.length} national and regional trial registries linked</span></div>
        <div class="table-scroll"><table class="data"><thead><tr><th>Cancer</th><th class="num">New cases, ${e(WORLD?.year)}</th><th class="num">Deaths, ${e(WORLD?.year)}</th><th class="num">Trials recruiting now</th><th></th></tr></thead><tbody>
        ${ROOTS.map((c) => `<tr><td><a href="#/cancers/${c.slug}">${e(c.name)}</a></td><td class="num">${fmt(world(c.slug)?.cases)}</td><td class="num">${fmt(world(c.slug)?.deaths)}</td><td class="num" data-trials="${e(c.term)}"><span class="loading">…</span></td><td><a href="${trialsHref({ cond: c.term })}">Find trials</a></td></tr>`).join('')}
        </tbody></table></div>
        <p class="source-note" style="margin-top:10px">New cases and deaths are worldwide estimates for both sexes and all ages: ${statsSource}. Lymphoma combines Hodgkin and non-Hodgkin lymphoma; colorectal follows IARC's "colorectum" group. Trial counts are live from ClinicalTrials.gov.</p>
      </div></section>`}

      <section class="band"><div class="wrap">
        <div class="band-title"><h2>Browse by country</h2><a href="#/countries">All countries</a></div>
        <p class="lead">See how many people are affected in each country, which trials are open there, and what its researchers are publishing.</p>
        <div class="chips">${COUNTRIES.map((c) => `<a class="chip" href="#/countries/${c.code.toLowerCase()}">${e(c.name)}</a>`).join('')}</div>
      </div></section>`;
    bindFinder();
    const token = renderToken;
    pool([...main.querySelectorAll('[data-trials]')], 4, async (el) => {
      const n = await countTrials({ cond: el.dataset.trials }).catch(() => null);
      if (token === renderToken) { el.textContent = n == null ? '—' : fmt(n); el.classList.remove('loading'); }
    });
  }

  function cancerList() {
    main.innerHTML = pageHead('Cancer types', 'Choose a cancer, then drill down into its types and subtypes.', [['Home', '#/'], ['Cancer types']]) + `
      <section class="band"><div class="wrap"><div class="grid c3">${ROOTS.map((c) => `<a class="card" href="#/cancers/${c.slug}"><h3>${e(c.name)}</h3>${world(c.slug) ? `<p>${fmt(world(c.slug).cases)} new cases worldwide in ${e(WORLD.year)}</p>` : ''}<div class="tags">${c.children.map((k) => `<span class="tag">${e(k.abbr || k.name)}</span>`).join('')}</div></a>`).join('')}</div></div></section>`;
  }

  function nodePage(slugs) {
    const found = findNode(slugs);
    if (!found || found.node.soon) return notFound();
    const { node, path } = found;
    const trail = [['Home', '#/'], ['Cancer types', '#/cancers'], ...path.map((n, i) => [n.name, i < path.length - 1 ? nodeHref(path.slice(0, i + 1)) : null])];
    const kids = node.children || [];
    const short = node.abbr || node.name;
    const root = path[0], isRoot = path.length === 1;
    const st = isRoot ? STATS[root.slug] : null;
    const sub = node.tagline || (st ? `About ${fmt(st.WORLD.cases)} new cases and ${fmt(st.WORLD.deaths)} deaths worldwide in ${WORLD.year}, by IARC estimates.` : `${root.name}: open trials and research worldwide.`);
    // Statements may be plain strings or {text, cites:[{label,url}]}; cited ones get numbered reference links.
    const refs = [];
    const ref = (c) => { let i = refs.findIndex((r) => r.url === c.url); if (i < 0) i = refs.push(c) - 1; return `<sup><a href="#ref-${i + 1}" aria-label="Reference ${i + 1}">[${i + 1}]</a></sup>`; };
    const T = (x) => (typeof x === 'string' ? e(x) : e(x.text) + (x.cites || []).map(ref).join(''));
    let treatHtml = '';
    main.innerHTML = pageHead(node.abbr ? `${node.name} (${node.abbr})` : node.name, sub, trail) + `
      <section class="band"><div class="wrap two-col">
        <div>
          ${st ? `<div class="stats" style="grid-template-columns:repeat(2,1fr);margin-bottom:10px"><div class="stat"><b>${fmt(st.WORLD.cases)}</b><span>new cases worldwide (${e(WORLD.year)})</span></div><div class="stat"><b>${fmt(st.WORLD.deaths)}</b><span>deaths worldwide (${e(WORLD.year)})</span></div></div><p class="source-note" style="margin-bottom:22px">${statsSource}</p>` : ''}
          ${node.overview?.length || node.group ? '' : `<div class="notice info">A written summary of ${e(node.name.toLowerCase())} has not been published on this site yet. Everything on this page is live data: open trials, activity by country and recent research.</div>`}
          ${(node.overview || []).map((p) => `<p>${T(p)}</p>`).join('')}
          ${node.facts?.length ? `<h3 style="margin-top:1.4em">Key facts</h3><ul class="facts">${node.facts.map((f) => `<li>${T(f)}</li>`).join('')}</ul>` : ''}
          ${node.global ? `<div class="notice info" style="margin-top:22px"><strong>Around the world.</strong> ${T(node.global)}</div>` : ''}
          ${treatHtml = node.treatments?.length ? `<div class="card"><h3>Treatment approaches</h3><div class="tags">${node.treatments.map((t) => `<span class="tag navy">${e(t)}</span>`).join('')}</div>${(node.treatmentCites || []).length ? `<p class="source-note" style="margin-top:8px">Sources ${node.treatmentCites.map(ref).join(' ')}</p>` : ''}</div>` : '', ''}
          ${refs.length ? `<h3 style="margin-top:1.6em">References</h3><ol class="refs">${refs.map((r, i) => `<li id="ref-${i + 1}">${ext(r.url, r.label)}</li>`).join('')}</ol><p class="source-note">Each statement above links to the source that supports it; citations were last checked on ${longDate(VERIFIED.citations)}. The text has not yet been reviewed by a medical board.</p>` : (node.overview?.length ? reviewNotice : '')}
        </div>
        <aside class="stack">
          ${isRoot ? `<div class="card" id="whats-new"><h3>What's new</h3><p class="loading">Loading the daily snapshot…</p></div>` : ''}
          ${node.group ? '' : `<div class="card"><h3>Open ${e(short)} trials</h3><p><span class="count loading" id="node-count">…</span><br><span class="source-note">recruiting worldwide right now</span></p><a class="btn btn-orange" href="${trialsHref({ cond: node.term })}">Find a trial</a></div>`}
          ${treatHtml}
          ${node.sources?.length ? `<div class="card"><h3>Further reading</h3>${node.sources.map(([t, u]) => `<p style="margin:.3em 0">${ext(u, t)}</p>`).join('')}</div>` : ''}
        </aside>
      </div></section>

      ${kids.length ? `<section class="band alt"><div class="wrap">
        <div class="band-title"><h2>${path.length === 1 ? `Types of ${e(node.name.toLowerCase())}` : 'Subtypes'}</h2></div>
        <div class="grid c3">${kids.map((k) => `<a class="card" href="${nodeHref([...path, k])}">${k.abbr ? `<span class="tag green">${e(k.abbr)}</span>` : ''}<h3 style="margin-top:8px">${e(k.name)}</h3>${k.tagline ? `<p>${e(k.tagline)}</p>` : ''}${k.children?.length ? `<span class="more">${k.children.length} subtypes</span>` : '<span class="more">Details &amp; trials</span>'}</a>`).join('')}</div>
      </div></section>` : ''}

      ${node.group ? '' : `<section class="band"><div class="wrap">
        <div class="band-title"><h2>Open ${e(short)} trials by country</h2><span class="source-note">Live counts · select a country to see its trials</span></div>
        <div class="table-scroll"><table class="data"><thead><tr><th>Country</th><th>Region</th>${st ? '<th class="num">New cases / year</th><th class="num">Deaths / year</th>' : ''}<th class="num">Recruiting trials</th><th class="num">Research papers</th><th>National registry</th><th></th></tr></thead>
        <tbody>${COUNTRIES.map((c) => `<tr><td><a href="#/countries/${c.code.toLowerCase()}">${e(c.name)}</a></td><td>${e(c.region)}</td>${st ? `<td class="num">${fmt(st[c.code]?.cases)}</td><td class="num">${fmt(st[c.code]?.deaths)}</td>` : ''}<td class="num" data-count="${e(c.name)}"><span class="loading">…</span></td><td class="num" data-papers="${e(c.code)}"><span class="loading">…</span></td><td>${c.registry ? ext(c.registry.url, c.registry.name) : '—'}</td><td><a href="${trialsHref({ cond: node.term, country: c.name })}">View trials</a></td></tr>`).join('')}</tbody></table></div>
        <p class="source-note" style="margin-top:10px">Counts come from ClinicalTrials.gov, which lists studies in most countries but does not include every trial registered only in a national registry. Use the registry links to search those directly. Trial counts: ${retrieved('ClinicalTrials.gov')} Research papers: all-time count of scholarly works with "${e(node.term)}" in the title and an author institution in that country (OpenAlex).${st ? ` New cases and deaths: ${statsSource}.` : ''}</p>
      </div></section>

      <section class="band alt"><div class="wrap">
        <div class="band-title"><h2>Latest ${e(short)} research, country by country</h2></div>
        <div class="chips" id="region-chips">${['All regions', ...REGIONS].map((r, i) => `<button type="button" class="chip${i === 0 ? ' active' : ''}" aria-pressed="${i === 0}" data-region="${i === 0 ? '' : e(r)}">${e(r)}</button>`).join('')}</div>
        <div class="grid c3" id="pub-grid" style="margin-top:20px"></div>
        <p class="source-note" style="margin-top:10px">Most recent peer-reviewed papers with "${e(node.term)}" in the title and at least one author affiliated with an institution in that country. Stage and source labels are assigned automatically from the index's article type and subject headings, and can be wrong; the linked record is authoritative.</p>
        <h3 style="margin-top:28px">Search regional research indexes</h3>
        <p class="source-note">Much research from China, Latin America, Africa, Japan and Russia is published in national-language journals that international indexes miss. These open each index's own search for ${e(short)}.</p>
        <div class="chips">${LIT.filter((l) => l.search).map((l) => `<a class="chip" href="${e(l.search.replace('{q}', encodeURIComponent(node.term)))}" target="_blank" rel="noopener noreferrer" title="${e(l.covers)}">${e(l.name)}</a>`).join('')}</div>
      </div></section>`}`;

    if (node.group) return;
    const token = renderToken;
    if (isRoot) snapshot('feed', root.slug).then((feed) => {
      const card = token === renderToken && document.getElementById('whats-new');
      if (!card) return;
      const n = (t) => feed.events.filter((ev) => ev.type === t).length;
      card.innerHTML = `<h3>What's new</h3><p class="source-note">Last 90 days, snapshot ${e(feed.date)}</p><ul class="facts" style="font-size:.95rem"><li>${fmt(n('new'))} new trials registered</li><li>${fmt(n('status'))} status changes</li><li>${fmt(n('results'))} trials posted results</li><li>${fmt(n('approval'))} FDA approvals</li></ul><p style="margin-top:12px"><a class="btn btn-outline btn-sm" href="#/updates/${root.slug}">Updates feed</a> <a class="btn btn-outline btn-sm" href="#/pipeline/${root.slug}">Drug pipeline</a></p>`;
    }).catch(() => { const card = document.getElementById('whats-new'); if (card) card.innerHTML = '<h3>What\'s new</h3><p class="source-note">No daily snapshot available yet.</p>'; });
    countTrials({ cond: node.term }).then((n) => { const el = document.getElementById('node-count'); if (el && token === renderToken) { el.textContent = fmt(n); el.classList.remove('loading'); } }).catch(() => {});
    pool(COUNTRIES, 4, async (c) => {
      const n = await countTrials({ cond: node.term, country: c.name }).catch(() => null);
      const cell = token === renderToken && main.querySelector(`[data-count="${CSS.escape(c.name)}"]`);
      if (cell) cell.textContent = n == null ? '—' : fmt(n);
    });
    paperCounts(node.term).then((counts) => {
      if (token !== renderToken) return;
      main.querySelectorAll('[data-papers]').forEach((cell) => { cell.textContent = fmt(counts[cell.dataset.papers] || 0); });
    }).catch(() => { main.querySelectorAll('[data-papers]').forEach((cell) => { cell.textContent = '—'; }); });
    const grid = document.getElementById('pub-grid');
    const drawPubs = (region) => {
      const list = COUNTRIES.filter((c) => !region || c.region === region);
      grid.innerHTML = list.map((c) => `<div class="card country-card"><h3><a href="#/countries/${c.code.toLowerCase()}">${e(c.name)}</a></h3><div data-pubs="${e(c.code)}"><p class="loading">Loading…</p></div></div>`).join('');
      pool(list, 3, async (c) => {
        let html;
        try { html = pubList(await publications(node.term, c, 3)); } catch { html = '<p class="error">Could not load publications.</p>'; }
        const box = token === renderToken && grid.querySelector(`[data-pubs="${c.code}"]`);
        if (box) box.innerHTML = html;
      });
    };
    document.getElementById('region-chips').addEventListener('click', (ev) => {
      const a = ev.target.closest('[data-region]');
      if (!a) return;
      ev.preventDefault();
      document.querySelectorAll('#region-chips .chip').forEach((x) => { x.classList.toggle('active', x === a); x.setAttribute('aria-pressed', x === a); });
      drawPubs(a.dataset.region);
    });
    drawPubs('');
  }

  function pubList(res) {
    if (!res.items.length) return '<p class="source-note">No recent indexed papers found.</p>';
    return `<p class="source-note" style="margin:0">${fmt(res.total)} papers indexed · retrieved ${e(res.retrieved)}</p><ul class="pubs">${res.items.map((p) => `<li>${ext(p.url, String(p.title || '').replace(/<[^>]+>/g, ''))}<small>${e(p.journal || '')}${p.date ? ' · published ' + e(p.date) : ''}</small><small>${e((p.authors || '').slice(0, 90))}${(p.authors || '').length > 90 ? '…' : ''}</small><span class="tags" style="margin:5px 0 0"><span class="tag navy">${e(p.stage)}</span><span class="tag">${e(p.source)}</span></span></li>`).join('')}</ul>`;
  }

  function trialsPage(q) {
    if (!q.cond) q = { ...q, cond: DEFAULT_COND };
    // Filters arriving via a shared link also feed the pre-screen on trial pages.
    if (q.age || q.sex || q.country) profile.set({ ...profile.get(), ...(q.age ? { age: q.age } : {}), ...(q.sex ? { sex: q.sex } : {}), ...(q.country ? { country: q.country } : {}) });
    main.innerHTML = pageHead('Find a clinical trial', 'Search open cancer trials worldwide, then check the age, sex and location requirements against your own situation.', [['Home', '#/'], ['Find a clinical trial']]) + `
      <section class="band"><div class="wrap">
        <div class="card">${finderForm(q)}</div>
        ${q.intr ? `<div class="notice info" style="margin-top:14px">Showing trials whose interventions include <strong>${e(q.intr)}</strong>. Changing the filters above drops this drug filter. <a href="#/drug/${encodeURIComponent(q.intr)}">Drug page</a></div>` : ''}
        ${q.setting || q.bio || q.elig ? '<div class="notice" style="margin-top:14px">Disease setting, biomarker and eligibility-text filters are keyword searches of the registry record. They can miss trials that use different wording and include trials where the term appears as an exclusion. Always read the full eligibility criteria.</div>' : ''}
        <div class="results-bar"><h2 id="result-count" style="margin:0" class="loading" aria-live="polite">Searching…</h2><span class="source-note" id="ct-stamp">Sorted by most recently updated</span></div>
        <div class="stack" id="results"></div>
        <p style="text-align:center;margin-top:22px"><button class="btn btn-outline" id="more" hidden>Load more trials</button></p>
        <div class="results-bar"><h2 style="margin:0">Also recruiting: ISRCTN registry</h2><span class="source-note" id="isrctn-stamp">UK-based international registry · live</span></div>
        <div class="stack" id="isrctn"><p class="loading">Searching ISRCTN…</p></div>
      </div></section>
      <section class="band alt"><div class="wrap">
        <div class="band-title"><h2>Search national registries directly</h2></div>
        <p class="lead">Many trials, particularly in Asia, Latin America, Africa and the Middle East, are registered only in a national or regional registry. These links open each registry's own search for your selected cancer type.</p>
        <div class="table-scroll"><table class="data"><thead><tr><th>Registry</th><th>Covers</th><th></th></tr></thead><tbody>
        ${[...REGISTRIES].sort((a, b) => (matchesCountry(b, q.country) - matchesCountry(a, q.country))).map((r) => `<tr><td><strong>${e(r.name)}</strong>${r.note ? `<br><span class="source-note">${e(r.note)}</span>` : ''}</td><td>${e(r.covers)}</td><td>${ext(registryLink(r, q.cond), r.search ? `Search for ${shortTerm(q.cond)}` : 'Open registry')}</td></tr>`).join('')}
        </tbody></table></div>
      </div></section>`;
    bindFinder();
    const results = document.getElementById('results'), more = document.getElementById('more'), count = document.getElementById('result-count');
    const token = renderToken;
    const load = async (pageToken) => {
      more.disabled = true;
      try {
        const d = await searchTrials(q, pageToken);
        if (token !== renderToken) return;
        if (!pageToken) {
          count.className = '';
          count.textContent = `${fmt(d.totalCount)} open trial${d.totalCount === 1 ? '' : 's'} found`;
          document.getElementById('ct-stamp').textContent = `Sorted by most recently updated · ${retrieved('ClinicalTrials.gov')}`;
          if (!d.totalCount) results.innerHTML = '<div class="notice">No trials on ClinicalTrials.gov match these filters. Try removing the country or age filter, or search the national registries listed below.</div>';
        }
        results.insertAdjacentHTML('beforeend', (d.studies || []).map(trialCard).join(''));
        more.hidden = !d.nextPageToken;
        more.onclick = () => load(d.nextPageToken);
      } catch (err) {
        count.className = 'error';
        count.textContent = 'Could not load trials';
        results.innerHTML = `<div class="notice">The trial registry did not respond (${e(err.message)}). Please try again shortly.</div>`;
      }
      more.disabled = false;
    };
    load();
    isrctnTrials(q.cond || DEFAULT_COND, q.country).then((list) => {
      if (token !== renderToken) return;
      const age = parseFloat(q.age);
      list = list.filter((t) => {
        const lo = parseAge(t.minAge), hi = parseAge(t.maxAge);
        const ageOk = isNaN(age) || ((lo == null || age >= lo) && (hi == null || age <= hi));
        const sexOk = !q.sex || !t.sex || /^(all|both)$/i.test(t.sex) || t.sex.toUpperCase() === q.sex;
        return ageOk && sexOk;
      });
      document.getElementById('isrctn-stamp').textContent = retrieved('ISRCTN');
      document.getElementById('isrctn').innerHTML = list.length ? list.map((t) => `<article class="card trial">
        <div class="tags"><span class="tag green">Recruiting</span>${t.phase && t.phase !== 'Not Applicable' ? `<span class="tag navy">${e(t.phase)}</span>` : ''}<span class="tag">Registry record · ISRCTN ${e(t.id.replace('ISRCTN', ''))}</span>${t.updated ? `<span class="tag">Record updated ${e(t.updated)}</span>` : ''}</div>
        <h3>${ext(`https://www.isrctn.com/${t.id}`, t.title)}</h3>
        <div class="trial-meta"><div><b>Condition</b>${e(t.condition.slice(0, 120))}</div><div><b>Age / sex</b>${e(t.minAge || 'No minimum')} – ${e(t.maxAge || 'no maximum')} · ${e(t.sex || 'All')}</div><div><b>Countries</b>${e(t.countries.slice(0, 6).join(', ') || 'Not listed')}</div></div>
        <p style="margin-top:12px">${ext(`https://www.isrctn.com/${t.id}`, 'Full record, eligibility & contacts on ISRCTN')}</p>
      </article>`).join('') : '<p class="source-note">No additional recruiting trials found on ISRCTN for these filters.</p>';
    }).catch(() => { if (token === renderToken) document.getElementById('isrctn').innerHTML = '<p class="source-note">ISRCTN could not be reached right now.</p>'; });
  }
  const matchesCountry = (r, name) => (name && (r.countries || []).some((c) => c.toLowerCase() === name.toLowerCase()) ? 1 : 0);
  const shortTerm = (t) => e((t || 'cancer').toLowerCase());

  function parseAge(s) {
    const m = /([\d.]+)\s*(year|month|week|day|hour|minute)/i.exec(s || '');
    if (!m) return null;
    return parseFloat(m[1]) / { year: 1, month: 12, week: 52, day: 365, hour: 8760, minute: 525600 }[m[2].toLowerCase()];
  }
  function formatCriteria(text) {
    return String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => (
      /^(key\s+)?(inclusion|exclusion)\s+criteria\s*:?$/i.test(l) ? `<h4>${e(l.replace(/:$/, ''))}</h4>` : `<p>${e(l.replace(/^[*\-•]\s*/, '• '))}</p>`
    )).join('');
  }
  function contactLine(c, nct) {
    const bits = [];
    if (c.name) bits.push(`<strong>${e(c.name)}</strong>`);
    if (c.phone) bits.push(`<a href="tel:${e(c.phone.replace(/[^\d+]/g, ''))}">${e(c.phone)}</a>`);
    if (c.email) bits.push(`<a href="mailto:${e(c.email)}?subject=${encodeURIComponent('Question about clinical trial ' + nct)}">${e(c.email)}</a>`);
    return bits.join(' · ');
  }

  async function trialPage(id) {
    if (!/^NCT\d{8}$/.test(id)) return notFound();
    main.innerHTML = pageHead('Loading trial…', id, [['Home', '#/'], ['Find a clinical trial', '#/trials'], [id]]);
    const token = renderToken;
    let s;
    try { s = await getJSON(`${CT}/${id}`); } catch (err) {
      if (token === renderToken) main.innerHTML = pageHead('Trial not available', id) + `<section class="band"><div class="wrap"><div class="notice">Could not load this trial (${e(err.message)}).</div></div></section>`;
      return;
    }
    if (token !== renderToken) return;
    const p = s.protocolSection || {};
    const el = p.eligibilityModule || {}, cl = p.contactsLocationsModule || {}, d = p.designModule || {};
    const me = profile.get();
    const byCountry = {};
    for (const l of cl.locations || []) (byCountry[l.country || 'Unknown'] ||= []).push(l);
    const mine = (me.country || '').toLowerCase();
    const countryNames = Object.keys(byCountry).sort((a, b) => (b.toLowerCase() === mine) - (a.toLowerCase() === mine) || byCountry[b].length - byCountry[a].length);

    // Pre-screen against the visitor's saved age / sex / country.
    const checks = [];
    const age = parseFloat(me.age), lo = parseAge(el.minimumAge), hi = parseAge(el.maximumAge);
    if (!isNaN(age)) {
      const ok = (lo == null || age >= lo) && (hi == null || age <= hi);
      checks.push([ok ? 'yes' : 'no', `Age ${e(me.age)}: trial accepts ${e(el.minimumAge || 'no minimum')} to ${e(el.maximumAge || 'no maximum')}`]);
    }
    if (me.sex) checks.push([!el.sex || el.sex === 'ALL' || el.sex === me.sex ? 'yes' : 'no', `Sex: trial accepts ${e(titleCase(el.sex || 'all'))}`]);
    if (me.country) {
      const sites = byCountry[countryNames.find((c) => c.toLowerCase() === mine)] || [];
      const open = sites.filter((l) => l.status === 'RECRUITING').length;
      checks.push([sites.length ? 'yes' : 'no', sites.length ? `${sites.length} study site${sites.length > 1 ? 's' : ''} in ${e(me.country)}${open ? ` (${open} recruiting now)` : ''}` : `No study sites listed in ${e(me.country)}`]);
    }
    checks.push(['unk', 'Medical criteria (diagnosis, prior treatment, test results) must be confirmed by the study team']);

    const phases = (d.phases || []).map((x) => x.replace('PHASE', 'Phase ').replace('EARLY_', 'Early ').replace('NA', 'N/A'));
    const title = p.identificationModule?.briefTitle;
    main.innerHTML = pageHead(title, p.identificationModule?.officialTitle !== title ? p.identificationModule?.officialTitle : '', [['Home', '#/'], ['Find a clinical trial', '#/trials'], [id]]) + `
      <section class="band"><div class="wrap two-col">
        <div>
          <div class="tags"><span class="tag green">${e(titleCase(p.statusModule?.overallStatus))}</span>${phases.map((x) => `<span class="tag navy">${e(x)}</span>`).join('')}<span class="tag">${e(titleCase(d.studyType))}</span><span class="tag">${e(id)}</span></div>
          <h2 style="margin-top:18px">What this study is about</h2>
          ${String(p.descriptionModule?.briefSummary || '').split('\n').filter((x) => x.trim()).map((x) => `<p>${e(x)}</p>`).join('')}
          <div class="trial-meta" style="margin:18px 0 28px">
            <div><b>Sponsor</b>${e(p.sponsorCollaboratorsModule?.leadSponsor?.name || '—')}</div>
            <div><b>Planned participants</b>${fmt(d.enrollmentInfo?.count)}</div>
            <div><b>Last updated</b>${e(p.statusModule?.lastUpdatePostDateStruct?.date || '—')}</div>
            <div><b>Conditions</b>${e((p.conditionsModule?.conditions || []).join(', '))}</div>
            <div><b>Started</b>${e(p.statusModule?.startDateStruct?.date || '—')}</div>
            <div><b>Est. completion</b>${e(p.statusModule?.primaryCompletionDateStruct?.date || '—')}</div>
          </div>

          <h2>Treatments being studied</h2>
          <ul class="facts">${(p.armsInterventionsModule?.interventions || []).map((i) => `<li><strong>${e(i.name)}</strong> <span class="tag">${e(titleCase(i.type))}</span>${i.description ? `<br><span class="source-note">${e(i.description.slice(0, 320))}${i.description.length > 320 ? '…' : ''}</span>` : ''}</li>`).join('') || '<li>Not listed</li>'}</ul>

          <h2 style="margin-top:32px">Who can take part</h2>
          <div class="trial-meta" style="margin-bottom:10px">
            <div><b>Age</b>${e(el.minimumAge || 'No minimum')} – ${e(el.maximumAge || 'no maximum')}</div>
            <div><b>Sex</b>${e(titleCase(el.sex || 'All'))}</div>
            <div><b>Healthy volunteers</b>${el.healthyVolunteers ? 'Accepted' : 'No'}</div>
          </div>
          <div class="card criteria">${formatCriteria(el.eligibilityCriteria) || '<p>No criteria published.</p>'}</div>

          <h2 style="margin-top:32px" id="sites">Study sites (${(cl.locations || []).length}) in ${countryNames.length} countr${countryNames.length === 1 ? 'y' : 'ies'}</h2>
          ${countryNames.map((c) => `<details${c.toLowerCase() === mine ? ' open' : ''}><summary>${e(c)} (${byCountry[c].length} site${byCountry[c].length > 1 ? 's' : ''})</summary><div class="inner">${byCountry[c].map((l) => `<div class="site"><strong>${e(l.facility || 'Study site')}</strong> ${l.status ? `<span class="tag${l.status === 'RECRUITING' ? ' green' : ''}">${e(titleCase(l.status))}</span>` : ''}<br>${e([l.city, l.state, l.zip].filter(Boolean).join(', '))}${(l.contacts || []).filter((x) => x.role === 'CONTACT').map((x) => `<br>${contactLine(x, id)}`).join('')}</div>`).join('')}</div></details>`).join('') || '<p>No sites listed yet.</p>'}
        </div>

        <aside class="stack">
          <div class="card"><h3>Your quick pre-screen</h3>
            ${checks.length > 1 ? '' : '<p class="source-note">Enter your age, sex and country in the <a href="#/trials">trial finder</a> to check them against this study.</p>'}
            <ul class="check-list">${checks.map(([k, t]) => `<li class="${k}">${t}</li>`).join('')}</ul>
            <p class="source-note" style="margin-top:10px">This is only a first check of basic requirements. It cannot tell you whether you are eligible.</p>
          </div>
          <div class="card" style="border-top:4px solid var(--orange)"><h3>How to enroll</h3>
            <ol class="steps">
              <li>Share this study (${e(id)}) with your hematologist or oncologist and ask whether it fits your situation.</li>
              <li>Contact the study team through the central contact below or the site nearest you.</li>
              <li>The team will review your records and arrange a screening visit to confirm eligibility.</li>
              <li>If eligible, you review and sign an informed consent form before anything starts. You can withdraw at any time.</li>
            </ol>
            ${(cl.centralContacts || []).length ? `<h4>Central study contact</h4>${cl.centralContacts.map((c) => `<p style="margin:.3em 0">${contactLine(c, id)}</p>`).join('')}` : '<p class="source-note">No central contact is listed. Contact a study site directly.</p>'}
            ${(cl.overallOfficials || []).length ? `<h4 style="margin-top:1em">Lead investigators</h4>${cl.overallOfficials.map((o) => `<p style="margin:.3em 0"><strong>${e(o.name)}</strong><br><span class="source-note">${e(o.affiliation || '')}</span></p>`).join('')}` : ''}
            <p style="margin-top:14px"><a class="btn btn-orange btn-sm" href="#sites">See study sites</a></p>
            <p><a href="#/enroll">More about joining a trial</a></p>
          </div>
          <div class="card"><h3>Official record</h3><p>${ext(`https://clinicaltrials.gov/study/${id}`, `${id} on ClinicalTrials.gov`)}</p>${(p.identificationModule?.secondaryIdInfos || p.identificationModule?.secondaryIdInfo || []).length ? `<p class="source-note">Other IDs: ${(p.identificationModule.secondaryIdInfos || p.identificationModule.secondaryIdInfo).map((x) => e(x.id)).join(', ')}</p>` : ''}<p class="source-note">Information shown here is maintained by the study sponsor. ${retrieved('ClinicalTrials.gov')}</p></div>
        </aside>
      </div></section>`;
  }

  function countriesPage() {
    main.innerHTML = pageHead('Research by country', 'Cancer burden, open trials, research groups and national registries, region by region.', [['Home', '#/'], ['Research by country']]) +
      REGIONS.map((r, i) => {
        const list = COUNTRIES.filter((c) => c.region === r);
        return list.length ? `<section class="band${i % 2 ? ' alt' : ''}"><div class="wrap"><div class="band-title"><h2>${e(r)}</h2></div><div class="grid c3">${list.map((c) => `<a class="card country-card" href="#/countries/${c.code.toLowerCase()}"><h3>${e(c.name)}</h3><p>${e((c.groups || []).slice(0, 3).map((g) => g.short || g.name).join(' · '))}</p><span class="more">Statistics, trials &amp; research groups</span></a>`).join('')}</div></div></section>` : '';
      }).join('');
  }

  function countryPage(code) {
    const c = country(code);
    if (!c) return notFound();
    const leuk = CANCERS.find((x) => x.slug === 'leukemia');
    const link = (o) => (o ? (o.url ? ext(o.url, o.name) : e(o.name)) : '—');
    const regs = REGISTRIES.filter((r) => r.id === 'ictrp' || (r.countries || []).includes(c.name));
    const first = FOCUS || ROOTS[0];
    main.innerHTML = pageHead(c.name, `Cancer research, trials and resources in ${c.name}.`, [['Home', '#/'], ['Research by country', '#/countries'], [c.name]]) + `
      <section class="band"><div class="wrap two-col">
        <div>
          <h2>${ROOTS.length === 1 ? e(ROOTS[0].name) : 'Cancer'} in ${e(c.name)}</h2>
          <div class="table-scroll"><table class="data"><thead><tr><th>Cancer</th><th class="num">New cases / year</th><th class="num">Deaths / year</th><th class="num">Recruiting trials</th><th></th></tr></thead><tbody>
          ${ROOTS.map((t) => `<tr><td><a href="#/cancers/${t.slug}">${e(t.name)}</a></td><td class="num">${fmt(STATS[t.slug]?.[c.code]?.cases)}</td><td class="num">${fmt(STATS[t.slug]?.[c.code]?.deaths)}</td><td class="num" data-type="${e(t.term)}"><span class="loading">…</span></td><td><a href="${trialsHref({ cond: t.term, country: c.name })}">View trials</a></td></tr>`).join('')}
          </tbody></table></div>
          <p class="source-note" style="margin-top:8px">New cases and deaths: ${statsSource}. ${c.statsNote ? e(c.statsNote) + ' ' : ''}Trial counts: ${retrieved('ClinicalTrials.gov')} ${c.registry ? `For trials registered only nationally, search ${ext(c.registry.url, c.registry.name)}.` : ''}</p>
          ${regs.length ? `<h3 style="margin-top:22px">Registries covering ${e(c.name)}</h3><div class="chips">${regs.map((r) => `<a class="chip" href="${e(registryLink(r, 'cancer'))}" target="_blank" rel="noopener noreferrer">${e(r.name)}</a>`).join('')}</div>` : ''}

          ${leuk ? `<h2 style="margin-top:34px">Leukemia trials by type</h2>
          <div class="table-scroll"><table class="data"><thead><tr><th>Leukemia type</th><th class="num">Recruiting trials</th><th></th></tr></thead><tbody>
          ${leuk.children.filter((k) => !k.group).map((t) => `<tr><td>${e(t.name)}</td><td class="num" data-type="${e(t.term)}"><span class="loading">…</span></td><td><a href="${trialsHref({ cond: t.term, country: c.name })}">View trials</a></td></tr>`).join('')}
          </tbody></table></div>` : ''}

          <h2 style="margin-top:34px">Leukemia research groups and centers</h2>
          <p class="source-note">Research groups for the other cancers have not been added yet. Group descriptions and their source links were last checked on ${longDate(VERIFIED.countryLinks)}.</p>
          <div class="stack">${(c.groups || []).map((g) => `<div class="card"><h3>${g.url ? ext(g.url, g.name) : e(g.name)}</h3>${g.city ? `<span class="tag">${e(g.city)}</span>` : ''}<p style="margin-top:8px">${e(g.note || '')}</p>${(g.src || []).length ? `<p class="source-note">Source: ${g.src.map(([t, u]) => ext(u, t)).join(' · ')}</p>` : ''}</div>`).join('') || '<p>No groups listed yet.</p>'}</div>

          <h2 style="margin-top:34px">Latest research from ${e(c.name)}</h2>
          <div class="chips" id="pub-cancer"${ROOTS.length === 1 ? ' hidden' : ''}>${ROOTS.map((t) => `<button type="button" class="chip${t === first ? ' active' : ''}" aria-pressed="${t === first}" data-term="${e(t.term)}">${e(t.name)}</button>`).join('')}</div>
          <div id="country-pubs" style="margin-top:14px"><p class="loading">Loading…</p></div>
        </div>
        <aside class="stack">
          <div class="card"><h3>National resources</h3>
            <p><b class="source-note">Trial registry</b><br>${link(c.registry)}</p>
            <p><b class="source-note">Medicines regulator</b><br>${link(c.regulator)}</p>
            <p><b class="source-note">Clinical guidelines</b><br>${link(c.guideline)}</p>
            <p><b class="source-note">Patient organization</b><br>${link(c.patientOrg)}</p>
          </div>
        </aside>
      </div></section>`;
    const token = renderToken;
    pool([...main.querySelectorAll('[data-type]')], 3, async (cell) => {
      const n = await countTrials({ cond: cell.dataset.type, country: c.name }).catch(() => null);
      if (token === renderToken) cell.textContent = n == null ? '—' : fmt(n);
    });
    const box = document.getElementById('country-pubs');
    const loadPubs = (term) => {
      box.innerHTML = '<p class="loading">Loading…</p>';
      publications(term, c, 8).then((r) => { if (token === renderToken) box.innerHTML = pubList(r); })
        .catch(() => { if (token === renderToken) box.innerHTML = '<p class="error">Could not load publications.</p>'; });
    };
    document.getElementById('pub-cancer').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-term]');
      if (!b) return;
      document.querySelectorAll('#pub-cancer .chip').forEach((x) => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
      loadPubs(b.dataset.term);
    });
    loadPubs(first.term);
  }

  function enrollPage() {
    main.innerHTML = pageHead('How to join a clinical trial', 'What trials are, how eligibility works, and the steps from finding a study to enrolling.', [['Home', '#/'], ['How to join a trial']]) + `
      <section class="band"><div class="wrap two-col">
        <div>
          <h2>The steps</h2>
          <ol class="steps">
            <li><strong>Know your diagnosis in detail.</strong> Trials are written for specific situations: the exact cancer type, its genetic features, and whether it is newly diagnosed, in remission, or has come back. Ask your doctor for these details and copies of your key test reports.</li>
            <li><strong>Search for open trials.</strong> Use the <a href="#/trials">trial finder</a> with your cancer type, country and age. Also check your national registry, because some trials are listed only there.</li>
            <li><strong>Read the eligibility criteria.</strong> Every trial lists inclusion criteria (what you must have) and exclusion criteria (what rules you out). Our pre-screen checks the basics; the medical criteria need your doctor.</li>
            <li><strong>Talk with your own doctor.</strong> Bring the trial's registry number. Your hematologist or oncologist can judge whether it is a reasonable option and can often refer you directly.</li>
            <li><strong>Contact the study team.</strong> Each trial page lists a central contact and site contacts. You, a family member or your doctor can call or email. Give the registry number and a short summary of your diagnosis.</li>
            <li><strong>Screening.</strong> The team reviews your records and performs tests to confirm you meet every criterion. Not everyone who is screened can enroll.</li>
            <li><strong>Informed consent.</strong> Before anything begins you receive a written explanation of the study's purpose, procedures, risks and possible benefits, in your language. Take time, ask questions. Signing is voluntary, and you can leave the study at any time without affecting your regular care.</li>
          </ol>
          <h2 style="margin-top:28px">Understanding trial phases</h2>
          <ul class="facts">
            <li><strong>Phase 1</strong> tests a new treatment in a small group to find a safe dose and identify side effects.</li>
            <li><strong>Phase 2</strong> studies how well the treatment works in a specific cancer, and continues to assess safety.</li>
            <li><strong>Phase 3</strong> compares the new treatment with the current standard, usually in hundreds of patients assigned at random.</li>
            <li><strong>Phase 4</strong> follows an approved treatment in wider use to learn about long-term effects.</li>
          </ul>
          <h2 style="margin-top:28px">Joining a trial in another country</h2>
          <p>Most trials enroll patients who live near a study site and can attend frequent visits. Joining a trial abroad is sometimes possible but depends on the sponsor, the site, visa and insurance rules, and your ability to stay near the hospital. Ask the study team directly, and ask whether a site is planned in your own country.</p>
        </div>
        <aside class="stack">
          <div class="card"><h3>Questions to ask the study team</h3><ul class="facts">
            <li>What is the purpose of this study?</li><li>What treatments or tests are involved, and how often?</li><li>How could this compare with my standard treatment options?</li><li>What are the known risks and side effects?</li><li>Who pays for study treatment, tests, travel and lodging?</li><li>How long will I be in the study, and what follow-up is needed?</li><li>Can I continue the treatment after the study ends if it helps me?</li>
          </ul></div>
          <div class="card"><h3>Official guidance</h3>
            <p style="margin:.3em 0">${ext('https://www.cancer.gov/research/participate/clinical-trials-search/steps', 'NCI: Steps to find a clinical trial')}</p>
            <p style="margin:.3em 0">${ext('https://www.fda.gov/patients/drug-development-process/step-3-clinical-research', 'FDA: Clinical research phases')}</p>
            <p style="margin:.3em 0">${ext('https://www.cancer.gov/research/participate/clinical-trials/paying', 'NCI: Paying for clinical trials')}</p>
          </div>
          <div class="notice">This site does not enroll patients and cannot determine eligibility. Only the study team can do that.</div>
          <a class="btn btn-orange" href="#/trials">Search open trials</a>
        </aside>
      </div></section>`;
  }

  function aboutPage() {
    const lit = window.LITERATURE_SOURCES || [];
    main.innerHTML = pageHead('About the data', 'Where the information on this site comes from, how current it is, and what its limits are.', [['Home', '#/'], ['About the data']]) + `
      <section class="band"><div class="wrap">
        <div class="notice"><strong>Proof of concept.</strong> The site currently covers leukemia only; other cancers will be added. Disease summaries and research-group descriptions are draft text that has not yet been reviewed by a medical board or matched line by line to citations. Coverage of national registries is still being expanded.</div>
        <h2>Clinical trial registries</h2>
        <p class="lead">Trials are registered in many different registries worldwide. We show live results where a registry offers open data access, and link directly to the registry's own search where it does not.</p>
        <div class="table-scroll"><table class="data"><thead><tr><th>Registry</th><th>Covers</th><th>How we use it</th></tr></thead><tbody>
        ${REGISTRIES.map((r) => `<tr><td>${ext(r.url, r.name)}</td><td>${e(r.covers)}</td><td>${e(r.access || 'Direct link to registry search')}</td></tr>`).join('')}
        </tbody></table></div>
        ${lit.length ? `<h2 style="margin-top:34px">Research literature and statistics</h2><div class="table-scroll"><table class="data"><thead><tr><th>Source</th><th>Covers</th><th>How we use it</th></tr></thead><tbody>${lit.map((r) => `<tr><td>${ext(r.url, r.name)}</td><td>${e(r.covers)}</td><td>${e(r.access)}</td></tr>`).join('')}</tbody></table></div>` : ''}
        <h2 style="margin-top:34px">How current is each part of the site</h2>
        <div class="table-scroll"><table class="data"><thead><tr><th>Content</th><th>Updated</th><th>Last verified</th></tr></thead><tbody>
          <tr><td>Trial listings, counts and trial pages</td><td>Live, each time a page loads</td><td>Shown on each item as "retrieved live" with the time; the registry's own "record last updated" date is shown as well</td></tr>
          <tr><td>Updates feed and drug pipeline</td><td>Daily snapshot (scheduled job, 05:20 UTC)</td><td>Snapshot date shown on each page</td></tr>
          <tr><td>Research papers and their stage/source labels</td><td>Live, each time a page loads</td><td>Shown with each list; labels are automatic</td></tr>
          <tr><td>Incidence and mortality statistics</td><td>IARC GLOBOCAN 2024 estimates</td><td>${longDate(VERIFIED.stats)}</td></tr>
          <tr><td>Disease summaries and their citations</td><td>Written October 2026</td><td>${longDate(VERIFIED.citations)}</td></tr>
          <tr><td>Country research groups, registries, regulators and patient organizations</td><td>October 2026</td><td>${longDate(VERIFIED.countryLinks)}</td></tr>
          <tr><td>Registry access notes</td><td>October 2026</td><td>${longDate(VERIFIED.registries)}</td></tr>
        </tbody></table></div>
        <h2 style="margin-top:34px">Evidence stage and source labels</h2>
        <p>Each trial shows its phase and whether it is an interventional or observational study, and is marked as a registry record with its registry name. Each research paper is labelled by evidence stage (Phase 1–4 trial, clinical trial, systematic review, review, guideline, case report, observational study, lab study, or patient data) and by source type (journal article or preprint). The paper labels come from the article type and subject headings in Europe PMC and are assigned automatically, so they are a guide, not a judgement of quality.</p>
        <h2 style="margin-top:34px">Known limits</h2>
        <ul class="facts">
          <li>Trial records are written and updated by sponsors. A trial shown as recruiting may have paused or filled at a particular site, so always confirm with the study team.</li>
          <li>A trial can appear in more than one registry under different identifiers.</li>
          <li>Publication lists are matched by author affiliation and title keywords; they show recent activity, not a ranking of importance or quality.</li>
          <li>Nothing here is medical advice. Decisions about treatment and trials should be made with a qualified doctor.</li>
        </ul>
      </div></section>`;
  }

  // ---------- daily snapshot: updates feed, pipeline, drug pages ----------
  const snapshot = (kind, slug) => getJSON(`data/snapshot/${kind}/${slug}.json`);
  const PHASE_LABEL = { PHASE4: 'Phase 4', PHASE3: 'Phase 3', PHASE2: 'Phase 2', PHASE1: 'Phase 1', EARLY_PHASE1: 'Early phase 1', NA: 'No phase (not a drug trial)' };
  const phaseLabel = (p) => PHASE_LABEL[p] || (p ? titleCase(p) : 'Phase not stated');
  const EVENT_LABEL = { new: 'New trial', status: 'Status change', results: 'Results posted', approval: 'FDA approval' };
  const cancerChips = (base, active) => `<div class="chips">${ROOTS.map((r) => `<a class="chip${r.slug === active ? ' active' : ''}" href="#/${base}/${r.slug}">${e(r.name)}</a>`).join('')}</div>`;
  const typeMatcher = (node) => {
    const words = node.name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
    const re = new RegExp(`\\b(${words.replace(/\s+/g, '\\s+')}${node.abbr ? '|' + node.abbr.replace(/[^a-z0-9+]/gi, '') : ''})\\b`, 'i');
    return (ev) => re.test(`${ev.title || ''} ${(ev.cond || []).join(' ')}`);
  };

  async function updatesPage(slug, q) {
    const root = ROOTS.find((r) => r.slug === slug) || FOCUS || ROOTS[0];
    main.innerHTML = pageHead(`What's new in ${root.name.toLowerCase()} research`, 'New trials, status changes, posted results and FDA approvals from the last 90 days, refreshed every day.', [['Home', '#/'], ['Updates']]) + `
      <section class="band"><div class="wrap">
        ${ROOTS.length > 1 ? cancerChips('updates', root.slug) : ''}
        <div id="feed" style="margin-top:20px"><p class="loading">Loading the latest snapshot…</p></div>
      </div></section>`;
    const token = renderToken;
    let feed;
    try { feed = await snapshot('feed', root.slug); } catch { if (token === renderToken) document.getElementById('feed').innerHTML = '<div class="notice">No snapshot has been published for this cancer yet.</div>'; return; }
    if (token !== renderToken) return;
    const types = (root.children || []).filter((k) => !k.group);
    const box = document.getElementById('feed');
    const draw = (typeSlug) => {
      const node = types.find((t) => t.slug === typeSlug);
      const events = node ? feed.events.filter(typeMatcher(node)) : feed.events;
      const groups = ['approval', 'new', 'status', 'results'].map((t) => [t, events.filter((ev) => ev.type === t)]);
      box.innerHTML = `
        <div class="stats" style="grid-template-columns:repeat(4,1fr)">${groups.map(([t, list]) => `<div class="stat"><b>${fmt(list.length)}</b><span>${e(EVENT_LABEL[t])}${t === 'approval' ? ' (US)' : ''}${t === 'new' ? ' registered' : ''}</span></div>`).join('')}</div>
        <p class="source-note" style="margin-top:10px">Snapshot taken ${e(feed.date)}, covering ${e(feed.since)} to ${e(feed.date)}. ${feed.previous ? `Status changes are detected by comparing with the previous snapshot (${e(feed.previous)}).` : 'Status changes appear once a second daily snapshot exists to compare against.'} ${fmt(feed.open)} open ${e(root.name.toLowerCase())} trials were tracked. Sources: ClinicalTrials.gov; openFDA (Drugs@FDA and drug labels) for approvals.</p>
        ${types.length ? `<div class="chips" style="margin-top:16px" id="type-chips"><button type="button" class="chip${!node ? ' active' : ''}" data-type="">All ${e(root.name.toLowerCase())}</button>${types.map((t) => `<button type="button" class="chip${t === node ? ' active' : ''}" data-type="${t.slug}">${e(t.abbr || t.name)}</button>`).join('')}</div>` : ''}
        ${groups.map(([t, list]) => list.length ? `<h2 style="margin-top:30px">${e(EVENT_LABEL[t])}${t === 'approval' ? ' (United States)' : ''} <span class="source-note">(${fmt(list.length)})</span></h2><ul class="facts">${list.slice(0, 60).map((ev) => eventItem(ev)).join('')}${list.length > 60 ? `<li class="source-note">${fmt(list.length - 60)} more not shown.</li>` : ''}</ul>` : '').join('')}
        ${!events.length ? '<p>No events in this window.</p>' : ''}`;
      box.querySelector('#type-chips')?.addEventListener('click', (ev) => { const b = ev.target.closest('[data-type]'); if (b) draw(b.dataset.type); });
    };
    draw(q.type || '');
  }
  function eventItem(ev) {
    const date = `<span class="tag">${e(ev.date)}</span>`;
    if (ev.type === 'approval') return `<li>${date} <strong>${e(ev.drug)}</strong>${ev.generic ? ` (${e(ev.generic)})` : ''} · ${e(ev.kind)} · ${e(ev.sponsor || '')} · ${ext(ev.url, 'Drugs@FDA record')} · <a href="#/drug/${encodeURIComponent((ev.generic || ev.drug).split(',')[0].trim())}">drug page</a><br><span class="source-note">Matched to this cancer because the approved label's indications mention it; read the label for the exact indication.</span></li>`;
    const extra = ev.type === 'status' ? ` · ${e(titleCase(ev.from))} → <strong>${e(titleCase(ev.to))}</strong>` : ev.type === 'new' && ev.status ? ` · ${e(titleCase(ev.status))}` : '';
    return `<li>${date} <span class="tag navy">${e(phaseLabel(ev.phase))}</span> <a href="#/trial/${e(ev.id)}">${e(ev.title)}</a>${extra}<br><span class="source-note">${e((ev.cond || []).join(', '))}</span></li>`;
  }

  async function pipelinePage(slug) {
    const root = ROOTS.find((r) => r.slug === slug) || FOCUS || ROOTS[0];
    main.innerHTML = pageHead(`${root.name} drug pipeline`, 'Drugs and biologics in open trials, ranked by trial activity, with the most advanced phase reached. Refreshed daily from ClinicalTrials.gov.', [['Home', '#/'], ['Pipeline']]) + `
      <section class="band"><div class="wrap">
        ${ROOTS.length > 1 ? cancerChips('pipeline', root.slug) : ''}
        <div id="pipe" style="margin-top:20px"><p class="loading">Loading the latest snapshot…</p></div>
      </div></section>`;
    const token = renderToken;
    let data;
    try { data = await snapshot('pipeline', root.slug); } catch { if (token === renderToken) document.getElementById('pipe').innerHTML = '<div class="notice">No snapshot has been published for this cancer yet.</div>'; return; }
    if (token !== renderToken) return;
    const box = document.getElementById('pipe');
    const draw = (phase) => {
      const rows = data.drugs.filter((d) => !phase || d.top === phase);
      box.innerHTML = `
        <div class="chips" id="phase-chips"><button type="button" class="chip${!phase ? ' active' : ''}" data-phase="">All phases</button>${['PHASE4', 'PHASE3', 'PHASE2', 'PHASE1', 'EARLY_PHASE1'].map((p) => `<button type="button" class="chip${phase === p ? ' active' : ''}" data-phase="${p}">Up to ${e(PHASE_LABEL[p].toLowerCase())}</button>`).join('')}</div>
        <p class="source-note" style="margin:12px 0">Snapshot taken ${e(data.date)} from ${fmt(data.open)} open interventional ${e(root.name.toLowerCase())} trials. "Highest phase" is the most advanced phase among the open trials that list the drug; it does not say whether the drug is approved anywhere. Drug names are grouped automatically from registry entries, so the same drug can occasionally appear twice under different spellings, and placebo, procedures and generic "chemotherapy" entries are left out.</p>
        <div class="table-scroll"><table class="data"><thead><tr><th>Drug</th><th>Highest phase in open trials</th><th class="num">Open trials</th><th>Trials by phase</th><th class="num">Sponsors</th><th></th></tr></thead><tbody>
        ${rows.map((d) => `<tr><td><a href="#/drug/${encodeURIComponent(d.name)}?from=${root.slug}"><strong>${e(d.name)}</strong></a></td><td><span class="tag navy">${e(phaseLabel(d.top))}</span></td><td class="num">${fmt(d.trials)}</td><td class="source-note">${['PHASE4', 'PHASE3', 'PHASE2', 'PHASE1', 'EARLY_PHASE1', 'NA'].filter((p) => d.phases[p]).map((p) => `${e(PHASE_LABEL[p].replace(' (not a drug trial)', ''))}: ${d.phases[p]}`).join(' · ')}</td><td class="num">${fmt(d.sponsors)}</td><td><a href="${trialsHref({ cond: root.term, intr: d.name })}">Trials</a></td></tr>`).join('')}
        </tbody></table></div>`;
      box.querySelector('#phase-chips').addEventListener('click', (ev) => { const b = ev.target.closest('[data-phase]'); if (b) draw(b.dataset.phase); });
    };
    draw('');
  }

  async function drugPage(name, q) {
    const from = ROOTS.find((r) => r.slug === q.from);
    main.innerHTML = pageHead(name, 'Open trials, regulatory status and recent research for this drug.', [['Home', '#/'], ['Pipeline', `#/pipeline/${(from || FOCUS || ROOTS[0]).slug}`], [name]]) + `
      <section class="band"><div class="wrap two-col">
        <div>
          <h2>Open trials studying ${e(name)}${from ? ` in ${e(from.name.toLowerCase())}` : ''}</h2>
          <p class="source-note" id="drug-count" aria-live="polite">Searching…</p>
          <div class="stack" id="drug-trials"></div>
          <p style="margin-top:14px"><a class="btn btn-outline btn-sm" href="${trialsHref({ cond: from ? from.term : 'Cancer', intr: name })}">All trials of ${e(name)}${from ? ` in ${e(from.name.toLowerCase())}` : ''}</a></p>
          <h2 style="margin-top:34px">Recent research papers</h2>
          <div id="drug-pubs"><p class="loading">Loading…</p></div>
        </div>
        <aside class="stack">
          <div class="card" id="fda"><h3>United States: FDA</h3><p class="loading">Checking openFDA…</p></div>
          <div class="card"><h3>Other regulators</h3><p class="source-note">These open each regulator's own search; approval status outside the US is not pulled in automatically.</p>
            <p style="margin:.3em 0">${ext(`https://www.ema.europa.eu/en/search?search_api_fulltext=${encodeURIComponent(name)}`, 'European Medicines Agency')}</p>
            <p style="margin:.3em 0">${ext(`https://health-products.canada.ca/dpd-bdpp/index-eng.jsp`, 'Health Canada Drug Product Database')}</p>
            <p style="margin:.3em 0">${ext(`https://www.pmda.go.jp/english/review-services/reviews/approved-information/drugs/0002.html`, 'Japan PMDA approved drugs')}</p>
            <p style="margin:.3em 0">${ext(`https://www.tga.gov.au/resources/artg?search_api_views_fulltext=${encodeURIComponent(name)}`, 'Australia TGA register')}</p>
            <p style="margin:.3em 0">${ext(`https://english.nmpa.gov.cn/`, 'China NMPA')}</p>
          </div>
          ${from ? `<div class="card" id="pipe-card"><h3>In the ${e(from.name.toLowerCase())} pipeline</h3><p class="loading">Loading…</p></div>` : ''}
        </aside>
      </div></section>`;
    const token = renderToken;
    const countEl = document.getElementById('drug-count'), list = document.getElementById('drug-trials');
    searchTrials({ cond: from ? from.term : 'Cancer', intr: name }).then((d) => {
      if (token !== renderToken) return;
      countEl.textContent = `${fmt(d.totalCount)} recruiting trial${d.totalCount === 1 ? '' : 's'} list ${name} as an intervention. ${retrieved('ClinicalTrials.gov')}`;
      list.innerHTML = (d.studies || []).map(trialCard).join('') || '<p>No recruiting trials found.</p>';
    }).catch(() => { if (token === renderToken) countEl.textContent = 'Could not load trials.'; });
    publications(name, null, 6).then((r) => { if (token === renderToken) document.getElementById('drug-pubs').innerHTML = pubList(r); })
      .catch(() => { if (token === renderToken) document.getElementById('drug-pubs').innerHTML = '<p class="error">Could not load publications.</p>'; });
    fdaStatus(name).then((html) => { if (token === renderToken) document.getElementById('fda').innerHTML = `<h3>United States: FDA</h3>${html}`; });
    if (from) snapshot('pipeline', from.slug).then((data) => {
      if (token !== renderToken) return;
      const d = data.drugs.find((x) => x.name.toLowerCase() === name.toLowerCase());
      document.getElementById('pipe-card').innerHTML = `<h3>In the ${e(from.name.toLowerCase())} pipeline</h3>${d ? `<p><span class="count">${fmt(d.trials)}</span><br><span class="source-note">open trials · highest phase ${e(phaseLabel(d.top))} · ${fmt(d.sponsors)} sponsors (snapshot ${e(data.date)})</span></p><p class="source-note">${d.ids.map((id) => `<a href="#/trial/${e(id)}">${e(id)}</a>`).join(' · ')}</p>` : '<p class="source-note">Not in the top 120 of this pipeline snapshot.</p>'}`;
    }).catch(() => {});
  }
  // openFDA: approved label (indications) and Drugs@FDA application history for a drug name.
  async function fdaStatus(name) {
    const qn = name.replace(/"/g, '');
    try {
      const lab = await getJSON(`https://api.fda.gov/drug/label.json?search=${encodeURIComponent(`openfda.generic_name:"${qn}" OR openfda.brand_name:"${qn}"`)}&limit=1`).catch(() => null);
      const label = lab?.results?.[0];
      if (!label) return `<p><span class="tag">No approved label found</span></p><p class="source-note">openFDA has no prescribing label matching "${e(name)}", which usually means the drug is investigational or not approved in the US under this name. ${retrieved('openFDA')}</p>`;
      const indic = (label.indications_and_usage || []).join(' ').replace(/^\s*1\s+INDICATIONS AND USAGE\s*/i, '').replace(/\(\s*\d+(\.\d+)?\s*\)/g, '').trim();
      const apps = label.openfda?.application_number || [];
      let first = '';
      if (apps[0]) {
        const d = await getJSON(`https://api.fda.gov/drug/drugsfda.json?search=${encodeURIComponent(`openfda.application_number:"${apps[0]}"`)}&limit=1`).catch(() => null);
        const orig = (d?.results?.[0]?.submissions || []).filter((s) => s.submission_type === 'ORIG' && s.submission_status === 'AP').map((s) => s.submission_status_date).sort()[0];
        if (orig) first = `${orig.slice(0, 4)}-${orig.slice(4, 6)}-${orig.slice(6, 8)}`;
      }
      const eff = label.effective_time ? `${label.effective_time.slice(0, 4)}-${label.effective_time.slice(4, 6)}-${label.effective_time.slice(6, 8)}` : '';
      return `<p><span class="tag green">FDA-approved label</span></p>
        <p><strong>${e((label.openfda?.brand_name || []).join(', '))}</strong>${label.openfda?.generic_name ? ` (${e(label.openfda.generic_name.join(', ').toLowerCase())})` : ''}<br><span class="source-note">${e((label.openfda?.manufacturer_name || []).join(', '))}${first ? ` · first approved ${e(first)}` : ''}${eff ? ` · label revised ${e(eff)}` : ''}</span></p>
        <p class="source-note"><b>Indications (from the label)</b><br>${e(indic.slice(0, 700))}${indic.length > 700 ? '…' : ''}</p>
        <p class="source-note">${apps[0] ? ext(`https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${apps[0].replace(/\D/g, '')}`, 'Drugs@FDA record') + ' · ' : ''}${label.openfda?.spl_set_id?.[0] ? ext(`https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${label.openfda.spl_set_id[0]}`, 'Full label on DailyMed') + ' · ' : ''}${retrieved('openFDA')}</p>`;
    } catch { return '<p class="source-note">openFDA could not be reached.</p>'; }
  }

  function notFound() {
    main.innerHTML = pageHead('Page not found', 'That page does not exist.') + '<section class="band"><div class="wrap"><a class="btn btn-cta" href="#/">Back to home</a></div></section>';
  }

  // ---------- router ----------
  let renderToken = 0;
  function route() {
    renderToken++;
    const [pathPart, queryPart] = location.hash.replace(/^#\/?/, '').split('?');
    const parts = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
    const q = Object.fromEntries(new URLSearchParams(queryPart || ''));
    const [top, ...rest] = parts;
    document.querySelectorAll('.nav a[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === (top === 'trial' ? 'trials' : top === 'pipeline' || top === 'drug' ? 'updates' : top)));
    document.getElementById('nav').classList.remove('open');
    document.querySelector('.nav-toggle').setAttribute('aria-expanded', 'false');
    if (!top) home();
    else if (top === 'cancers') (rest.length ? nodePage(rest) : cancerList());
    else if (top === 'trials') trialsPage(q);
    else if (top === 'trial' && rest[0]) trialPage(rest[0]);
    else if (top === 'countries') (rest[0] ? countryPage(rest[0]) : countriesPage());
    else if (top === 'enroll') enrollPage();
    else if (top === 'about') aboutPage();
    else if (top === 'updates') updatesPage(rest[0], q);
    else if (top === 'pipeline') pipelinePage(rest[0]);
    else if (top === 'drug' && rest[0]) drugPage(rest[0], q);
    else notFound();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  document.querySelector('.nav-toggle').addEventListener('click', (ev) => {
    const open = document.getElementById('nav').classList.toggle('open');
    ev.currentTarget.setAttribute('aria-expanded', open);
  });
  // In-page anchors (e.g. #sites) must not be treated as routes.
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href^="#"]');
    if (a && !a.getAttribute('href').startsWith('#/') && a.getAttribute('href').length > 1) {
      ev.preventDefault();
      document.getElementById(a.getAttribute('href').slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  });
  route();
})();
