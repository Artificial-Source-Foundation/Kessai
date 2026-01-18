# AGENTS.md

Instructions for AI agents working on this codebase.

## Project Context

**Subby** is a local-first desktop subscription tracker.

| Aspect   | Details                          |
| -------- | -------------------------------- |
| Type     | Desktop app (Tauri 2 + React 19) |
| Database | SQLite via tauri-plugin-sql      |
| Styling  | Tailwind CSS 4 + shadcn/ui       |
| State    | Zustand stores                   |

## Code Style

- **Components**: PascalCase, one component per file
- **Files**: kebab-case (`subscription-form.tsx`)
- **Imports**: Use `@/` path alias
- **Types**: Zod schemas → inferred TypeScript types

## Key Patterns

### Database Operations

```typescript
import { db } from '@/lib/database'
const results = await db.select<T[]>('SELECT * FROM table')
await db.execute('INSERT INTO table VALUES (?)', [value])
```

### Zustand Stores

```typescript
const { subscriptions, addSubscription } = useSubscriptionStore()
```

### Forms

```typescript
const form = useForm<SubscriptionFormData>({
  resolver: zodResolver(subscriptionFormSchema),
})
```

## File Locations

| What          | Where                       |
| ------------- | --------------------------- |
| Pages         | `src/pages/`                |
| Components    | `src/components/{feature}/` |
| UI primitives | `src/components/ui/`        |
| Stores        | `src/stores/`               |
| Types         | `src/types/`                |
| Utils         | `src/lib/`                  |
| Tests         | `src/**/__tests__/`         |

## Commands

```bash
pnpm tauri dev        # Run app
pnpm test             # Run tests
pnpm lint             # Lint code
pnpm vite build       # Build frontend
```

## Don'ts

- Don't use Framer Motion (removed for performance)
- Don't use backdrop-filter blur (causes lag)
- Don't suppress TypeScript errors with `as any`
- Don't add heavy animations on scroll containers
