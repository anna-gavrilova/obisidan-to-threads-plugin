# Threads Poster (Obsidian Plugin)

Post selected text to Threads as a single thread (root post + replies) with a command/hotkey.

## What it does

- Takes your current selection
- Splits it by a delimiter (if present)
- Posts the first chunk as the root post
- Posts the rest as replies, chained one-by-one

## Install (manual)

1. Download the latest release from GitHub Releases.
2. Create a folder: `<your-vault>/.obsidian/plugins/threads-poster/`
3. Copy **exactly** these files into it:
   - `manifest.json`
   - `main.js`
   - `styles.css` (optional)
4. Obsidian → Settings → Community plugins → enable **Threads Poster**.

## Setup

### Get a Threads token (video)
I recorded a setup walkthrough here:
- YouTube: **PASTE_YOUR_VIDEO_LINK_HERE**

If you prefer official docs, start here:
- Threads API: authorization and tokens (Meta docs)  
- Threads API: endpoints for posting (Meta docs)

## Usage

1. Select text in an open note.
2. Run command: **“Post selection to Threads”**
3. Assign a hotkey: Settings → Hotkeys → search “Threads Poster”.

### Delimiter

Default delimiter is `\n---\n`.

Example selection:

```
Root post text.
---
Reply 1
---
Reply 2
```

Will become one thread: root + 2 replies.

## Roadmap

- v0.1: Text threads (root + replies)
- v0.2: Timed queue
- v0.3: Images support
- v0.4: Topics support

## Support

- Buy me a coffee: **PASTE_YOUR_LINK_HERE**
