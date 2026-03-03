"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const filename =
    typeof args.path === "string"
      ? (args.path.split("/").pop() ?? args.path)
      : "";

  if (toolName === "str_replace_editor") {
    const command = args.command as string;
    if (command === "create") return `Creating ${filename}`;
    if (command === "view") return `Viewing ${filename}`;
    return `Editing ${filename}`;
  }

  if (toolName === "file_manager") {
    const command = args.command as string;
    if (command === "delete") return `Deleting ${filename}`;
    if (command === "rename") return `Renaming ${filename}`;
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const result = "result" in toolInvocation ? toolInvocation.result : undefined;
  const label = getLabel(toolName, args as Record<string, unknown>);
  const isDone = state === "result" && result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
