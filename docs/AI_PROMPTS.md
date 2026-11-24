# AI usage log

Tool: Claude Code. This file records the key prompts and how I validated or changed the output.

| # | Prompt / intent | What I kept / changed |
|---|---|---|
| 1 | Plan the assessment and scope the requirements | Kept scope; trimmed extras to fit time |
| 2 | Build employee CRUD + list API following SOLID and design patterns; document them | Kept Repository/Unit of Work/DI layering. Tests exposed a Zod 4 `.partial()` default bug (PATCH reset status); fixed by building the PATCH schema from a default-free shape. |
| 3 | Add insights endpoints (stats by country/department/job title, distribution, top/bottom earners) | Chose SQL window functions for median over loading rows in JS. Reused the filter chain instead of duplicating it. Rewrote a muddled test the AI produced (odd-count median) into two clear ones. Verified numbers on the seeded 10k data. |
