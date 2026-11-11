# Setup & Demo Guide

The system is **two core workflows + monitoring + a monthly report**:

| # | Workflow | What it does | Runs |
|---|---|---|---|
| 1 | **Candidate Reactivation** | New job form → finds past candidates who fit → personal emails as Gmail drafts → hands each one to the follow-up sequence | When a recruiter submits the form |
| 2 | **Follow-up Sequence** | Watches every email thread: detects when the recruiter sent it, when the candidate replied or bounced, and writes follow-ups for people who haven't answered | Every morning at 9am |
| 3 | **Error Alerts** | Emails you the moment any workflow fails, with the likely fix | Automatically on failure |
| 4 | **Monthly Client Report** | Emails the agency owner last month's results | 1st of every month |

## How the pieces connect

```
Recruiter fills job form
        │
  [1] Reactivation ──► Gmail drafts ──► recruiter reviews & sends
        │                                       │
        └──► Outreach tab (one row per email) ◄─┘
                        │
  [2] Follow-up Sequence, every morning, per email:
        replied?  → stop, mark "Responded", put them at the top of the recruiter's digest
        bounced?  → stop, mark "Email bounced"
        sent?     → start the sequence
        due?      → follow-up 1 (day 3), follow-up 2 (day 7), close (day 11)
                        │
        Run_Log tab ◄───┴─── every run and every error is recorded
                        │
  [4] Monthly report reads Run_Log + Outreach → emails the agency owner
  [3] Error alerts → email to you + Run_Log
```

## Files

| File | Purpose |
|---|---|
| `workflows/1_candidate_reactivation.json` | Workflow 1 |
| `workflows/2_followup_sequence.json` | Workflow 2 |
| `workflows/3_error_alerts.json` | Workflow 3 |
| `workflows/4_monthly_report.json` | Workflow 4 |
| `sample-data/demo_candidates.xlsx` | Data file: Candidates, Match_Log, Outreach, Run_Log tabs |
| `sample-data/test_scenarios_java.xlsx` | Scenario test set (see TESTING.md) |

---

## Setup (about 45 minutes)

### Step 1: The Google Sheet
1. Upload `sample-data/demo_candidates.xlsx` to Google Drive → open it → **File → Save as Google Sheets**.
2. Copy the Google Sheet's **URL** from your browser's address bar. You'll paste it in step 3.
3. Don't rename tabs or columns. Columns are set to Plain text on purpose so dates stay as `2026-11-04` and IDs aren't changed by Google Sheets.

### Step 2: Import the four workflows
In n8n, for each JSON file: **Create workflow → ⋯ menu → Import from File**. Save each one.

> Import each file only once. Two workflows containing similar form triggers can cause a "Problem submitting response" error on the form.

### Step 3: Fill in the Settings node in each workflow
Every workflow starts with a node called **Settings**. Open it and change the values at the top of the code. This is the only place you need to edit.

| Workflow | Must change | Optional |
|---|---|---|
| 1 Reactivation | `SHEET_URL` | `TIMEZONE`, `COOLDOWN_DAYS`, `MAX_TO_SCORE`, `MIN_SCORE` |
| 2 Follow-up | `SHEET_URL` | `FOLLOWUP_GAPS_DAYS`, `FINAL_WAIT_DAYS`, `FOLLOWUP_MODE` |
| 3 Error Alerts | `SHEET_URL`, `ALERT_TO` (your email) | `CLIENT_NAME` |
| 4 Monthly Report | `SHEET_URL`, `REPORT_TO` | `AGENCY_NAME`, `PROVIDER_NAME`, time-saved minutes |

Because every Google Sheets node reads the URL from Settings, you **don't** have to pick the spreadsheet and tab in each sheet node this time.

### Step 4: Connect credentials
Open every node with a warning triangle and select your credential:
- **Google Sheets:** 5 nodes in workflow 1, 5 in workflow 2, 1 in workflow 3, 2 in workflow 4
- **OpenAI:** 2 model nodes in workflow 1, 1 in workflow 2. If `gpt-4o-mini` isn't listed, pick any current small/mini model.
- **Gmail:** 2 in workflow 1, 3 in workflow 2 (*Get Gmail Thread*, *Create Follow-up Draft*, *Email Digest*), 1 in workflow 3, 1 in workflow 4
- **Send Draft** (HTTP node in workflow 2): under *Credential for Gmail OAuth2 API*, choose the **same Gmail credential**. It's only used if you switch to auto-send.

### Step 5: Turn on error alerts
First publish/activate workflow 3. Then in workflows **1, 2 and 4**: open **⚙ Workflow settings → Error workflow** → choose *Recruiting - 3. Error Alerts* → Save.

Note: n8n only fires error workflows for **live (automatic) runs**, not manual test runs. To check the alert email itself, open workflow 3 and click **Execute workflow**; n8n uses a sample error.

### Step 6: Check the form
Open workflow 1's **Job Opening Form** node. If submitting gives "Problem submitting response" again, delete the node and rebuild it with the same 10 field labels you used before, rename it `Job Opening Form`, and connect it to **Settings**.

---

## Testing and demo (about 30 minutes)

### Prepare a "candidate" inbox
To show reply detection, the candidate's email must be an inbox you control that is **not** the Gmail account running n8n (a second Gmail account works). In the Candidates tab, change the `email` of 2 strong ICU candidates (e.g. Maria Lopez, Olivia Turner) to that inbox, for example by using `+` aliases of your second account.

Why: if you email yourself, Gmail treats your "reply" as a sent message and the workflow can't tell it's a reply. The other candidates keep `example.com` addresses, so those emails will **bounce**, which conveniently demonstrates bounce handling too.

### Switch workflow 2 to demo timing
In workflow 2's Settings: `FOLLOWUP_GAPS_DAYS: [0, 0]` and `FINAL_WAIT_DAYS: 0`. Each click of **Run Check Now** then moves sequences one step forward instead of waiting days.

### Run the full story
| Step | Do this | You should see |
|---|---|---|
| 1 | Workflow 1: submit the ICU job (Execute workflow, then submit the form) | Drafts in Gmail; 5 rows in **Outreach** with status `Awaiting send`; a `Reactivation` row in Run_Log; summary email |
| 2 | In Gmail, **send** the drafts | — |
| 3 | Workflow 2: **Run Check Now** | Outreach rows become `Active`; follow-up 1 drafts appear **inside the same Gmail threads**; example.com rows become `Bounced` (once Gmail's bounce arrives, usually within a minute); digest email |
| 4 | From the second inbox, **reply** to one email | — |
| 5 | Workflow 2: **Run Check Now** again | That row becomes `Replied`; candidate status becomes `Responded`; the digest lists them under "call these people first" with their reply. Non-repliers get follow-up 2 |
| 6 | Run Check Now once more | Remaining non-repliers become `Completed - no reply` |
| 7 | Workflow 4: **Run Report Now** | Monthly-style report for the last 30 days |
| 8 | Workflow 3: **Execute workflow** | Sample alert email |

**After the demo:** set workflow 2's timing back to `[3, 4]` and `4`.

### Reset for the next demo
Restore the Google Sheet from **File → Version history** to the version before step 1, and delete the test drafts and threads in Gmail.

---

## Going live with a client
1. **Activate** workflows 1, 2 and 4 (toggle at the top). Workflow 3 must also be published/active, otherwise n8n won't let you select it as an error workflow.
2. Give the recruiter the form's **Production URL** (from the form node), not the Test URL.
3. Set `TIMEZONE` to the agency's time zone in all four Settings nodes. Workflows 2 and 4 also use **⚙ Workflow settings → Timezone** for their schedule.
4. Keep `FOLLOWUP_MODE: 'draft'` for the first 2–4 weeks. Once the recruiter trusts the follow-ups, switch to `'send'` so they go out automatically in the same thread.
5. Replace the Candidates tab with the client's ATS export, or later a direct ATS connection. Keep the column names, or update the code to match theirs.

## Safety rules built in
- Never contacts Do Not Contact / Placed / Not Looking / Interviewing / Responded / Email bounced candidates
- 30-day cooldown between reactivation emails
- First emails are always drafts a human sends; follow-ups are drafts unless you switch modes
- Any reply stops the sequence immediately
- Sequences stop if the candidate's status changes to Do Not Contact, Placed, Not Looking or Interviewing
- Drafts never sent within 7 days are closed, not chased
- Maximum 2 follow-ups, each short and in the same thread
- Every AI score and reason is logged; the AI never sees names and is told to ignore protected characteristics

## Settings reference (workflow 2)
| Setting | Default | Meaning |
|---|---|---|
| `FOLLOWUP_GAPS_DAYS` | `[3, 4]` | Follow-up 1 three days after sending, follow-up 2 four days later. Add a number for a third follow-up |
| `FINAL_WAIT_DAYS` | `4` | Days to wait after the last follow-up before closing |
| `NEVER_SENT_DAYS` | `7` | Close drafts the recruiter never sent |
| `FOLLOWUP_MODE` | `'draft'` | `'draft'` = review in Gmail; `'send'` = sent automatically |
| `STOP_STATUSES` | DNC, placed, not looking, interviewing | Candidate statuses that end a sequence |

## Troubleshooting
| Problem | Fix |
|---|---|
| "Unable to parse range" / sheet not found | `SHEET_URL` is wrong in that workflow's Settings, or a tab was renamed |
| Outreach rows have no `thread_id` | Gmail didn't return a thread ID for that draft; that row can't be tracked. Check the *Create Gmail Draft* output |
| Follow-ups appear as a new email instead of in the thread | Check *Create Follow-up Draft* → Options → Thread ID is set to `{{ $json.thread_id }}` |
| A reply wasn't detected | The candidate inbox is the same Gmail account as n8n (see "Prepare a candidate inbox"), or the reply was sent as a new email rather than replying in the thread |
| Everything shows `Bounced` | The candidate emails are still `example.com` addresses |
| Send Draft fails with 403 | Reconnect the Gmail credential so it has permission to send, or stay in `'draft'` mode |
| Monthly report shows zeros | Run_Log is empty for that period. Use *Run Report Now* (last 30 days) after a demo run |
| Workflow 2 does nothing | No rows are `Awaiting send` or `Active` in Outreach; run workflow 1 first |
