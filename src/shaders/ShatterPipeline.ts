import Phaser from 'phaser';

export class ShatterPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
    private time: number;

    constructor(game: Phaser.Game) {
        super({
            game: game,
            fragShader: `
            precision mediump float;

            uniform float uTime;
            uniform sampler2D uMainSampler;
            varying vec2 outTexCoord;

            // fixed voronoi seeds. tweak or add more for complexity
            const int SEED_COUNT = 4;
            vec2 seeds[SEED_COUNT];

            void initSeeds() {
                seeds[0] = vec2(0.2, 0.3);
                seeds[1] = vec2(0.7, 0.25);
                seeds[2] = vec2(0.4, 0.7);
                seeds[3] = vec2(0.8, 0.8);
            }

            // find nearest seed => determines shard id and dist to boundary
            // returns (dist to closest seed, shard index)
            vec3 findShard(vec2 uv) {
                float minDist = 10.0;
                int shardId = 0;
                for (int i=0; i<SEED_COUNT; i++) {
                    float d = distance(uv, seeds[i]);
                    if (d < minDist) {
                        minDist = d;
                        shardId = i;
                    }
                }
                return vec3(minDist, float(shardId), 0.0);
            }

            // to show cracks between shards, we can also find the second-closest seed
            // and measure how close we are to that boundary
            float secondClosestDist(vec2 uv, int closestId) {
                float dist1 = 10.0;
                for (int i=0; i<SEED_COUNT; i++) {
                    if (i == closestId) continue;
                    float d = distance(uv, seeds[i]);
                    if (d < dist1) {
                        dist1 = d;
                    }
                }
                return dist1;
            }

            // get a stable pseudo-random vec2 from shard id
            vec2 shardRand(int id) {
                float f = float(id)*54.13;
                return vec2(fract(sin(f*12.9898)*43758.5453), fract(sin(f*93.233)*43758.5453));
            }

            void main(void) {
                initSeeds();
                vec2 uv = outTexCoord;
                
                // find shard
                vec3 shardData = findShard(uv);
                float closestDist = shardData.x;
                int shardId = int(shardData.y);
                
                float scDist = secondClosestDist(uv, shardId);
                // distance between closest and second-closest seed
                float edgeGap = scDist - closestDist;
                
                // as time passes, each shard shifts its uv coords outward
                vec2 randVec = shardRand(shardId)*2.0 - 1.0; // random direction
                float separation = uTime * 0.5; // how far shards move
                vec2 shardOffset = randVec * separation;

                // offset uv by shard offset
                vec2 shatteredUV = uv + shardOffset;

                vec4 baseColor = texture2D(uMainSampler, shatteredUV);

                // fade out near cracks
                // if edgeGap is small, we are near boundary => fade out or darken
                float crackFactor = smoothstep(0.0, 0.02, edgeGap); 
                // crackFactor=0 means pixel lies on or near the boundary line
                // we can fade out alpha near boundary as shards separate
                float finalAlpha = baseColor.a * crackFactor;
                
                // maybe darken edges slightly
                vec3 finalColor = mix(baseColor.rgb, vec3(0.0), 1.0 - crackFactor);
                
                gl_FragColor = vec4(finalColor, finalAlpha);
            }`
        });
        this.time = 0;
    }

    public setShatterTime(t: number) {
        this.time = t;
        this.set1f('uTime', this.time);
    }
}
