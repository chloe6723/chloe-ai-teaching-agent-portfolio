from __future__ import annotations

import html
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

from .config import Settings
from .models import LessonBlueprint, LessonRequest, ValidationReport


def _h(value: object) -> str:
    return html.escape(str(value), quote=True)


def _topic_slug(value: str) -> str:
    ascii_slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip().lower()).strip("-")
    if ascii_slug:
        return ascii_slug
    digest = hashlib.sha1(value.encode("utf-8"), usedforsecurity=False).hexdigest()[:8]
    return f"lesson-{digest}"


def _render_reading_paragraph(text: str, glossary: list[dict]) -> str:
    """Wrap known words with accessible buttons, preferring longest matches."""
    by_word = {item["word"]: item for item in glossary}
    words = sorted(by_word, key=len, reverse=True)
    if not words:
        return _h(text)
    pattern = re.compile("(" + "|".join(re.escape(word) for word in words) + ")")
    parts = pattern.split(text)
    rendered: list[str] = []
    for part in parts:
        if part in by_word:
            entry = by_word[part]
            rendered.append(
                '<button class="word" type="button" '
                f'data-entry="{_h(json.dumps(entry, ensure_ascii=False))}">{_h(part)}</button>'
            )
        else:
            rendered.append(_h(part))
    return "".join(rendered)


def render_html(lesson: LessonBlueprint) -> str:
    lesson_data = lesson.model_dump(mode="json")
    cards = "".join(
        f"""
        <article class="card reveal">
          <div class="card-image"><img src="{_h(card.image_url)}" alt="{_h(card.image_alt)}" loading="lazy"></div>
          <div class="card-copy">
            <span class="card-number">{index:02d}</span>
            <h3>{_h(card.term)}</h3>
            <p class="pinyin">{_h(card.pinyin)}</p>
            <p class="translation">{_h(card.translation)}</p>
            <div class="example">
              <strong>{_h(card.example)}</strong>
              <span>{_h(card.example_pinyin)}</span>
              <span>{_h(card.example_translation)}</span>
            </div>
          </div>
        </article>
        """
        for index, card in enumerate(lesson.cards, 1)
    )
    instructions = "".join(
        f"<li><strong>{_h(zh)}</strong><span>{_h(en)}</span></li>"
        for zh, en in zip(lesson.game.instructions, lesson.game.instructions_translation, strict=True)
    )
    reading_blocks = "".join(
        f"""
        <div class="reading-block">
          <p class="reading-zh">{_render_reading_paragraph(text, [x.model_dump(mode='json') for x in lesson.reading.glossary])}</p>
          <p class="reading-pinyin pinyin">{_h(pinyin)}</p>
          <p class="reading-translation translation">{_h(translation)}</p>
        </div>
        """
        for text, pinyin, translation in zip(
            lesson.reading.paragraphs,
            lesson.reading.paragraphs_pinyin,
            lesson.reading.paragraphs_translation,
            strict=True,
        )
    )
    discussions = "".join(
        f"""
        <article class="discussion-card">
          <span class="question-index">0{index}</span>
          <h3>{_h(item.question)}</h3>
          <p class="pinyin">{_h(item.pinyin)}</p>
          <p class="translation">{_h(item.translation)}</p>
          <div class="sentence-frame">
            <small>句型支架 · Sentence frame</small>
            <strong>{_h(item.sentence_frame)}</strong>
            <span>{_h(item.sentence_frame_pinyin)}</span>
            <span>{_h(item.sentence_frame_translation)}</span>
          </div>
          <div class="keywords">{''.join(f'<span>{_h(keyword)}</span>' for keyword in item.keywords)}</div>
        </article>
        """
        for index, item in enumerate(lesson.discussion_questions, 1)
    )
    objectives = "".join(f"<li>{_h(item)}</li>" for item in lesson.learning_objectives)

    return f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{_h(lesson.title)} · Chloe 中文课</title>
  <style>
    :root {{ --ink:#202124; --paper:#fffdf8; --purple:#7254e8; --pink:#e94296; --cyan:#35c1c8; --yellow:#ffd667; --line:#dcdde3; --size:1; }}
    * {{ box-sizing:border-box; }}
    html {{ scroll-behavior:smooth; }}
    body {{ margin:0; color:var(--ink); background:#f2f7f8; font-family:Inter,"Noto Sans SC","PingFang SC",sans-serif; font-size:calc(16px * var(--size)); }}
    button {{ font:inherit; }}
    .topbar {{ position:sticky; top:0; z-index:20; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 5vw; background:rgba(255,255,255,.94); border-bottom:1px solid var(--line); backdrop-filter:blur(12px); }}
    .brand {{ font-weight:900; letter-spacing:.02em; }}
    .nav {{ display:flex; flex-wrap:wrap; gap:8px; }}
    .nav a,.size-control button {{ color:var(--ink); text-decoration:none; border:1.5px solid var(--ink); background:white; border-radius:999px; padding:7px 12px; box-shadow:2px 2px 0 var(--ink); }}
    .size-control {{ display:flex; gap:6px; }}
    main {{ width:min(1180px,92vw); margin:auto; }}
    .hero {{ min-height:68vh; display:grid; grid-template-columns:1.25fr .75fr; gap:42px; align-items:center; padding:70px 0; }}
    .eyebrow {{ display:inline-block; padding:8px 12px; background:var(--yellow); border:2px solid var(--ink); border-radius:999px; font-weight:800; }}
    h1 {{ font-size:clamp(3rem,8vw,7.5rem); line-height:.95; margin:22px 0; letter-spacing:-.06em; }}
    .subtitle {{ font-size:1.25rem; color:#555; max-width:720px; }}
    .hero-panel {{ padding:28px; background:white; border:2px solid var(--ink); border-radius:28px; box-shadow:10px 10px 0 var(--purple); transform:rotate(1.5deg); }}
    .hero-panel li {{ margin:12px 0; }}
    section {{ padding:72px 0; scroll-margin-top:80px; }}
    .section-head {{ display:flex; justify-content:space-between; align-items:end; gap:20px; margin-bottom:30px; }}
    .section-head h2 {{ font-size:clamp(2rem,5vw,4.5rem); margin:0; }}
    .section-head p {{ max-width:500px; color:#666; }}
    .card-grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }}
    .card {{ overflow:hidden; background:white; border:2px solid var(--ink); border-radius:28px; box-shadow:7px 7px 0 var(--ink); transition:.2s ease; }}
    .card:hover {{ transform:translateY(-6px) rotate(-.5deg); box-shadow:11px 13px 0 var(--purple); }}
    .card-image {{ aspect-ratio:16/9; background:#f3edff; overflow:hidden; }}
    .card-image img {{ width:100%; height:100%; object-fit:cover; display:block; }}
    .card-copy {{ padding:22px; position:relative; }}
    .card-number {{ position:absolute; right:18px; top:16px; font-weight:900; color:var(--pink); }}
    .card h3 {{ font-size:2rem; margin:0 0 4px; }}
    .pinyin {{ color:#514968; }} .translation {{ color:#656565; }}
    .example {{ display:grid; gap:5px; margin-top:16px; padding:14px; background:#f6f1ff; border-radius:14px; }}
    .game-layout {{ display:grid; grid-template-columns:minmax(260px,.7fr) 1.3fr; gap:24px; align-items:start; }}
    .rules,.quiz,.reading,.discussion-card {{ background:white; border:2px solid var(--ink); border-radius:28px; box-shadow:7px 7px 0 var(--ink); }}
    .rules {{ padding:28px; position:sticky; top:92px; }}
    .rules li {{ display:grid; gap:4px; margin:18px 0; }} .rules li span {{ color:#666; }}
    .quiz {{ overflow:hidden; }}
    .quiz-stage {{ min-height:470px; padding:34px; display:flex; flex-direction:column; justify-content:center; background:linear-gradient(135deg,#2f6fe0,#7354e9); color:white; }}
    .quiz-stage h3 {{ font-size:2rem; margin:12px 0 5px; }}
    .progress {{ height:10px; background:rgba(255,255,255,.25); border-radius:10px; overflow:hidden; }}
    .progress span {{ display:block; height:100%; background:var(--yellow); transition:.25s; }}
    .choices {{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:24px; }}
    .choice {{ border:2px solid var(--ink); border-radius:16px; padding:16px; background:white; color:var(--ink); cursor:pointer; font-weight:800; }}
    .choice:hover {{ background:var(--yellow); }}
    .quiz-feedback {{ min-height:68px; padding:18px 32px; }}
    .restart {{ margin-top:14px; border:0; border-radius:999px; padding:12px 18px; background:var(--yellow); font-weight:900; cursor:pointer; }}
    .reading {{ padding:clamp(22px,5vw,56px); }}
    .reading-tools {{ display:flex; gap:8px; margin-bottom:20px; }}
    .reading-tools button {{ border:1.5px solid var(--ink); background:white; border-radius:999px; padding:9px 14px; cursor:pointer; }}
    .reading-block {{ padding:22px 0; border-bottom:1px solid var(--line); }}
    .reading-zh {{ font-size:1.55rem; line-height:2.1; }}
    .word {{ display:inline; border:0; border-bottom:3px solid var(--cyan); padding:0 2px; background:transparent; cursor:pointer; font-weight:700; }}
    .word:hover,.word:focus {{ background:#dff9f8; border-radius:5px; outline:2px solid var(--cyan); }}
    .discussion-grid {{ display:grid; grid-template-columns:1fr 1fr; gap:24px; }}
    .discussion-card {{ padding:32px; }} .question-index {{ color:var(--pink); font-weight:900; }}
    .discussion-card h3 {{ font-size:2rem; }}
    .sentence-frame {{ display:grid; gap:7px; padding:18px; margin:22px 0; background:#fff4c8; border-radius:16px; }}
    .keywords {{ display:flex; flex-wrap:wrap; gap:8px; }} .keywords span {{ padding:7px 11px; background:#eaf8f8; border-radius:999px; }}
    dialog {{ width:min(560px,90vw); padding:0; border:2px solid var(--ink); border-radius:24px; box-shadow:10px 10px 0 var(--ink); }}
    dialog::backdrop {{ background:rgba(25,20,40,.55); backdrop-filter:blur(4px); }}
    .dialog-image {{ width:100%; aspect-ratio:16/8; object-fit:cover; background:#eee; }}
    .dialog-copy {{ padding:24px; }} .dialog-copy h3 {{ font-size:2.5rem; margin:0; }}
    .dialog-close {{ float:right; border:0; background:#eee; border-radius:50%; width:40px; height:40px; cursor:pointer; }}
    footer {{ margin-top:70px; padding:36px 5vw; background:var(--ink); color:white; text-align:center; }}
    .hidden {{ display:none !important; }}
    @media (max-width:850px) {{ .hero,.game-layout {{ grid-template-columns:1fr; }} .card-grid {{ grid-template-columns:1fr 1fr; }} .rules {{ position:static; }} .topbar {{ align-items:flex-start; }} .nav {{ display:none; }} }}
    @media (max-width:560px) {{ .card-grid,.discussion-grid,.choices {{ grid-template-columns:1fr; }} h1 {{ font-size:3.4rem; }} }}
    @media (prefers-reduced-motion:reduce) {{ * {{ scroll-behavior:auto !important; transition:none !important; }} }}
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand">CHLOE · 中文课堂</div>
    <nav class="nav" aria-label="课程导航"><a href="#cards">知识卡</a><a href="#game">小游戏</a><a href="#reading">小课文</a><a href="#discussion">讨论</a></nav>
    <div class="size-control" aria-label="调整字号"><button data-size="down" aria-label="缩小字号">A−</button><button data-size="reset">A</button><button data-size="up" aria-label="放大字号">A＋</button></div>
  </header>
  <main>
    <section class="hero">
      <div><span class="eyebrow">{_h(lesson.level)} · {_h(lesson.duration_minutes)} MIN</span><h1>{_h(lesson.title)}</h1><p class="subtitle">{_h(lesson.subtitle)}</p></div>
      <aside class="hero-panel"><strong>今天我们会 · Today we will</strong><ul>{objectives}</ul><p>{_h(lesson.audience_summary)}</p></aside>
    </section>
    <section id="cards"><div class="section-head"><div><small>01 · INPUT</small><h2>先认识</h2></div><p>点击、观察、跟读，再用例句把新词放进真实语境。</p></div><div class="card-grid">{cards}</div></section>
    <section id="game"><div class="section-head"><div><small>02 · PRACTICE</small><h2>{_h(lesson.game.title)}</h2></div><div><p class="pinyin">{_h(lesson.game.title_pinyin)}</p><p>{_h(lesson.game.title_translation)}</p></div></div><div class="game-layout"><aside class="rules"><h3>游戏规则</h3><p>{_h(lesson.game.goal)}</p><p class="translation">{_h(lesson.game.goal_translation)}</p><ol>{instructions}</ol><div class="example"><strong>教师提示</strong><span>{_h(lesson.game.teacher_tip)}</span></div></aside><div class="quiz"><div class="quiz-stage" id="quizStage"></div><div class="quiz-feedback" id="quizFeedback" aria-live="polite"></div></div></div></section>
    <section id="reading"><div class="section-head"><div><small>03 · CONTEXT</small><h2>{_h(lesson.reading.title)}</h2></div><div><p class="pinyin">{_h(lesson.reading.title_pinyin)}</p><p>{_h(lesson.reading.title_translation)}</p></div></div><article class="reading"><div class="reading-tools"><button id="togglePinyin">拼音 Pinyin</button><button id="toggleTranslation">英文 English</button></div>{reading_blocks}</article></section>
    <section id="discussion"><div class="section-head"><div><small>04 · OUTPUT</small><h2>轮到你说</h2></div><p>没有唯一答案。先借助句型开口，再补充自己的理由。</p></div><div class="discussion-grid">{discussions}</div></section>
  </main>
  <dialog id="wordDialog"><img class="dialog-image" id="dialogImage" alt=""><div class="dialog-copy"><button class="dialog-close" aria-label="关闭">×</button><h3 id="dialogWord"></h3><p class="pinyin" id="dialogPinyin"></p><p id="dialogTranslation"></p><p id="dialogExplanation"></p></div></dialog>
  <footer>为这节真实课堂生成 · Chloe AI Chinese Lesson Agent</footer>
  <script>
    const lesson = {json.dumps(lesson_data, ensure_ascii=False).replace('</', '<\\/')};
    let current = 0, score = 0;
    const stage = document.querySelector('#quizStage');
    const feedback = document.querySelector('#quizFeedback');
    function renderQuestion() {{
      const total = lesson.game.questions.length;
      if (current >= total) {{
        stage.innerHTML = `<small>完成 · COMPLETE</small><h3>你答对了 ${{score}} / ${{total}} 题</h3><p>和老师一起回看最需要练习的词语。</p><button class="restart" type="button">重新开始 · Restart</button>`;
        stage.querySelector('.restart').addEventListener('click', () => {{ current=0; score=0; feedback.textContent=''; renderQuestion(); }});
        return;
      }}
      const q = lesson.game.questions[current];
      const choices = q.choices.map((choice,index) => `<button class="choice" type="button" data-index="${{index}}">${{choice}}</button>`).join('');
      stage.innerHTML = `<div class="progress"><span style="width:${{current/total*100}}%"></span></div><small>${{current+1}} / ${{total}}</small><h3>${{q.prompt}}</h3><p>${{q.prompt_pinyin}}</p><p>${{q.prompt_translation}}</p><div class="choices">${{choices}}</div>`;
      stage.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => answer(Number(button.dataset.index))));
    }}
    function answer(index) {{
      const q = lesson.game.questions[current]; const correct = index === q.correct_index;
      if (correct) score += 1;
      feedback.innerHTML = `<strong>${{correct ? '答对了！Correct!' : '再看一次 · Look again'}}</strong><br>${{q.feedback}}<br><span class="translation">${{q.feedback_translation}}</span>`;
      current += 1; setTimeout(renderQuestion, 850);
    }}
    renderQuestion();
    document.querySelector('#togglePinyin').addEventListener('click', () => document.querySelectorAll('.reading-pinyin').forEach(el => el.classList.toggle('hidden')));
    document.querySelector('#toggleTranslation').addEventListener('click', () => document.querySelectorAll('.reading-translation').forEach(el => el.classList.toggle('hidden')));
    const dialog = document.querySelector('#wordDialog');
    document.querySelectorAll('.word').forEach(button => button.addEventListener('click', () => {{
      const entry = JSON.parse(button.dataset.entry); document.querySelector('#dialogWord').textContent=entry.word; document.querySelector('#dialogPinyin').textContent=entry.pinyin; document.querySelector('#dialogTranslation').textContent=entry.translation; document.querySelector('#dialogExplanation').textContent=entry.explanation; const image=document.querySelector('#dialogImage'); image.src=entry.image_url; image.alt=entry.image_alt; dialog.showModal();
    }}));
    document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {{ if(event.target === dialog) dialog.close(); }});
    document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => {{ const currentSize=Number(getComputedStyle(document.documentElement).getPropertyValue('--size')) || 1; const action=button.dataset.size; const next=action==='up'?Math.min(1.35,currentSize+.1):action==='down'?Math.max(.85,currentSize-.1):1; document.documentElement.style.setProperty('--size',next); }}));
  </script>
</body>
</html>"""


def render_teacher_guide(lesson: LessonBlueprint, request: LessonRequest) -> str:
    flow = "\n".join(f"{index}. {item}" for index, item in enumerate(lesson.teacher_flow, 1))
    objectives = "\n".join(f"- {item}" for item in lesson.learning_objectives)
    sources = "\n".join(f"- {item}" for item in lesson.source_notes) or "- 本课未记录额外来源。"
    return f"""# {lesson.title}｜教师教案

## 学生与课堂

- 学生：{request.student_id}
- 年龄：{request.age}
- 水平：{request.level}
- 形式：{request.class_format}
- 时长：{request.duration_minutes} 分钟
- 主题：{request.topic}

## 学习目标

{objectives}

## 建议课堂流程

{flow}

## 游戏答案

{chr(10).join(f"{i}. {q.choices[q.correct_index]} — {q.feedback}" for i, q in enumerate(lesson.game.questions, 1))}

## 素材来源备注

{sources}
"""


def save_lesson_package(
    lesson: LessonBlueprint,
    request: LessonRequest,
    report: ValidationReport,
    settings: Settings,
) -> Path:
    date_prefix = datetime.now().strftime("%Y%m%d")
    topic_slug = _topic_slug(request.topic)
    destination = settings.output_dir / f"{date_prefix}-{topic_slug}"
    suffix = 2
    while destination.exists():
        destination = settings.output_dir / f"{date_prefix}-{topic_slug}-{suffix}"
        suffix += 1
    destination.mkdir(parents=True)
    (destination / "index.html").write_text(render_html(lesson), encoding="utf-8")
    (destination / "lesson.json").write_text(lesson.model_dump_json(indent=2), encoding="utf-8")
    (destination / "request.json").write_text(request.model_dump_json(indent=2), encoding="utf-8")
    (destination / "validation.json").write_text(report.model_dump_json(indent=2), encoding="utf-8")
    (destination / "teacher-guide.md").write_text(render_teacher_guide(lesson, request), encoding="utf-8")
    return destination
