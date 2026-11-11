# Scenario Test Plan

The test set `sample-data/test_scenarios_java.xlsx` contains 24 fictional candidates for a **Senior Java Developer** job. Every candidate is designed to exercise a specific path through the system.

Before use, replace `YOURTESTINBOX` in the Candidates tab with the name of a test inbox you control. The test inbox must **not** be the Gmail account connected to n8n, otherwise replies are filed as "sent" and can't be detected.

## Test candidates

### Strong matches (should receive emails)

| Candidate | Path through the sequence | Expected final status |
|---|---|---|
| T001 Ethan Walker | Replies to the first email | `Replied`, candidate marked `Responded` |
| T002 Priya Sharma | Never replies, receives both follow-ups | `Completed - no reply` |
| T003 Marcus Lee | Marked **Placed** mid-sequence | `Stopped - candidate status changed` |
| T004 Hannah Brooks | Recruiter never sends the draft | `Stopped - never sent` |
| T005 Diego Alvarez | Email bounces (example.com) | `Bounced`, candidate marked `Email bounced` |
| T006 Grace Kim | Final follow-up sent automatically | `Completed - no reply` |

### Must never be contacted

| Candidate | Reason |
|---|---|
| T007 Ryan Cooper | Do Not Contact |
| T008 Aisha Rahman | Interviewing |
| T009 Tom Becker | Contacted within the 30-day cooldown |
| T010 Lucia Moreno | Placed |
| T011 Kevin Osei | Email bounced |

### Partial and unrelated profiles

- **T012–T017** (Python, junior Java, .NET, QA, DevOps, data analyst) reach the AI and should score below 70.
- **T018–T024** (nurse, warehouse, accountant, etc.) share no skills with the job and are removed before AI scoring.

## Test rounds

Set workflow 2 to demo timing first: `FOLLOWUP_GAPS_DAYS: [0, 0]`, `FINAL_WAIT_DAYS: 0`. Each manual run then advances every sequence by one step.

| Round | Action | Expected result |
|---|---|---|
| 1 | Run workflow 1 with the Senior Java Developer job (max 6) | 24 read, 12 scored, 6 drafts, 6 Outreach rows with thread IDs |
| 2 | Send 5 drafts, leave T004 unsent | Emails arrive in the test inbox; T005 bounces |
| 3 | Run workflow 2 **once** | 4 rows `Active`, follow-up 1 drafted in-thread, T005 `Bounced` |
| 4 | Reply as T001; mark T003 as `Placed` | (no run) |
| 5 | Set `FOLLOWUP_MODE: 'send'`, `NEVER_SENT_DAYS: 0`; run workflow 2 | T001 `Replied`, T003 stopped, T004 stopped, T002/T006 follow-up 2 **sent** in-thread |
| 6 | Restore settings; run workflow 2 twice | T002/T006 `Completed`; second run has nothing to do |
| 7 | Rerun workflow 1 with the same job | Only T012–T017 reviewed; **no new drafts** |
| 8 | Activate workflow 1, rename the Candidates tab, submit the live form | Error alert email with a likely fix; `Error alert` row in Run_Log |
| 9 | Run workflow 4 manually | Report figures match the Run_Log and Outreach tabs |

Important: between sending drafts (round 2) and round 5, run workflow 2 exactly once, or the follow-ups are used up before the send-mode test.

## Reset

Restore the sheet from Google Sheets version history, delete test drafts and conversations in Gmail, and set workflow 2 back to `[3, 4]`, `4`, `'draft'`, `7`.
