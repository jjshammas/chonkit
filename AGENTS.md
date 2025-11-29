# Repository Guidelines

## Project Structure & Module Organization

- Entry point in `src/index.ts` exports the public surface; keep exports minimal and documented.
- UI primitives live in `src/components` (Button, Box, Text, ScrollArea, etc.); shared logic and theming sit in `src/core` and `src/hooks`.
- Styling is split between CSS modules per component (e.g. `Button.module.css`) and shared tokens in `src/index.css`, `reset.css`, and `variables.css`; PostCSS handles nesting via `postcss-preset-chonkit`.
- Tests reside alongside utilities and components (see `src/components/**.test.ts`, `src/utils/**.test.ts`); snapshots are not currently used.
- Alias `@/` resolves to `src/`; prefer it over relative `../../` imports.

## Build, Test, and Development Commands

- `npm run dev`: start the Vite dev server.
- `npm run build`: produce the distributable package in `dist/` with types in `dist/types`.
- `npm run preview`: serve the production build locally.
- `npm run storybook` / `npm run build-storybook`: run or build the Storybook docs for components.
- `npm test` (or `npm test -- --coverage`): run Vitest; keep failures reproducible without watch mode in CI.

## Coding Style & Naming Conventions

- TypeScript, strict mode on; favor typed props/interfaces and avoid `any`.
- Functional React components with hooks; keep components small and reuse patterns from `core/themes` when adding variants.
- CSS modules named `Component.module.css`; use PostCSS nesting instead of long selectors and rely on the shared CSS variables before adding new ones.
- Use `clsx` for conditional classes; prefer descriptive prop names (`size`, `variant`, `tone`) over boolean flags.
- Tabs are used for indentation in this codebase; maintain that style and keep lines ≤ 100 characters.

## Testing Guidelines

- Vitest is the framework; mirror existing naming: `<unit>.test.ts` with `describe` blocks per feature.
- Cover edge cases for theming logic and generated styles (see `src/utils/svg/**.test.ts` and `src/components/Box/useShadow.test.ts` for patterns).
- Add regression tests when fixing bugs; prefer unit tests over integration where possible.

## Commit & Pull Request Guidelines

- Recent history favors short, imperative summaries (e.g., `add inner border support`); keep subjects under ~72 chars.
- Include a concise description of intent plus notable trade-offs in the PR body; link issues when available.
- For UI-affecting changes, add Storybook screenshots or notes on new props/variants.
- Keep commits cohesive (one feature/fix per commit) and ensure `npm test` + `npm run build` pass before requesting review.

## Security & Configuration Tips

- `postcss-preset-chonkit` is consumed via a local `file:` dependency; ensure the sibling package is installed or linked before running builds.
- Do not commit `.env` or secrets; Vite will expose `import.meta.env` only for variables prefixed appropriately—document any new env keys in the PR.
