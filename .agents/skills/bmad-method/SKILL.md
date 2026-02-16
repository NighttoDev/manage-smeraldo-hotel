---
name: bmad-method
description: Orchestrates BMAD (Business Method for AI Development) workflows for project planning, PRD creation, architecture design, and implementation. Use when asked to create PRDs, run workflows, activate agents, plan sprints, or use BMAD.
---

# BMAD Method Skill

Orchestrates the BMAD (Business Method for AI Development) platform for structured software development workflows.

## Overview

BMAD provides a modular framework with specialized agents, workflows, and tasks for software development lifecycle management. This skill enables you to use BMAD's capabilities within Amp.

## BMAD Directory Structure

```
_bmad/
├── _config/           # Manifests and configuration
│   ├── agent-manifest.csv
│   ├── workflow-manifest.csv
│   ├── task-manifest.csv
│   └── manifest.yaml
├── core/              # Core platform
│   ├── agents/        # bmad-master.md
│   ├── workflows/     # brainstorming, party-mode, advanced-elicitation
│   ├── tasks/         # index-docs, shard-doc, adversarial-review
│   └── config.yaml
└── bmm/               # Business Method Module
    ├── agents/        # analyst, architect, dev, pm, sm, ux-designer, etc.
    ├── workflows/     # PRD, architecture, epics, implementation workflows
    └── data/          # Templates and resources
```

## Activation Steps

When user invokes BMAD or asks for BMAD workflows:

1. **Load Configuration**
   Read `{project-root}/_bmad/core/config.yaml` to get:
   - `user_name` - User's name for personalized interaction
   - `communication_language` - Language for all communication
   - `output_folder` - Where to save generated documents

2. **Communicate in configured language throughout**

## Available Agents

Load agent personas from `_bmad/bmm/agents/`:

| Agent | Name | Role |
|-------|------|------|
| analyst | Mary | Business Analyst - requirements, market research |
| architect | Winston | System Architect - technical design, patterns |
| dev | Amelia | Developer - story execution, TDD |
| pm | John | Product Manager - PRD creation, user interviews |
| sm | Bob | Scrum Master - story preparation, sprint management |
| tea | Murat | Test Architect - testing strategy, automation |
| ux-designer | Sally | UX Designer - user experience, wireframes |
| tech-writer | Paige | Technical Writer - documentation |
| quick-flow-solo-dev | Barry | Full-stack developer for quick specs |

## Core Workflows

List available workflows by reading `{project-root}/_bmad/_config/workflow-manifest.csv`.

### Phase 1: Analysis
- **create-product-brief** - Collaborative product brief discovery
- **research** - Market, technical, domain research

### Phase 2: Planning
- **prd** - Create/Validate/Edit PRDs (tri-modal)
- **create-ux-design** - UX patterns and design planning

### Phase 3: Solutioning
- **create-architecture** - Architecture decisions and design
- **create-epics-and-stories** - Break PRD into implementation stories
- **check-implementation-readiness** - Validate before implementation

### Phase 4: Implementation
- **sprint-planning** - Generate sprint status tracking
- **create-story** - Create next user story from epics
- **dev-story** - Execute story with TDD approach
- **code-review** - Adversarial code review
- **correct-course** - Navigate significant changes

### Quick Flow (Lightweight)
- **quick-spec** - Conversational spec engineering
- **quick-dev** - Flexible development execution

### Testing Workflows
- **testarch-framework** - Initialize test framework
- **testarch-atdd** - Acceptance test-driven development
- **testarch-automate** - Expand test coverage

## Executing a Workflow

When user asks to run a workflow:

1. Find workflow path from `_bmad/_config/workflow-manifest.csv`
2. Read the workflow file (`.md` or `.yaml`)
3. Follow the workflow's initialization sequence exactly
4. Execute step-by-step as directed in the workflow

### Workflow Processing Rules

- **READ COMPLETELY**: Read entire workflow/step file before acting
- **FOLLOW SEQUENCE**: Execute sections in order, never skip
- **WAIT FOR INPUT**: Halt at menus, wait for user selection
- **SAVE STATE**: Update `stepsCompleted` in output frontmatter
- **LOAD NEXT**: Only load next step when directed

## Available Tasks

Read tasks from `_bmad/_config/task-manifest.csv`:

- **index-docs** - Generate index.md for document directories
- **shard-doc** - Split large documents into smaller files
- **review-adversarial-general** - Cynical content review

## Common Commands

| Command | Action |
|---------|--------|
| `list workflows` | Show all available workflows |
| `list agents` | Show all available agents |
| `list tasks` | Show all available tasks |
| `run <workflow>` | Execute a specific workflow |
| `activate <agent>` | Load an agent persona |
| `party mode` | Multi-agent group discussion |

## Output Location

All generated documents should be saved to:
- Primary: `{output_folder}` from config (typically `_bmad-output/`)
- Planning artifacts: `{planning_artifacts}/` subdirectory
- Implementation artifacts: `{implementation_artifacts}/` subdirectory

## Project Context

If `**/project-context.md` exists, treat it as the authoritative reference for implementation decisions and patterns.

## Example Usage

**User:** "Run the PRD workflow"
1. Read `_bmad/core/config.yaml` for settings
2. Read `_bmad/bmm/workflows/2-plan-workflows/prd/workflow.md`
3. Follow mode selection (Create/Validate/Edit)
4. Execute step files sequentially
5. Save output to configured folder

**User:** "Activate the architect agent"
1. Read `_bmad/bmm/agents/architect.md`
2. Adopt Winston's persona and communication style
3. Follow architect's principles and identity

**User:** "List available workflows"
1. Read `_bmad/_config/workflow-manifest.csv`
2. Display formatted list with descriptions
