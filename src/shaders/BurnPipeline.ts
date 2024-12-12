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

            // cheap hash-based pseudo-noise
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
            }

            float noise(in vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                vec2 u = f*f*(3.0-2.0*f);
                return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
            }

            void main(void) {
                vec4 baseColor = texture2D(uMainSampler, outTexCoord);
                float burnAmount = clamp(uTime, 0.0, 1.0);

                // scale coords for noise
                vec2 uv = outTexCoord * 5.0;
                float n = noise(uv + uTime*2.0);

                // define a burn threshold that moves with time
                // pixels above threshold get charred/burned away
                float threshold = burnAmount * 1.3 - n*0.5;

                // if pixel passes threshold, we show char; else normal
                // char color
                vec3 charColor = vec3(0.1, 0.05, 0.0);

                // ember color near edge
                vec3 emberColor = mix(vec3(1.0,0.5,0.0), charColor, 0.5);

                float distFactor = step(threshold, 0.5); // just a reference point

                // create a smooth mask for transition
                float edgeFactor = smoothstep(threshold-0.05, threshold+0.05, 0.5);

                // final color
                vec3 finalColor = mix(baseColor.rgb, emberColor, edgeFactor);
                finalColor = mix(finalColor, charColor, step(0.5, threshold));

                // fade alpha where burned
                float finalAlpha = mix(baseColor.a, 0.0, step(0.5, threshold));

                gl_FragColor = vec4(finalColor, finalAlpha);
            }`
        });
        this.time = 0;
    }

    public setBurnTime(t: number) {
        this.time = t;
        this.set1f('uTime', this.time);
    }
}
