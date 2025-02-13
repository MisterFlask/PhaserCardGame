import Phaser from 'phaser';
import { BurnPipeline } from './BurnPipeline';

export class BurnEffect {
    private pipeline: BurnPipeline;
    private scene: Phaser.Scene;
    private burnTime: number;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.pipeline = new BurnPipeline(scene.game);
        // no addPipeline on renderer. must cast to webglrenderer and use pipelines.add
        const glRenderer = this.scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        glRenderer.pipelines.add('BurnPipeline', this.pipeline);
        this.burnTime = 0;
    }

    public setBurnAmount(amount: number) {
        this.burnTime = Phaser.Math.Clamp(amount, 0, 1);
        this.pipeline.setBurnTime(this.burnTime);
    }

    public apply(container: Phaser.GameObjects.Container) {
        this.applyTo(container);
    }

    private applyTo(obj: Phaser.GameObjects.GameObject) {
        if ('setPipeline' in obj && typeof (obj as any).setPipeline === 'function') {
            (obj as any).setPipeline('BurnPipeline');
        }

        if (obj instanceof Phaser.GameObjects.Container) {
            for (const child of obj.getAll()) {
                this.applyTo(child);
            }
        }
    }

    public destroy(){
        // Commented out to avoid removing the pipeline for other burn effects still running:
        // const glRenderer = this.scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        // glRenderer.pipelines.remove('BurnPipeline');
    }
}
