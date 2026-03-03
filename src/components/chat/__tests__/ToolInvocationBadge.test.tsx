import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

const base = { toolCallId: "1" };

test("shows 'Creating <filename>' for str_replace_editor create command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        ...base,
        toolName: "str_replace_editor",
        args: { command: "create", path: "/components/Card.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("shows 'Editing <filename>' for str_replace_editor str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        ...base,
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Editing <filename>' for str_replace_editor insert command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        ...base,
        toolName: "str_replace_editor",
        args: { command: "insert", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Viewing <filename>' for str_replace_editor view command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        ...base,
        toolName: "str_replace_editor",
        args: { command: "view", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("shows 'Deleting <filename>' for file_manager delete command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        ...base,
        toolName: "file_manager",
        args: { command: "delete", path: "/components/Old.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Deleting Old.jsx")).toBeDefined();
});

test("shows 'Renaming <filename>' for file_manager rename command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        ...base,
        toolName: "file_manager",
        args: { command: "rename", path: "/components/Old.jsx", new_path: "/components/New.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Renaming Old.jsx")).toBeDefined();
});

test("falls back to tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        ...base,
        toolName: "unknown_tool",
        args: {},
        state: "call",
      }}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("shows green dot when tool invocation has a result", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        ...base,
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("shows spinner when tool invocation is in progress", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        ...base,
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
