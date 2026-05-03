# Hackathon Submission Checklist

## Core Deliverables

- [ ] Public repository link
- [ ] 3-5 minute video demo
- [ ] Problem/solution write-up
- [ ] IBM Bob usage summary
- [ ] Evidence that the app runs

## Demo Readiness

- [ ] `npm install` and `npm run build` succeed
- [ ] Web app runs at `http://127.0.0.1:3000`
- [ ] Unsafe demo scan shows `100/100` (`CRITICAL`)
- [ ] Safe demo scan shows `0/100` (`MINIMAL`)
- [ ] Before/after comparison is visible
- [ ] Findings detail panel works
- [ ] JSON and Markdown export works

## Documentation Readiness

- [ ] `README.md` reflects current app and commands
- [ ] `demo/DEMO_SCRIPT.md` matches actual UI flow
- [ ] `PROBLEM_SOLUTION.md` explains real user pain and value
- [ ] `BOB_USAGE_REPORT.md` includes clear contribution evidence
- [ ] No outdated references to old folders/ports

## Security and Data Hygiene

- [ ] Demo files use fake credentials/domains only
- [ ] No real API keys or tokens in repository
- [ ] Findings and recommendations remain plain English

## Video Structure (Suggested)

1. Problem in 20-30 seconds
2. Unsafe demo scan and key findings
3. Safe demo scan and `100 -> 0` improvement
4. Policy/report export
5. IBM Bob contribution summary

## Final QA

- [ ] Links in docs work
- [ ] Repo is clean and push-ready
- [ ] Team can run the full demo from scratch in under 3 minutes
