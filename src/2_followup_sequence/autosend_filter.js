// Only used when FOLLOWUP_MODE is 'send': passes each new draft on to be sent.
if ($('Settings').first().json.FOLLOWUP_MODE !== 'send') return [];
return $input.all().map((i) => ({ json: { draft_id: i.json.id } }));
