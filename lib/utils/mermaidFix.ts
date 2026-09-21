/**
 * Shared Mermaid auto-fix pipeline used by every route that stores PRD markdown.
 * Extracted here so the exact same validation logic isn't duplicated across
 * prd / struktur / edit-prd routes.
 */

/**
 * Safe auto-quoting for flowchart node labels.
 * Mermaid v11 requires labels with special chars to be wrapped in double quotes.
 * Quotes unquoted labels in [], {}, () shapes.
 * Careful NOT to modify:
 *   - already quoted labels: A["label"]
 *   - special shapes: A[(cylinder)], A[[subroutine]], A[/parallelogram/]
 *   - edge label text: -->|label|
 *   - diagram type declaration line
 */
function autoQuoteFlowchartLabels(code: string): string {
  const codeLines = code.split('\n');
  return codeLines.map((line, idx) => {
    // Skip: diagram type line, comments
    if (idx === 0) return line;
    if (line.trim().startsWith('%%')) return line;

    // Fix unquoted [label] — skip ["..."], [(...)], [[...]], [/...]
    line = line.replace(
      /([A-Za-z0-9_]+)\[(?!["\[(\//])([^\]\n"]+)\]/g,
      (_m, id, label) => `${id}["${label}"]`
    );

    // Fix unquoted {label} — skip {"..."} and {{...}}
    line = line.replace(
      /([A-Za-z0-9_]+)\{(?!["\{])([^}\n"]+)\}/g,
      (_m, id, label) => `${id}{"${label}"}`
    );

    // Fix unquoted (label) — skip ("..."), ((circle)), ([ asymmetric )
    line = line.replace(
      /([A-Za-z0-9_]+)\((?!["\(\[])([^)\n"]+)\)/g,
      (_m, id, label) => `${id}("${label}")`
    );

    return line;
  }).join('\n');
}

/**
 * Validates & repairs every ```mermaid block in the given markdown.
 * Returns the markdown with all blocks auto-fixed and validated.
 */
export async function fixMermaidBlocks(markdown: string): Promise<string> {
  if (!markdown || !markdown.includes("```mermaid")) return markdown;

  const { parse: mermaidParse } = await import("@mermaid-js/parser");

  const blockRegex = /```mermaid\n([\s\S]*?)```/g;
  let match;
  const blocks: { original: string, code: string }[] = [];
  while ((match = blockRegex.exec(markdown)) !== null) {
    blocks.push({ original: match[0], code: match[1] });
  }

  let result = markdown;
  for (const block of blocks) {
    let code = block.code;

    // 1. Remove markdown formatting (bold/italic/backtick are always invalid inside mermaid)
    code = code.replace(/\*\*/g, "").replace(/__/g, "").replace(/`/g, "");

    // 2. Fix broken LLM arrows and convert double-hyphen quoted labels to valid Mermaid pipes
    code = code.replace(/([A-Za-z0-9_\]\)\}]|")\s+->\s+([A-Za-z0-9_\[\(\{]|")/g, "$1 --> $2");
    code = code.replace(/([A-Za-z0-9_\]\)\}]|")\s+->\|(.*?)\|\s+([A-Za-z0-9_\[\(\{]|")/g, "$1 -->|$2| $3");
    code = code.replace(/→/g, "-->");

    // Convert `-- label with quotes -->` into safe `-->|label|`
    code = code.replace(/--\s*([^-\n>]+?)\s*-->/g, (_m, label) => {
      const safeLabel = label.replace(/["']/g, "").replace(/[\(\)]/g, "").replace(/\s+/g, " ").trim();
      return `-->|${safeLabel}|`;
    });

    // Clean pipe edge labels
    code = code.replace(/\|([^|\n]*?)\|/g, (_m, label) => {
      const safeLabel = label.replace(/["']/g, "").replace(/[\(\)]/g, "").replace(/\s+/g, " ").trim();
      return `|${safeLabel}|`;
    });

    // 3. Fix unquoted node labels for flowchart/graph diagrams
    const diagramFirstLine = code.trim().split('\n')[0].trim();
    const diagramType = diagramFirstLine.split(' ')[0];
    if (diagramType === 'flowchart' || diagramType === 'graph') {
      code = autoQuoteFlowchartLabels(code);
    }

    // 3. Validate with @mermaid-js/parser for Langium-based diagram types
    const supportedTypes = ["pie", "info", "gitGraph", "architecture", "packet", "radar", "railroad", "cynefin", "mindmap", "timeline"];
    if (supportedTypes.includes(diagramType)) {
      try {
        await mermaidParse(diagramType as any, code);
      } catch (e: any) {
        console.warn(`Mermaid parser validation failed for ${diagramType}:`, e.message);
      }
    }

    result = result.replace(block.original, '```mermaid\n' + code + '\n```');
  }

  return result;
}