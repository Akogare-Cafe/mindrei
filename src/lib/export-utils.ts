interface ExportNode {
  id: string;
  label: string;
  content?: string;
  level: number;
  parentId?: string;
}

interface ExportEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

interface MindMapData {
  title: string;
  nodes: ExportNode[];
  edges: ExportEdge[];
}

export function exportToMarkdown(data: MindMapData): string {
  const { title, nodes } = data;
  
  const nodeMap = new Map<string, ExportNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  const childrenMap = new Map<string, ExportNode[]>();
  nodes.forEach(node => {
    if (node.parentId) {
      const children = childrenMap.get(node.parentId) || [];
      children.push(node);
      childrenMap.set(node.parentId, children);
    }
  });

  let markdown = `# ${title}\n\n`;

  function renderNode(node: ExportNode, depth: number): string {
    const indent = "  ".repeat(depth);
    const prefix = depth === 0 ? "## " : "- ";
    let result = `${indent}${prefix}**${node.label}**`;
    
    if (node.content) {
      result += `\n${indent}  ${node.content}`;
    }
    result += "\n";

    const children = childrenMap.get(node.id) || [];
    children.forEach(child => {
      result += renderNode(child, depth + 1);
    });

    return result;
  }

  const rootNodes = nodes.filter(n => n.level === 0);
  rootNodes.forEach(root => {
    markdown += renderNode(root, 0);
  });

  return markdown;
}

export function exportToCSV(data: MindMapData): string {
  const { nodes } = data;
  
  const headers = ["ID", "Label", "Content", "Level", "Parent ID"];
  const rows = nodes.map(node => [
    node.id,
    `"${(node.label || "").replace(/"/g, '""')}"`,
    `"${(node.content || "").replace(/"/g, '""')}"`,
    node.level.toString(),
    node.parentId || "",
  ]);

  return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}

export function exportToOutline(data: MindMapData): string {
  const { title, nodes } = data;
  
  const childrenMap = new Map<string, ExportNode[]>();
  nodes.forEach(node => {
    if (node.parentId) {
      const children = childrenMap.get(node.parentId) || [];
      children.push(node);
      childrenMap.set(node.parentId, children);
    }
  });

  let outline = `${title}\n${"=".repeat(title.length)}\n\n`;

  function renderNode(node: ExportNode, depth: number): string {
    const indent = "    ".repeat(depth);
    const bullet = depth === 0 ? "" : "- ";
    let result = `${indent}${bullet}${node.label}`;
    
    if (node.content) {
      result += `: ${node.content}`;
    }
    result += "\n";

    const children = childrenMap.get(node.id) || [];
    children.forEach(child => {
      result += renderNode(child, depth + 1);
    });

    return result;
  }

  const rootNodes = nodes.filter(n => n.level === 0);
  rootNodes.forEach(root => {
    outline += renderNode(root, 0);
  });

  return outline;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
