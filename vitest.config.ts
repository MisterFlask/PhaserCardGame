import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Only the real source tree. Without this, vitest's default globs
        // also sweep .claude/worktrees/<agent-worktree>/src/**, running every
        // test twice whenever an agent worktree is left behind (they persist
        // if they hold uncommitted changes).
        include: ['src/**/*.test.ts'],
    },
});
