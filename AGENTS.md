# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
MCP Shield - 48-hour hackathon MVP for scanning AI agent/MCP security risks.

**CRITICAL: This is a hackathon project. Prioritize working demo over perfect architecture.**

## Project Structure (Simplified for MVP)
```
backend/          # Node.js/Express API + Scanner
frontend/         # React dashboard
demo/            # Demo data files (all fake data)
docs/            # Architecture and implementation guides
```

## Build Commands
```bash
# Backend
cd backend
npm install
npm run dev      # Runs on http://localhost:3001
npm test         # Run scanner tests

# Frontend
cd frontend
npm install
npm run dev      # Runs on http://localhost:5173
```

## Hackathon Rules (MUST FOLLOW)

### 1. Demo First
- Every feature must be demoable in under 3 minutes
- Working > Perfect
- If it doesn't show in the demo, deprioritize it

### 2. Code Style
- **TypeScript**: Use TypeScript, but keep it simple
- **Readability**: Simple, readable code over clever optimizations
- **Comments**: Explain WHY, not WHAT (especially for scanner rules)
- **No over-engineering**: No complex abstractions for MVP

### 3. Security & Data
- **NO real secrets**: Never hardcode real API keys, passwords, tokens
- **Fake demo data**: All demo files must use obviously fake credentials
  - Example: `password: "fake-password-123"`, `token: "demo-token-abc"`
- **Demo files**: Keep all test data in `demo/` directory

### 4. Scanner Rules
- **Plain English**: Every rule must explain risk in non-technical terms
- **Example format**:
  ```typescript
  // ❌ Bad: "Unrestricted filesystem access detected"
  // ✅ Good: "This allows the AI to read/write ANY file on your computer, including passwords and private documents"
  ```
- **Include recommendations**: Always tell users HOW to fix the issue

### 5. Reports
- **Non-technical language**: Reports must be understandable by non-security people
- **Visual indicators**: Use emojis/colors for severity (🔴 Critical, 🟠 High, 🟡 Medium)
- **Action items**: Clear next steps, not just problems

### 6. Testing
- **Test scanner engine**: Must have tests for core detection logic
- **Test with demo files**: Verify all demo files produce expected results
- **Coverage goal**: 70% for scanner, don't obsess over 100%

## Scanner Implementation Rules

### Detection Rules (5 Core Rules)
Each rule must:
1. Have a clear category (filesystem, commands, secrets, auth, audit)
2. Return issues with severity, title, description, evidence, recommendation
3. Explain risks in plain English
4. Be testable with demo files

### Example Rule Structure
```typescript
interface Issue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'filesystem' | 'commands' | 'secrets' | 'auth' | 'audit';
  title: string;                    // Short, clear title
  description: string;               // Plain English explanation
  evidence: string;                  // What was found
  recommendation: string;            // How to fix it
}
```

### Risk Scoring
- Critical: 25 points (immediate danger)
- High: 15 points (serious risk)
- Medium: 8 points (should fix)
- Low: 3 points (minor issue)
- Info: 1 point (FYI)
- Cap at 100 total

## Code Examples

### Good: Simple, Readable
```typescript
// ✅ Clear and simple
function hasRootAccess(config: any): boolean {
  const path = config.path || config.args?.[config.args.length - 1];
  return path === '/' || path === '*';
}
```

### Bad: Over-engineered
```typescript
// ❌ Too complex for hackathon
class PathAnalyzer {
  private readonly pathValidator: IPathValidator;
  constructor(validator: IPathValidator) { ... }
  analyze(config: ConfigSchema): ValidationResult { ... }
}
```

### Good: Plain English Errors
```typescript
// ✅ Non-technical explanation
{
  title: "Full Computer Access Detected",
  description: "The AI agent can access every file on your computer, including your passwords, photos, and documents. This is like giving a stranger the keys to your house.",
  recommendation: "Change the path from '/' to a specific folder like '/home/user/projects'"
}
```

### Bad: Technical Jargon
```typescript
// ❌ Too technical
{
  title: "Unrestricted Filesystem Access",
  description: "Root directory access without path restrictions",
  recommendation: "Implement allowedPaths whitelist"
}
```

## Demo Requirements

### Must Demo in 5 Minutes
1. Upload unsafe config → Show 95/100 risk score
2. Upload safe config → Show 15/100 risk score
3. Show issue details with plain English explanations
4. Export report

### Demo Data Files
- `demo/unsafe-mcp-config.json` - High risk (score ~95)
- `demo/safe-mcp-config.json` - Low risk (score ~15)
- `demo/unsafe-agent-tools.json` - Critical issues
- `demo/malicious-prompts.md` - Prompt injection examples

## Testing Strategy

### Must Test
- Scanner engine core logic
- Each detection rule with safe/unsafe examples
- Risk score calculation
- API endpoints (basic smoke tests)

### Can Skip for MVP
- Edge cases
- Performance tests
- E2E UI tests
- 100% coverage

### Test Example
```typescript
describe('FilesystemRule', () => {
  it('detects root access', () => {
    const config = { path: '/' };
    const issues = rule.detect(config);
    expect(issues[0].severity).toBe('critical');
    expect(issues[0].title).toContain('Full Computer Access');
  });
});
```

## Common Pitfalls to Avoid

1. **Over-engineering**: Don't build for scale, build for demo
2. **Perfect code**: 80% working is better than 20% perfect
3. **Complex abstractions**: Keep it simple and direct
4. **Technical jargon**: Use plain English everywhere
5. **Real secrets**: Never use real credentials, even in comments
6. **Scope creep**: Stick to 5 core detection rules

## Quick Reference

### File Locations
- Scanner engine: `backend/src/scanner/engine.ts`
- Detection rules: `backend/src/scanner/rules/*.ts`
- Risk scorer: `backend/src/scanner/scorer.ts`
- API routes: `backend/src/routes/scan.ts`
- Frontend pages: `frontend/src/pages/*.tsx`

### Key Commands
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Run tests
cd backend && npm test

# Test with demo file
curl -F "file=@demo/unsafe-mcp-config.json" http://localhost:3001/api/scan
```

## Success Criteria
- [ ] All 5 detection rules working
- [ ] Risk score accurate (test with demo files)
- [ ] Frontend displays results clearly
- [ ] Reports use plain English
- [ ] Demo runs in under 3 minutes
- [ ] Tests pass for scanner engine
- [ ] No real secrets in code
- [ ] All demo data is obviously fake