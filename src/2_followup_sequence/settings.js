// ===== SETTINGS: the only node you normally need to edit =====
return [{
  json: {
    SHEET_URL: 'PASTE_YOUR_GOOGLE_SHEET_URL_HERE',
    TIMEZONE: 'America/Chicago',
    // Follow-up 1 goes 3 days after the first email, follow-up 2 four days after that.
    // FOR A DEMO set this to [0, 0] and FINAL_WAIT_DAYS to 0 so each manual run moves one step.
    FOLLOWUP_GAPS_DAYS: [3, 4],
    FINAL_WAIT_DAYS: 4,        // after the last follow-up, wait this long for a reply, then close
    NEVER_SENT_DAYS: 7,        // drafts the recruiter never sent are closed after 7 days
    FOLLOWUP_MODE: 'draft',    // 'draft' = recruiter reviews each follow-up; 'send' = follow-ups go out automatically
    // Sequences stop if the candidate's status in the Candidates tab changes to one of these
    STOP_STATUSES: ['do not contact', 'placed', 'not looking', 'interviewing'],
  },
}];
