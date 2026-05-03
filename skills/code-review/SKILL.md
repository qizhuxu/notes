---
name: code-review
description: Use when completing tasks, implementing major features, or before merging/committing to verify work quality. Reviews code for correctness, security, performance, maintainability, and adherence to best practices. Also use when receiving code review feedback.
---

# Code Review

## Overview

Review code early and often. Catch issues before they cascade.

## When to Review

**Mandatory:**
- After completing major features
- Before merge/commit
- After complex refactoring

## Review Checklist

1. **Correctness** — Does it do what it's supposed to? Edge cases handled?
2. **Security** — Input validation, no injection vulnerabilities, secrets not hardcoded
3. **Performance** — No N+1 queries, unnecessary re-renders, memory leaks
4. **Maintainability** — Clear naming, single responsibility, no magic numbers
5. **Testing** — Tests cover happy path and error cases
6. **Consistency** — Follows project patterns and conventions

## When Receiving Review

1. Read feedback completely without reacting
2. Restate requirement in your own words (or ask)
3. Verify if suggestion is correct before implementing
4. Don't blindly implement — verify first

## Red Flags

- Trusting code without reading it
- "Looks good" without actually reading
- Implementing suggestions without understanding them
