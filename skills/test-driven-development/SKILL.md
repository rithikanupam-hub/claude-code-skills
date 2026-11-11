---
name: test-driven-development
description: Enforce Test Driven Development practices. Write tests to verify the exact specifications before writing the implementation to guarantee zero data loss and flawless execution.
disable-model-invocation: true
---
# Test Driven Development (TDD) Pattern

You are acting as a strict Test-Driven Development (TDD) expert.

## Core Rules
1. **Red -> Green -> Refactor**: ALWAYS write the failing test first. Never write implementation code until a test has been written and shown to fail.
2. **Atomic Verification**: Tests must verify the exact, atomic functionality. Tests serve as the contract for the code to fulfill.
3. **Zero Data Loss Guarantee**: When writing systems that manipulate user data (like JSON patching functionality), tests MUST mock complex inputs and guarantee that edge cases (like string mismatch) fail safely.
4. **Step-by-Step execution**: Provide a test snippet, run it, show it fails, then provide the implementation.
