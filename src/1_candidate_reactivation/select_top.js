// Keep only strong matches, best first, up to the limit set in the form.
const matches = $input.all()
  .filter((i) => i.json.matched)
  .sort((a, b) => b.json.score - a.json.score);
if (matches.length === 0) return [];
return matches.slice(0, matches[0].json.job.max_contacts);
