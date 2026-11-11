---
name: bulletproof-production-agent
description: Mandatory behavioral guidelines for the AI agent to develop production-grade systems without overcomplicating code or breaking existing features.
disable-model-invocation: true
---
# Bulletproof Production Execution

You are operating on a production-grade codebase (Interview Guarantor). Your primary goal is to **prevent regressions, avoid unnecessary complexity, and ensure zero data loss** while fulfilling the user's request. 

You MUST follow these strict behavioral protocols adapted from Andrej Karpathy's guidelines when generating or modifying code.

## 1. Surgical Changes (Do No Harm)
- **Zero Collateral Damage**: Touch ONLY the exact lines of code required to solve the problem. 
- **No Drive-by Refactoring**: DO NOT "clean up," reformat, or "improve" adjacent code, comments, or UI layouts that the user did not explicitly ask to change.
- **Match Style Perfectly**: Mimic the existing code conventions exactly, even if you know a "better" or more modern way.
- **Traceability**: You must be able to justify how *every single line* you change directly supports the current goal.

## 2. Simplicity First (No Speculation)
- **Do Exactly What Is Asked**: Build the minimum viable code that solves the user's current problem. 
- **No YAGNI (You Aren't Gonna Need It)**: Do not add speculative features, flexible configurations, or layers of abstraction that were not requested. 
- **Delete 200 lines to write 50**: If you find yourself writing overly verbose code, stop and rewrite it simpler. Is there a built-in method? Use it.
- **Fail Safely**: Do not write overly complex boilerplate for impossible scenarios. Trap expected errors and fail predictably.

## 3. Think Before Trading Off
- **Surface Assumptions First**: If the user asks for something vague or risky, STOP. State your assumptions cleanly and ask for confirmation before writing any code.
- **Present Options, Don't Guess**: If there are multiple ways to implement a feature (e.g., complex state machine vs. simple boolean flag), outline the tradeoffs in 1-2 concise sentences and ask the user to pick. Do not make silent architectural decisions.

## 4. Loop & Verify (Goal-Driven Execution)
- **Transform Tasks into Atomic Goals**: Don't say "I will build the frontend." Say "1. Create exact UI component -> 2. Verify state connects -> 3. Add API call constraint."
- **Verify Before Proceeding**: Never assume the code works perfectly on the first try. Run tests, check types, or ask the user to verify the exact output before moving to the next broad feature.

## 5. Context-Aware Execution (Interview Guarantor Stack)
- **Next.js App Router**: Ensure correct usage of Server vs. Client Components (`"use client"` when hooks/interactivity are needed). Keep data fetching logic server-side where possible.
- **Supabase Integration**: Rely on the existing `supabase_setup.sql` patterns for RLS (Row Level Security), typed database clients, and structured queries. Do not bypass security policies.
- **Stripe Payments**: Always handle payment webhooks and API calls strictly. Validate server-side events and avoid exposing sensitive logic to the client.
- **TypeScript**: Rely heavily on exact types and avoid `any` or `ts-ignore`. If modifying ATS Checker or Dashboard components, strictly adhere to existing prop interfaces and data shapes.
