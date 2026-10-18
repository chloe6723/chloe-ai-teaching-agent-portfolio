from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    root: Path
    model: str
    skill_path: Path
    catalog_path: Path
    student_dir: Path
    output_dir: Path

    @classmethod
    def load(cls, root: Path | None = None) -> "Settings":
        project_root = (root or Path(__file__).resolve().parents[1]).resolve()
        return cls(
            root=project_root,
            model=os.getenv("CHLOE_AGENT_MODEL", "gpt-6-astra"),
            skill_path=project_root / "SKILL.md",
            catalog_path=project_root / "lessons" / "catalog.json",
            student_dir=project_root / "data" / "students",
            output_dir=project_root / "generated-lessons",
        )

