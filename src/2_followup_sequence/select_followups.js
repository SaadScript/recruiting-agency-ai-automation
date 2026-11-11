// Only the sequences where a follow-up is due today.
const S = $('Settings').first().json;
const total = S.FOLLOWUP_GAPS_DAYS.length;
return $input.all()
  .filter((i) => i.json.action === 'followup')
  .map((i) => ({ json: { ...i.json, total_followups: total, is_final: i.json.followup_number >= total ? 'yes' : 'no' } }));
