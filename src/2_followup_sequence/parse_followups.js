// Read the AI's follow-up text; fall back to a safe template if needed.
const rows = $('Select Follow-ups').all();
return $input.all().map((item, i) => {
  const r = rows[i].json;
  let body = '';
  const match = String(item.json.text || '').match(/\{[\s\S]*\}/);
  if (match) { try { body = String(JSON.parse(match[0]).body || '').trim(); } catch (e) { /* fallback */ } }
  const recruiterFirst = String(r.recruiter_name || '').split(' ')[0] || r.recruiter_name;
  if (!body) {
    body = r.is_final === 'yes'
      ? `Hi ${r.first_name},\n\nI don't want to fill your inbox, so this is my last note about the ${r.job_title} role. If the timing isn't right, no problem at all; just reply any time if your situation changes.\n\nBest,\n${recruiterFirst}\n${r.agency}`
      : `Hi ${r.first_name},\n\nJust checking whether you saw my note about the ${r.job_title} opening. Happy to share details or set up a quick call if you're interested.\n\nBest,\n${recruiterFirst}\n${r.agency}`;
  }
  const subj = String(r.original_subject || r.job_title || 'Following up');
  return { json: { ...r, body, subject: /^re:/i.test(subj) ? subj : `Re: ${subj}` } };
});
