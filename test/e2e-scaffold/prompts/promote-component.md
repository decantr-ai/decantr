{{> _base}}

## Task: Promote local implementation to registry component

**Gap:** {{gapName}}
**Location:** {{location}}
**Confidence:** {{confidence}} ({{reason}})

**Implementation:**
```javascript
{{gapCode}}
```

**Requirements:**
1. Create component in src/components/{{gapName}}.js
2. Follow existing component patterns (see Button, Card, Modal)
3. Export from src/components/index.js
4. Add to src/registry/components.json with props/types
5. Include JSDoc with usage example
