# Chloe AI Chinese Lesson Design Agent

An AI-assisted workflow that turns a teacher's brief into a structured,
validated and interactive Chinese lesson. The project combines agent tool use,
typed lesson schemas, deterministic rendering and classroom-focused quality
checks.

**[Open the live lesson portfolio](https://chloe6723.github.io/chloe-ai-teaching-agent-portfolio/)**

![System architecture](docs/architecture.svg)

## What it solves

Generic lesson generators often produce attractive text without a teachable
sequence. This agent starts from a learner profile and a concrete lesson goal,
searches approved reference metadata, returns a typed lesson blueprint, checks
the result, and packages it as an interactive webpage.

Each generated lesson follows one learning path:

1. nine focused learning cards;
2. a practice game tied to the lesson objective;
3. a level-appropriate reading with clickable vocabulary support;
4. two scaffolded discussion questions;
5. a teacher guide and machine-readable validation report.

## Selected interactive lessons

| Level | Lesson | What it demonstrates |
|---|---|---|
| Pre-HSK | [Four-Session Pinyin Lab](lessons/00-pre-hsk/pinyin-four-courses/index.html) | Progressive curriculum, audio practice, English pronunciation cues and four reusable sessions |
| HSK 2–3 | [First Visit to Haidilao](lessons/04-hsk2-3/haidilao-restaurant/index.html) | Real service flow, restaurant language, menu interaction and role-play |
| HSK 2–3 | [Chinese for Social Media Creators](lessons/04-hsk2-3/social-media-creator/index.html) | Learner-specific vocabulary, short-video scripting, interactive reading and creator workflow |

## Technical design

- **Agent orchestration:** OpenAI Agents SDK with profile lookup, lesson search
  and web research tools.
- **Reliable output:** Pydantic models define the complete lesson contract.
- **Deterministic delivery:** Python renders the validated blueprint into HTML,
  JSON, a teacher guide and a quality report.
- **Quality checks:** the validator checks lesson count, pinyin coverage,
  vocabulary reuse and practice completeness.
- **Privacy:** the public repository includes one fictional student profile.
  Production prompts, real learner records and private teaching rules are not
  published.

## Run the offline demo

The offline demo does not call an API.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
chloe-agent demo --open
```

Run the test suite:

```bash
python -m unittest discover -s tests -v
```

To run the live agent, set your own `OPENAI_API_KEY` locally and use:

```bash
chloe-agent create \
  --student example-student \
  --age 16 \
  --level "HSK 2" \
  --topic "ordering breakfast" \
  --open
```

The key is read from the local environment and is never committed.

## Repository map

```text
chloe_agent/          public agent runtime, schemas, renderer and validator
data/students/        one fictional learner profile
examples/             one complete structured-output example
lessons/              three selected final lesson experiences
tests/                agent contract, renderer and tool-wiring tests
docs/architecture.svg system architecture diagram
```

## Portfolio scope

This is a deliberately reduced portfolio edition. It demonstrates the system's
architecture and output quality while excluding API keys, real student data,
private records, the full lesson archive and the production prompt library.

Copyright © 2026 Chloe Chen. All rights reserved. See [COPYRIGHT.md](COPYRIGHT.md).
