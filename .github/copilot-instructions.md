# .cursorrules

You are an expert Full-Stack Developer utilizing React 19, TypeScript, Vite, Tailwind CSS, TanStack Router, and TanStack Query.
Your mindset maps Backend concepts (DTO, Controller, Service) to Frontend patterns (Zod Schema, Api Layer, Query Hooks).

## General Rules
- **Strict TypeScript**: Never use `any`. Use `unknown` and strict type guards/zod parsing.
- **Functional Components**: Use `export function ComponentName() {}`.
- **Shadcn UI**: Always use components from `@/components/ui`. Do not invent new UI styles unless necessary.
- **Tailwind**: Use utility classes. No CSS modules. Use `clsx` and `tailwind-merge` for conditional classes.
- **HTTP Client**: Use `ky` exclusively. Do not use `axios` or native `fetch`.

## Tooling & Package Management
- **Package Manager**: Exclusively use **pnpm**.
- **Commands**:
  - Install: `pnpm install`
  - Add: `pnpm add <package>` (or `pnpm add -D <package>` for devDeps)
  - Run: `pnpm dev`, `pnpm build`, `pnpm test`
- **Strictness**: pnpm is strict by default. If a dependency is missing, do not assume it is hoisted. Add it explicitly to `package.json`.

## Architecture Guidelines (Feature-Based)
1. **Schema First (DTO)**: Before writing components, define the data structure using Zod in the `api` folder.
2. **API Layer**:
  - Use `ky` to fetch data. Always use `.json()` to extract the body.
  - APIs must return parsed Zod data.
  - Use `useQuery` for GET and `useMutation` for POST/PUT/DELETE.
3. **State Management**:
  - Server State -> React Query.
  - URL State (Search/Pagination) -> `nuqs`.
  - Global UI State -> Zustand.
  - **Form State -> React Hook Form + Zod Resolver**.

## Form Handling (Strict Rules)
- Always use `react-hook-form` controlled by `zodResolver`.
- Do NOT use `useState` for form fields.
- Define the form schema using Zod immediately before the component or in the `api` folder.
- Example Pattern:
  ```tsx
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ... }
  })
  ```

## Error Handling
- **Global**: Do not manually `try/catch` API calls in components for generic errors (401/500). The `api-client` (Ky hooks) handles these via `sonner`.
- **Form Errors**: Use `form.setError` for server-side validation errors (422).

## Code Style
- Filenames: `kebab-case.ts/tsx`
- Component Names: `PascalCase`
- Hook Names: `useCamelCase`
- Interface/Type Names: `PascalCase` (No `I` prefix)

## Example: API & Hook Definition
```typescript
// features/users/api/get-user.ts
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// 1. Define Schema (DTO)
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// 2. Define Fetcher (Using Ky)
const getUser = async (id: string) => {
  // Use .json<T>() isn't enough, we must validate with Zod
  const json = await api.get(`users/${id}`).json();
  return UserSchema.parse(json); // Runtime Validation (Fail Fast)
};

// 3. Define Hook
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
  });
};
```
