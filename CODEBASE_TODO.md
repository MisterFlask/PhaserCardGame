# Codebase Improvement TODO

This document outlines recommended improvements for the Phaser Card Game codebase, organized by priority and effort level.

---

## High Priority

### Architecture & Code Organization

- [ ] **Reduce ActionManager complexity** (`src/rules/ActionManager.ts` - 1,243 lines)
  - Split into multiple files by responsibility: game actions, UI actions, state management
  - Use event emitters for cross-component communication
  - Target: 400-500 lines per file

- [ ] **Refactor PhysicalCard** (`src/ui/PhysicalCard.ts` - 932 lines)
  - Separate UI rendering from game data logic
  - Extract visual components into smaller focused classes
  - Create clear boundary between display and data

- [ ] **Replace singleton pattern with dependency injection**
  - Affected classes: GameState, ActionManager, CombatStateService, EventsManager, and 10+ others
  - Consider InversifyJS or lightweight alternative
  - Convert singletons to scoped services
  - Pass dependencies explicitly to constructors

- [ ] **Separate UI/Logic coupling**
  - ActionManager is tightly coupled to Scene
  - Create a "headless" game logic module that can run without Phaser
  - Use dependency injection for rendering layer

### Type Safety

- [ ] **Eliminate `as any` type assertions** (170+ instances)
  - Create proper generic base classes instead of `any` casts
  - Implement factory pattern for buff creation
  - Add runtime type checking for critical paths
  - Key files: `AbstractCard.ts`, `AbstractBuff.ts`, various utilities

### Error Handling

- [ ] **Add comprehensive error handling** (only 28/615 files have try-catch)
  - Add try-catch around action execution
  - Implement error reporting service
  - Add validation at domain boundaries
  - Prevent silent failures

### Testing

- [ ] **Set up testing infrastructure**
  - Add Jest or Vitest configuration
  - Only 1 test file exists: `StrategicProjectTechTree.test.ts`

- [ ] **Write unit tests for core game logic**
  - Card effects and interactions
  - Buff calculations and stacking
  - Combat rules and state transitions
  - Target: 70%+ coverage for game logic

---

## Medium Priority

### Build & Configuration

- [ ] **Configure TypeScript path aliases** in `tsconfig.json`
  ```json
  {
    "baseUrl": "./",
    "paths": {
      "@gamecharacters/*": ["src/gamecharacters/*"],
      "@rules/*": ["src/rules/*"],
      "@ui/*": ["src/ui/*"],
      "@encounters/*": ["src/encounters/*"]
    }
  }
  ```

- [ ] **Add production build configuration**
  - Currently only development mode (unminified)
  - Add minification, tree-shaking, code splitting

- [ ] **Set up linting and formatting**
  - Add ESLint configuration
  - Add Prettier configuration
  - Add pre-commit hooks

### Documentation

- [ ] **Add JSDoc comments to public methods**
  - Inconsistent documentation across codebase
  - Focus on: ActionManager, AbstractBuff, AbstractCard, combat rules

- [ ] **Create architecture documentation**
  - Architecture overview diagram
  - How to add new cards/relics guide
  - Action queue flow documentation
  - UI component hierarchy

### Code Quality

- [ ] **Complete TODO comments in code**
  - `src/gamecharacters/persona/Huntsman.ts`: "TODO: IMPLEMENT" for Hunting Trophy
  - `src/screens/hud/MapOverlay.ts`: "TODO: Implement actual mission status logic"
  - Search for other incomplete implementations

- [ ] **Reduce complexity in large manager classes**
  - `CombatUIManager.ts` (792 lines)
  - `LocationManager.ts` (879 lines)
  - `AbstractIntent.ts` (600 lines)

---

## Low Priority

### Code Cleanup

- [ ] **Remove debug console.log statements** (314 instances)
  - Keep logs in test files
  - Remove from: consumables, encounters, GameState
  - Implement proper logging framework with log levels

- [ ] **Standardize export patterns**
  - Some files use default exports, others named exports
  - Pick one pattern and enforce consistently

- [ ] **Clean up import organization**
  - 1,645 relative imports going up directories
  - Use absolute imports with path aliases once configured

### Performance

- [ ] **Add object pooling for frequently-created objects**
  - Cards, buffs, visual effects

- [ ] **Verify memory cleanup in scenes**
  - Check Phaser listener cleanup
  - Verify event unsubscription on scene transitions

- [ ] **Add performance profiling before release**
  - Monitor memory usage during long play sessions
  - Profile action queue performance

### Developer Experience

- [ ] **Add environment configuration**
  - Set up .env file handling
  - Secure API key management (OpenAI integration)

- [ ] **Set up conventional commits**
  - Format: feat/fix/refactor/docs/test
  - Add commit message linting

- [ ] **Add pre-commit hooks**
  - Run linting
  - Run type checking
  - Run tests

---

## Future Considerations

### Accessibility
- [ ] Add keyboard navigation support
- [ ] Add ARIA labels for screen readers
- [ ] Add high-contrast mode option

### Localization
- [ ] Externalize all user-facing strings
- [ ] Set up i18n framework
- [ ] Support multiple languages

### Analytics
- [ ] Add telemetry for player behavior
- [ ] Track game balance metrics
- [ ] Monitor error rates in production

---

## Files Requiring Most Attention

| File | Lines | Issues |
|------|-------|--------|
| `src/rules/ActionManager.ts` | 1,243 | Orchestration complexity, needs splitting |
| `src/ui/PhysicalCard.ts` | 932 | Mixed UI/logic, needs separation |
| `src/maplogic/LocationManager.ts` | 879 | Large file, needs review |
| `src/screens/subcomponents/CombatUIManager.ts` | 792 | UI state complexity |
| `src/screens/hud/MapOverlay.ts` | 782 | Large UI component |
| `src/gamecharacters/AbstractIntent.ts` | 600 | Consider splitting by intent type |
| `src/gamecharacters/buffs/AbstractBuff.ts` | 540 | `any` type usage |

---

## Estimated Effort

| Category | Effort | Impact |
|----------|--------|--------|
| Singleton → DI refactor | High | High |
| ActionManager split | High | High |
| Test infrastructure | Medium | High |
| Type safety fixes | Medium | Medium |
| Error handling | Medium | Medium |
| Documentation | Medium | Low-Medium |
| Console.log cleanup | Low | Low |
| Linting setup | Low | Medium |

**Total estimated effort**: 80-120 developer hours for all improvements

---

## Quick Wins (Can be done in 1-2 days)

1. Add ESLint + Prettier configuration
2. Set up proper logging framework
3. Clean up console.log statements
4. Add tsconfig paths for cleaner imports
5. Fix the 6 documented TODO comments in code
