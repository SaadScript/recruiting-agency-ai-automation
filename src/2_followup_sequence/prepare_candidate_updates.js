// Keep the ATS in sync: mark candidates who replied or whose email bounced.
const S = $('Settings').first().json;
const today = new Intl.DateTimeFormat('en-CA', { timeZone: S.TIMEZONE }).format(new Date());
return $input.all()
  .filter((i) => ['replied', 'bounced'].includes(i.json.event))
  .map((i) => ({
    json: i.json.event === 'replied'
      ? { candidate_id: i.json.candidate_id, status: 'Responded', last_contacted: today }
      : { candidate_id: i.json.candidate_id, status: 'Email bounced' },
  }));
