# JavaScript Fixes for Button Clickability and Module Issues

## Issues Identified:
1. ES6 import statements causing "Cannot use import statement outside a module" errors
2. Multiple DOMContentLoaded event listeners causing conflicts
3. Inline onclick handlers that may not work properly

## Files to Fix:
- [ ] status.js - Remove import, consolidate event listeners
- [ ] login.js - Remove import
- [ ] status.html - Update script loading order
- [ ] index.html - Update script loading order
- [ ] Other HTML files that may have similar issues

## Steps:
1. Remove import statements from JavaScript files
2. Ensure sync-utils.js is loaded before other scripts that depend on it
3. Consolidate multiple DOMContentLoaded event listeners
4. Test button functionality after fixes
