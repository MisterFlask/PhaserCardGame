import Phaser from 'phaser';

export class BurnPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
    private time: number;

    constructor(game: Phaser.Game) {
        super({
            game: game,
            fragShader: `
            precision mediump float;

            uniform float uTime;
            uniform sampler2D uMainSampler;
            varying vec2 outTexCoord;

            void main(void) {
                vec4 color = texture2D(uMainSampler, outTexCoord);
                float burnAmount = clamp(uTime, 0.0, 1.0);
                float intensity = 1.0 - burnAmount;
                color.rgb = mix(color.rgb, vec3(0.1,0.05,0.0), burnAmount);
                color.a *= intensity;
                gl_FragColor = color;
            }`
        });
        this.time = 0;
    }

    public setBurnTime(t: number) {
        this.time = t;
        // 'setFloat1' no longer exists; for uniforms use set1f:
        this.set1f('uTime', this.time);
    }
}
