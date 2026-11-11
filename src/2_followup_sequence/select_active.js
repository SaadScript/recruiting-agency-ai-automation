// Pick the outreach rows that still need watching, and flag any whose
// candidate has since been marked Do Not Contact / Placed / etc.
const S = $('Settings').first().json;
const ACTIVE = ['awaiting send', 'active'];
const stop = new Set(S.STOP_STATUSES.map((s) => s.toLowerCase()));

const candStatus = {};
for (const c of $('Read Candidates').all()) {
  if (c.json.candidate_id) candStatus[c.json.candidate_id] = String(c.json.status || '').trim().toLowerCase();
}

const out = [];
for (const item of $('Read Outreach').all()) {
  const r = item.json;
  if (!r.outreach_id) continue;
  if (!ACTIVE.includes(String(r.status || '').trim().toLowerCase())) continue;
  const cs = candStatus[r.candidate_id];
  const { row_number, ...row } = r;
  out.push({ json: { ...row, stop_reason: cs && stop.has(cs) ? `Candidate status changed to "${cs}"` : '' } });
}
return out;
