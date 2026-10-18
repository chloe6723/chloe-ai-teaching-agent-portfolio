from __future__ import annotations

import argparse
import asyncio
import json
import os
import subprocess
import sys
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .agent import generate_blueprint
from .config import Settings
from .models import LessonBlueprint, LessonRequest, StudentProfile
from .renderer import save_lesson_package
from .repository import LessonRepository
from .validator import validate_blueprint


def _request_from_args(args: argparse.Namespace) -> LessonRequest:
    return LessonRequest(
        student_id=args.student,
        age=args.age,
        level=args.level,
        topic=args.topic,
        duration_minutes=args.duration,
        class_format=args.format,
        support_language=args.language,
        interests=args.interest or [],
        teacher_notes=args.notes or "",
    )


async def _create(args: argparse.Namespace) -> int:
    settings = Settings.load()
    request = _request_from_args(args)
    print("① 正在读取学生档案和参考课件…")
    print("② Agent 正在设计课程并核验素材…")
    blueprint = await generate_blueprint(request, settings)
    print("③ 正在执行结构和教学检查…")
    report = validate_blueprint(blueprint)
    destination = save_lesson_package(blueprint, request, report, settings)
    print(f"④ 已保存：{destination}")
    if report.issues:
        for issue in report.issues:
            print(f"   [{issue.severity}] {issue.message}")
    if args.open:
        webbrowser.open((destination / "index.html").as_uri())
    return 0 if report.passed else 2


def _demo(args: argparse.Namespace) -> int:
    settings = Settings.load()
    path = settings.root / "examples" / "demo_blueprint.json"
    lesson = LessonBlueprint.model_validate_json(path.read_text(encoding="utf-8"))
    request = LessonRequest(
        student_id="example-student",
        age=16,
        level="HSK 2",
        topic="校园早餐",
        duration_minutes=45,
        class_format="线上一对一",
        support_language="English",
    )
    report = validate_blueprint(lesson)
    destination = save_lesson_package(lesson, request, report, settings)
    print(f"离线示例已生成：{destination}")
    if args.open:
        webbrowser.open((destination / "index.html").as_uri())
    return 0


def _validate(args: argparse.Namespace) -> int:
    path = Path(args.lesson).expanduser().resolve()
    blueprint = LessonBlueprint.model_validate_json(path.read_text(encoding="utf-8"))
    report = validate_blueprint(blueprint)
    print(report.model_dump_json(indent=2))
    return 0 if report.passed else 2


def _save_profile(args: argparse.Namespace) -> int:
    settings = Settings.load()
    repository = LessonRepository(settings)
    profile = StudentProfile(
        student_id=args.student,
        display_name=args.name,
        age=args.age,
        level=args.level,
        support_language=args.language,
        interests=args.interest or [],
        learned_topics=args.learned or [],
        strengths=args.strength or [],
        weak_points=args.weak_point or [],
        teacher_notes=args.notes or "",
    )
    path = repository.save_profile(profile)
    print(f"学生档案已保存：{path}")
    return 0


def _serve(args: argparse.Namespace) -> int:
    directory = Path(args.directory).expanduser().resolve()
    if not directory.exists():
        raise SystemExit(f"目录不存在：{directory}")
    handler = partial(SimpleHTTPRequestHandler, directory=str(directory))
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    url = f"http://127.0.0.1:{args.port}/"
    print(f"预览地址：{url}\n按 Ctrl+C 停止。")
    if args.open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="chloe-agent", description="Chloe AI 中文课程设计 Agent")
    sub = parser.add_subparsers(dest="command", required=True)

    create = sub.add_parser("create", help="调用AI生成一套课程")
    create.add_argument("--student", required=True)
    create.add_argument("--age", required=True, type=int)
    create.add_argument("--level", required=True)
    create.add_argument("--topic", required=True)
    create.add_argument("--duration", type=int, default=60)
    create.add_argument("--format", default="线上一对一")
    create.add_argument("--language", default="English")
    create.add_argument("--interest", action="append")
    create.add_argument("--notes")
    create.add_argument("--open", action="store_true")

    demo = sub.add_parser("demo", help="不调用API，生成离线示例")
    demo.add_argument("--open", action="store_true")

    validate = sub.add_parser("validate", help="检查 lesson.json")
    validate.add_argument("lesson")

    profile = sub.add_parser("profile", help="创建或更新学生档案")
    profile.add_argument("--student", required=True)
    profile.add_argument("--name", required=True)
    profile.add_argument("--age", type=int)
    profile.add_argument("--level")
    profile.add_argument("--language", default="English")
    profile.add_argument("--interest", action="append")
    profile.add_argument("--learned", action="append")
    profile.add_argument("--strength", action="append")
    profile.add_argument("--weak-point", action="append")
    profile.add_argument("--notes")

    serve = sub.add_parser("serve", help="通过本地HTTP预览生成的课件")
    serve.add_argument("directory", nargs="?", default="generated-lessons")
    serve.add_argument("--port", type=int, default=8780)
    serve.add_argument("--open", action="store_true")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    try:
        if args.command == "create":
            code = asyncio.run(_create(args))
        elif args.command == "demo":
            code = _demo(args)
        elif args.command == "validate":
            code = _validate(args)
        elif args.command == "profile":
            code = _save_profile(args)
        else:
            code = _serve(args)
    except (ValueError, RuntimeError) as exc:
        print(f"错误：{exc}", file=sys.stderr)
        code = 1
    raise SystemExit(code)


if __name__ == "__main__":
    main()

