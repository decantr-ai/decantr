{{> _base}}

## Task: Promote local implementation to registry pattern

**Gap:** {{gapName}}
**Location:** {{location}}
**Confidence:** {{confidence}} ({{reason}})

**Implementation:**
```javascript
{{gapCode}}
```

**Requirements:**
1. Create pattern in src/registry/patterns/{{gapName}}.json
2. Follow existing pattern structure (see hero.json, card-grid.json)
3. Include: description, layout, components array, presets, blend config
4. Add to src/registry/patterns/index.json
5. Document in reference/ if complex
