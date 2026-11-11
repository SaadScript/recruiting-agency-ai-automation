// ===== SETTINGS: the only node you normally need to edit =====
return [{
  json: {
    SHEET_URL: 'PASTE_YOUR_GOOGLE_SHEET_URL_HERE',
    TIMEZONE: 'America/Chicago',  // the agency's time zone
    COOLDOWN_DAYS: 30,            // never re-contact anyone reached in the last 30 days
    MAX_TO_SCORE: 12,             // how many candidates the AI reviews per job
    MIN_SCORE: 70,                // 70+ = strong match
    // Candidates with these statuses are never contacted
    EXCLUDED_STATUSES: ['do not contact', 'placed', 'not looking', 'interviewing', 'responded', 'email bounced'],
  },
}];
