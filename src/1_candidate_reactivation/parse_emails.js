// Read the AI's subject + body; fall back to a simple safe template if needed.
const candidates = $('Select Top Matches').all();

return $input.all().map((item, i) => {
  const c = candidates[i].json;
  let subject = `New ${c.job.title} opening in ${c.job.location}`;
  let body = '';
  const match = String(item.json.text || '').match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      subject = String(parsed.subject || subject).trim();
      body = String(parsed.body || '').trim();
    } catch (e) { /* use fallback */ }
  }
  if (!body) {
    body = `Hi ${c.first_name},\n\nWe have a new ${c.job.title} opening in ${c.job.location} that looks like a good fit for your background. Would you be open to a quick call this week to hear more?\n\nBest,\n${c.job.recruiter_name}\n${c.job.agency}`;
  }
  return { json: { ...c, subject, body } };
});
