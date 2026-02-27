"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
} from "lucide-react";

type Layout = "block" | "float-left" | "float-right";
type HandlePosition =
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";

const HANDLE_POSITIONS: HandlePosition[] = [
  "top-left",
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
];

const HANDLE_CURSORS: Record<HandlePosition, string> = {
  "top-left": "nwse-resize",
  top: "ns-resize",
  "top-right": "nesw-resize",
  right: "ew-resize",
  "bottom-right": "nwse-resize",
  bottom: "ns-resize",
  "bottom-left": "nesw-resize",
  left: "ew-resize",
};

const HANDLE_STYLES: Record<HandlePosition, React.CSSProperties> = {
  "top-left": { top: -4, left: -4 },
  top: { top: -4, left: "50%", transform: "translateX(-50%)" },
  "top-right": { top: -4, right: -4 },
  right: { top: "50%", right: -4, transform: "translateY(-50%)" },
  "bottom-right": { bottom: -4, right: -4 },
  bottom: { bottom: -4, left: "50%", transform: "translateX(-50%)" },
  "bottom-left": { bottom: -4, left: -4 },
  left: { top: "50%", left: -4, transform: "translateY(-50%)" },
};

export function ResizableImageView(props: NodeViewProps) {
  const { node, updateAttributes, selected, deleteNode, editor } = props;
  const { src, alt, width, layout } = node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [resizing, setResizing] = useState(false);
  const startData = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    handle: "" as HandlePosition,
    aspectRatio: 1,
  });

  useEffect(() => {
    setIsSelected(selected);
  }, [selected]);

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsSelected(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(() => {
    setIsSelected(true);
  }, []);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: HandlePosition) => {
      e.preventDefault();
      e.stopPropagation();
      const img = containerRef.current?.querySelector("img");
      if (!img) return;
      const rect = img.getBoundingClientRect();
      startData.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
        handle,
        aspectRatio: rect.width / rect.height,
      };
      setResizing(true);

      const onMouseMove = (moveE: MouseEvent) => {
        const { x, y, width: sw, height: sh, handle: h, aspectRatio } = startData.current;
        const dx = moveE.clientX - x;
        const dy = moveE.clientY - y;

        let newWidth = sw;
        let newHeight = sh;

        // Calculate based on handle
        switch (h) {
          case "right":
            newWidth = Math.max(80, sw + dx);
            newHeight = newWidth / aspectRatio;
            break;
          case "left":
            newWidth = Math.max(80, sw - dx);
            newHeight = newWidth / aspectRatio;
            break;
          case "bottom":
            newHeight = Math.max(60, sh + dy);
            newWidth = newHeight * aspectRatio;
            break;
          case "top":
            newHeight = Math.max(60, sh - dy);
            newWidth = newHeight * aspectRatio;
            break;
          case "top-left":
            newWidth = Math.max(80, sw - dx);
            newHeight = newWidth / aspectRatio;
            break;
          case "top-right":
            newWidth = Math.max(80, sw + dx);
            newHeight = newWidth / aspectRatio;
            break;
          case "bottom-left":
            newWidth = Math.max(80, sw - dx);
            newHeight = newWidth / aspectRatio;
            break;
          case "bottom-right":
            newWidth = Math.max(80, sw + dx);
            newHeight = newWidth / aspectRatio;
            break;
        }

        updateAttributes({
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        });
      };

      const onMouseUp = () => {
        setResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes]
  );

  const setLayout = useCallback(
    (l: Layout) => {
      updateAttributes({ layout: l });
    },
    [updateAttributes]
  );

  // Wrapper style based on layout
  const wrapperStyle: React.CSSProperties = {};
  if (layout === "float-left") {
    wrapperStyle.float = "left";
    wrapperStyle.marginRight = 16;
    wrapperStyle.marginBottom = 8;
  } else if (layout === "float-right") {
    wrapperStyle.float = "right";
    wrapperStyle.marginLeft = 16;
    wrapperStyle.marginBottom = 8;
  } else {
    wrapperStyle.display = "flex";
    wrapperStyle.justifyContent = "center";
    wrapperStyle.margin = "12px 0";
  }

  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper
      as="div"
      style={wrapperStyle}
      data-drag-handle
      className="resizable-image-wrapper"
    >
      <div
        ref={containerRef}
        onClick={handleSelect}
        style={{
          position: "relative",
          display: "inline-block",
          width: width ? `${width}px` : "auto",
          maxWidth: "100%",
          outline: isSelected && isEditable ? "2px solid #3b82f6" : "none",
          outlineOffset: 2,
          borderRadius: 2,
          userSelect: resizing ? "none" : "auto",
        }}
      >
        <img
          src={src}
          alt={alt || ""}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: 2,
          }}
          draggable={false}
        />

        {/* Resize handles — only show when selected & editable */}
        {isSelected && isEditable &&
          HANDLE_POSITIONS.map((pos) => (
            <div
              key={pos}
              onMouseDown={(e) => handleResizeStart(e, pos)}
              style={{
                position: "absolute",
                width: pos === "top" || pos === "bottom" ? 20 : 8,
                height: pos === "left" || pos === "right" ? 20 : 8,
                background: "white",
                border: "1.5px solid #3b82f6",
                borderRadius: pos.includes("-") ? "50%" : 1,
                cursor: HANDLE_CURSORS[pos],
                zIndex: 10,
                ...HANDLE_STYLES[pos],
              }}
            />
          ))}

        {/* Floating toolbar — layout options */}
        {isSelected && isEditable && (
          <div
            style={{
              position: "absolute",
              top: -36,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 4,
              padding: "2px 4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 20,
              whiteSpace: "nowrap",
            }}
          >
            <LayoutBtn
              icon={<AlignLeft size={14} />}
              active={layout === "float-left"}
              onClick={() => setLayout("float-left")}
              title="Sola yasla (metin sağda)"
            />
            <LayoutBtn
              icon={<AlignCenter size={14} />}
              active={layout === "block"}
              onClick={() => setLayout("block")}
              title="Ortalanmış (blok)"
            />
            <LayoutBtn
              icon={<AlignRight size={14} />}
              active={layout === "float-right"}
              onClick={() => setLayout("float-right")}
              title="Sağa yasla (metin solda)"
            />
            <div
              style={{
                width: 1,
                height: 18,
                background: "#e5e7eb",
                margin: "0 2px",
              }}
            />
            <LayoutBtn
              icon={<Trash2 size={13} />}
              active={false}
              onClick={() => deleteNode()}
              title="Görseli sil"
              danger
            />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

function LayoutBtn({
  icon,
  active,
  onClick,
  title,
  danger,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        borderRadius: 2,
        border: "none",
        cursor: "pointer",
        background: active ? "#eff6ff" : "transparent",
        color: danger ? "#ef4444" : active ? "#3b82f6" : "#6b7280",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.background = danger
          ? "#fef2f2"
          : "#eff6ff";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.background = active
          ? "#eff6ff"
          : "transparent";
      }}
    >
      {icon}
    </button>
  );
}
