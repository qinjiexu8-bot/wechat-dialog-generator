# Private / Group Chat Pixel-Fidelity Design

## Goal

Match the supplied 1179×2556 iPhone WeChat screenshot as closely as browser rendering allows, while preserving a complete private-chat workflow beside the group-chat workflow.

## Product model

- Add a persistent `private` / `group` tab in the application header.
- Keep one independent workspace per mode: participants, messages, self identity, import text, and phone settings.
- Private chat keeps exactly two editable roles and renders the contact name without a member count.
- Group chat keeps editable member management and renders the group name with a derived member count.
- Switching tabs never resets either workspace.

## Preview geometry

- Render and export at the reference resolution: 1179×2556.
- Use Apple system fonts with PingFang SC for Chinese content.
- Rebuild the status bar with mute, cellular, Wi-Fi, and numbered low-battery indicators.
- Match the screenshot's top bar heights, avatar size, bubble padding and radius, message spacing, time badge, input bar, and home indicator.
- Keep uploaded wallpaper behind the message layer; provide a neutral warm background when no wallpaper is supplied.

## Editing behavior

- Private mode supports avatar/name editing, switching which role is “me”, all message types, deletion, text import, and image export.
- Group mode additionally supports member creation/deletion and automatically updates its member count.
- Appearance settings include mute state, background color, and local background-image upload/removal.
- Existing regular screenshot, clipboard copy, and long screenshot flows remain available in both modes.

## Verification

- TypeScript production build and ESLint must pass.
- Browser checks cover tab state isolation, private title, group member count, member speaking identity, wallpaper control, and 390px responsive layout.
- Export output must report 1179×2556 for a normal screenshot.

## Deterministic export pass

- Keep the live phone preview DOM-based so every private/group setting remains editable.
- After the DOM is captured, redraw the top 294 pixels on the output Canvas.
- Place time, mute, cellular, Wi-Fi, battery, back arrow, unread badge, title, and menu dots at coordinates measured from the supplied 1179×2556 iPhone screenshot.
- Rasterize dynamic text into an offscreen Canvas, crop to its actual alpha bounds, then fit it into the measured target box. This removes browser line-box and baseline drift from the final PNG.
- Apply the same deterministic pass to download, clipboard, and long-screenshot outputs.
- Match the supplied iPhone's Dual SIM indicator with two stacked four-bar rows; the upper and lower rows share the editable signal-strength setting.
- Build the muted bell with a transparent diagonal channel plus a separate slash, and construct Wi-Fi from two clipped arc bands and a teardrop node so the exported silhouettes match the reference screenshot.
- Provide independent Wi-Fi visibility and single/dual-SIM mode controls. Both modes retain the existing editable signal-strength value.
- For the final PNG, replace the approximate Wi-Fi vector with the exact 49×37 RGB reference patch sampled from the user-supplied screenshot; the DOM preview keeps a lightweight matching SVG.

## Client persistence

- Save the active private/group tab and both complete workspaces to a versioned IndexedDB record.
- Persist member names, avatars, messages, imported text, phone settings, and uploaded background/image data URLs.
- Restore cached data before enabling writes, merge saved settings over current defaults for forward compatibility, and debounce edits before saving.
- Flush the latest snapshot when the page becomes hidden or is unloaded; storage failures are non-blocking and reported once.
