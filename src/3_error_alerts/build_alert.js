// Turn n8n's error details into a clear alert email with likely fixes.
const S = $('Settings').first().json;
const e = $('Error Trigger').first().json;
const wf = (e.workflow && e.workflow.name) || 'Unknown workflow';
const ex = e.execution || {};
const err = ex.error || (e.trigger && e.trigger.error) || {};
const node = ex.lastNodeExecuted || (err.node && err.node.name) || 'Unknown step';
const msg = String(err.message || 'No error message was provided');
const url = ex.url || '';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const when = new Intl.DateTimeFormat('sv-SE', { timeZone: S.TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date());

let hint = 'Open the execution, click the red step, and read its error message.';
if (/401|403|unauthori[sz]ed|invalid_grant|token|credential/i.test(msg)) hint = 'A login has expired or lost permission. Reconnect the Google / Gmail / OpenAI credential used by this step.';
else if (/429|rate limit/i.test(msg)) hint = 'The AI provider is rate-limiting. It usually clears on its own; if it repeats, lower MAX_TO_SCORE or upgrade the API plan.';
else if (/quota|insufficient/i.test(msg)) hint = 'The AI account is out of credit. Add credit in the provider\'s billing settings.';
else if (/not found|unable to parse range|sheet/i.test(msg)) hint = 'A sheet, tab or column may have been renamed or deleted. Check the Google Sheet against the expected tab and column names.';

const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
<p><b>${esc(S.CLIENT_NAME)}</b>: the workflow <b>${esc(wf)}</b> failed at step <b>${esc(node)}</b> (${when}).</p>
<p><b>Error:</b> ${esc(msg)}</p>
<p><b>Likely fix:</b> ${esc(hint)}</p>
${url ? `<p><a href="${esc(url)}">Open this execution in n8n</a></p>` : ''}
</div>`;

return [{
  json: {
    to: S.ALERT_TO,
    subject: `[Alert] ${S.CLIENT_NAME}: "${wf}" failed at "${node}"`,
    html,
    log: { run_date: when, workflow: 'Error alert', notes: `${wf} / ${node}: ${msg}`.slice(0, 300) },
  },
}];
