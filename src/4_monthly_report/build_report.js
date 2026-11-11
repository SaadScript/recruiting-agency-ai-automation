// Monthly results report for the agency owner.
// Scheduled run = previous calendar month. Manual run = last 30 days.
const S = $('Settings').first().json;
let scheduled = false;
try { scheduled = $execution.mode === 'production' && $('Monthly Schedule').isExecuted === true; } catch (e) { scheduled = false; }

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

let start, end, label;
if (scheduled) {
  const [y, m] = today.split('-').map(Number);
  const py = m === 1 ? y - 1 : y;
  const pm = m === 1 ? 12 : m - 1;
  start = `${py}-${String(pm).padStart(2, '0')}-01`;
  end = addDays(`${y}-${String(m).padStart(2, '0')}-01`, -1);
  label = new Date(start + 'T12:00:00Z').toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
} else {
  end = today; start = addDays(today, -29); label = `Last 30 days (${start} to ${end})`;
}
const inRange = (d) => !!d && d >= start && d <= end;
const rowsOf = (name) => { try { return $(name).all().map((i) => i.json).filter((j) => j && Object.keys(j).length && !j.error); } catch (e) { return []; } };
const num = (v) => Number(v) || 0;
const sum = (arr, k) => arr.reduce((a, r) => a + num(r[k]), 0);

const runs = rowsOf('Read Run_Log').filter((r) => inRange(parseDay(r.run_date)));
const react = runs.filter((r) => r.workflow === 'Reactivation');
const checks = runs.filter((r) => r.workflow === 'Follow-up check');
const errors = runs.filter((r) => r.workflow === 'Error alert');
const outreach = rowsOf('Read Outreach');

const m = {
  jobs: react.length,
  reviewed: sum(react, 'reviewed'),
  matches: sum(react, 'strong_matches'),
  drafts: sum(react, 'drafts_created'),
  followups: sum(checks, 'followups'),
  sent: outreach.filter((o) => inRange(parseDay(o.sent_date))).length,
  repliedRows: outreach.filter((o) => String(o.status).toLowerCase() === 'replied' && inRange(parseDay(o.reply_date))),
  bounced: sum(checks, 'bounced'),
  waiting: outreach.filter((o) => String(o.status).toLowerCase() === 'awaiting send').length,
  active: outreach.filter((o) => String(o.status).toLowerCase() === 'active').length,
  checks: checks.length,
  errors: errors.length,
};
m.replies = m.repliedRows.length;
m.replyRate = m.sent ? Math.round((m.replies / m.sent) * 100) : null;
m.hours = Math.round(((m.reviewed * S.MIN_PER_CANDIDATE_REVIEW + m.drafts * S.MIN_PER_EMAIL_WRITTEN + m.followups * S.MIN_PER_FOLLOWUP) / 60) * 10) / 10;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tile = (n, l) => `<td style="background:#EEF3F9;border-radius:8px;padding:14px 10px;text-align:center;width:25%"><div style="font-size:28px;font-weight:bold;color:#1F3A5F">${n}</div><div style="font-size:12px;color:#555">${l}</div></td>`;
const replyRows = m.repliedRows
  .sort((a, b) => String(b.reply_date).localeCompare(String(a.reply_date)))
  .map((o) => `<tr><td>${esc(o.candidate_name)}</td><td>${esc(o.job_title)}</td><td>${esc(parseDay(o.reply_date))}</td></tr>`).join('');

const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:680px">
<h2 style="color:#1F3A5F;margin-bottom:4px">Candidate reactivation report</h2>
<p style="margin-top:0;color:#555">${esc(S.AGENCY_NAME)} &middot; ${esc(label)}</p>
<table cellspacing="8" style="width:100%"><tr>
${tile(m.reviewed, 'past candidates reviewed')}${tile(m.sent, 'outreach emails sent')}${tile(m.replies, 'candidates replied')}${tile(m.replyRate === null ? '-' : m.replyRate + '%', 'reply rate')}
</tr><tr>
${tile(m.jobs, 'job openings worked')}${tile(m.matches, 'strong matches found')}${tile(m.followups, 'follow-ups')}${tile(m.hours, 'est. recruiter hours saved')}
</tr></table>
<h3 style="color:#1F3A5F">Candidates who replied</h3>
${replyRows ? `<table border="1" cellpadding="6" style="border-collapse:collapse;font-size:13px;width:100%"><tr style="background:#1F3A5F;color:#fff"><th>Candidate</th><th>Job</th><th>Replied</th></tr>${replyRows}</table>` : '<p>No replies recorded in this period.</p>'}
<h3 style="color:#1F3A5F">Open items</h3>
<ul>
<li>Sequences still running: <b>${m.active}</b></li>
<li>Drafts not yet sent by a recruiter: <b>${m.waiting}</b>${m.waiting ? ' (these close automatically after a week if not sent)' : ''}</li>
${m.bounced ? `<li>Bounced email addresses to fix in the ATS: <b>${m.bounced}</b></li>` : ''}
</ul>
<h3 style="color:#1F3A5F">System health</h3>
<p>Daily follow-up checks completed: <b>${m.checks}</b>. Errors recorded: <b>${m.errors}</b>${m.errors ? ' (each one triggered an immediate alert)' : ''}.</p>
<p style="font-size:12px;color:#777">Hours saved is an estimate: ${S.MIN_PER_CANDIDATE_REVIEW} min per candidate reviewed, ${S.MIN_PER_EMAIL_WRITTEN} min per email written, ${S.MIN_PER_FOLLOWUP} min per follow-up. Reply rate = replies divided by outreach emails sent in this period.</p>
<p>Prepared by ${esc(S.PROVIDER_NAME)}</p>
</div>`;

const { repliedRows, ...metrics } = m;
return [{ json: { to: S.REPORT_TO, subject: `${S.AGENCY_NAME}: candidate reactivation report, ${label}`, html, metrics, period: { start, end } } }];
