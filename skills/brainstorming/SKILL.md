---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation. Use this skill whenever the user asks to build something new, create a feature, or design a system, even if they don't explicitly ask for brainstorming."
---

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every project goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval.

## Checklist

You MUST create a task for each of these items and complete them in order:

1. **Explore project context** — check files, docs, recent commits
2. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
3. **Propose 2-3 approaches** — with trade-offs and your recommendation
4. **Present design** — in sections scaled to their complexity, get user approval after each section
5. **Write design doc** — save to docs and inform user
6. **Transition to implementation** — proceed with coding

## Process Flow

1. **Explore project context** — Check current files, docs, recent git history
2. **Ask clarifying questions** — One question at a time, prefer multiple choice when possible. Focus on: purpose, constraints, success criteria, edge cases
3. **Propose 2-3 approaches** — With trade-offs. Lead with your recommended option and explain why
4. **Present design** — Scale sections to complexity. Cover: architecture, components, data flow, error handling, testing. Ask after each section if it looks right
5. **Design for isolation** — Break into smaller units with clear purpose and well-defined interfaces
6. **Write design doc** — Save validated design to docs
7. **Transition to implementation** — Begin coding

## Key Principles

- **One question at a time** — Don't overwhelm with multiple questions
- **Multiple choice preferred** — Easier to answer than open-ended
- **YAGNI ruthlessly** — Remove unnecessary features from designs
- **Explore alternatives** — Always propose 2-3 approaches before settling
- **Incremental validation** — Present design, get approval before moving on
- **Working in existing codebases** — Follow existing patterns, don't propose unrelated refactoring

## When to Use

- Creating any new feature or component
- Building a new project from scratch
- Modifying existing behavior in a significant way
- User asks "build X", "create Y", "design Z"
- Even simple-seeming requests benefit from a brief design step
