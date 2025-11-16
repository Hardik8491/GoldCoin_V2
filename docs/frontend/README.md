# Frontend Documentation

## Structure

The frontend application is built with Next.js 16 and follows a feature-based architecture.

### Directory Organization

```
src/
├── app/              Next.js app directory (routes)
├── components/       Reusable UI components
│   ├── ui/          shadcn/ui components
│   └── ...          Feature components
├── features/         Feature modules
│   ├── onboarding/  Onboarding flow
│   ├── auth/        Authentication
│   ├── expenses/    Expense management
│   └── ...          Other features
├── services/         API client services
├── types/            TypeScript definitions
├── utils/            Helper functions
├── providers/        React context providers
├── hooks/            Custom React hooks
├── lib/              Third-party utilities
└── store/            Global state management
```

## Service Layer

All API communication is handled through dedicated service classes:

**api.service.ts** - Base HTTP client with authentication  
**auth.service.ts** - User authentication operations  
**user.service.ts** - User profile management  
**expense.service.ts** - Expense CRUD operations  
**budget.service.ts** - Budget management  
**prediction.service.ts** - Spending predictions  
**ai.service.ts** - AI chat and recommendations  
**onboarding.service.ts** - Onboarding API operations  
**storage.service.ts** - Local storage wrapper  

### Usage Example

```typescript
import { expenseService } from '@/services';

// Fetch expenses
const expenses = await expenseService.getExpenses();

// Create expense
const newExpense = await expenseService.createExpense({
  amount: 50.00,
  category: 'food',
  description: 'Lunch'
});
```

## Type Definitions

All data structures are TypeScript-typed for type safety:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  month: string;
}
```

## Utilities

Common helper functions:

**formatCurrency(amount)** - Format numbers as currency  
**formatDate(date, format)** - Format dates  
**cn(...classes)** - Merge Tailwind classes  
**debounce(fn, delay)** - Debounce function calls  

## State Management

**Zustand** - For feature-specific state (onboarding):
```typescript
import { useOnboardingStore } from '@/features/onboarding/store/use-onboarding-store';

function Component() {
  const { step, profile, setStep } = useOnboardingStore();
  // ...
}
```

**React Context** - For global state (authentication):
```typescript
import { useAuth } from '@/providers/auth-provider';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
}
```

## Authentication

User authentication is handled through the AuthProvider:

```typescript
import { useAuth } from '@/providers';

function Component() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    await login({ email, password });
  };
  
  return isAuthenticated ? <Dashboard /> : <Login />;
}
```

## Styling

The app uses Tailwind CSS with the Shadcn UI component library. Components are located in `src/components/ui/`.

### Custom Components

Build custom components using Shadcn:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

## Forms

Forms use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
});

function ExpenseForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    await expenseService.createExpense(data);
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

## Environment Variables

Configure in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Access in code:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm test         # Run tests
```

## Best Practices

1. **Use the service layer** for all API calls
2. **Type everything** with TypeScript
3. **Keep components small** and focused
4. **Use hooks** for reusable logic
5. **Follow the feature structure** for new pages
6. **Write tests** for critical functionality

## Pages & Routes

The application includes the following pages:

- `/` - Landing page
- `/auth/login` - User login
- `/auth/signup` - User registration
- `/onboarding` - 6-step onboarding flow (protected)
- `/dashboard` - Main dashboard with overview (protected)
- `/expenses` - Expense management (protected)
- `/analytics` - Spending analytics and charts (protected)
- `/predictions` - AI-powered spending predictions (protected)
- `/advisor` - AI financial advisor chat (protected)
- `/settings` - User settings and preferences (protected)

## Onboarding System

The onboarding system guides new users through setup:

1. **Step 1: Welcome** - Introduction to features
2. **Step 2: Profile** - Name, currency, theme preferences
3. **Step 3: Financial** - Current savings, monthly income, recurring expenses
4. **Step 4: Budget** - Category-wise budget limits
5. **Step 5: Goals** - Financial goals (optional)
6. **Step 6: Review** - Summary and completion

Components are located in `src/features/onboarding/components/`

## Adding New Features

1. Create a new directory in `src/features/`
2. Add components, hooks, and types within that feature
3. Create a service if it requires API calls
4. Add routes in `app/` directory
5. Update TypeScript types in `src/types/`

Example structure for a new "Reports" feature:

```
src/
├── features/reports/
│   ├── components/
│   │   └── ReportCard.tsx
│   ├── hooks/
│   │   └── useReports.ts
│   └── store/
│       └── use-reports-store.ts
app/
└── reports/
    └── page.tsx
src/
├── services/
│   └── report.service.ts
└── types/
    └── index.ts  (add Report interface)
```
