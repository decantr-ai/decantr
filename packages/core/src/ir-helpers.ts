import type { IRGridNode, IRNode, IRPatternNode } from './types.js';

/** Depth-first walk of IR tree, calling visitor on each node */
export function walkIR(
  node: IRNode,
  visitor: (node: IRNode, parent: IRNode | null) => void,
  parent: IRNode | null = null,
): void {
  visitor(node, parent);
  for (const child of node.children) {
    walkIR(child, visitor, node);
  }
}

/** Find all nodes of a specific type */
export function findNodes<T extends IRNode>(root: IRNode, type: string): T[] {
  const results: T[] = [];
  walkIR(root, (node) => {
    if (node.type === type) {
      results.push(node as T);
    }
  });
  return results;
}

/** Count total patterns in an IR tree */
export function countPatterns(root: IRNode): number {
  return findNodes(root, 'pattern').length;
}

/** Validate IR tree structure (no orphaned grids, patterns have meta, etc.) */
export function validateIR(root: IRNode): string[] {
  const errors: string[] = [];

  walkIR(root, (node, parent) => {
    if (node.type === 'grid') {
      const grid = node as IRGridNode;
      if (grid.children.length === 0) {
        errors.push(`Grid node "${grid.id}" has no children`);
      }
    }

    if (node.type === 'pattern') {
      const pattern = node as IRPatternNode;
      if (!pattern.pattern) {
        errors.push(`Pattern node "${pattern.id}" is missing pattern meta`);
      }
      if (!pattern.pattern.patternId) {
        errors.push(`Pattern node "${pattern.id}" has no patternId`);
      }
    }

    if (node.type === 'page') {
      if (!node.id) {
        errors.push('Page node is missing id');
      }
    }
  });

  return errors;
}
