# Research Brief: Agentic Red Teaming in LLMs

**Date**: 2026-09-06
**Author**: scire-researcher
**Status**: Initial brief — for evaluator shock review

---

## 1. Executive Summary

Agentic red teaming — adversarial testing of LLM agents that reason, plan, call tools, and take real-world actions — has rapidly evolved from ad-hoc jailbreak testing into a structured subfield with its own benchmarks, taxonomies, and tooling (2025–2026). The field sits at a critical inflection: attack research outpaces defense work by **3.9:1** (PRISMA systematic review, 85 papers 2023–2025) [^1], perception-layer vulnerabilities dominate (66% of papers) while action-layer vulnerabilities (tool misuse, code injection, sandbox escape) appear in only 4.7% [^1], and no single benchmark or framework yet provides end-to-end coverage across the full autonomous pipeline.

The OWASP Top 10 for Agentic Applications (ASI01–ASI10, December 2025) provides the current canonical threat taxonomy [^2]. Multiple competing frameworks — REDAgentBench, RIFT-Bench, AgentRedBench, SIRAJ, TrajRed, AHA — each cover a complementary slice of the threat space but none combines dynamic attacker content, cross-system transferability, multi-integration chaining, and production-representative evaluation in a single package [^3][^4][^5][^6][^7][^8].

---

## 2. Landscape: Key Frameworks & Benchmarks

### 2.1 OWASP Agentic Top 10 (ASI01–ASI10) [^2]

The canonical risk register for autonomous AI agents (December 2025). Ten categories:

| ID | Risk | LLM Top 10 Equivalent |
|----|------|----------------------|
| ASI01 | Agent Goal Hijack | LLM01 Prompt Injection |
| ASI02 | Tool Misuse & Exploitation | LLM06 Excessive Agency |
| ASI03 | Identity & Privilege Abuse | (none) |
| ASI04 | Agentic Supply Chain | LLM03 Supply Chain |
| ASI05 | Unexpected Code Execution (RCE) | LLM05 Improper Output Handling |
| ASI06 | Memory & Context Poisoning | LLM04 Data Poisoning + LLM08 Vector/Embedding |
| ASI07 | Insecure Inter-Agent Communication | (none) |
| ASI08 | Cascading Failures | (none) |
| ASI09 | Human-Agent Trust Exploitation | LLM09 Misinformation (partial) |
| ASI10 | Rogue Agents | LLM06 Excessive Agency (partial) |

ASI07, ASI08, and ASI10 have **no LLM Top 10 predecessor** — they arise purely from agentic autonomy, tool use, and multi-agent coordination [^2].

### 2.2 REDAgentBench (2026-08) [^3]

Executable red-teaming framework for tool-using LLM agents. Key findings:
- **1,661 cases** across five service surfaces
- Macro-average ASR: **65.69%** across 6 models × 3 agent harnesses (GPT-5.2, Qwen3.7-plus, Kimi K2.6, GLM-5.2, etc.)
- **Recognition–Execution Gap**: ~1 in 5 violations occurs *after* the agent states the relevant constraint
- **Training-free policy reminder** reduces confirmed violations by >70 percentage points
- **Key insight**: ASR varies with harness and evidence view; trajectory-only judging systematically misses durable harm visible in service receipts and final state

### 2.3 TrajRed (2026) [^4]

Trajectory-guided red-teaming for execution vulnerabilities:
- Uses **trajectory progress scoring** (not just binary success/failure)
- Measures how far agent advances along malicious tool-use path
- Achieves **41.8% ASR** and **46.6% TPS**, outperforming AdvAgent (34.9% ASR)
- Converts high-risk trajectories into **TrajGuard** runtime governance layer
- Central argument: execution risk is a **trajectory-level phenomenon**

### 2.4 SIRAJ (EACL 2026 Findings) [^5]

Generic red-teaming for arbitrary black-box LLM agents:
- Two-step process: seed test case generation + iterative adversarial refinement
- **Distilled 8B model** improves ASR by 100%, surpassing 671B Deepseek-R1
- Seed generation yields **2–2.5× boost** in risk outcome and tool-calling trajectory coverage
- Structured reasoning distillation reduces noise vs. raw reasoning chains

### 2.5 AHA — Agent Hacks Agent (2026-07) [^6]

Autoresearch for production-agent red-teaming:
- Vulnerability Concept Graph (VCG) as auditable, reusable artifact
- Discovers **core vulnerability families** that transfer across victim models and agents
- "Claimed authorization" family present in 16/18 settings (all scenarios, models, agents)
- "Task-goal hijack" family shared along attack channel (indirect, tool-mediated)
- Frozen VCG outperforms strongest frozen discovery baseline by **14.2 percentage points**

### 2.6 RIFT-Bench (2026-06) [^7]

Representation-driven dynamic red-teaming:
- **NodeSpec**: standardized hierarchical representation of agentic system structure
- 105 probes across 5 attack surfaces and 10 attack suites
- Attack surface hierarchy: Surface → Suite → Probe → Attempt
- Adversarial objectives: unwanted actions, task disruption, info leakage, resource overload
- Key insight: attacks should be grounded in **functional structure**, not framework-specific details

### 2.7 AgentRedBench (2026) [^8]

Dynamic red-teaming for SaaS integrations:
- **215 subtle underspecified-authorization scenarios** across 24 enterprise integrations
- Dynamic LLM-driven attacker (content generated per-run, not template-replayed)
- No-guard ASR ranges from **32% to 81%** across 8-model panel
- AgentRedGuard cuts online attack success by **75–77 percentage points**
- 50 multi-integration chained scenarios (injection from connector A → writes on connector B)

### 2.8 Tooling Landscape

| Tool | Primary Approach | Agentic Support | Maturity |
|------|-----------------|-----------------|----------|
| **DeepTeam** | Agent-loop simulation, 50+ vulnerabilities, 20+ attack methods | Strong (11 agentic vulnerability classes) | ~1,277 GitHub stars |
| **PyRIT** | Orchestration scripting, multi-turn | Partial (needs framework integration) | 100+ red team ops at Microsoft |
| **Garak** | Probe-library automation | Limited (stateless) | Mature, Apache 2.0 |
| **PromptBench** | Static prompt testing | Limited | Research-oriented |

DeepTeam is the only framework with first-class support for OWASP ASI 2026, agentic vulnerability classes (GoalTheft, ToolOrchestrationAbuse, ExcessiveAgency, InsecureInterAgentCommunication), and structured tool-call capture via `RTTurn` objects [^9].

---

## 3. Vulnerability Taxonomy (Synthesized)

Based on the four-layer taxonomy from the PRISMA survey [^1] and cross-referenced with OWASP ASI [^2] and the individual benchmarks:

### Layer 1: Perception (66% of current research [^1])
- Prompt injection (direct + indirect)
- Jailbreaking (single-turn + multi-turn)
- Adversarial perturbations (multimodal)
- Context poisoning / indirect instruction

### Layer 2: Brain
- Goal hijacking (ASI01)
- Memory & context poisoning (ASI06)
- Reasoning manipulation
- Human-agent trust exploitation (ASI09)

### Layer 3: Action (4.7% of current research [^1] — **massive gap**)
- Tool misuse & exploitation (ASI02)
- Unexpected code execution / RCE (ASI05)
- Privilege escalation (ASI03)
- Sandbox escape
- Unauthorized API access

### Layer 4: Interaction
- Insecure inter-agent communication (ASI07)
- Cascading failures (ASI08)
- Rogue agents (ASI10)
- Supply chain vulnerabilities (ASI04)

**Critical finding**: Action-layer vulnerabilities are **severely under-researched** (4.7% of papers) despite being the most consequential in production — a compromised reasoning step can trigger unauthorized data access, irreversible state changes, or cascading failures [^1].

---

## 4. Key Empirical Findings

1. **ASR is harness-dependent**: REDAgentBench shows macro-average ASR of 65.69%, but reported ASR varies significantly across harnesses and evidence views [^3]. A single ASR number is insufficient.

2. **Trajectory > binary**: TrajRed and SIRAJ both demonstrate that trajectory-level feedback (partial progress, tool-call sequences) yields richer signal than binary success/failure [^4][^5].

3. **Recognition ≠ Execution**: ~20% of confirmed violations occur *after* the agent states the relevant constraint — the agent "knows" the rule but violates it anyway [^3].

4. **Architecture determines risk profile**: Multi-agent architectures amplify privacy and behavior vulnerabilities; governance risks dominate single-agent systems. Vulnerabilities cluster by architecture, not model choice [^10].

5. **Multi-turn attacks exploit tool-calling patterns**: Each turn provides information about agent tool-calling patterns and decision boundaries, enabling iterative refinement [^9].

6. **Defense by policy reminder works**: A simple training-free policy reminder reduces confirmed violations by >70pp in matched replay [^3].

7. **Cross-system transfer is real but limited**: AHA's Vulnerability Concepts transfer across victim models (53.7% mean ASR cross-scenario), with a core family ("claimed authorization") recurring universally [^6].

8. **Dynamic attackers outperform templates**: AgentRedBench shows that LLM-driven per-run attacker content discovers vulnerabilities that template replay misses; cross-integration chaining is a real threat [^8].

---

## 5. Research Gaps

| Gap | Description | Evidence |
|-----|-------------|----------|
| **Action-layer under-research** | Only 4.7% of papers cover tool misuse, code injection, sandbox escape | PRISMA survey [^1] |
| **No unified benchmark** | Each framework covers a slice; none combines dynamic attacker, cross-system transfer, chaining, production evaluation | Positioning statements in [^3][^7][^8] |
| **Adaptive defense lag** | Most defenses focus on input filtering / detection; runtime control for tool-use actions is sparse | 17 defense papers vs 66 attack papers [^1] |
| **Multi-modal agentic attacks** | Multimodal agents (vision + tools + memory) largely untested | Gap noted in [^1][^11] |
| **Continuous red teaming** | Most work is pre-deployment; production-time adversarial monitoring is nascent | Practitioner guide [^11] |
| **Cost/effectiveness tradeoffs** | SIRAJ shows 8B models can surpass 671B for red-teaming, but cost-per-vulnerability is unquantified at scale | [^5] |
| **Regulatory alignment** | EU AI Act Art. 15/17 requirements for high-risk agents are partially covered by ASI Top 10 but agent-specific gaps remain | [^2][^12] |

---

## 6. Hypotheses

1. **If** action-layer vulnerabilities are under-tested (4.7% of research), **then** production agentic systems with tool access will exhibit higher real-world ASR than reported in perception-focused benchmarks.

2. **If** the Recognition–Execution Gap is ~20% (agents violate constraints they can articulate), **then** adding runtime constraint-checking hooks (not just prompts) will reduce violations more than prompt-level hardening alone.

3. **If** architecture determines risk profile more than model choice, **then** a multi-agent system with a weaker model but better architectural isolation will be more robust than a single-agent system with a stronger model.

4. **If** dynamic LLM-driven attackers outperform template replay, **then** continuous red-teaming in production (shadow-mode adversarial probing) will discover novel attack vectors not found in pre-deployment testing.

5. **If** the "claimed authorization" vulnerability family transfers universally across models and agents (16/18 settings in AHA), **then** a single defense targeting this family will yield disproportionate security gains across heterogeneous deployments.

6. **If** trajectory-level scoring provides richer signal than binary ASR, **then** benchmarks that report only binary ASR systematically underestimate agent safety risk by missing partial-progress attacks.

7. **If** distilled 8B red-teamer models match or surpass 671B models (SIRAJ), **then** cost-effective continuous red teaming becomes feasible for organizations without large GPU budgets, democratizing agent security testing.

---

## 7. Sources

[^1]: "On Understanding, Identifying, and Mitigating Vulnerabilities in Agentic Large Language Models" — PRISMA systematic review, 85 papers (2023–2025). arXiv:2608.10530, 2026-08-11. https://arxiv.org/html/2608.10530

[^2]: OWASP Top 10 for Agentic Applications 2026 (ASI01–ASI10), December 2025. https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

[^3]: "REDAgentBench: Executable Red Teaming and Faithful Measurement of LLM Agent Systems" — 1,661 cases, 6 models × 3 harnesses. arXiv:2608.10669, 2026-08-11. https://arxiv.org/html/2608.10669

[^4]: "Governing Execution Risk in Agentic AI Systems: A Trajectory-Guided Framework for Red Teaming" (TrajRed). arXiv:2608.04018, 2026. https://arxiv.org/html/2608.04018

[^5]: "SIRAJ: Diverse and Efficient Red-Teaming for LLM Agents via Distilled Structured Reasoning" — EACL 2026 Findings. https://aclanthology.org/2026.findings-eacl.171.pdf

[^6]: "Agent Hacks Agent: Autoresearch for Production-Agent Red-Teaming" (AHA) — Vulnerability Concept Graphs. arXiv:2607.11698, 2026-07-13. https://arxiv.org/html/2607.11698

[^7]: "RIFT-Bench: Dynamic Red-teaming For Agentic AI Systems" — NodeSpec, 105 probes. arXiv:2606.23927, 2026-06-22. https://arxiv.org/html/2606.23927

[^8]: "AgentRedBench: Dynamic Redteaming and Integration-Aware Defense for LLM Agents over SaaS Integrations" — 215 scenarios, 24 integrations. arXiv:2606.02240, 2026. https://arxiv.org/html/2606.02240v3

[^9]: "Complete Guide to Agentic AI Red Teaming" — DeepTeam. 2026-07-02. https://trydeepteam.com/guides/guide-agentic-ai-red-teaming

[^10]: "Black-Box Red Teaming of Agentic AI: A Taxonomy-Driven Framework for Automated Risk Discovery" — SAGE-RT, 7-domain taxonomy. OpenReview, 2026. https://openreview.net/attachment?id=ZLzc8coumq&name=pdf

[^11]: "Red-Teaming LLMs 2026: A Practitioner's Guide." https://datavlab.ai/post/red-teaming-llms-practitioner-guide-2026

[^12]: "Redefining AI Red Teaming in the Agentic Era: From Weeks to Hours." arXiv:2605.04019, 2026-05-05. https://arxiv.org/html/2605.04019v1

[^13]: "Securing LLM agents: From prompt sanitization to continuous red teaming" — Comprehensive survey. ScienceDirect, 2026. https://www.sciencedirect.com/science/article/pii/S2667345226000015

[^14]: "Evaluating PyRIT for Agentic AI Red Teaming" — CSA/OWASP joint initiative. https://cloudsecurityalliance.org/artifacts/evaluating-pyrit-for-agentic-ai-red-teaming

[^15]: "Adversarial Robustness Testing: A Comparative Guide to Garak, PyRIT, and DeepTeam." https://axiomlogica.com/ai-ml/adversarial-robustness-testing-garak-pyrit-deepteam-guide

---

## 8. Confidence

**Confidence: HIGH** (for landscape survey and gap identification)

Rationale:
- Multiple independent sources converge on the same findings (attack > defense ratio, action-layer gap, architecture > model for risk)
- All frameworks cited are from 2025–2026 with arXiv or peer-reviewed venue backing
- The OWASP ASI Top 10 provides an industry-consensus taxonomy validated by 100+ experts
- Key empirical claims (65.69% macro ASR, 20% Recognition–Execution Gap, 3.9:1 attack/defense ratio) are from reproducible benchmarks with published methodology

**Confidence: MEDIUM** (for hypotheses)
- Hypotheses 1–5 are well-grounded in cited evidence but are *falsifiable predictions* requiring experimental validation
- Hypothesis 6 (trajectory > binary) is supported by two independent frameworks but not yet benchmarked head-to-head
- Hypothesis 7 (8B models cost-effective) is supported by SIRAJ results but transfer to continuous production use is untested [UNVERIFIED]

**Confidence: LOW** (for multi-modal agentic attacks)
- Gap is real but very few papers exist; the space is too early for confident claims

---

## 9. Recommended Next Steps

1. **For SCIRE project**: Propose an experiment testing Hypothesis 2 (runtime constraint-checking vs. prompt hardening) using the SCIRE experiment framework with a local LLM agent
2. **For deeper research**: Focus on action-layer vulnerabilities (ASI02, ASI05) — the most under-researched and most consequential category
3. **For tooling**: Evaluate DeepTeam with OWASP ASI 2026 as the fastest path to comprehensive agentic coverage
4. **For evaluator**: Shock-test Hypothesis 3 (architecture > model) — is there counterevidence?
