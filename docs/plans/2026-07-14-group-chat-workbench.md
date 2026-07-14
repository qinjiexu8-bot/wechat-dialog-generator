# Group Chat Workbench Implementation Plan

**Goal:** Turn the existing screenshot generator into a group-chat-first editor where every member and message author can be managed directly.

**Architecture:** Keep React state in `App.tsx` as the single source of truth. Extend the existing member and message panels through callback props, derive the displayed member count from the member array, and keep the current `PhonePreview` export path unchanged.

**Tech Stack:** React 19, TypeScript, Vite 8, CSS, html-to-image.

---

### Task 1: Add a ready-to-edit group chat state

**Files:**
- Modify: `src/App.tsx`

1. Seed three members and a short group conversation.
2. Add member create, rename, avatar, self-selection, and delete handlers.
3. Remove a deleted member's messages and select a safe replacement for `selfId`.
4. Add message deletion and reset-to-group-example actions.

### Task 2: Replace avatar-only management with member management

**Files:**
- Modify: `src/components/UserAvatarManager.tsx`
- Modify: `src/index.css`

1. Add an inline editable name for every member.
2. Keep avatar upload/removal and self selection.
3. Add a member creation form and guarded delete action.
4. Expose the live member count in the section header.

### Task 3: Make speaking identity explicit

**Files:**
- Modify: `src/components/MessageEditor.tsx`
- Modify: `src/index.css`

1. Replace the compact sender dropdown with avatar identity chips.
2. Keep all six message types and their existing field validation.
3. Add a recent-message list with per-message deletion.

### Task 4: Render a true group header

**Files:**
- Modify: `src/components/PhonePreview.tsx`
- Modify: `src/components/SettingsPanel.tsx`
- Modify: `src/index.css`

1. Always render group name and the derived member count together.
2. Rename the setting from chat title to group name.
3. Preserve nickname labels, left/right alignment, screenshot and long-shot behavior.

### Task 5: Verify the implementation

**Files:**
- Modify: `README.md`

1. Run `npm run build` with a supported Node.js version.
2. Run `npm run lint`.
3. Launch the application and verify the member and message flows in a browser.
4. Check desktop and narrow viewport layouts.
