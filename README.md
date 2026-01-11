# Threads Poster (Obsidian Plugin)

Post selected text to Threads as a single thread (root post + replies) with a command/hotkey.

## What it does

- Takes your current selection
- Splits it by a delimiter (if present)
- Posts the first chunk as the root post
- Posts the rest as replies, chained one-by-one


## Setup

### Get a Threads token 
I am in process of creating a detailed video-walkthrough of obtaining your threads token.

In the meanwhile, you can start here:
- [Threads API: authorization and tokens (Meta docs)](https://developers.facebook.com/docs/threads/get-started/)

## Usage

1. Select text in an open note.
2. Run command: **“Post selection to Threads”** (or press "@" icon in the left ribbon)
3. Assign a hotkey: Settings → Hotkeys → search “Threads Poster”.

### Delimiter

Default delimiter is `---`.

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
This is a hobby project that if completely free to use. 
However, if it has saved you any time and headache or enhanced your creative process, consider buying me a coffee. (Cappuccino on almond milk)

[<img src="https://cdn.buymeacoffee.com/buttons/v2/arial-blue.png" alt="BuyMeACoffee" width="100">](https://buymeacoffee.com/metaformproject)
