// One short morning email per recruiter: replies first, then follow-ups, then closed sequences.
const S = $('Settings').first().json;
const items = $input.all().map((i) => i.json).filter((j) => j.event || j.action === 'followup');
if (!items.length) return [];
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const groups = {};
for (const j of items) {
  const key = j.recruiter_email || 'unknown';
  (groups[key] = groups[key] || []).push(j);
}

return Object.entries(groups).map(([to, list]) => {
  const replied = list.filter((j) => j.event === 'replied');
  const fups = list.filter((j) => j.action === 'followup');
  const started = list.filter((j) => j.event === 'sent_detected');
  const closed = list.filter((j) => ['completed', 'stopped', 'bounced'].includes(j.event));
  const first = String(list[0].recruiter_name || '').split(' ')[0] || 'there';
  const section = (title, rows) => rows.length ? `<h3 style="color:#1F3A5F;margin:18px 0 6px">${title}</h3><ul style="margin-top:0">${rows.join('')}</ul>` : '';

  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
<p>Good morning ${esc(first)},</p>
<p>Here's today's update on your candidate outreach.</p>
${section(`Replies: call these people first (${replied.length})`, replied.map((j) =>
  `<li><b>${esc(j.candidate_name)}</b> replied about <b>${esc(j.job_title)}</b>${j.reply_snippet ? `: <i>"${esc(j.reply_snippet)}"</i>` : ''}</li>`))}
${section(`Follow-ups (${fups.length})`, fups.map((j) =>
  `<li>${esc(j.candidate_name)} (${esc(j.job_title)}): follow-up ${j.followup_number} ${S.FOLLOWUP_MODE === 'send' ? 'sent' : 'is waiting in your Gmail drafts'}</li>`))}
${section(`Emails you sent, now being followed up (${started.length})`, started.map((j) =>
  `<li>${esc(j.candidate_name)} (${esc(j.job_title)})</li>`))}
${section(`Closed (${closed.length})`, closed.map((j) =>
  `<li>${esc(j.candidate_name)} (${esc(j.job_title)}): ${esc(j.updates.status)}</li>`))}
${S.FOLLOWUP_MODE === 'send' ? '' : '<p>Please review and send the follow-up drafts in Gmail.</p>'}
</div>`;

  const parts = [];
  if (replied.length) parts.push(`${replied.length} ${replied.length === 1 ? 'reply' : 'replies'}`);
  if (fups.length) parts.push(`${fups.length} follow-up${fups.length === 1 ? '' : 's'}`);
  if (!parts.length) parts.push('status changes');
  return { json: { to, subject: `Outreach update: ${parts.join(', ')}`, html } };
});
