from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator


class LessonRequest(BaseModel):
    student_id: str = Field(min_length=1, max_length=80)
    age: int = Field(ge=4, le=100)
    level: str = Field(min_length=1, max_length=40)
    topic: str = Field(min_length=1, max_length=160)
    duration_minutes: int = Field(default=60, ge=20, le=180)
    class_format: str = Field(default="线上一对一", max_length=80)
    support_language: str = Field(default="English", max_length=40)
    interests: list[str] = Field(default_factory=list, max_length=12)
    teacher_notes: str = Field(default="", max_length=2000)


class StudentProfile(BaseModel):
    student_id: str
    display_name: str = "Student"
    age: int | None = None
    level: str | None = None
    support_language: str = "English"
    interests: list[str] = Field(default_factory=list)
    learned_topics: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    weak_points: list[str] = Field(default_factory=list)
    teacher_notes: str = ""


class VocabularyCard(BaseModel):
    term: str = Field(min_length=1, max_length=30)
    pinyin: str = Field(min_length=1, max_length=80)
    translation: str = Field(min_length=1, max_length=120)
    example: str = Field(min_length=1, max_length=160)
    example_pinyin: str = Field(min_length=1, max_length=240)
    example_translation: str = Field(min_length=1, max_length=240)
    image_url: HttpUrl
    image_alt: str = Field(min_length=2, max_length=160)

    @field_validator("pinyin", "example_pinyin")
    @classmethod
    def reject_tone_numbers(cls, value: str) -> str:
        if any(char.isdigit() for char in value):
            raise ValueError("拼音必须使用声调符号，不能使用声调数字")
        return value


class GameQuestion(BaseModel):
    prompt: str = Field(min_length=1, max_length=180)
    prompt_pinyin: str = Field(min_length=1, max_length=260)
    prompt_translation: str = Field(min_length=1, max_length=260)
    choices: list[str] = Field(min_length=3, max_length=4)
    correct_index: int = Field(ge=0, le=3)
    feedback: str = Field(min_length=1, max_length=220)
    feedback_translation: str = Field(min_length=1, max_length=260)

    @model_validator(mode="after")
    def correct_choice_exists(self) -> "GameQuestion":
        if self.correct_index >= len(self.choices):
            raise ValueError("correct_index 超出选项范围")
        return self


class GameDesign(BaseModel):
    title: str
    title_pinyin: str
    title_translation: str
    goal: str
    goal_translation: str
    instructions: list[str] = Field(min_length=2, max_length=6)
    instructions_translation: list[str] = Field(min_length=2, max_length=6)
    teacher_tip: str
    questions: list[GameQuestion] = Field(min_length=6, max_length=12)

    @model_validator(mode="after")
    def parallel_instructions(self) -> "GameDesign":
        if len(self.instructions) != len(self.instructions_translation):
            raise ValueError("游戏规则与翻译数量必须一致")
        return self


class GlossaryEntry(BaseModel):
    word: str = Field(min_length=1, max_length=24)
    pinyin: str = Field(min_length=1, max_length=80)
    translation: str = Field(min_length=1, max_length=120)
    explanation: str = Field(min_length=1, max_length=220)
    image_url: HttpUrl
    image_alt: str = Field(min_length=2, max_length=160)


class ReadingText(BaseModel):
    title: str
    title_pinyin: str
    title_translation: str
    paragraphs: list[str] = Field(min_length=1, max_length=8)
    paragraphs_pinyin: list[str] = Field(min_length=1, max_length=8)
    paragraphs_translation: list[str] = Field(min_length=1, max_length=8)
    glossary: list[GlossaryEntry] = Field(min_length=9, max_length=60)

    @model_validator(mode="after")
    def parallel_paragraphs(self) -> "ReadingText":
        count = len(self.paragraphs)
        if len(self.paragraphs_pinyin) != count or len(self.paragraphs_translation) != count:
            raise ValueError("课文、拼音和翻译段落数量必须一致")
        return self


class DiscussionQuestion(BaseModel):
    question: str
    pinyin: str
    translation: str
    sentence_frame: str
    sentence_frame_pinyin: str
    sentence_frame_translation: str
    keywords: list[str] = Field(min_length=2, max_length=8)


class LessonBlueprint(BaseModel):
    title: str
    subtitle: str
    level: str
    duration_minutes: int
    audience_summary: str
    learning_objectives: list[str] = Field(min_length=2, max_length=4)
    cards: list[VocabularyCard]
    game: GameDesign
    reading: ReadingText
    discussion_questions: list[DiscussionQuestion]
    teacher_flow: list[str] = Field(min_length=4, max_length=10)
    source_notes: list[str] = Field(default_factory=list, max_length=20)

    @model_validator(mode="after")
    def enforce_lesson_contract(self) -> "LessonBlueprint":
        if len(self.cards) != 9:
            raise ValueError("必须恰好生成九张知识卡")
        if len(self.discussion_questions) != 2:
            raise ValueError("必须恰好生成两个讨论问题")
        terms = [card.term for card in self.cards]
        if len(set(terms)) != len(terms):
            raise ValueError("九张知识卡不能重复")
        return self


class ValidationIssue(BaseModel):
    severity: Literal["error", "warning"]
    code: str
    message: str


class ValidationReport(BaseModel):
    passed: bool
    issues: list[ValidationIssue]
    checks: dict[str, bool]

