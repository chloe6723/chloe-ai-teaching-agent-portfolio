from __future__ import annotations

import re

from .models import LessonBlueprint, ValidationIssue, ValidationReport


TONE_NUMBER_PATTERN = re.compile(r"[a-zA-ZüÜvV][1-5]\b")


def validate_blueprint(lesson: LessonBlueprint) -> ValidationReport:
    issues: list[ValidationIssue] = []
    checks: dict[str, bool] = {}

    checks["exactly_nine_cards"] = len(lesson.cards) == 9
    checks["exactly_two_discussion_questions"] = len(lesson.discussion_questions) == 2
    checks["game_has_six_or_more_questions"] = len(lesson.game.questions) >= 6
    checks["reading_has_glossary"] = len(lesson.reading.glossary) >= 9

    pinyin_fields: list[str] = []
    for card in lesson.cards:
        pinyin_fields.extend([card.pinyin, card.example_pinyin])
    pinyin_fields.extend(lesson.reading.paragraphs_pinyin)
    pinyin_fields.extend(entry.pinyin for entry in lesson.reading.glossary)
    pinyin_fields.extend(question.pinyin for question in lesson.discussion_questions)
    checks["no_tone_numbers"] = not any(TONE_NUMBER_PATTERN.search(value) for value in pinyin_fields)

    card_terms = {card.term for card in lesson.cards}
    glossary_words = {entry.word for entry in lesson.reading.glossary}
    missing_targets = sorted(term for term in card_terms if term not in glossary_words)
    checks["target_terms_in_glossary"] = not missing_targets
    if missing_targets:
        issues.append(
            ValidationIssue(
                severity="warning",
                code="TARGETS_MISSING_FROM_GLOSSARY",
                message="部分卡片词语未进入课文词典：" + "、".join(missing_targets),
            )
        )

    for name, passed in checks.items():
        if not passed and name != "target_terms_in_glossary":
            issues.append(
                ValidationIssue(severity="error", code=name.upper(), message=f"检查未通过：{name}")
            )

    return ValidationReport(
        passed=not any(issue.severity == "error" for issue in issues),
        issues=issues,
        checks=checks,
    )

