"use client";

import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageView } from "./ResizableImageView";

export interface ResizableImageOptions {
  inline: boolean;
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: number;
        layout?: "block" | "float-left" | "float-right";
      }) => ReturnType;
    };
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: "resizableImage",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      layout: { default: "block" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (dom: HTMLElement) => {
          const width = dom.getAttribute("width");
          const style = dom.getAttribute("style") || "";
          let layout: string = "block";
          if (style.includes("float: left")) layout = "float-left";
          else if (style.includes("float: right")) layout = "float-right";
          return {
            src: dom.getAttribute("src"),
            alt: dom.getAttribute("alt"),
            title: dom.getAttribute("title"),
            width: width ? parseInt(width, 10) : null,
            layout,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { layout, width, ...attrs } = HTMLAttributes;
    const style: string[] = [];
    if (width) {
      style.push(`width: ${width}px`);
      attrs.width = width;
    }
    if (layout === "float-left") {
      style.push("float: left", "margin: 0 16px 8px 0");
    } else if (layout === "float-right") {
      style.push("float: right", "margin: 0 0 8px 16px");
    } else {
      style.push("display: block", "margin: 12px auto");
    }
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, attrs, {
        style: style.join("; "),
      }),
    ];
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
