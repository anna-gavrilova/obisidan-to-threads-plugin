import {
  App,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  requestUrl,
} from "obsidian";

type ThreadsPosterSettings = {
  threadsAccessToken: string;
  delimiter: string; // split selection into parts of the same thread (root + replies)
};

const DEFAULT_SETTINGS: ThreadsPosterSettings = {
  threadsAccessToken: "",
  delimiter: "\n---\n",
};

// Threads Graph API base for Threads endpoints
const GRAPH_BASE = "https://graph.threads.net/v1.0";

export default class ThreadsPosterPlugin extends Plugin {
  settings!: ThreadsPosterSettings;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    this.addCommand({
      id: "threads-post-selection-as-thread",
      name: "Post selection to Threads (as a thread)",
      callback: async () => {
        await this.postSelectionAsThread();
      },
    });

    this.addRibbonIcon(
      "at-sign",
      "Post selection to Threads",
      () => {
        void this.postSelectionAsThread();
      }
    );

    this.addSettingTab(new ThreadsPosterSettingTab(this.app, this));
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private getActiveSelection(): { text: string; noteTitle: string } | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return null;

    const editor = view.editor;
    const selection = (editor.getSelection() ?? "").trim();
    if (!selection) return null;

    const noteTitle = view.file?.basename ?? "";
    return { text: selection, noteTitle };
  }

  private splitIntoParts(text: string): string[] {
    const delim = this.settings.delimiter ?? "";
    if (!delim) return [text];

    return text
      .split(delim)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private async postSelectionAsThread() {
    const sel = this.getActiveSelection();
    if (!sel) {
      new Notice("No selection.");
      return;
    }

    const token = this.settings.threadsAccessToken?.trim();
    if (!token) {
      new Notice("Threads access token is not set. Configure in plugin settings.");
      return;
    }

    const parts = this.splitIntoParts(sel.text);
    if (parts.length === 0) {
      new Notice("Nothing to post.");
      return;
    }

    try {
      // todo: add cache mechanics
      const userId = await this.getThreadsUserId(token);

      // 1) Root post
      const rootCreationId = await this.createTextContainer({
        accessToken: token,
        userId,
        text: parts[0],
      });

      const rootPostId = await this.publishContainerAndReturnId({
        accessToken: token,
        userId,
        creationId: rootCreationId,
      });

      // 2) Replies chained to previous post (so it reads as a single thread)
      let replyToId = rootPostId;
      for (let i = 1; i < parts.length; i++) {
        const creationId = await this.createTextContainer({
          accessToken: token,
          userId,
          text: parts[i],
          replyToId,
        });

        const publishedId = await this.publishContainerAndReturnId({
          accessToken: token,
          userId,
          creationId,
        });

        replyToId = publishedId;
        await sleep(350);
      }

      new Notice(`Posted thread: ${parts.length} post(s).`);
    } catch (err) {
      console.error(err);
      new Notice(`Threads Poster failed: ${String(err)}.`);
    }
  }

  // GET /me?fields=id
  private async getThreadsUserId(accessToken: string): Promise<string> {
    const res = await requestUrl({
      url: `${GRAPH_BASE}/me?fields=id&access_token=${encodeURIComponent(accessToken)}`,
      method: "GET",
    });

    const json = safeJson(res.text) as { id?: string; error?: unknown } | null;
    if (!json?.id) throw new Error(`Could not resolve Threads user id: ${res.text}`);
    return String(json.id);
  }

  // POST /{threads-user-id}/threads  (media_type=TEXT, optional reply_to_id)
  private async createTextContainer(args: {
    accessToken: string;
    userId: string;
    text: string;
    replyToId?: string;
  }): Promise<string> {
    const payload: Record<string, unknown> = {
      media_type: "TEXT",
      text: args.text,
    };

    if (args.replyToId) {
      payload.reply_to_id = args.replyToId;
    }

    const res = await requestUrl({
      url: `${GRAPH_BASE}/${encodeURIComponent(args.userId)}/threads`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = safeJson(res.text) as { id?: string; error?: unknown } | null;
    if (!json?.id) throw new Error(`Create container failed: ${res.text}`);
    return String(json.id);
  }

  // POST /{threads-user-id}/threads_publish  (creation_id=container_id) -> returns published post id
  private async publishContainerAndReturnId(args: {
    accessToken: string;
    userId: string;
    creationId: string;
  }): Promise<string> {
    const res = await requestUrl({
      url: `${GRAPH_BASE}/${encodeURIComponent(args.userId)}/threads_publish`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creation_id: args.creationId,
      }),
    });

    const json = safeJson(res.text) as { id?: string; error?: unknown } | null;
    if (json?.error) throw new Error(`Publish failed: ${res.text}`);
    if (!json?.id) throw new Error(`Publish did not return post id: ${res.text}`);
    return String(json.id);
  }
}

class ThreadsPosterSettingTab extends PluginSettingTab {
  plugin: ThreadsPosterPlugin;

  constructor(app: App, plugin: ThreadsPosterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Threads poster")
      .setHeading();

    new Setting(containerEl)
      .setName("Threads access token")
      .setDesc("Long-lived Threads user access token (you generate it yourself).")
      .addText((text) =>
        text
          .setPlaceholder("EAAB…")
          .setValue(this.plugin.settings.threadsAccessToken)
          .onChange(async (value: string) => {
            this.plugin.settings.threadsAccessToken = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Delimiter")
      .setDesc("Split selection into parts of the same thread (root + replies). Example: \\n---\\n")
      .addText((text) =>
        text
          .setPlaceholder("\\n---\\n")
          .setValue(this.plugin.settings.delimiter)
          .onChange(async (value: string) => {
            this.plugin.settings.delimiter = value;
            await this.plugin.saveSettings();
          })
      );
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
