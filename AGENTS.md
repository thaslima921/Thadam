You are building Thadam TN, an Android-first Expo app that must also run on web for the demo.
Read docs/SPEC.md, docs/DESIGN.md and docs/DATA.md before writing code.

RULES
1. Work one phase at a time. Do not start the next phase until the current one runs and its acceptance checks pass.
2. After every phase run: npx tsc --noEmit, the unit tests, and start the app (web is fine). Fix every error. Then report: what works, what you tested, known gaps.
3. The app must run with zero API keys. Every external service sits behind an interface in src/services with a demo implementation. Real providers are optional adapters.
4. No lorem ipsum, no TODO stubs, no buttons that do nothing. If a feature is not built yet, do not show its button.
5. All recommendation logic lives in src/engine as pure TypeScript functions with unit tests. Screens call the engine only through hooks.
6. Never invent real-world facts. Use only the places and experiences in docs/DATA.md. Show seeded values with the DataBadge component labelled DEMO.
7. Use only the design tokens in docs/DESIGN.md. Do not add colours, fonts or radii.
8. Keep each file under 250 lines. Strong types, no any.
9. If you must choose between more features and fewer working features, choose fewer working features.
10. Never expose secrets. Read keys only from environment variables.
