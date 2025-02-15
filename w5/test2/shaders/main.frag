#version 300 es

precision highp float;

out vec4 outColor;

uniform float u_palette[12];
uniform int u_i;

void main(){
    outColor = vec4(
        u_palette[u_i * 4],
        u_palette[u_i * 4 + 1],
        u_palette[u_i * 4 + 2],
        u_palette[u_i * 4 + 3]
    );
}