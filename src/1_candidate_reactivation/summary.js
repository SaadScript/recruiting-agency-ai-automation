// Build one HTML summary email for the recruiter, plus a Run_Log row.
const S = $('Settings').first().json;
const scored = $input.all().map((i) => i.json).sort((a, b) => b.score - a.score);
const job = scored[0].job;
const totalInDb = $('Read Candidates (ATS)').all().length;
const matched = scored.filter((s) => s.matched);
const drafted = new Set(matched.slice(0, job.max_contacts).map((s) => s.candidate_id));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const runDate = new Intl.DateTimeFormat('sv-SE', { timeZone: S.TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date());

const rows = scored.map((s) => {
  const status = drafted.has(s.candidate_id) ? 'Draft ready' : (s.matched ? 'Match (over limit)' : 'Not a fit');
  return `<tr><td>${esc(s.first_name + ' ' + s.last_name)}</td><td>${esc(s.current_title)}</td>` +
    `<td style="text-align:center">${s.score}</td><td>${status}</td><td>${esc(s.reason)}</td></tr>`;
}).join('');

const firstName = String(job.recruiter_name || '').split(' ')[0] || 'there';
const html = `
<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
<p>Hi ${esc(firstName)},</p>
<p>The reactivation run for <b>${esc(job.title)}</b> (${esc(job.location)}) is complete.</p>
<ul>
  <li>Candidates in your database: <b>${totalInDb}</b></li>
  <li>Reviewed by AI (after skipping do-not-contact, placed, not looking, interviewing, and anyone contacted in the last ${S.COOLDOWN_DAYS} days): <b>${scored.length}</b></li>
  <li>Strong matches (score ${S.MIN_SCORE}+): <b>${matched.length}</b></li>
  <li>Email drafts waiting in Gmail: <b>${drafted.size}</b></li>
</ul>
<p><b>Next step:</b> review and send the drafts. Once you send them, the follow-up workflow takes over: it checks every morning for replies and prepares polite follow-ups for anyone who hasn't answered. Anyone who replies is taken out of the sequence automatically.</p>
<p>Scores are suggestions to save you time; you make the final decision on every candidate.</p>
<table border="1" cellpadding="6" style="border-collapse:collapse;font-size:13px">
<tr style="background:#1F3A5F;color:#fff"><th>Candidate</th><th>Current title</th><th>Score</th><th>Status</th><th>Why</th></tr>
${rows}
</table>
</div>`;

return [{
  json: {
    recruiter_email: job.recruiter_email,
    subject: `Reactivation results: ${job.title} - ${drafted.size} drafts ready`,
    html,
    run_log: {
      run_date: runDate,
      workflow: 'Reactivation',
      job_title: job.title,
      candidates_in_db: String(totalInDb),
      reviewed: String(scored.length),
      strong_matches: String(matched.length),
      drafts_created: String(drafted.size),
      notes: '',
    },
  },
}];
