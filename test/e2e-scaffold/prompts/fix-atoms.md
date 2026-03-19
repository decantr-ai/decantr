{{> _base}}

## Task: Fix atom usage violations

**Rule:** {{rule}}
**Files:** {{files}}
**Occurrences:** {{count}}

**Examples:**
{{examples}}

**Requirements:**
1. Replace raw CSS values with decantr atoms (e.g., `color: red` -> `_fgdanger`)
2. Check reference/atoms.md for valid atom names
3. Preserve exact visual appearance
4. Test that styles render correctly after changes
