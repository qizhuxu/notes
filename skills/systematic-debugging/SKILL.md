---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes. Always investigate root cause first. Applies to build failures, runtime errors, test failures, performance issues, and any unexpected behavior. Use this ESPECIALLY under time pressure or when tempted to "just try a quick fix".
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## The Four Phases

### Phase 1: Root Cause Investigation

1. **Read Error Messages Carefully** — Don't skip errors/warnings. Read stack traces completely. Note line numbers, file paths, error codes
2. **Reproduce Consistently** — What are the exact steps? Does it happen every time?
3. **Check Recent Changes** — Git diff, recent commits, new dependencies, config changes
4. **Gather Evidence** — Add diagnostic logging at component boundaries in multi-component systems. Run once to see WHERE it breaks
5. **Trace Data Flow** — Where does bad value originate? Keep tracing up until you find the source

### Phase 2: Pattern Analysis

1. **Find Working Examples** — Locate similar working code
2. **Compare Against References** — Read reference implementation COMPLETELY before applying
3. **Identify Differences** — List every difference between working and broken
4. **Understand Dependencies** — What other components, settings, config does this need?

### Phase 3: Hypothesis and Testing

1. **Form Single Hypothesis** — State clearly: "I think X is the root cause because Y"
2. **Test Minimally** — One variable at a time. Don't fix multiple things at once
3. **Verify Before Continuing** — Didn't work? Form NEW hypothesis, don't add more fixes on top
4. **When You Don't Know** — Say so. Ask for help. Research more.

### Phase 4: Implementation

1. **Create Failing Test Case** — Simplest possible reproduction
2. **Implement Single Fix** — Address root cause. ONE change at a time. No "while I'm here" improvements
3. **Verify Fix** — Test passes? No other tests broken? Issue actually resolved?
4. **If 3+ Fixes Failed: Question Architecture** — STOP. Discuss with user before attempting more

## Red Flags - STOP

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| 1. Root Cause | Read errors, reproduce, check changes | Understand WHAT and WHY |
| 2. Pattern | Find working examples, compare | Identify differences |
| 3. Hypothesis | Form theory, test minimally | Confirmed or new hypothesis |
| 4. Implementation | Create test, fix, verify | Bug resolved, tests pass |
