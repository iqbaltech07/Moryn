"""
Deterministic Markdown Section Patcher for Moryn PRD Documents.

Applies surgical patches to specific PRD sections (chapters) without
regenerating the entire document. This eliminates LLM output token bloat
(8,000 tokens → ~250 tokens) and reduces edit response time from 80s to <3s.

Key guarantees:
  - Only the targeted section is modified; all other sections remain byte-identical.
  - Mermaid diagrams, KaTeX formulas, and tables in untouched sections are preserved.
  - If the target section is not found, the patch is appended as a new section.
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Heading regex: matches `## <title>` (level-2 headings used by Moryn PRD chapters) ──
_HEADING_PATTERN = re.compile(
    r"^(#{1,3})\s+(.+)$", re.MULTILINE
)


def _normalize_section_title(title: str) -> str:
    """
    Normalizes a section title for flexible matching.
    Strips leading numbers (e.g. '5.'), whitespace, emoji, and lowercases.
    """
    cleaned = re.sub(r"^\d+[\.\)]\s*", "", title.strip())
    # Remove common emoji & special chars
    cleaned = re.sub(r"[^\w\s]", "", cleaned)
    return cleaned.lower().strip()


def _find_section_boundaries(
    prd_text: str, target_section: str
) -> Optional[tuple[int, int, str]]:
    """
    Finds the start and end character offsets of the target section in the PRD.
    Returns (start_offset, end_offset, matched_heading_line) or None.

    The section spans from its heading line to just before the next heading of
    the same or higher level, or end-of-document.
    """
    target_normalized = _normalize_section_title(target_section)
    # Also extract numeric prefix if present (e.g. "## 5." → "5")
    target_num_match = re.match(r"^#+\s*(\d+)", target_section.strip())
    if not target_num_match:
        target_num_match = re.match(r"^(\d+)", target_section.strip())
    target_num = target_num_match.group(1) if target_num_match else None

    headings = list(_HEADING_PATTERN.finditer(prd_text))
    if not headings:
        return None

    best_match_idx: Optional[int] = None
    best_score = 0.0

    for idx, m in enumerate(headings):
        heading_level = len(m.group(1))  # number of '#'
        heading_text = m.group(2).strip()
        heading_normalized = _normalize_section_title(heading_text)

        # Only match level-2 headings (PRD chapters) or the exact level requested
        target_level_match = re.match(r"^(#{1,3})", target_section.strip())
        expected_level = len(target_level_match.group(1)) if target_level_match else 2

        if heading_level != expected_level:
            continue

        score = 0.0

        # Exact normalized match
        if heading_normalized == target_normalized:
            score = 1.0
        # Number-based match (e.g. target "## 5. Database Schema" matches "## 5. Skema Database")
        elif target_num:
            heading_num_match = re.match(r"^(\d+)", heading_text.strip())
            if heading_num_match and heading_num_match.group(1) == target_num:
                score = 0.9
        # Substring containment match
        elif target_normalized and len(target_normalized) > 3:
            if target_normalized in heading_normalized or heading_normalized in target_normalized:
                score = 0.7

        if score > best_score:
            best_score = score
            best_match_idx = idx

    if best_match_idx is None or best_score < 0.5:
        return None

    matched = headings[best_match_idx]
    matched_level = len(matched.group(1))
    start_offset = matched.start()

    # Find the next heading of the same or higher (lower number) level
    end_offset = len(prd_text)
    for subsequent in headings[best_match_idx + 1 :]:
        subsequent_level = len(subsequent.group(1))
        if subsequent_level <= matched_level:
            end_offset = subsequent.start()
            break

    return (start_offset, end_offset, matched.group(0))


def apply_section_patch(
    current_prd: str,
    target_section: str,
    patch_content: str,
    action: str = "REPLACE_SECTION",
) -> str:
    """
    Applies a surgical patch to a specific section of the PRD markdown.

    Args:
        current_prd: The full current PRD markdown text.
        target_section: The heading of the target section (e.g. "## 5. Database Schema").
        patch_content: The replacement content for that section (including heading).
        action: One of "REPLACE_SECTION" (default), "APPEND", "INSERT_AFTER".

    Returns:
        The full updated PRD markdown with only the target section modified.
    """
    if not current_prd or not patch_content:
        logger.warning("[Patcher] Empty currentPrd or patchContent, returning original")
        return current_prd or ""

    # Ensure patch_content ends with a newline for clean formatting
    patch_content = patch_content.rstrip() + "\n"

    boundaries = _find_section_boundaries(current_prd, target_section)

    if boundaries is None:
        # Section not found → append as new section at the end
        logger.info(
            f"[Patcher] Section '{target_section}' not found, appending as new section"
        )
        separator = "\n\n" if not current_prd.endswith("\n\n") else ""
        return current_prd.rstrip() + separator + "\n" + patch_content

    start, end, matched_heading = boundaries
    logger.info(
        f"[Patcher] Matched section '{matched_heading}' at chars [{start}:{end}]"
    )

    if action == "REPLACE_SECTION":
        # Replace the entire section (heading through end-of-section) with patch
        before = current_prd[:start]
        after = current_prd[end:]
        # Ensure clean spacing
        if before and not before.endswith("\n"):
            before += "\n"
        if after and not after.startswith("\n"):
            after = "\n" + after
        return before + patch_content + after

    elif action == "APPEND":
        # Append patch_content at the end of the existing section
        section_text = current_prd[start:end]
        before = current_prd[:start]
        after = current_prd[end:]
        merged = section_text.rstrip() + "\n\n" + patch_content
        return before + merged + after

    elif action == "INSERT_AFTER":
        # Insert patch as a new section right after the matched section
        before = current_prd[:end]
        after = current_prd[end:]
        return before.rstrip() + "\n\n" + patch_content + after

    else:
        logger.warning(f"[Patcher] Unknown action '{action}', falling back to REPLACE_SECTION")
        before = current_prd[:start]
        after = current_prd[end:]
        return before + patch_content + after
