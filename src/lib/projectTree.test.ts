import { describe, it, expect } from "vitest";

type Node = {
  id: string;
  parentId: string | null;
};

function canMoveNodeWithinParent(
  nodes: Node[],
  activeId: string,
  overId: string,
): boolean {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const active = byId.get(activeId);
  const over = byId.get(overId);
  if (!active || !over) return false;
  return active.parentId === over.parentId;
}

describe("project tree drag constraints", () => {
  it("allows reorder within same parent", () => {
    const nodes: Node[] = [
      { id: "a", parentId: "root" },
      { id: "b", parentId: "root" },
    ];
    expect(canMoveNodeWithinParent(nodes, "a", "b")).toBe(true);
  });

  it("disallows cross-parent move", () => {
    const nodes: Node[] = [
      { id: "a", parentId: "root-a" },
      { id: "b", parentId: "root-b" },
    ];
    expect(canMoveNodeWithinParent(nodes, "a", "b")).toBe(false);
  });
});
