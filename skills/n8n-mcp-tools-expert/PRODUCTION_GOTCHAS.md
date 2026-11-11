# Production Gotchas — Hard-Won Lessons from Real n8n MCP Debugging

This guide captures real-world pitfalls discovered while building, debugging, and updating n8n workflows via MCP tools and the REST API. Every item here caused actual production failures.

---

## Gotcha 1: Missing `typeVersion` Kills Nodes Silently

**Symptom:** "Could not get parameter" error on Code nodes, or nodes that appear empty when opened in the UI despite having code in the JSON.

**Root Cause:** n8n requires a `typeVersion` field on every node. Without it, n8n doesn't know which version of the node executor to use, so it fails to read the `parameters` object entirely.

**Critical:** The n8n UI does NOT show a helpful error message. It just shows an empty node with no code.

**Fix:** Always include `typeVersion` when creating nodes via `n8n_create_workflow` or direct REST API calls.

**Correct typeVersions (as of n8n v1.x):**
```javascript
const TYPE_VERSIONS = {
  'n8n-nodes-base.code':             2,
  'n8n-nodes-base.httpRequest':      4.2,
  'n8n-nodes-base.if':               2.2,
  'n8n-nodes-base.switch':           3.2,
  'n8n-nodes-base.splitInBatches':   3,
  'n8n-nodes-base.scheduleTrigger':  1.2,
  'n8n-nodes-base.webhook':          2,
  'n8n-nodes-base.set':              3.4,
  'n8n-nodes-base.merge':            3,
  'n8n-nodes-base.functionItem':     1,
};
```

**Prevention:** When building workflows programmatically, ALWAYS validate that every node has `typeVersion` set before pushing to n8n. Add a pre-flight check:
```python
for node in workflow['nodes']:
    assert node.get('typeVersion') is not None, f"{node['name']} missing typeVersion!"
```

---

## Gotcha 2: HTTP Request Node `sendQuery` Must Be Explicitly `true`

**Symptom:** HTTP Request node (v4.2) calls the API without query parameters. The URL shows no `?lat=59.437&lon=24.75` appended.

**Root Cause:** Even if you define `queryParameters.parameters[]` in the JSON, the HTTP Request node has a separate toggle called `sendQuery`. If `sendQuery` is not explicitly set to `true`, the parameters are stored but never sent.

**Fix:**
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "parameters": {
    "url": "https://api.example.com/data",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        {"name": "latitude", "value": "={{ $json.lat }}"},
        {"name": "longitude", "value": "={{ $json.lon }}"}
      ]
    }
  }
}
```

**Same applies to:** `sendHeaders` (for custom headers) and `sendBody` (for POST body).

---

## Gotcha 3: Expression Syntax — The Invisible `=` Problem

**Symptom:** "Cannot initialize Float from invalid String value =59.437" when an expression like `{{ $json.lat }}` is used in a query parameter.

**Root Cause:** In the n8n UI, when you toggle a field to "Expression" mode, n8n internally prepends `=` to the value. So the JSON stores `={{ $json.lat }}`. But if you **manually type** `={{ $json.lat }}` into an already-expression-mode field, it becomes `=={{ $json.lat }}`, which evaluates to the literal string `=59.437`.

**Rules:**
- **In JSON/API:** Always use `={{ $json.lat }}` (with leading `=`)
- **In n8n UI (Expression mode):** Just type `{{ $json.lat }}` (no leading `=`)
- **Never mix:** Don't type `=` in a field that already shows the expression toggle is on

---

## Gotcha 4: Minimax M1 `<think>` Tags Break JSON Parsing

**Symptom:** LLM returns valid JSON, but the parser fails because the response is wrapped in `<think>...</think>` reasoning tags.

**Root Cause:** Minimax M1 (and other reasoning models like DeepSeek-R1) include chain-of-thought in `<think>` tags within the `content` field. A raw response looks like:
```
<think>The user wants me to respond with JSON...</think>

```json
{"severity": "🔴", "headline": "..."}
```
```

**Fix (dual approach):**
1. **API-level:** Add `reasoning_split: true` to the request body. This tells MiniMax to put thinking in a separate `reasoning_details` field.
2. **Parser-level:** Strip `<think>` tags as a safety net:
```javascript
let jsonStr = content.replace(/<think>[\s\S]*?<\/think>/g, '');
if (jsonStr.includes('```')) {
  jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '');
}
jsonStr = jsonStr.trim();
const start = jsonStr.indexOf('{');
const end = jsonStr.lastIndexOf('}');
if (start !== -1 && end !== -1) {
  jsonStr = jsonStr.substring(start, end + 1);
}
const parsed = JSON.parse(jsonStr);
```

**Applies to all reasoning models:** DeepSeek-R1, QwQ, Minimax M1, etc.

---

## Gotcha 5: API PUT Overwrites EVERYTHING — State Is Lost

**Symptom:** After pushing a workflow update via `PUT /api/v1/workflows/{id}`, some nodes lose their configuration (query parameters, code, etc.).

**Root Cause:** The n8n REST API `PUT` endpoint does a **full replacement** of the workflow. If your local JSON file is out of date or was derived from an older version, you'll overwrite changes that were made in the UI.

**Prevention workflow:**
```
1. GET the current workflow from n8n API (latest state)
2. Modify the in-memory JSON
3. PUT the modified JSON back
```

**Never:** Read from a local file that may be stale and PUT it directly. Always start from a fresh GET.

```python
# CORRECT PATTERN
import requests

# Step 1: GET latest
resp = requests.get(f"{N8N_URL}/api/v1/workflows/{wf_id}", headers=headers)
wf = resp.json()

# Step 2: Modify in memory
for node in wf['nodes']:
    if node['name'] == 'My Node':
        node['parameters']['someField'] = 'newValue'

# Step 3: PUT back
requests.put(f"{N8N_URL}/api/v1/workflows/{wf_id}", json=wf, headers=headers)
```

---

## Gotcha 6: SplitInBatches Loop Requires Explicit Loop-Back Connections

**Symptom:** Workflow processes the first item in the batch and then stops. Remaining items are never processed.

**Root Cause:** The `SplitInBatches` node has a special "done" output (index 0) and a "loop" pattern. Every terminal branch in the loop body must connect BACK to the SplitInBatches node to trigger the next item.

**Required connections:**
```json
{
  "If Weather Flagged": {
    "main": [
      [{"node": "LLM Assessment"}],     // True branch → continue processing
      [{"node": "Split In Batches"}]      // False branch → loop back for next item!
    ]
  },
  "Slack Alert": {
    "main": [
      [{"node": "Split In Batches"}]      // After alerting → loop back for next item!
    ]
  }
}
```

**Visual check:** In the n8n canvas, you should see lines going BACKWARDS from the end of the pipeline to the SplitInBatches node. If you don't see those lines, the loop won't work.

---

## Gotcha 7: Pinned/Mock Data Blocks Execution

**Symptom:** n8n shows "Unpin output data?" dialog when you try to execute a node that has mock data set.

**Root Cause:** When mock data is "pinned" to a node's output, n8n will use that data instead of executing the node. If you click "Execute step", n8n offers to unpin (delete) the mock data. If you click "Execute Workflow" from the canvas, it uses the pinned data seamlessly.

**Rules:**
- Use **"Execute Workflow"** (canvas button) to run with mock data intact
- Use **"Execute step"** (inside node) to run the real node — this will unpin mock data
- Click **"Cancel"** if you see the unpin dialog and want to keep mock data

---

## Gotcha 8: n8n UI Query Parameters Don't Survive API Updates

**Symptom:** You manually added query parameters in the n8n UI, but after an API update they disappear.

**Root Cause:** Parameters added in the UI are stored in the workflow JSON. When you push a workflow update via API from a local file that doesn't include those parameters, they get overwritten.

**Prevention:** If you're going to update workflows via API, ALWAYS include ALL node parameters in your JSON — especially `sendQuery`, `sendHeaders`, `sendBody`, and their corresponding parameter arrays. See Gotcha 5.

---

## Pre-Flight Checklist

Before pushing any workflow via API, verify ALL of these:

```python
def preflight_check(workflow):
    for node in workflow['nodes']:
        # 1. typeVersion exists
        assert node.get('typeVersion') is not None, f"{node['name']} missing typeVersion"
        
        # 2. HTTP Request nodes have sendQuery/sendHeaders/sendBody if they have params
        if node['type'] == 'n8n-nodes-base.httpRequest':
            params = node.get('parameters', {})
            if params.get('queryParameters', {}).get('parameters'):
                assert params.get('sendQuery') == True, f"{node['name']} has query params but sendQuery is not True"
            if params.get('headerParameters', {}).get('parameters'):
                assert params.get('sendHeaders') == True, f"{node['name']} has headers but sendHeaders is not True"
        
        # 3. Code nodes have jsCode or pyCode
        if node['type'] == 'n8n-nodes-base.code':
            params = node.get('parameters', {})
            assert params.get('jsCode') or params.get('pyCode'), f"{node['name']} has no code"
    
    print("✅ Pre-flight check passed!")
```
