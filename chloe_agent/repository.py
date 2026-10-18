from __future__ import annotations

import json
import re
from pathlib import Path

from .config import Settings
from .models import StudentProfile


def safe_id(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip().lower()).strip("-")
    if not cleaned:
        raise ValueError("student_id 必须包含字母、数字、连字符或下划线")
    return cleaned


class LessonRepository:
    def __init__(self, settings: Settings):
        self.settings = settings

    def load_skill(self) -> str:
        return self.settings.skill_path.read_text(encoding="utf-8")

    def load_profile(self, student_id: str) -> StudentProfile | None:
        path = self.settings.student_dir / f"{safe_id(student_id)}.json"
        if not path.exists():
            return None
        return StudentProfile.model_validate_json(path.read_text(encoding="utf-8"))

    def save_profile(self, profile: StudentProfile) -> Path:
        self.settings.student_dir.mkdir(parents=True, exist_ok=True)
        path = self.settings.student_dir / f"{safe_id(profile.student_id)}.json"
        path.write_text(profile.model_dump_json(indent=2), encoding="utf-8")
        return path

    def search_lessons(self, level: str, topic: str, limit: int = 4) -> list[dict]:
        if not self.settings.catalog_path.exists():
            return []
        payload = json.loads(self.settings.catalog_path.read_text(encoding="utf-8"))
        lessons = payload if isinstance(payload, list) else payload.get("lessons", [])
        def tokens(value: str) -> set[str]:
            normalized = value.lower().strip()
            latin = set(re.findall(r"[a-z0-9]+", normalized))
            chinese_runs = re.findall(r"[\u4e00-\u9fff]+", normalized)
            chinese = set(chinese_runs)
            for run in chinese_runs:
                chinese.update(run[index : index + 2] for index in range(max(0, len(run) - 1)))
            return {token for token in latin | chinese if token}

        level_tokens = tokens(level)
        topic_tokens = tokens(topic)

        def score(item: dict) -> int:
            haystack = " ".join(
                str(item.get(k, "")) for k in ("level", "hsk", "title", "topic", "description")
            ).lower()
            return sum(3 for token in level_tokens if token in haystack) + sum(
                2 for token in topic_tokens if token in haystack
            )

        ranked = sorted(lessons, key=score, reverse=True)
        return [item for item in ranked if score(item) > 0][:limit]
