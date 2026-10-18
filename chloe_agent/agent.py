from __future__ import annotations

import json
import os
from dataclasses import dataclass

from .config import Settings
from .models import LessonBlueprint, LessonRequest
from .repository import LessonRepository


@dataclass
class AgentRuntime:
    """Runtime dependencies exposed to the lesson-planning agent."""

    settings: Settings
    repository: LessonRepository


def _public_instructions(support_language: str) -> str:
    """Return a deployment placeholder without exposing the production rubric."""

    return (
        "本仓库为求职展示版。生产环境的教学策略、质量规则与提示词库"
        f"由私有配置注入；本次辅助语言为 {support_language}。"
    )


async def generate_blueprint(
    request: LessonRequest, settings: Settings | None = None
) -> LessonBlueprint:
    """运行课程规划智能体并返回通过数据模型校验的课程蓝图。"""

    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Use `chloe-agent demo` for the offline portfolio demo."
        )

    try:
        from agents import Agent, Runner, WebSearchTool, function_tool
    except ImportError as exc:
        raise RuntimeError("智能体运行依赖尚未安装。") from exc

    resolved = settings or Settings.load()
    repository = LessonRepository(resolved)
    runtime = AgentRuntime(settings=resolved, repository=repository)

    @function_tool
    def read_student_profile(student_id: str) -> str:
        """Read an anonymized student profile by ID."""

        profile = runtime.repository.load_profile(student_id)
        payload = {"found": profile is not None, "student_id": student_id}
        if profile is not None:
            payload["profile"] = profile.model_dump()
        return json.dumps(payload, ensure_ascii=False)

    @function_tool
    def search_reference_lessons(level: str, topic: str) -> str:
        """Search approved lesson metadata by language level and topic."""

        matches = runtime.repository.search_lessons(level=level, topic=topic)
        return json.dumps(matches, ensure_ascii=False)

    agent = Agent(
        name="Chinese Lesson Design Agent",
        instructions=_public_instructions(request.support_language),
        model=resolved.model,
        tools=[read_student_profile, search_reference_lessons, WebSearchTool()],
        output_type=LessonBlueprint,
    )
    prompt = "Create a complete lesson blueprint from this request:\n" + request.model_dump_json(
        indent=2
    )
    result = await Runner.run(agent, prompt)
    if isinstance(result.final_output, LessonBlueprint):
        return result.final_output
    return LessonBlueprint.model_validate(result.final_output)
