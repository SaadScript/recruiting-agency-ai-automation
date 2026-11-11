// One log row per scored candidate, matching the Match_Log column headers.
const S = $('Settings').first().json;
const runDate = new Intl.DateTimeFormat('sv-SE', { timeZone: S.TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date());
return $input.all().map((i) => ({
  json: {
    run_date: runDate,
    job_title: i.json.job.title,
    candidate_id: i.json.candidate_id,
    candidate_name: `${i.json.first_name} ${i.json.last_name}`,
    score: i.json.score,
    matched: i.json.matched ? 'Yes' : 'No',
    reason: i.json.reason,
  },
}));
