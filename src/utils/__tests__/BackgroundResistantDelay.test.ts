import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('backgroundResistantDelay (fallback path, no Worker global)', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubGlobal('Worker', undefined);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('resolves via plain setTimeout when Worker is unavailable', async () => {
        vi.useFakeTimers();
        const { backgroundResistantDelay } = await import('../BackgroundResistantDelay');

        let resolved = false;
        const promise = backgroundResistantDelay(10).then(() => { resolved = true; });

        await vi.advanceTimersByTimeAsync(10);
        await promise;

        expect(resolved).toBe(true);
        vi.useRealTimers();
    });

    it('reports it is not using worker delays', async () => {
        const { backgroundResistantDelay, _isUsingWorkerDelays } = await import('../BackgroundResistantDelay');
        await backgroundResistantDelay(1);
        expect(_isUsingWorkerDelays()).toBe(false);
    });
});

describe('backgroundResistantDelay (worker path)', () => {
    class MockWorker {
        public onmessage: ((event: { data: number }) => void) | null = null;
        public posted: Array<{ id: number; ms: number }> = [];
        postMessage(data: { id: number; ms: number }) {
            this.posted.push(data);
        }
        terminate() {}
    }

    let lastWorkerInstance: MockWorker | null = null;

    let originalCreateObjectURL: typeof URL.createObjectURL | undefined;

    beforeEach(() => {
        vi.resetModules();
        lastWorkerInstance = null;
        vi.stubGlobal('Worker', class extends MockWorker {
            constructor() {
                super();
                lastWorkerInstance = this;
            }
        });
        originalCreateObjectURL = (URL as any).createObjectURL;
        (URL as any).createObjectURL = vi.fn(() => 'blob:mock');
        vi.stubGlobal('Blob', class { constructor(_parts: unknown[], _opts: unknown) {} });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        (URL as any).createObjectURL = originalCreateObjectURL;
    });

    it('resolves when the mock worker posts back the matching id', async () => {
        const { backgroundResistantDelay, _isUsingWorkerDelays } = await import('../BackgroundResistantDelay');

        let resolved = false;
        const promise = backgroundResistantDelay(25).then(() => { resolved = true; });

        expect(_isUsingWorkerDelays()).toBe(true);
        expect(lastWorkerInstance).not.toBeNull();
        const worker = lastWorkerInstance!;
        expect(worker.posted).toHaveLength(1);
        expect(worker.posted[0].ms).toBe(25);

        expect(resolved).toBe(false);
        worker.onmessage!({ data: worker.posted[0].id });
        await promise;

        expect(resolved).toBe(true);
    });

    it('routes concurrent delays to the correct caller by id', async () => {
        const { backgroundResistantDelay } = await import('../BackgroundResistantDelay');

        const order: string[] = [];
        const first = backgroundResistantDelay(100).then(() => order.push('first'));
        const second = backgroundResistantDelay(5).then(() => order.push('second'));

        const worker = lastWorkerInstance!;
        expect(worker.posted).toHaveLength(2);

        const [firstMsg, secondMsg] = worker.posted;

        // Resolve the second-scheduled delay first to prove routing is by id,
        // not by call order.
        worker.onmessage!({ data: secondMsg.id });
        await second;
        expect(order).toEqual(['second']);

        worker.onmessage!({ data: firstMsg.id });
        await first;
        expect(order).toEqual(['second', 'first']);
    });

    it('falls back to setTimeout when Worker construction throws', async () => {
        vi.resetModules();
        vi.stubGlobal('Worker', class {
            constructor() {
                throw new Error('construction not allowed (e.g. strict CSP)');
            }
        });
        (URL as any).createObjectURL = vi.fn(() => 'blob:mock');
        vi.stubGlobal('Blob', class { constructor(_parts: unknown[], _opts: unknown) {} });

        vi.useFakeTimers();
        const { backgroundResistantDelay, _isUsingWorkerDelays } = await import('../BackgroundResistantDelay');

        let resolved = false;
        const promise = backgroundResistantDelay(10).then(() => { resolved = true; });

        await vi.advanceTimersByTimeAsync(10);
        await promise;

        expect(resolved).toBe(true);
        expect(_isUsingWorkerDelays()).toBe(false);
        vi.useRealTimers();
    });
});
