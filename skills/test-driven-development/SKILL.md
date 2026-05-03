---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code. Enforces the Red-Green-Refactor cycle: write failing test first, watch it fail, write minimal code to pass, then refactor. Applies to all new features, bug fixes, refactoring, and behavior changes.
---

# Test-Driven Development (TDD)

## Overview

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

## Red-Green-Refactor Cycle

### RED — Write Failing Test

Write one minimal test showing what should happen. Clear name, tests real behavior, one thing only.

### Verify RED — Watch It Fail

**MANDATORY.** Run the test. Confirm it fails for the right reason (feature missing, not typo).

### GREEN — Minimal Code

Write simplest code to pass. Don't add features, refactor other code, or "improve" beyond the test.

### Verify GREEN — Watch It Pass

**MANDATORY.** Run the test. Confirm pass. Check other tests still pass.

### REFACTOR — Clean Up

After green only. Remove duplication, improve names. Keep tests green.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Already manually tested" | Ad-hoc is not systematic. No record, can't re-run. |
| "TDD will slow me down" | TDD is faster than debugging production. |

## Example: Bug Fix

**Bug:** Empty email accepted

**RED:** Write `test('rejects empty email')` → Run → FAIL
**GREEN:** Add validation `if (!email.trim()) return error` → Run → PASS
**REFACTOR:** Extract validation helper if needed

## Verification Checklist

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass, output pristine
