import re
import difflib
from typing import List, Tuple, Optional, Dict, Set
from app.schemas.contract import (
    InvariantContract,
    DatabaseEntity,
    DatabaseField,
    ApiEndpoint,
    TechStackItem,
    ContractCompliance,
)
from app.schemas.tasks import TasksData, KanbanTask, PhaseGroup


def extract_database_entities(prd_markdown: str) -> List[DatabaseEntity]:
    """
    Extracts database models, fields, and relationships from Section 6 (Database Schema)
    supporting Mermaid erDiagram or structured Markdown tables.
    """
    if not prd_markdown:
        return []

    entities: Dict[str, DatabaseEntity] = {}

    # 1. Look for mermaid erDiagram
    er_match = re.search(r"```(?:mermaid)?\s*erDiagram([\s\S]*?)```", prd_markdown, re.IGNORECASE)
    if er_match:
        er_content = er_match.group(1)

        # Parse relationships: ENTITY1 ||--o{ ENTITY2 : "rel"
        rel_pattern = re.compile(
            r"^\s*([A-Za-z0-9_]+)\s+([|o}{]{1,2}(?:--|\.\.)[|o}{]{1,2})\s+([A-Za-z0-9_]+)\s*:\s*[\"']?([^\"'\n\r]+)[\"']?",
            re.MULTILINE,
        )
        for m in rel_pattern.finditer(er_content):
            src, rel_type, dst, desc = m.groups()
            src_clean = src.strip().upper()
            dst_clean = dst.strip().upper()
            if src_clean not in entities:
                entities[src_clean] = DatabaseEntity(name=src.strip())
            if dst_clean not in entities:
                entities[dst_clean] = DatabaseEntity(name=dst.strip())
            entities[src_clean].relationships.append(f"{src.strip()} {rel_type.strip()} {dst.strip()} ({desc.strip()})")

        # Parse entity blocks: ENTITY_NAME { field_type field_name [PK/FK/UK] ["comment"] }
        # Must start at beginning of line to avoid matching relationships like ||--o{
        entity_block_pattern = re.compile(
            r"^\s*([A-Za-z0-9_]+)\s*\{([^}]*)\}",
            re.MULTILINE,
        )
        for m in entity_block_pattern.finditer(er_content):
            entity_name = m.group(1).strip()
            entity_key = entity_name.upper()
            fields_block = m.group(2)

            if entity_key not in entities:
                entities[entity_key] = DatabaseEntity(name=entity_name)
            else:
                entities[entity_key].name = entity_name

            # Parse individual fields
            for line in fields_block.splitlines():
                line = line.strip()
                if not line or line.startswith("%%"):
                    continue

                # Examples:
                # string id PK "Unique CUID"
                # string email UK "User email"
                # datetime createdAt
                field_match = re.match(
                    r"([A-Za-z0-9_<>]+)\s+([A-Za-z0-9_]+)(?:\s+(PK|FK|UK|PK,FK|FK,PK))?(?:\s+[\"'](.*)[\"'])?",
                    line,
                )
                if field_match:
                    f_type, f_name, f_key, f_comment = field_match.groups()
                    key_upper = (f_key or "").upper()
                    entities[entity_key].fields.append(
                        DatabaseField(
                            name=f_name,
                            type=f_type,
                            is_pk="PK" in key_upper,
                            is_fk="FK" in key_upper,
                            is_uk="UK" in key_upper,
                            comment=f_comment.strip() if f_comment else None,
                        )
                    )

    # 2. If no entities extracted from Mermaid, fallback to Section 6 markdown tables or lists
    if not entities:
        sec6_match = re.search(r"##\s*6\.\s*Database Schema([\s\S]*?)(?=\n##\s*\d|\Z)", prd_markdown, re.IGNORECASE)
        if sec6_match:
            sec_text = sec6_match.group(1)
            # Match markdown tables: | Entity | Field | Type | ... |
            table_rows = re.findall(r"\|\s*([A-Za-z0-9_]+)\s*\|\s*([A-Za-z0-9_]+)\s*\|\s*([A-Za-z0-9_]+)\s*\|", sec_text)
            for ent, f_name, f_type in table_rows:
                if ent.lower() in ("entity", "table", "model"):
                    continue
                ent_key = ent.upper()
                if ent_key not in entities:
                    entities[ent_key] = DatabaseEntity(name=ent)
                entities[ent_key].fields.append(DatabaseField(name=f_name, type=f_type))

    return list(entities.values())


def extract_api_endpoints(prd_markdown: str) -> List[ApiEndpoint]:
    """
    Extracts REST API endpoints from Section 8 (API Endpoints) markdown table or code lines.
    """
    if not prd_markdown:
        return []

    endpoints: List[ApiEndpoint] = []
    seen_keys: Set[Tuple[str, str]] = set()

    # Locate Section 8: API Endpoints
    sec_match = re.search(
        r"##\s*(?:8\.\s*)?API Endpoints([\s\S]*?)(?=\n##\s*\d|\Z)",
        prd_markdown,
        re.IGNORECASE,
    )
    search_text = sec_match.group(1) if sec_match else prd_markdown

    # 1. Parse Markdown Table rows
    # Standard format: | Method | Endpoint Path | Request Payload Schema | Expected 200 Response Schema |
    table_row_pattern = re.compile(
        r"\|\s*`?(GET|POST|PUT|PATCH|DELETE)`?\s*\|\s*`?([/A-Za-z0-9_\-:{}.]+)`?\s*\|\s*([^|]*)\|\s*([^|\n\r]*)",
        re.IGNORECASE,
    )

    for m in table_row_pattern.finditer(search_text):
        method, path, req_payload, res_schema = m.groups()
        method_clean = method.strip().upper()
        path_clean = path.strip().replace("`", "")

        # Ignore header rows
        if method_clean in ("METHOD", "HTTP") or "endpoint" in path_clean.lower():
            continue

        key = (method_clean, path_clean)
        if key not in seen_keys and path_clean.startswith("/"):
            seen_keys.add(key)
            endpoints.append(
                ApiEndpoint(
                    method=method_clean,
                    path=path_clean,
                    request_payload=req_payload.strip() if req_payload.strip() else None,
                    response_schema=res_schema.strip() if res_schema.strip() else None,
                )
            )

    # 2. Fallback: Parse code-blocks or bullet list endpoints like:
    # - `POST /api/projects/create`: Description
    if not endpoints:
        list_endpoint_pattern = re.compile(
            r"[`*]*(GET|POST|PUT|PATCH|DELETE)[`*]*\s+[`*]*([/A-Za-z0-9_\-:{}.]+)[`*]*(?:\s*[-:]\s*(.*))?",
            re.IGNORECASE,
        )
        for m in list_endpoint_pattern.finditer(search_text):
            method, path, desc = m.groups()
            method_clean = method.strip().upper()
            path_clean = path.strip().replace("`", "")
            if path_clean.startswith("/"):
                key = (method_clean, path_clean)
                if key not in seen_keys:
                    seen_keys.add(key)
                    endpoints.append(
                        ApiEndpoint(
                            method=method_clean,
                            path=path_clean,
                            description=desc.strip() if desc else None,
                        )
                    )

    return endpoints


def extract_tech_stack(prd_markdown: str) -> List[TechStackItem]:
    """
    Extracts tech stack specifications from Section 7 (Tech Stack).
    """
    if not prd_markdown:
        return []

    items: List[TechStackItem] = []
    sec_match = re.search(
        r"##\s*(?:7\.\s*)?Tech Stack([\s\S]*?)(?=\n##\s*\d|\Z)",
        prd_markdown,
        re.IGNORECASE,
    )
    if not sec_match:
        return []

    sec_text = sec_match.group(1)
    # Parse bullet points: * **Category**: Details or - **Category**: Details
    bullet_pattern = re.compile(
        r"(?:^|\n)\s*[*+-]\s+\*\*([^*]+)\*\*:\s*([^\n\r]+)",
        re.MULTILINE,
    )

    for m in bullet_pattern.finditer(sec_text):
        cat, details = m.groups()
        items.append(
            TechStackItem(
                category=cat.strip(),
                details=details.strip(),
            )
        )

    return items


def extract_system_contract(prd_markdown: str) -> InvariantContract:
    """
    Top-level deterministic contract extractor. Parses PRD Markdown into a structured InvariantContract.
    """
    entities = extract_database_entities(prd_markdown)
    endpoints = extract_api_endpoints(prd_markdown)
    stack = extract_tech_stack(prd_markdown)

    return InvariantContract(
        version="1.0.0",
        database_entities=entities,
        api_endpoints=endpoints,
        tech_stack=stack,
    )


def format_contract_for_prompt(contract: InvariantContract) -> str:
    """
    Formats the InvariantContract into an authoritative prompt block that strictly binds the LLM.
    """
    lines = [
        "=== STRICT SYSTEM INVARIANT CONTRACT (ZERO-DRIFT MANDATE) ===",
        "CRITICAL: The following Database Entities and REST API Endpoints are contractually LOCKED.",
        "You MUST NOT invent alternate route paths, modify URL structures, or rename Database models.",
        "",
        "[LOCKED DATABASE MODELS]:",
    ]

    if contract.database_entities:
        for ent in contract.database_entities:
            field_names = [f.name for f in ent.fields]
            fields_str = f" (fields: {', '.join(field_names)})" if field_names else ""
            lines.append(f"  - Model `{ent.name}`{fields_str}")
    else:
        lines.append("  (Derive models strictly from Architecture Blueprint)")

    lines.append("\n[LOCKED REST API ROUTES]:")
    if contract.api_endpoints:
        for ep in contract.api_endpoints:
            payload_str = f" | Payload: {ep.request_payload}" if ep.request_payload else ""
            res_str = f" | Expected: {ep.response_schema}" if ep.response_schema else ""
            lines.append(f"  - `{ep.method} {ep.path}`{payload_str}{res_str}")
    else:
        lines.append("  (Derive standard REST API routes matching feature specifications)")

    lines.extend([
        "",
        "STRICT IMPLEMENTATION RULES:",
        "1. In Phase 2 (Database Schema & Auth): Generate tasks for EVERY locked database model using exact names.",
        "2. In Phase 3 (Backend APIs & Integrations): Every API task MUST implement the EXACT method and path listed above verbatim. DO NOT mutate paths (e.g. creating '/api/new-project' when '/api/projects/create' is locked).",
        "3. In all task titles and descriptions: Quote the exact locked route or model.",
        "===========================================================",
    ])

    return "\n".join(lines)


def reconcile_tasks_with_contract(
    tasks_data: TasksData,
    contract: InvariantContract,
) -> Tuple[TasksData, ContractCompliance]:
    """
    Deterministic post-generation reconciler:
    1. Scans tasks for slight route mutations and auto-reconciles them to the locked contract.
    2. Measures model and endpoint coverage.
    3. Auto-appends any missing locked endpoints to Phase 3 (Backend APIs) if omitted by LLM.
    """
    compliance = ContractCompliance()
    if not contract.api_endpoints and not contract.database_entities:
        return tasks_data, compliance

    locked_paths = [ep.path for ep in contract.api_endpoints]
    locked_methods_paths = {f"{ep.method} {ep.path}": ep for ep in contract.api_endpoints}
    covered_endpoints: Set[str] = set()
    covered_entities: Set[str] = set()
    reconciled_count = 0
    drift_notes = []

    # Map of all tasks
    for phase in tasks_data.phases:
        for task in phase.tasks:
            text = f"{task.title} {task.description or ''}"

            # Check database model coverage
            for entity in contract.database_entities:
                if re.search(r"\b" + re.escape(entity.name) + r"\b", text, re.IGNORECASE):
                    covered_entities.add(entity.name)

            # Check for API route references in task text
            # Find any `/api/...` string
            found_paths = re.findall(r"/api/[A-Za-z0-9_\-:{}/]+", text)
            for fp in found_paths:
                clean_fp = fp.rstrip(".,;`)\"")
                # Direct match
                if clean_fp in locked_paths:
                    covered_endpoints.add(clean_fp)
                else:
                    # Check for fuzzy match / slight drift (e.g. `/api/project/create` vs `/api/projects/create`)
                    matches = difflib.get_close_matches(clean_fp, locked_paths, n=1, cutoff=0.75)
                    if matches:
                        target_path = matches[0]
                        # Auto-reconcile text in task title & description!
                        if task.title and clean_fp in task.title:
                            task.title = task.title.replace(clean_fp, target_path)
                        if task.description and clean_fp in task.description:
                            task.description = task.description.replace(clean_fp, target_path)
                        reconciled_count += 1
                        covered_endpoints.add(target_path)
                        drift_notes.append(f"Auto-reconciled drifted route '{clean_fp}' to contract '{target_path}' in task '{task.id}'")

    # Check for missing locked endpoints
    missing_endpoints = [p for p in locked_paths if p not in covered_endpoints]
    missing_entities = [e.name for e in contract.database_entities if e.name not in covered_entities]

    # Auto-healing: If an endpoint was completely missed by the LLM, inject it into Phase 3
    if missing_endpoints:
        # Find phase 3 (Backend APIs) or fallback to first phase
        phase_3 = next((p for p in tasks_data.phases if "3" in str(p.id) or "backend" in p.name.lower() or "api" in p.name.lower()), None)
        if not phase_3 and tasks_data.phases:
            phase_3 = tasks_data.phases[0]
        if phase_3:
            for missing_path in missing_endpoints:
                matching_ep = next((ep for ep in contract.api_endpoints if ep.path == missing_path), None)
                method = matching_ep.method if matching_ep else "POST"
                new_task = KanbanTask(
                    id=f"auto-contract-{len(phase_3.tasks) + 1}",
                    title=f"Implement {method} {missing_path}",
                    description=f"Contract enforcement: Implement locked endpoint `{method} {missing_path}` as specified in Section 8 of the PRD.",
                    estimasi="1h",
                    tags=["API", "Backend", "Contract-Enforced"],
                    definitionOfDone=f"Endpoint {method} {missing_path} responds with 200 OK according to contract specification.",
                    isCheckpoint=False,
                )
                phase_3.tasks.append(new_task)
                covered_endpoints.add(missing_path)
                drift_notes.append(f"Auto-injected missing contract endpoint '{method} {missing_path}' into Phase 3")

    # Recalculate metrics
    total_endpoints = len(locked_paths)
    covered_count = len(covered_endpoints)
    endpoint_score = (covered_count / total_endpoints) if total_endpoints > 0 else 1.0

    total_entities = len(contract.database_entities)
    entity_score = (len(covered_entities) / total_entities) if total_entities > 0 else 1.0

    overall_score = round((endpoint_score * 0.7) + (entity_score * 0.3), 2)

    compliance.is_compliant = overall_score >= 0.85
    compliance.score = overall_score
    compliance.covered_endpoints = sorted(list(covered_endpoints))
    compliance.missing_endpoints = [p for p in locked_paths if p not in covered_endpoints]
    compliance.covered_entities = sorted(list(covered_entities))
    compliance.missing_entities = missing_entities
    compliance.auto_reconciled_count = reconciled_count
    compliance.drift_notes = drift_notes

    return tasks_data, compliance
