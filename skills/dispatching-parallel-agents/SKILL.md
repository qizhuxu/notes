---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies. Dispatches one subagent per independent problem domain to work concurrently. Use for multiple unrelated failures, independent subsystem work, or parallel feature development.
---

# Dispatching Parallel Agents

## Overview

Delegate tasks to specialized agents with isolated context. Each agent gets precisely crafted instructions.

**Core principle:** Dispatch one agent per independent problem domain. Let them work concurrently.

## When to Use

- Multiple independent failures (different files, different subsystems)
- Tasks with no shared state or sequential dependencies
- Each problem can be understood without context from others

## When NOT to Use

- Failures are related (fixing one might fix others)
- Need to understand full system state first
- Agents would interfere (editing same files)

## The Pattern

1. **Identify Independent Domains** — Group by what's broken
2. **Create Focused Tasks** — Each agent gets specific scope, clear goal, constraints
3. **Dispatch in Parallel** — Launch all agents in one turn
4. **Review and Integrate** — Read summaries, verify no conflicts, run full test suite

## Agent Prompt Guidelines

Good prompts are:
1. **Focused** — One clear problem domain
2. **Self-contained** — All context needed, no dependency on session history
3. **Specific about output** — What should the agent return?

## Common Mistakes

- Too broad: "Fix all the tests" → Agent gets lost
- No context: "Fix the race condition" → Agent doesn't know where
- No constraints: Agent might refactor everything
- Vague output: "Fix it" → You don't know what changed
