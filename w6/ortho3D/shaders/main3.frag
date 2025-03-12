#version 300 es

precision highp float;

in vec4 v_col;

out vec4 outColor;

void main(){
    // outColor = vec4(1,0,0.5,1);
    outColor = v_col;
}