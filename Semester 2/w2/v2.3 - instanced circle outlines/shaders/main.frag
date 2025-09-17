#version 300 es

precision highp float;

out vec4 outColor;

in vec4 v_color;

void main(){
    // outColor = vec4(v_pos,0,1);
    // outColor = v_color;
    outColor = vec4(0,0.5,1,1);
}