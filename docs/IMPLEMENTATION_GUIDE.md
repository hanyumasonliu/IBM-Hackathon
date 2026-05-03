# Implementation Guide

## 1) Install and Build

```bash
npm install
npm run build
```

## 2) Run Web App

```bash
cd apps/web
npm run dev
```

Open `http://127.0.0.1:3000`.

## 3) Run Scanner Tests

```bash
cd packages/scanner
npm test
```

## 4) Core Extension Points

### Add a Scanner Rule

1. Update `packages/scanner/src/rules.ts`
2. Return `Finding` objects with:
   - severity
   - title
   - explanation (plain English)
   - evidence
   - recommended fix
3. Ensure scoring impact is expected
4. Add tests in `packages/scanner/tests/scanner.test.ts`

### Update UI Presentation

1. Edit `apps/web/src/App.tsx` for structure/behavior
2. Edit `apps/web/src/App.css` and `apps/web/src/index.css` for styling
3. Keep demo flow simple:
   - unsafe scan
   - safe scan
   - comparison
   - export

### Update Report Formatting

1. Edit generator logic in `packages/report`
2. Keep outputs readable by technical and non-technical users

## 5) Demo Config Expectations

- Unsafe config should remain intentionally high risk.
- Safe config should remain least-privilege and currently score `0/100`.

If changing scanner rules, re-validate both unsafe and safe demo scores.
