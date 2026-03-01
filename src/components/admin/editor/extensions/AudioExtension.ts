import { Node, mergeAttributes } from "@tiptap/core";

export interface AudioOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { src: string }) => ReturnType;
    };
  }
}

export const Audio = Node.create<AudioOptions>({
  name: "audio",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "audio[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "audio",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        controls: "true",
        style: "width:100%;margin:16px 0;",
      }),
    ];
  },

  addCommands() {
    return {
      setAudio:
        (options) =>
        ({ commands }) => {
          return commands.insertContent([
            { type: this.name, attrs: { src: options.src } },
            { type: "paragraph" },
          ]);
        },
    };
  },
});
