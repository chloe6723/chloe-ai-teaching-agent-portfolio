from __future__ import annotations

import asyncio
import os
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from chloe_agent.config import Settings
from chloe_agent.agent import generate_blueprint
from chloe_agent.models import LessonBlueprint, LessonRequest
from chloe_agent.renderer import render_html
from chloe_agent.repository import LessonRepository
from chloe_agent.validator import validate_blueprint


ROOT = Path(__file__).resolve().parents[1]


class AgentCoreTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.blueprint = LessonBlueprint.model_validate_json(
            (ROOT / "examples" / "demo_blueprint.json").read_text(encoding="utf-8")
        )

    def test_demo_contract(self) -> None:
        self.assertEqual(len(self.blueprint.cards), 9)
        self.assertEqual(len(self.blueprint.discussion_questions), 2)
        self.assertGreaterEqual(len(self.blueprint.game.questions), 6)

    def test_demo_validation_passes(self) -> None:
        report = validate_blueprint(self.blueprint)
        self.assertTrue(report.passed, report.model_dump_json(indent=2))

    def test_renderer_has_interactions(self) -> None:
        document = render_html(self.blueprint)
        self.assertIn('id="quizStage"', document)
        self.assertIn('id="wordDialog"', document)
        self.assertIn('id="togglePinyin"', document)
        self.assertEqual(document.count('class="card reveal"'), 9)

    def test_renderer_is_safe_for_chinese_topic_slug(self) -> None:
        from chloe_agent.renderer import save_lesson_package
        from chloe_agent.validator import validate_blueprint

        request = LessonRequest(student_id="test", age=16, level="HSK 2", topic="校园早餐")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            settings = Settings(
                root=root,
                model="test",
                skill_path=ROOT / "SKILL.md",
                catalog_path=ROOT / "lessons" / "catalog.json",
                student_dir=root / "students",
                output_dir=root / "outputs",
            )
            destination = save_lesson_package(
                self.blueprint, request, validate_blueprint(self.blueprint), settings
            )
            self.assertTrue((destination / "index.html").exists())

    def test_catalog_search_uses_hsk_and_topic(self) -> None:
        repository = LessonRepository(Settings.load(ROOT))
        matches = repository.search_lessons("HSK 2-3", "饭店点餐")
        self.assertTrue(matches)
        self.assertEqual(matches[0]["slug"], "haidilao-restaurant")

    def test_agents_sdk_wiring_accepts_structured_output(self) -> None:
        request = LessonRequest(student_id="example-student", age=16, level="HSK 2", topic="早餐")
        fake_result = SimpleNamespace(final_output=self.blueprint)
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}), patch(
            "agents.Runner.run", new=AsyncMock(return_value=fake_result)
        ) as mocked_run:
            result = asyncio.run(generate_blueprint(request, Settings.load(ROOT)))
        self.assertEqual(result.title, self.blueprint.title)
        self.assertEqual(mocked_run.await_count, 1)


if __name__ == "__main__":
    unittest.main()
