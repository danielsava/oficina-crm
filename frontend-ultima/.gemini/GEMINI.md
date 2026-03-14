
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Styling & Theming (Ultima & PrimeNG)

- **Semantic Colors**: Use PrimeNG semantic color presets configured in `app.config.ts` (e.g., `primary`) and rely on Tailwind's utility classes (e.g., `bg-primary-500`, `text-surface-500`) instead of hardcoding HEX values.
- **Tailwind Integration**: Use the `tailwindcss-primeui` plugin classes. Avoid writing custom CSS rules in `.scss` files unless strictly necessary for animations or complex overrides not supported by Tailwind.
- **Component Styling**: For PrimeNG components, use Tailwind utility classes directly via the `styleClass` or `class` property.
- **Dark Mode Compatibility**: Ensure all custom Tailwind classes support dark mode using the `dark:` variant (e.g., `bg-surface-0 dark:bg-surface-900`), respecting the `app-dark` selector defined in the layout configuration.

## PrimeNG & Layout Integration

- **PrimeNG Components**: Always prefer using PrimeNG components (e.g., `p-button`, `p-card`, `p-table`) over building custom ones from scratch, to maintain visual consistency and accessibility.
- **Form Controls**: Use PrimeNG form inputs (`p-inputtext`, `p-dropdown`, `p-checkbox`) seamlessly integrated with Angular Reactive Forms (`formControlName`).
- **Icons**: Exclusively use `primeicons` (`pi pi-icon-name`) instead of importing external icon libraries (like FontAwesome) unless specifically requested.
- **Template Layout**: When creating new full pages, ensure they respect the template's routing structure and are placed appropriately within `src/app/pages/` or the relevant feature directories. Any new global layout components must reside in `src/app/layout/`.


## Domain Module Structure & Naming Conventions

When generating or refactoring domain components inside \src/app/pages/\ (e.g., a \cliente\ module), strictly follow this scaffolding and naming convention:

- **Folder Hierarchy**:
  - \pages/{domain}/list/\: Contains the main data presentation component. File: \{domain}-table.component.ts\.
  - \pages/{domain}/edit/\: Contains the creation/edition form component. File: \{domain}-form.component.ts\.
  - \pages/{domain}/{domain}.service.ts\: The Angular Service responsible for API communication (Quarkus).
  - \pages/{domain}/{domain}.routes.ts\: The lazy-loaded route definitions for this domain.

- **Class Naming**:
  - Table Component: \{Domain}TableComponent\ (e.g., \ClienteTableComponent\)
  - Form Component: \{Domain}FormComponent\ (e.g., \ClienteFormComponent\)
  - Service: \{Domain}Service\ (e.g., \ClienteService\)
  - Routes: \{Domain}Route\ (e.g., exported as export const ClienteRoute: Routes = []\)
