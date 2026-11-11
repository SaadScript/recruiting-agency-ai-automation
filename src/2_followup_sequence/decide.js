// Read each Gmail thread and decide what happens next:
// replied -> stop and alert recruiter | bounced -> stop | sent -> start sequence |
// follow-up due -> write follow-up | all follow-ups done -> close.
const S = $('Settings').first().json;
const rows = $('Select Active Sequences').all();
const threads = $input.all();

const fmtDay = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: S.TIMEZONE }).format(d);
const today = fmtDay(new Date());
const addDays = (ymd, n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + Number(n || 0)); return d.toISOString().slice(0, 10); };
const parseDay = (v) => {
  if (v === undefined || v === null || v === '') return '';
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d+(\.\d+)?$/.test(s)) { const n = Number(s); if (n > 20000 && n < 80000) return new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 86400000).toISOString().slice(0, 10); }
  const d = new Date(s); return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};
const labelsOf = (m) => {
  const raw = m.labelIds || m.labels || [];
  return (Array.isArray(raw) ? raw : []).map((l) => String(typeof l === 'string' ? l : (l.id || l.name || '')).toUpperCase());
};
const headerOf = (m, name) => {
  for (const k of [name, name.toLowerCase()]) {
    if (m[k]) return typeof m[k] === 'string' ? m[k] : JSON.stringify(m[k]);
  }
  const hs = (m.payload && m.payload.headers) || [];
  const h = Array.isArray(hs) ? hs.find((x) => String(x.name).toLowerCase() === name.toLowerCase()) : null;
  return h ? String(h.value) : '';
};
const timeOf = (m) => Number(m.internalDate) || Date.parse(headerOf(m, 'Date')) || 0;
const BOUNCE = /mailer-daemon|postmaster|mail delivery/i;

return rows.map((rowItem, i) => {
  const r = rowItem.json;
  const t = (threads[i] && threads[i].json) || {};
  const messages = Array.isArray(t.messages) ? t.messages : [];
  const sent = messages.filter((m) => labelsOf(m).includes('SENT')).sort((a, b) => timeOf(a) - timeOf(b));
  const inbound = messages
    .filter((m) => { const l = labelsOf(m); return !l.includes('SENT') && !l.includes('DRAFT'); })
    .sort((a, b) => timeOf(a) - timeOf(b));
  const bounces = inbound.filter((m) => BOUNCE.test(headerOf(m, 'From')));
  const replies = inbound.filter((m) => !BOUNCE.test(headerOf(m, 'From')));

  const updates = { outreach_id: r.outreach_id };
  let status = String(r.status || '').trim().toLowerCase() === 'active' ? 'Active' : 'Awaiting send';
  let event = '';
  let action = 'none';
  let followup_number = 0;
  let reply_snippet = '';
  const followupsSent = Number(r.followups_sent || 0);
  let nextDue = parseDay(r.next_followup_due);
  const created = parseDay(r.created_date);

  if (r.stop_reason) {
    status = 'Stopped - candidate status changed'; event = 'stopped'; updates.notes = r.stop_reason;
  } else if (replies.length) {
    const first = replies[0];
    status = 'Replied'; event = 'replied';
    updates.reply_date = timeOf(first) ? fmtDay(new Date(timeOf(first))) : today;
    updates.notes = 'Candidate replied - sequence stopped';
    reply_snippet = String(first.snippet || '').slice(0, 240);
  } else if (bounces.length) {
    status = 'Bounced'; event = 'bounced'; updates.notes = 'Email bounced - check the address';
  } else {
    if (status === 'Awaiting send') {
      if (sent.length) {
        const sd = timeOf(sent[0]) ? fmtDay(new Date(timeOf(sent[0]))) : today;
        status = 'Active'; event = 'sent_detected';
        nextDue = addDays(sd, S.FOLLOWUP_GAPS_DAYS[0]);
        Object.assign(updates, { sent_date: sd, last_touch_date: sd, next_followup_due: nextDue, followups_sent: '0' });
      } else if (created && addDays(created, S.NEVER_SENT_DAYS) <= today) {
        status = 'Stopped - never sent'; event = 'stopped';
        updates.notes = `Draft not sent within ${S.NEVER_SENT_DAYS} days`;
      }
    }
    if (status === 'Active' && nextDue && nextDue <= today) {
      if (followupsSent < S.FOLLOWUP_GAPS_DAYS.length) {
        action = 'followup'; followup_number = followupsSent + 1;
      } else {
        status = 'Completed - no reply'; event = 'completed'; updates.notes = 'No reply after all follow-ups';
      }
    }
  }
  updates.status = status;
  return { json: { ...r, updates, action, event, followup_number, reply_snippet } };
});
