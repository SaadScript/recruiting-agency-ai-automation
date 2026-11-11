// Record each follow-up and schedule the next one (or the final wait).
const S = $('Settings').first().json;
const today = new Intl.DateTimeFormat('en-CA', { timeZone: S.TIMEZONE }).format(new Date());
const addDays = (ymd, n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + Number(n || 0)); return d.toISOString().slice(0, 10); };
const gaps = S.FOLLOWUP_GAPS_DAYS;
return $('Parse Follow-ups').all().map((i) => {
  const r = i.json;
  const n = r.followup_number;
  const next = n < gaps.length ? addDays(today, gaps[n]) : addDays(today, S.FINAL_WAIT_DAYS);
  return {
    json: {
      ...r.updates,
      followups_sent: String(n),
      last_touch_date: today,
      next_followup_due: next,
      notes: S.FOLLOWUP_MODE === 'send' ? `Follow-up ${n} sent` : `Follow-up ${n} drafted for review`,
    },
  };
});
