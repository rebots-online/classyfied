# CHECKLIST: Fix Textbox Visibility Issue

## Problem Statement
New users cannot see the input textbox without scrolling, making the app appear non-functional.

## Previous Work (from Neo4j UILayout entity)
- Fixed scrolling issues with display port
- Changed overflow from hidden to auto in .content-pusher
- Changed overflow from hidden to visible in .main-container
- Ensures textbox and checkboxes remain visible at top
- Responsive design with mobile support

## Analysis Tasks
- [ ] 1. Measure exact pixel distances from top of viewport to textbox
  - Function: Use browser dev tools measurements
  - File: index.css (lines affecting .main-container, .content-pusher, .left-side)
  - Variables: --header-height (currently 56px), padding values

- [ ] 2. Identify all CSS rules affecting vertical positioning of input section
  - Classes: .main-container, .content-pusher, .left-side, .input-section
  - Properties: padding-top, margin-top, gap, flex positioning
  - File: index.css lines 165-196

- [ ] 3. Document current viewport calculations
  - Calculate: header height + content-pusher padding-top + main-container padding + left-side positioning
  - Expected total offset from top of screen to textbox

## Implementation Tasks
- [ ] 4. Adjust .main-container top padding
  - File: /home/robin/CascadeProjects/classyfied/index.css
  - Line: ~168 (current: padding: 0.5rem 1rem 1rem 1rem)
  - Change to: padding: 0.25rem 1rem 1rem 1rem
  - Reason: Further reduce top padding to ensure immediate visibility

- [ ] 5. Ensure .content-pusher padding accounts for header correctly
  - File: /home/robin/CascadeProjects/classyfied/index.css
  - Line: 165 (current: padding-top: var(--header-height))
  - Verify: --header-height variable is 56px (line 29)
  - Action: No change needed, this is correct

- [ ] 6. Add explicit top positioning to .input-section
  - File: /home/robin/CascadeProjects/classyfied/index.css
  - Line: ~201 (class: .input-section)
  - Add property: margin-top: 0
  - Add property: padding-top: 0
  - Ensure: First visible element on page

- [ ] 7. Verify .left-side positioning doesn't push content down
  - File: /home/robin/CascadeProjects/classyfied/index.css
  - Line: 187-197 (class: .left-side)
  - Current: margin-top: 0 (already added)
  - Verify: No additional vertical spacing

## Testing Tasks
- [ ] 8. Test viewport positioning at 1920x1080 resolution
  - Method: Open browser, load app, measure textbox position
  - Expected: Textbox visible within first 100vh without scrolling

- [ ] 9. Test on mobile viewport (768px width)
  - Method: Use browser dev tools mobile view
  - Expected: Input section still immediately visible

- [ ] 10. Test with different browser zoom levels
  - Levels: 100%, 125%, 150%
  - Expected: Textbox remains visible at all zoom levels

## Verification Tasks
- [ ] 11. Update Neo4j UILayout entity with new changes
  - Function: mcp__neo4j__add_observations
  - Entity: UILayout
  - Observation: "Reduced main-container top padding to 0.25rem for immediate textbox visibility"

- [ ] 12. Test with fresh user perspective
  - Method: Clear browser cache, reload page
  - Verification: Textbox is immediately visible without any scrolling
  - Success criteria: Input field visible within top 50% of viewport

## Dependencies
- CSS Variables: --header-height (56px)
- CSS Classes: .main-container, .content-pusher, .left-side, .input-section
- Files: /home/robin/CascadeProjects/classyfied/index.css

## Success Criteria
1. Input textbox visible immediately on page load
2. No scrolling required to see primary input
3. Responsive design maintained
4. No regression in other layout components