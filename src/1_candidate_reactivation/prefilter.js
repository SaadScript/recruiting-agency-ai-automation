// Pre-filter: skip people who must not be contacted, skip recent contacts,
// and keep only candidates whose title/skills overlap the job.
const S = $('Settings').first().json;
const form = $('Job Opening Form').first().json;
const job = {
  agency: form['Agency name'] || 'our agency',
  title: form['Job title'],
  skills: form['Required skills'],
  location: form['Location'],
  pay: form['Pay rate'] || 'Not specified',
  shift: form['Shift / schedule'] || 'Not specified',
  client: form['Client description'] || 'one of our clients',
  recruiter_name: form['Recruiter name'],
  recruiter_email: form['Recruiter email'],
  max_contacts: Number(form['Max candidates to contact']) || 5,
};

const excluded = S.EXCLUDED_STATUSES.map((s) => s.toLowerCase());
const STOP = new Set(['and', 'or', 'the', 'with', 'for', 'of', 'in', 'to', 'a', 'an', 'on', 'at']);
const words = (s) => String(s || '').toLowerCase().split(/[^a-z0-9+#]+/).filter((w) => w.length > 1 && !STOP.has(w));
const jobTerms = new Set(words(`${job.title} ${job.skills}`));
const now = new Date();

const shortlist = [];
for (const item of $input.all()) {
  const c = item.json;
  if (!c.candidate_id) continue;
  if (excluded.includes(String(c.status || '').trim().toLowerCase())) continue;
  if (c.last_contacted) {
    const last = new Date(c.last_contacted);
    if (!isNaN(last) && (now - last) / 86400000 < S.COOLDOWN_DAYS) continue;
  }
  const candTerms = new Set(words(`${c.current_title} ${c.skills}`));
  let overlap = 0;
  for (const t of jobTerms) if (candTerms.has(t)) overlap++;
  if (overlap === 0) continue;
  shortlist.push({ json: { ...c, pre_score: overlap, job } });
}

shortlist.sort((a, b) => b.json.pre_score - a.json.pre_score);
return shortlist.slice(0, S.MAX_TO_SCORE);
