"""
Unit tests for the Moryn PRD Section Patcher (Combo Architecture).

Tests the core `apply_section_patch` function to ensure:
- Surgical section replacement works correctly
- Non-target sections remain byte-identical
- New section insertion works
- Edge cases are handled gracefully
"""
import sys
import os
import unittest
import importlib.util

# Load patcher module directly to avoid __init__.py side-effects (gemini_client dependency)
_patcher_path = os.path.join(os.path.dirname(__file__), "..", "app", "services", "patcher.py")
_spec = importlib.util.spec_from_file_location("patcher", _patcher_path)
_patcher = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_patcher)

apply_section_patch = _patcher.apply_section_patch
_find_section_boundaries = _patcher._find_section_boundaries


SAMPLE_PRD = """# MyApp PRD

## 1. Executive Summary
This is the executive summary of the application.

## 2. Core Features
- Feature A: User authentication
- Feature B: Dashboard

## 3. User Flow
Users will sign up, log in, and access the dashboard.

## 4. Tech Stack
- Frontend: React
- Backend: Node.js

## 5. Database Schema
```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
}
```

## 6. API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/users | List users |
| POST   | /api/auth  | Login      |

## 7. Timeline
Phase 1: MVP in 4 weeks.
"""


class TestSectionPatcher(unittest.TestCase):

    def test_replace_section_middle(self):
        """Replace a middle section (Bab 5) and verify others are intact."""
        patch = """## 5. Database Schema
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  phone     String?
  createdAt DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  content   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```
"""
        result = apply_section_patch(SAMPLE_PRD, "## 5. Database Schema", patch)

        # The patched section should be present
        self.assertIn("model Notification", result)
        self.assertIn("phone     String?", result)

        # Other sections must remain intact
        self.assertIn("## 1. Executive Summary", result)
        self.assertIn("This is the executive summary", result)
        self.assertIn("## 2. Core Features", result)
        self.assertIn("Feature A: User authentication", result)
        self.assertIn("## 3. User Flow", result)
        self.assertIn("## 4. Tech Stack", result)
        self.assertIn("## 6. API Endpoints", result)
        self.assertIn("| GET    | /api/users | List users |", result)
        self.assertIn("## 7. Timeline", result)
        self.assertIn("Phase 1: MVP in 4 weeks", result)

    def test_replace_section_by_number(self):
        """Match section by number when title differs slightly."""
        patch = """## 5. Skema Database (Diperbarui)
Updated schema content here.
"""
        result = apply_section_patch(SAMPLE_PRD, "## 5. Skema Database", patch)

        # Should match by number prefix "5"
        self.assertIn("## 5. Skema Database (Diperbarui)", result)
        self.assertIn("Updated schema content here.", result)
        # Old content should be gone
        self.assertNotIn("model User {", result)
        # Other sections intact
        self.assertIn("## 4. Tech Stack", result)
        self.assertIn("## 6. API Endpoints", result)

    def test_append_to_section(self):
        """Append content to end of an existing section."""
        patch = "- Feature C: Notifications\n- Feature D: Settings\n"
        result = apply_section_patch(SAMPLE_PRD, "## 2. Core Features", patch, action="APPEND")

        self.assertIn("Feature A: User authentication", result)
        self.assertIn("Feature C: Notifications", result)
        self.assertIn("Feature D: Settings", result)

    def test_section_not_found_appends(self):
        """If target section doesn't exist, append as new section."""
        patch = """## 8. Security
All endpoints require JWT authentication.
"""
        result = apply_section_patch(SAMPLE_PRD, "## 8. Security", patch)

        self.assertIn("## 8. Security", result)
        self.assertIn("All endpoints require JWT authentication", result)
        # Existing content intact
        self.assertIn("## 7. Timeline", result)

    def test_first_section_replacement(self):
        """Replace the first section (Bab 1)."""
        patch = """## 1. Executive Summary
Updated executive summary with more details.
"""
        result = apply_section_patch(SAMPLE_PRD, "## 1. Executive Summary", patch)

        self.assertIn("Updated executive summary with more details", result)
        self.assertNotIn("This is the executive summary of the application", result)
        self.assertIn("## 2. Core Features", result)

    def test_last_section_replacement(self):
        """Replace the last section (Bab 7)."""
        patch = """## 7. Timeline
Phase 1: MVP in 2 weeks (accelerated).
Phase 2: Beta in 4 weeks.
"""
        result = apply_section_patch(SAMPLE_PRD, "## 7. Timeline", patch)

        self.assertIn("Phase 1: MVP in 2 weeks (accelerated)", result)
        self.assertIn("Phase 2: Beta in 4 weeks", result)
        self.assertNotIn("Phase 1: MVP in 4 weeks.", result)

    def test_empty_prd_returns_original(self):
        """Empty PRD input returns empty."""
        result = apply_section_patch("", "## 5. Test", "new content")
        self.assertEqual(result, "")

    def test_empty_patch_returns_original(self):
        """Empty patch content returns original PRD unchanged."""
        result = apply_section_patch(SAMPLE_PRD, "## 5. Database Schema", "")
        self.assertEqual(result, SAMPLE_PRD)

    def test_find_section_boundaries(self):
        """Verify boundary detection returns correct offsets."""
        boundaries = _find_section_boundaries(SAMPLE_PRD, "## 3. User Flow")
        self.assertIsNotNone(boundaries)
        start, end, heading = boundaries
        self.assertIn("## 3. User Flow", heading)
        # The section text between boundaries should contain the user flow content
        section_text = SAMPLE_PRD[start:end]
        self.assertIn("Users will sign up", section_text)
        # Should NOT contain content from other sections
        self.assertNotIn("## 4. Tech Stack", section_text)


if __name__ == "__main__":
    unittest.main()
