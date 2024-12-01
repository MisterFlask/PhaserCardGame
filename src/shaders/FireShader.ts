
`
#define PRECISION mediump
precision PRECISION float;

uniform float time;
uniform vec2 resolution;

// Simplex 2D noise
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
    
    // Create base fire shape
    float y = 1.0 - uv.y;
    
    // Add noise-based movement
    float noise1 = snoise(vec2(uv.x * 4.0 + time * 0.5, uv.y * 4.0 + time * 0.5)) * 0.5;
    float noise2 = snoise(vec2(uv.x * 8.0 - time * 0.8, uv.y * 8.0 - time * 1.2)) * 0.25;
    
    // Combine noises
    float finalNoise = noise1 + noise2;
    
    // Create fire shape
    float fireShape = y + finalNoise * 0.6;
    fireShape = smoothstep(0.2, 0.8, fireShape);
    
    // Fire colors
    vec3 color1 = vec3(1.0, 0.3, 0.0); // Orange
    vec3 color2 = vec3(1.0, 0.1, 0.0); // Red
    vec3 color3 = vec3(1.0, 0.9, 0.0); // Yellow
    
    // Mix colors based on height and noise
    vec3 finalColor = mix(color2, color1, fireShape);
    finalColor = mix(finalColor, color3, pow(fireShape, 3.0) * 0.6);
    
    // Add flickering
    float flicker = sin(time * 10.0) * 0.05 + 0.95;
    
    // Output final color with alpha based on fire shape
    gl_FragColor = vec4(finalColor * flicker, fireShape);
}
`;