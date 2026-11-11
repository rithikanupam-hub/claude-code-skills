# MCP Server Evaluation Guide

## Purpose
Evaluations test whether an LLM can effectively use your MCP server to answer realistic, complex questions. They catch regressions and validate tool discoverability.

## Creating 10 Evaluation Questions

### Process
1. **Tool Inspection**: Call `list_tools` and understand all capabilities
2. **Content Exploration**: Use READ-ONLY tool calls to explore what data is available
3. **Question Generation**: Write 10 questions that require multiple tool calls
4. **Answer Verification**: Solve each yourself and record the exact answer

### Requirements per Question
- **Independent**: Not dependent on other questions or side effects
- **Read-only**: Only non-destructive operations required
- **Complex**: Requires 2+ tool calls and decision-making
- **Realistic**: A real user would actually ask this
- **Verifiable**: Single, exact answer (string comparison)
- **Stable**: Answer doesn't change over time

### Example Questions for a Browser Agent MCP

```
Q: Navigate to getyourguide.com and search for "Colosseum" tours.
   How many results appear on the first page?
A: 24

Q: On omio.com, search for trains from Rome to Florence tomorrow.
   What is the price of the cheapest available option in EUR?
A: 9.90
```

## Output Format (XML)

```xml
<evaluation>
  <qa_pair>
    <question>Navigate to getyourguide.com and search for 'Colosseum Underground Tour'. 
    What is the star rating displayed for the top result?</question>
    <answer>4.7</answer>
  </qa_pair>
  <qa_pair>
    <question>On skyscanner.com, search for one-way flights from Rome (FCO) to London (LHR) 
    for next Monday. What is the cheapest price shown?</question>
    <answer>£34</answer>
  </qa_pair>
  <!-- 8 more qa_pairs... -->
</evaluation>
```

## Running Evaluations

```bash
# Run against your MCP server
npx @modelcontextprotocol/inspector --eval evaluation.xml

# Or manually: start server, then run each question through an LLM hooked to the MCP
```

## Anti-Patterns to Avoid
- Questions with date-dependent answers (prices, availability)
- Questions requiring login or payment
- Questions where multiple answers are valid
- Questions that WRITE or MODIFY data
