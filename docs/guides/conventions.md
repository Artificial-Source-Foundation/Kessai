# Code Conventions

## Document Context
This guide defines coding standards for the Subby project.

---

## TypeScript

### Naming
- **Files**: kebab-case (`subscription-card.tsx`)
- **Components**: PascalCase (`SubscriptionCard`)
- **Functions/hooks**: camelCase (`useSubscriptions`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_CURRENCY`)
- **Types**: PascalCase, no `I` prefix (`Subscription`, not `ISubscription`)

### Types
- Prefer `type` over `interface` for object shapes
- Export types from dedicated `types/` files
- Use Zod for runtime validation, infer types from schemas

```typescript
import { z } from 'zod'

export const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
})

export type Subscription = z.infer<typeof subscriptionSchema>
```

---

## React

### Component Structure
```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Subscription } from '@/types/subscription'

type SubscriptionCardProps = {
  subscription: Subscription
  onEdit: (id: string) => void
}

export function SubscriptionCard({ subscription, onEdit }: SubscriptionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleEdit = () => onEdit(subscription.id)
  
  return (
    <div>
      {/* content */}
    </div>
  )
}
```

### Hooks
- Custom hooks go in `hooks/` directory
- Prefix with `use`
- Return object for multiple values

---

## Styling (Tailwind)

### Class Order
1. Layout (display, position)
2. Sizing (width, height)
3. Spacing (margin, padding)
4. Background
5. Border
6. Typography
7. Effects (shadow, opacity)
8. Transitions

```tsx
<div className="flex items-center w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm shadow-lg transition-all">
```

### Custom Classes
Use `@layer components` in globals.css:

```css
@layer components {
  .glass-card {
    @apply bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg;
  }
}
```

---

## State Management (Zustand)

```typescript
import { create } from 'zustand'

type SubscriptionState = {
  subscriptions: Subscription[]
  isLoading: boolean
  fetch: () => Promise<void>
  add: (sub: NewSubscription) => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  fetch: async () => { /* ... */ },
  add: async (sub) => { /* ... */ },
}))
```

---

## Git Conventions

### Commit Messages
```
type(scope): description

feat(subscriptions): add edit functionality
fix(dashboard): correct total calculation
style(ui): update glass card opacity
docs(readme): add setup instructions
```

### Branches
- `main` — stable, release-ready
- `feat/feature-name` — feature branches
- `fix/issue-description` — bug fixes
