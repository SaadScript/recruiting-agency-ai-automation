// Read the AI's JSON reply for each candidate and attach score + reason.
const MIN_SCORE = $('Settings').first().json.MIN_SCORE;
const candidates = $('Pre-filter Candidates').all();

return $input.all().map((item, i) => {
  const c = candidates[i].json;
  let score = 0;
  let reason = 'AI response could not be read; review manually.';
  const match = String(item.json.text || '').match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
      reason = String(parsed.reason || reason).trim();
    } catch (e) { /* keep defaults */ }
  }
  return { json: { ...c, score, reason, matched: score >= MIN_SCORE } };
});
