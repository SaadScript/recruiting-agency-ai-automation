// Update the ATS so these candidates are not re-contacted during the cooldown.
const S = $('Settings').first().json;
const today = new Intl.DateTimeFormat('en-CA', { timeZone: S.TIMEZONE }).format(new Date());
return $('Parse Email Drafts').all().map((i) => ({
  json: { candidate_id: i.json.candidate_id, last_contacted: today, status: 'Re-engaged (draft)' },
}));
