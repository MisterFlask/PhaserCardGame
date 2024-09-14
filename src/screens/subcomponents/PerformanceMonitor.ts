// src/utils/PerformanceMonitor.ts

import Phaser from 'phaser';

class PerformanceMonitor {
    private scene: Phaser.Scene;
    private lastPerformanceLog: number = 0;
    private frameCount: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public update(time: number, delta: number): void {
        this.frameCount++;

        if (time - this.lastPerformanceLog >= 1000) {
            const fps = Math.round(this.frameCount / ((time - this.lastPerformanceLog) / 1000));
            const memory = (performance as any).memory ?
                Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024)) :
                'N/A';

            console.debug(`Performance: FPS: ${fps}, Memory: ${memory} MB`);

            this.lastPerformanceLog = time;
            this.frameCount = 0;
        }

        // Implement additional update logic if needed
    }
}

export default PerformanceMonitor;
