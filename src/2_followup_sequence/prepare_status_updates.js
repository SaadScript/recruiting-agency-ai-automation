// Status changes that don't involve writing a follow-up
// (sent detected, replied, bounced, completed, stopped).
return $input.all()
  .filter((i) => i.json.action !== 'followup' && i.json.event)
  .map((i) => ({ json: i.json.updates }));
