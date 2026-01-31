You are an expert Full-Stack Developer utilizing React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Router, and TanStack Query.
Your mindset maps Backend concepts (DTO, Controller, Service) to Frontend patterns (Zod Schema, Api Layer, Query Hooks).

## General Rules
- **Strict TypeScript**: Never use `any`. Use `unknown` and strict type guards/zod parsing.
- **Functional Components**: Use `export function ComponentName() {}`.
- **Shadcn UI**: Always use components from `@/components/ui`. Do not invent new UI styles unless necessary.
- **Tailwind**: Use utility classes (Tailwind 4). No CSS modules. Use `clsx` and `tailwind-merge` for conditional classes.
- **Themes & Styling**: ALWAYS use Shadcn's semantic variables (e.g., `bg-background`, `text-foreground`, `border-border`) or extended theme variables (e.g., `bg-success`, `text-info`).
  - **Zero Hardcoding**: Strictly forbid hardcoded hex, RGB, or named colors (e.g., `bg-white`, `text-blue-500`).
  - **Semantic States**: Use `Badge` variants for status colors. For custom components, map states to theme variables (e.g., `success`, `warning`).
  - **Spacing & Radius**: Use theme tokens like `rounded-lg` (via `--radius`) and standard Tailwind spacing. Do not use arbitrary values (e.g., `p-[13px]`).
  - **Consistent UI**: Prioritize existing patterns from `@/components/ui`. Do not invent new UI styles unless absolutely necessary.
- **HTTP Client**: Use `ky` exclusively. Do not use `axios` or native `fetch`.
- **Lint/Format**: Use Biome for linting and formatting. Indentation: Tabs. Quotes: Double quotes.
- **Visual Hierarchy & Borders**:
  - **Subtle Borders**: For internal borders (tables, lists, secondary dividers), ALWAYS use `border-border/50` or `divide-border/50` to reduce visual noise. Reserve full opacity borders for primary containers (Cards, Modals).
  - **Table Overflow**: Always wrap `Table` components in a `div` with `overflow-x-auto` to ensure responsiveness.

## Tooling & Package Management
- **Package Manager**: Exclusively use **pnpm**.
- **Commands**:
  - Dev: `pnpm dev`
  - Build: `pnpm build`
  - Test: `pnpm test` (Vitest + Testing Library + MSW)
  - Lint: `pnpm lint` (Biome)
  - Router: `pnpm routes:generate`
- **Strictness**: pnpm is strict. If a dependency is missing, add it explicitly to `package.json`.

## Architecture Guidelines (Feature-Based / DDD)
1. **Feature as Package**: Treat each feature in `src/features/` as an isolated unit.
  - **Colocation**: Keep API, types, components, hooks, and **mocks** within the feature directory.
  - **Mock Injection**: Mock code MUST be written in the feature's `api` or `mocks` directory using the `*.mock.ts` pattern and register themselves via the `mockRegistry`. Global `handlers.ts` is for auto-discovery only.
  - **Public API**: Export ONLY necessary items via `index.ts`. Other modules MUST import from `@/features/{name}`.
2. **Schema First (DTO)**: Define the data structure using Zod in the `api` folder before writing logic.
3. **API Layer**:
  - Use `ky` to fetch data. APIs MUST return parsed Zod data (Runtime Validation/Fail Fast).
  - Use `useQuery` for GET and `useMutation` for POST/PUT/DELETE.
4. **State Management**:
  - Server State -> TanStack Query.
  - URL State -> `nuqs`.
  - Global UI State -> Zustand.
  - Form State -> React Hook Form + Zod Resolver.
5. **Dependency Rules**:
  - Features → Lib; High-level features → Foundation features.
  - Infrastructure (`src/lib/`) should NOT depend on features.

## Directory Structure
- `src/app/`: Global config (providers, router tree).
- `src/features/{name}/`: Business logic (api, components, hooks, types, index.ts).
- `src/lib/`: Infrastructure (api-client, shared stores).
- `src/components/ui/`: Shared Shadcn components.
- `src/routes/`: File-based routing (TanStack Router).

## Form Handling & Error Handling
- **Forms**: Always use `react-hook-form` + `zodResolver`. No `useState` for form fields.
- **Global Errors**: Do not manually `try/catch` API calls in components for generic errors (401/500). Let `api-client` handle them.
- **Form Errors**: Use `form.setError` for server-side validation errors (422).

## Code Style
- Filenames: `kebab-case.ts/tsx`
- Component Names: `PascalCase`
- Hook Names: `useCamelCase`
- Interface/Type Names: `PascalCase` (No `I` prefix)
- Imports: Always use `@/` absolute aliases.

## Example: API & Hook Definition
```typescript
// features/users/api/get-user.ts
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api.get(`users/${id}`).json().then(UserSchema.parse),
  });
};
```
