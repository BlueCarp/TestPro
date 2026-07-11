## Description: <br>
Applies WCAG 2 Level AA accessibility standards to design systems, UI components, and web pages with contrast validation, design-token patterns, typography and focus-state rules, and a semantics checklist. <br>

This skill is ready for commercial/non-commercial use. <br>

## Publisher: <br>
[raunakkathuria](https://clawhub.ai/user/raunakkathuria) <br>

### License/Terms of Use: <br>
MIT-0 <br>


## Use Case: <br>
Developers, designers, and accessibility reviewers use this skill when building or reviewing UI, design tokens, typography, focus states, page semantics, and WCAG 2.2 AA color contrast checks. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: Automated contrast checks do not establish full WCAG conformance. <br>
Mitigation: Pair the local contrast validator with keyboard walkthroughs, screen-reader passes, zoom/reflow checks, and review of labels, headings, alt text, and dynamic status updates. <br>
Risk: CI or build enforcement can block releases if color-pair configuration is incomplete or intentionally strict. <br>
Mitigation: Review project fit before wiring the validator into CI/build steps and maintain explicit token-pair configuration for each rendered theme and interaction state. <br>


## Reference(s): <br>
- [ClawHub skill page](https://clawhub.ai/raunakkathuria/skills/web-accessibility) <br>
- [WCAG 2 AA conformance](https://www.w3.org/WAI/WCAG2AA-Conformance) <br>
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/?currentsidebar=%23col_customize&levels=aaa) <br>
- [ARIA Authoring Practices patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) <br>
- [WCAG 2.2 AA checklist with fix patterns](references/wcag-checklist.md) <br>


## Skill Output: <br>
**Output Type(s):** [text, markdown, code, shell commands, configuration, guidance] <br>
**Output Format:** [Markdown guidance with inline JavaScript, CSS, JSON, and shell command examples] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [May produce local Node.js contrast-check commands and CI/build integration guidance; no network access or hidden data access is indicated by security evidence.] <br>

## Skill Version(s): <br>
0.1.1 (source: server release metadata) <br>

## Ethical Considerations: <br>
Users should evaluate whether this skill is appropriate for their environment, review any generated or modified files before relying on them, and apply their organization's safety, security, and compliance requirements before deployment. <br>
