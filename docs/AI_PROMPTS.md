# AI usage log

Tool: Claude Code. This file records the key prompts and how I validated or changed the output.

| # | Prompt / intent | What I kept / changed |
|---|---|---|
| 1 | Plan the assessment and scope the requirements | Kept scope; trimmed extras to fit time |
| 2 | Build employee CRUD + list API following SOLID and design patterns; document them | Kept Repository/Unit of Work/DI layering. Tests exposed a Zod 4 `.partial()` default bug (PATCH reset status); fixed by building the PATCH schema from a default-free shape. |
| 3 | Add insights endpoints (stats by country/department/job title, distribution, top/bottom earners) | Chose SQL window functions for median over loading rows in JS. Reused the filter chain instead of duplicating it. Rewrote a muddled test the AI produced (odd-count median) into two clear ones. Verified numbers on the seeded 10k data. |
| 4 | Build the app shell and employees table (MUI, react-query) | Added a `/facets` endpoint so filter dropdowns use real values. MUI 9 removed system props (`fontWeight`), fixed via `sx`. Caught a UI bug by screenshotting the running app: spreading `params` into the filter object made "Clear filters" always visible; fixed and covered by a test. |
| 5 | Build the Insights dashboard following a data-viz guide | Single-series charts: one hue, no legend, thin rounded bars, value at tip, hover tooltips, and a Table view toggle as the accessible alternative. Verified by screenshotting against the real 10k data (US median $84.8K matches the API). Did not unit-test recharts in jsdom (needs real layout); tested the table/card components instead. |
