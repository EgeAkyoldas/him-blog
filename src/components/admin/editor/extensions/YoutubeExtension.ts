import { Node, mergeAttributes } from "@tiptap/core";

export interface YoutubeOptions {
  HTMLAttributes: Record<string, unknown>;
  width: number;
  height: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      setYoutubeVideo: (options: { src: string }) => ReturnType;
    };
  }
}

function getEmbedUrl(url: string): string | null {
  // Standard watch URL
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;

  // Already an embed URL
  match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match) return url;

  return null;
}

export const Youtube = Node.create<YoutubeOptions>({
  name: "youtube",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      width: 640,
      height: 360,
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      width: { default: this.options.width },
      height: { default: this.options.height },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-youtube-video]" }];
  },

  renderHTML({ HTMLAttributes }) {
    // The outer div uses data-youtube-video so CSS can target it differently
    // in editor (compact) vs public page (full-width responsive)
    return [
      "div",
      {
        "data-youtube-video": "",
        style: "position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;border-radius:8px;margin:16px 0;",
      },
      [
        "iframe",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          style: "position:absolute;top:0;left:0;width:100%;height:100%;border:0;",
          allowfullscreen: "true",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setYoutubeVideo:
        (options) =>
        ({ commands }) => {
          const embedUrl = getEmbedUrl(options.src);
          if (!embedUrl) return false;
          return commands.insertContent([
            { type: this.name, attrs: { src: embedUrl } },
            { type: "paragraph" },
          ]);
        },
    };
  },
});
