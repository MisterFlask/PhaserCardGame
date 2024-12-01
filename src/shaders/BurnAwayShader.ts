
const fragShader = `
#define PRECISION mediump
precision PRECISION float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D uMainSampler;
uniform float progress;

// Simplex 2D noise from the FireShader
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
            -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 texture = texture2D(uMainSampler, uv);
    
    // Create burning edge effect
    float noise = snoise(vec2(uv.x * 5.0 + time * 2.0, uv.y * 5.0)) * 0.1;
    float burnLine = 1.0 - progress + noise;
    
    // Add some vertical noise to the burn line
    float verticalNoise = snoise(vec2(uv.x * 3.0, time * 3.0)) * 0.15;
    burnLine += verticalNoise;
    
    // Create embers effect
    float embers = max(0.0, snoise(vec2(uv.x * 8.0 + time, uv.y * 8.0 - time * 2.0)));
    embers = pow(embers, 3.0) * step(burnLine - 0.1, uv.y);
    
    // Fire colors
    vec3 fireColor = vec3(1.0, 0.5, 0.1);
    vec3 emberColor = vec3(1.0, 0.9, 0.3);
    
    // Calculate alpha for dissolve effect
    float alpha = smoothstep(burnLine - 0.05, burnLine + 0.05, uv.y);
    
    // Add fire edge
    float fireEdge = smoothstep(burnLine - 0.1, burnLine, uv.y) * 
                     (1.0 - smoothstep(burnLine, burnLine + 0.1, uv.y));
    
    // Combine effects
    vec3 finalColor = texture.rgb * alpha;
    finalColor += fireColor * fireEdge * 0.8;
    finalColor += emberColor * embers * 0.5;
    
    gl_FragColor = vec4(finalColor, texture.a * alpha);
}
`;
