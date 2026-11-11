// One Run_Log row per daily check (used by the monthly report).
const S = $('Settings').first().json;
const all = $input.all().map((i) => i.json);
const count = (e) => String(all.filter((j) => j.event === e).length);
const runDate = new Intl.DateTimeFormat('sv-SE', { timeZone: S.TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date());
return [{
  json: {
    run_date: runDate,
    workflow: 'Follow-up check',
    active_sequences: String(all.length),
    sent_detected: count('sent_detected'),
    followups: String(all.filter((j) => j.action === 'followup').length),
    replies: count('replied'),
    completed: count('completed'),
    stopped: count('stopped'),
    bounced: count('bounced'),
    notes: `Follow-up mode: ${S.FOLLOWUP_MODE}`,
  },
}];
