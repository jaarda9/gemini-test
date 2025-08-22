# HP Cap Fix - TODO List

## Tasks to Complete:

1. [ ] Fix Quest_Rewards.js - Add HP cap to xpgainspiritual() function
2. [ ] Add utility function for HP cap enforcement in status.js
3. [ ] Update all HP modification points to use the cap function
4. [ ] Test the changes to ensure HP never exceeds 100

## Files to Modify:
- SysLVLUP-main/SysLvLUp/Alarm/js/Quest_Rewards.js
- SysLVLUP-main/SysLvLUp/Alarm/js/status.js

## Current Issues Found:
- xpgainspiritual() in Quest_Rewards.js adds HP without cap
- Need consistent HP cap enforcement throughout codebase

## Progress:
- [x] Task 1: Fix Quest_Rewards.js - Added HP cap to xpgainspiritual() function
- [x] Task 1b: Fix Quest_Rewards.js - Added HP cap to xpgainphysical() function
- [ ] Task 2: Add utility function
- [ ] Task 3: Update all HP modification points
- [ ] Task 4: Testing
