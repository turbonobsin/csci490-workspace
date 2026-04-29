#version 300 es

precision highp float;

uniform vec2 u_res;
out vec4 outColor;

void main(){
    // outColor = vec4(1,0,0.5,1);
    outColor = vec4(fract(gl_FragCoord.xy / u_res),0,1);
}