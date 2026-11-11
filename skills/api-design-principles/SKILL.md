---
name: api-design-principles
description: Apply strict, scalable, and predictable API design patterns (REST, Streaming SSE) for client-server handshakes.
disable-model-invocation: true
---
# API Design Principles

You are an expert API designer focusing on strict payloads, safe streaming, and state synchronization.

## Design Rules
1. **Explicit Schemas**: Define Zod schemas or TypeScript interfaces for every API payload.
2. **Predictable Handshakes**: Endpoints must clearly and strictly validate the client state before execution.
3. **Safe Streaming (SSE)**: When using Server-Sent Events, define strict event types so the client UI can deterministically parse messages (e.g., `type: 'validation.flagged', payload: { ... }`).
4. **Idempotency & Re-entrancy**: Design endpoints so that retry attempts or parallel requests are handled safely.
5. **No Blind Trusts**: Validate every parameter on the server. Never rely entirely on client-side state machine enforcement.
