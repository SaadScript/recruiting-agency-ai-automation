// One Outreach row per draft. The Follow-up Sequence workflow tracks each row
// through its Gmail thread: sent -> follow-ups -> replied / completed.
const S = $('Settings').first().json;
const drafts = $input.all();               // output of Create Gmail Draft
const people = $('Parse Email Drafts').all();
const today = new Intl.DateTimeFormat('en-CA', { timeZone: S.TIMEZONE }).format(new Date());
const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

return people.map((p, i) => {
  const c = p.json;
  const j = c.job;
  const d = (drafts[i] && drafts[i].json) || {};
  const threadId = (d.message && d.message.threadId) || d.threadId || '';
  const jobSummary = [j.title, j.location, j.pay, j.shift, j.client]
    .filter((x) => x && x !== 'Not specified' && x !== 'one of our clients')
    .join(' | ');
  return {
    json: {
      outreach_id: `${c.candidate_id}-${stamp}`,
      created_date: today,
      job_title: j.title,
      job_summary: jobSummary,
      agency: j.agency,
      recruiter_name: j.recruiter_name,
      recruiter_email: j.recruiter_email,
      candidate_id: c.candidate_id,
      candidate_name: `${c.first_name} ${c.last_name}`,
      first_name: c.first_name,
      candidate_email: c.email,
      original_subject: c.subject,
      thread_id: threadId,
      draft_id: d.id || '',
      status: 'Awaiting send',
      sent_date: '',
      followups_sent: '0',
      last_touch_date: '',
      next_followup_due: '',
      reply_date: '',
      notes: threadId ? '' : 'Gmail returned no thread ID; follow-ups cannot track this one',
    },
  };
});
