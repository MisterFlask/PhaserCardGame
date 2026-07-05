import Phaser from 'phaser';

/**
 * Phaser's LoaderPlugin refills its download queue from the game step, which
 * runs on requestAnimationFrame. In a hidden/background tab rAF is suspended,
 * so the loader dispatches its first maxParallelDownloads files and then
 * stalls forever. setInterval still ticks in hidden tabs (throttled to ~1Hz),
 * so this watchdog kicks the queue whenever the frame-driven update can't.
 */
export function installLoaderWatchdog(scene: Phaser.Scene): void {
    const loader = scene.load;
    const interval = setInterval(() => {
        if (loader.state === Phaser.Loader.LOADER_LOADING
            && loader.list.size > 0
            && loader.inflight.size < loader.maxParallelDownloads) {
            (loader as any).checkLoadQueue();
        }
    }, 250);

    const stop = () => clearInterval(interval);
    loader.once(Phaser.Loader.Events.COMPLETE, stop);
    scene.events.once('shutdown', stop);
    scene.events.once('destroy', stop);
}
