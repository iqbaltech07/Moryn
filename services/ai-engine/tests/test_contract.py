"""
Unit tests for the Moryn Invariant Contract System & Reconciler.

Tests:
- Deterministic extraction of Database Entities from Mermaid erDiagram & tables
- Deterministic extraction of API Endpoints from Markdown tables & lists
- Deterministic extraction of Tech Stack items
- Zero-drift prompt formatting
- Post-generation task reconciliation (route auto-healing & auto-injection of missing endpoints)
- Resilient handling of malformed or empty PRDs
"""
import os
import unittest
import importlib.util
from app.schemas.contract import (
    InvariantContract,
    DatabaseEntity,
    DatabaseField,
    ApiEndpoint,
    TechStackItem,
    ContractCompliance,
)
from app.schemas.tasks import TasksData, PhaseGroup, KanbanTask
from app.services.contract_service import (
    extract_database_entities,
    extract_api_endpoints,
    extract_tech_stack,
    extract_system_contract,
    format_contract_for_prompt,
    reconcile_tasks_with_contract,
)


class TestContractSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        sample_prd_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "public", "contoh-prd.md")
        )
        with open(sample_prd_path, "r", encoding="utf-8") as f:
            cls.sample_prd = f.read()

    def test_extract_database_entities_mermaid(self):
        entities = extract_database_entities(self.sample_prd)
        self.assertGreaterEqual(len(entities), 2)

        entity_names = {e.name.upper(): e for e in entities}
        self.assertIn("USER", entity_names)
        self.assertIn("PROJECT", entity_names)

        user_entity = entity_names["USER"]
        user_field_names = [f.name for f in user_entity.fields]
        self.assertIn("id", user_field_names)
        self.assertIn("email", user_field_names)
        self.assertIn("apiKey", user_field_names)

        id_field = next(f for f in user_entity.fields if f.name == "id")
        self.assertTrue(id_field.is_pk)

        email_field = next(f for f in user_entity.fields if f.name == "email")
        self.assertTrue(email_field.is_uk)

        # Check relationships on USER
        self.assertTrue(any("PROJECT" in r for r in user_entity.relationships))

        project_entity = entity_names["PROJECT"]
        project_field_names = [f.name for f in project_entity.fields]
        self.assertIn("userId", project_field_names)
        self.assertIn("prdData", project_field_names)

    def test_extract_database_entities_fallback_table(self):
        table_prd = """
## 6. Database Schema
| Entity | Field | Type | Attributes |
|---|---|---|---|
| User | id | String | PK |
| User | email | String | Unique |
| Invoice | id | String | PK |
| Invoice | amount | Float | |
"""
        entities = extract_database_entities(table_prd)
        self.assertEqual(len(entities), 2)
        names = {e.name.upper() for e in entities}
        self.assertIn("USER", names)
        self.assertIn("INVOICE", names)

    def test_extract_api_endpoints_markdown_table(self):
        endpoints = extract_api_endpoints(self.sample_prd)
        self.assertEqual(len(endpoints), 9)

        paths = [ep.path for ep in endpoints]
        self.assertIn("/api/projects/create", paths)
        self.assertIn("/api/projects/detail", paths)
        self.assertIn("/api/generate/tasks", paths)
        self.assertIn("/api/projects/finish", paths)

        create_ep = next(ep for ep in endpoints if ep.path == "/api/projects/create")
        self.assertEqual(create_ep.method, "POST")
        self.assertIsNotNone(create_ep.request_payload)
        self.assertIn("appName", create_ep.request_payload or "")

        detail_ep = next(ep for ep in endpoints if ep.path == "/api/projects/detail")
        self.assertEqual(detail_ep.method, "GET")

    def test_extract_api_endpoints_fallback_list(self):
        list_prd = """
## 8. API Endpoints
- `POST /api/auth/login`: User login endpoint
- `GET /api/user/profile`: Fetch current profile
"""
        endpoints = extract_api_endpoints(list_prd)
        self.assertEqual(len(endpoints), 2)
        self.assertEqual(endpoints[0].method, "POST")
        self.assertEqual(endpoints[0].path, "/api/auth/login")
        self.assertEqual(endpoints[1].method, "GET")
        self.assertEqual(endpoints[1].path, "/api/user/profile")

    def test_extract_tech_stack(self):
        stack = extract_tech_stack(self.sample_prd)
        self.assertGreaterEqual(len(stack), 4)
        categories = [item.category for item in stack]
        self.assertTrue(any("Framework" in c for c in categories))
        self.assertTrue(any("Database" in c or "ORM" in c for c in categories))

    def test_extract_system_contract_full(self):
        contract = extract_system_contract(self.sample_prd)
        self.assertEqual(contract.version, "1.0.0")
        self.assertGreater(len(contract.database_entities), 0)
        self.assertGreater(len(contract.api_endpoints), 0)
        self.assertGreater(len(contract.tech_stack), 0)

    def test_format_contract_for_prompt(self):
        contract = extract_system_contract(self.sample_prd)
        prompt_block = format_contract_for_prompt(contract)

        self.assertIn("=== STRICT SYSTEM INVARIANT CONTRACT (ZERO-DRIFT MANDATE) ===", prompt_block)
        self.assertIn("[LOCKED DATABASE MODELS]:", prompt_block)
        self.assertIn("[LOCKED REST API ROUTES]:", prompt_block)
        self.assertIn("POST /api/projects/create", prompt_block)
        self.assertIn("Model `USER`", prompt_block)

    def test_reconcile_tasks_auto_heal_drifted_route(self):
        contract = extract_system_contract(self.sample_prd)
        # Create tasks where LLM hallucinated / drifted route: /api/project/create instead of /api/projects/create
        drifted_task = KanbanTask(
            id="T-3.1",
            title="Create project endpoint at /api/project/create",
            description="Handle POST requests to /api/project/create with validation.",
            estimasi="30m",
            tags=["API"],
        )
        phase_3 = PhaseGroup(
            id="phase-3",
            name="Phase 3: Backend APIs & Integrations",
            description="API endpoints",
            tasks=[drifted_task],
        )
        tasks_data = TasksData(phases=[phase_3])

        reconciled_tasks, compliance = reconcile_tasks_with_contract(tasks_data, contract)

        # Check route was auto-healed in task title & description
        self.assertIn("/api/projects/create", reconciled_tasks.phases[0].tasks[0].title)
        self.assertIn("/api/projects/create", reconciled_tasks.phases[0].tasks[0].description or "")
        self.assertGreater(compliance.auto_reconciled_count, 0)
        self.assertIn("/api/projects/create", compliance.covered_endpoints)

    def test_reconcile_tasks_auto_inject_missing_endpoint(self):
        contract = extract_system_contract(self.sample_prd)
        # Create minimal tasks that omit /api/projects/finish
        phase_3 = PhaseGroup(
            id="phase-3",
            name="Phase 3: Backend APIs & Integrations",
            description="API endpoints",
            tasks=[
                KanbanTask(
                    id="T-3.1",
                    title="Implement POST /api/projects/create",
                    description="Create project handler.",
                    estimasi="30m",
                )
            ],
        )
        tasks_data = TasksData(phases=[phase_3])

        reconciled_tasks, compliance = reconcile_tasks_with_contract(tasks_data, contract)

        # Confirm that missing endpoints (like /api/projects/finish) were injected into phase 3
        task_titles = [t.title for t in reconciled_tasks.phases[0].tasks]
        self.assertTrue(any("/api/projects/finish" in title for title in task_titles))
        self.assertIn("/api/projects/finish", compliance.covered_endpoints)
        self.assertEqual(len(compliance.missing_endpoints), 0)

    def test_empty_or_malformed_prd(self):
        empty_contract = extract_system_contract("")
        self.assertEqual(len(empty_contract.database_entities), 0)
        self.assertEqual(len(empty_contract.api_endpoints), 0)
        self.assertEqual(len(empty_contract.tech_stack), 0)

        tasks_data = TasksData(phases=[])
        reconciled, compliance = reconcile_tasks_with_contract(tasks_data, empty_contract)
        self.assertEqual(compliance.score, 1.0)
        self.assertTrue(compliance.is_compliant)


if __name__ == "__main__":
    unittest.main()
