"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  RefreshCw,
  Crop,
  Check,
  X,
  Loader2,
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

  // Recreate state
  const [recreateOpen, setRecreateOpen] = useState(false);
  const [recreatePrompt, setRecreatePrompt] = useState("");
  const [recreateLoading, setRecreateLoading] = useState(false);
  const [recreateSize, setRecreateSize] = useState<"landscape" | "square" | "portrait">("landscape");
  const [recreateWithRef, setRecreateWithRef] = useState(false);

  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [cropInsets, setCropInsets] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [cropLoading, setCropLoading] = useState(false);
  const cropDragRef = useRef({ edge: "", startX: 0, startY: 0, startVal: 0 });

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
        setRecreateOpen(false);
        setCropMode(false);
        setCropInsets({ top: 0, right: 0, bottom: 0, left: 0 });
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
      if (cropMode) return;
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
    [updateAttributes, cropMode]
  );

  const setLayout = useCallback(
    (l: Layout) => {
      updateAttributes({ layout: l });
    },
    [updateAttributes]
  );

  // ─── Recreate ───────────────────────────────────────────────
  const handleRecreate = useCallback(async () => {
    if (!recreatePrompt.trim() || recreateLoading) return;
    setRecreateLoading(true);
    try {
      // Optionally build a base64 reference from the current image
      let referenceBase64: string | null = null;
      if (recreateWithRef && src) {
        try {
          const tempImg = new Image();
          tempImg.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            tempImg.onload = () => resolve();
            tempImg.onerror = reject;
            tempImg.src = src;
          });
          const canvas = document.createElement("canvas");
          canvas.width = tempImg.naturalWidth;
          canvas.height = tempImg.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(tempImg, 0, 0);
            referenceBase64 = canvas.toDataURL("image/jpeg", 0.8);
          }
        } catch { /* reference extraction failed, proceed without */ }
      }

      const body: Record<string, unknown> = {
        prompt: recreatePrompt,
        articleSlug: "recreate",
        aspectRatio: recreateSize,
        articleTitle: recreatePrompt,
        articleContext: `Recreating image with prompt: ${recreatePrompt}`,
      };
      if (referenceBase64) {
        body.referenceImage = referenceBase64;
      }

      const res = await fetch("/api/v1/admin/ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          updateAttributes({ src: data.url });
          setRecreateOpen(false);
          setRecreatePrompt("");
        }
      }
    } catch (err) {
      console.error("[Recreate] Error:", err);
    } finally {
      setRecreateLoading(false);
    }
  }, [recreatePrompt, recreateLoading, recreateSize, recreateWithRef, src, updateAttributes]);

  // ─── Crop ───────────────────────────────────────────────────
  const handleCropEdgeStart = useCallback(
    (e: React.MouseEvent, edge: string) => {
      e.preventDefault();
      e.stopPropagation();
      cropDragRef.current = {
        edge,
        startX: e.clientX,
        startY: e.clientY,
        startVal: cropInsets[edge as keyof typeof cropInsets],
      };

      const img = containerRef.current?.querySelector("img");
      if (!img) return;
      const rect = img.getBoundingClientRect();

      const onMove = (moveE: MouseEvent) => {
        const { edge: ed, startX, startY, startVal } = cropDragRef.current;
        let delta = 0;
        if (ed === "top") delta = moveE.clientY - startY;
        else if (ed === "bottom") delta = -(moveE.clientY - startY);
        else if (ed === "left") delta = moveE.clientX - startX;
        else if (ed === "right") delta = -(moveE.clientX - startX);

        const maxPx = (ed === "top" || ed === "bottom") ? rect.height * 0.4 : rect.width * 0.4;
        const newVal = Math.max(0, Math.min(maxPx, startVal + delta));
        setCropInsets(prev => ({ ...prev, [ed]: newVal }));
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [cropInsets]
  );

  const applyCrop = useCallback(async () => {
    const img = containerRef.current?.querySelector("img") as HTMLImageElement;
    if (!img) return;

    setCropLoading(true);
    try {
      const rect = img.getBoundingClientRect();
      const scaleX = img.naturalWidth / rect.width;
      const scaleY = img.naturalHeight / rect.height;

      const sx = Math.round(cropInsets.left * scaleX);
      const sy = Math.round(cropInsets.top * scaleY);
      const sw = Math.round((rect.width - cropInsets.left - cropInsets.right) * scaleX);
      const sh = Math.round((rect.height - cropInsets.top - cropInsets.bottom) * scaleY);

      // Draw cropped region onto canvas
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Need to load the image fresh to get cross-origin data
      const tempImg = new Image();
      tempImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        tempImg.onload = () => resolve();
        tempImg.onerror = reject;
        tempImg.src = img.src;
      });

      ctx.drawImage(tempImg, sx, sy, sw, sh, 0, 0, sw, sh);

      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );
      if (!blob) return;

      // Upload to Supabase via FormData
      const formData = new FormData();
      formData.append("file", blob, `cropped-${Date.now()}.jpg`);
      formData.append("bucket", "articles");
      formData.append("path", `ai-gen/cropped-${Date.now()}.jpg`);

      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          updateAttributes({ src: data.url, width: sw, height: sh });
        }
      } else {
        // Fallback: Use base64 data URL directly
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        updateAttributes({ src: dataUrl, width: sw, height: sh });
      }

      setCropMode(false);
      setCropInsets({ top: 0, right: 0, bottom: 0, left: 0 });
    } catch (err) {
      console.error("[Crop] Error:", err);
      // Fallback to data URL
      try {
        const img2 = containerRef.current?.querySelector("img") as HTMLImageElement;
        const rect = img2.getBoundingClientRect();
        const scaleX = img2.naturalWidth / rect.width;
        const scaleY = img2.naturalHeight / rect.height;
        const canvas = document.createElement("canvas");
        const sw = Math.round((rect.width - cropInsets.left - cropInsets.right) * scaleX);
        const sh = Math.round((rect.height - cropInsets.top - cropInsets.bottom) * scaleY);
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            img2,
            Math.round(cropInsets.left * scaleX),
            Math.round(cropInsets.top * scaleY),
            sw, sh, 0, 0, sw, sh
          );
          updateAttributes({ src: canvas.toDataURL("image/jpeg", 0.92), width: sw, height: sh });
        }
        setCropMode(false);
        setCropInsets({ top: 0, right: 0, bottom: 0, left: 0 });
      } catch { /* silent */ }
    } finally {
      setCropLoading(false);
    }
  }, [cropInsets, updateAttributes]);

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
  const hasCrop = cropInsets.top > 0 || cropInsets.bottom > 0 || cropInsets.left > 0 || cropInsets.right > 0;

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
          outline: isSelected && isEditable ? `2px solid ${cropMode ? "#f59e0b" : "#3b82f6"}` : "none",
          outlineOffset: 2,
          borderRadius: 2,
          userSelect: resizing ? "none" : "auto",
        }}
      >
        {/* Image with optional crop overlay */}
        <div style={{ position: "relative", overflow: cropMode ? "hidden" : "visible" }}>
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

          {/* Crop overlays — dark areas being cropped away */}
          {cropMode && (
            <>
              {/* Top crop overlay */}
              {cropInsets.top > 0 && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: cropInsets.top,
                  background: "rgba(0,0,0,0.5)",
                  pointerEvents: "none",
                }} />
              )}
              {/* Bottom crop overlay */}
              {cropInsets.bottom > 0 && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: cropInsets.bottom,
                  background: "rgba(0,0,0,0.5)",
                  pointerEvents: "none",
                }} />
              )}
              {/* Left crop overlay */}
              {cropInsets.left > 0 && (
                <div style={{
                  position: "absolute",
                  top: cropInsets.top, bottom: cropInsets.bottom,
                  left: 0, width: cropInsets.left,
                  background: "rgba(0,0,0,0.5)",
                  pointerEvents: "none",
                }} />
              )}
              {/* Right crop overlay */}
              {cropInsets.right > 0 && (
                <div style={{
                  position: "absolute",
                  top: cropInsets.top, bottom: cropInsets.bottom,
                  right: 0, width: cropInsets.right,
                  background: "rgba(0,0,0,0.5)",
                  pointerEvents: "none",
                }} />
              )}

              {/* Draggable crop edge handles */}
              {/* Top edge */}
              <div
                onMouseDown={(e) => handleCropEdgeStart(e, "top")}
                style={{
                  position: "absolute",
                  top: Math.max(0, cropInsets.top - 3),
                  left: cropInsets.left,
                  right: cropInsets.right,
                  height: 6,
                  cursor: "ns-resize",
                  zIndex: 15,
                }}
              >
                <div style={{
                  width: "100%", height: 2,
                  background: "#f59e0b",
                  marginTop: 2,
                }} />
              </div>
              {/* Bottom edge */}
              <div
                onMouseDown={(e) => handleCropEdgeStart(e, "bottom")}
                style={{
                  position: "absolute",
                  bottom: Math.max(0, cropInsets.bottom - 3),
                  left: cropInsets.left,
                  right: cropInsets.right,
                  height: 6,
                  cursor: "ns-resize",
                  zIndex: 15,
                }}
              >
                <div style={{
                  width: "100%", height: 2,
                  background: "#f59e0b",
                  marginTop: 2,
                }} />
              </div>
              {/* Left edge */}
              <div
                onMouseDown={(e) => handleCropEdgeStart(e, "left")}
                style={{
                  position: "absolute",
                  left: Math.max(0, cropInsets.left - 3),
                  top: cropInsets.top,
                  bottom: cropInsets.bottom,
                  width: 6,
                  cursor: "ew-resize",
                  zIndex: 15,
                }}
              >
                <div style={{
                  height: "100%", width: 2,
                  background: "#f59e0b",
                  marginLeft: 2,
                }} />
              </div>
              {/* Right edge */}
              <div
                onMouseDown={(e) => handleCropEdgeStart(e, "right")}
                style={{
                  position: "absolute",
                  right: Math.max(0, cropInsets.right - 3),
                  top: cropInsets.top,
                  bottom: cropInsets.bottom,
                  width: 6,
                  cursor: "ew-resize",
                  zIndex: 15,
                }}
              >
                <div style={{
                  height: "100%", width: 2,
                  background: "#f59e0b",
                  marginLeft: 2,
                }} />
              </div>
            </>
          )}
        </div>

        {/* Resize handles — only show when selected & editable & not in crop mode */}
        {isSelected && isEditable && !cropMode &&
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

        {/* Floating toolbar */}
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
            {!cropMode ? (
              <>
                <LayoutBtn
                  icon={<AlignLeft size={14} />}
                  active={layout === "float-left"}
                  onClick={() => setLayout("float-left")}
                  title="Sola yasla"
                />
                <LayoutBtn
                  icon={<AlignCenter size={14} />}
                  active={layout === "block"}
                  onClick={() => setLayout("block")}
                  title="Ortala"
                />
                <LayoutBtn
                  icon={<AlignRight size={14} />}
                  active={layout === "float-right"}
                  onClick={() => setLayout("float-right")}
                  title="Sağa yasla"
                />
                <Sep />
                <LayoutBtn
                  icon={<RefreshCw size={13} />}
                  active={recreateOpen}
                  onClick={() => { setRecreateOpen(!recreateOpen); setCropMode(false); }}
                  title="Görseli yeniden üret"
                />
                <LayoutBtn
                  icon={<Crop size={13} />}
                  active={false}
                  onClick={() => { setCropMode(true); setRecreateOpen(false); }}
                  title="Kırp"
                />
                <Sep />
                <LayoutBtn
                  icon={<Trash2 size={13} />}
                  active={false}
                  onClick={() => deleteNode()}
                  title="Görseli sil"
                  danger
                />
              </>
            ) : (
              <>
                <LayoutBtn
                  icon={cropLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  active={hasCrop}
                  onClick={applyCrop}
                  title="Kırpmayı uygula"
                  disabled={!hasCrop || cropLoading}
                />
                <LayoutBtn
                  icon={<X size={13} />}
                  active={false}
                  onClick={() => {
                    setCropMode(false);
                    setCropInsets({ top: 0, right: 0, bottom: 0, left: 0 });
                  }}
                  title="İptal"
                  danger
                />
              </>
            )}
          </div>
        )}

        {/* Recreate prompt bar */}
        {recreateOpen && isSelected && isEditable && (
          <div
            style={{
              position: "absolute",
              top: -84,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 4,
              padding: "6px 8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 25,
              whiteSpace: "nowrap",
              minWidth: 300,
            }}
          >
            {/* Row 1: Size picker + Reference toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Size pills */}
              <div style={{
                display: "flex",
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
              }}>
                {(["landscape", "square", "portrait"] as const).map((s) => {
                  const labels = { landscape: "16:9", square: "1:1", portrait: "9:16" };
                  const active = recreateSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setRecreateSize(s)}
                      style={{
                        padding: "2px 8px",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        border: "none",
                        cursor: "pointer",
                        background: active ? "#3b82f6" : "#f9fafb",
                        color: active ? "white" : "#6b7280",
                        transition: "all 0.15s",
                      }}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
              {/* Reference toggle */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  fontSize: 10,
                  color: recreateWithRef ? "#3b82f6" : "#9ca3af",
                  fontWeight: 500,
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={recreateWithRef}
                  onChange={(e) => setRecreateWithRef(e.target.checked)}
                  style={{ width: 12, height: 12, accentColor: "#3b82f6" }}
                />
                Referans al
              </label>
            </div>

            {/* Row 2: Prompt input + generate button */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="text"
                value={recreatePrompt}
                onChange={(e) => setRecreatePrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRecreate(); }}
                placeholder="Yeni görsel açıklaması..."
                autoFocus
                style={{
                  flex: 1,
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  outline: "none",
                  fontSize: 11,
                  padding: "4px 6px",
                  background: "#f9fafb",
                  color: "#1f2937",
                  minWidth: 180,
                }}
              />
              <button
                onClick={handleRecreate}
                disabled={recreateLoading || !recreatePrompt.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  fontSize: 10,
                  fontWeight: 600,
                  borderRadius: 3,
                  border: "none",
                  cursor: recreateLoading ? "wait" : "pointer",
                  background: "#3b82f6",
                  color: "white",
                  opacity: recreateLoading || !recreatePrompt.trim() ? 0.5 : 1,
                }}
              >
                {recreateLoading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <RefreshCw size={11} />
                )}
                Üret
              </button>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

/* ─── Helper Components ─── */

function Sep() {
  return <div style={{ width: 1, height: 18, background: "#e5e7eb", margin: "0 2px" }} />;
}

function LayoutBtn({
  icon,
  active,
  onClick,
  title,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        borderRadius: 2,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: active ? "#eff6ff" : "transparent",
        color: danger ? "#ef4444" : active ? "#3b82f6" : "#6b7280",
        transition: "all 0.15s",
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.target as HTMLElement).style.background = danger ? "#fef2f2" : "#eff6ff";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.background = active ? "#eff6ff" : "transparent";
      }}
    >
      {icon}
    </button>
  );
}
