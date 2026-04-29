#version 300 es

layout(location = 0) in vec2 a_pos;
layout(location = 1) in vec2 a_texCoord;
uniform mat4 u_mat;

void main(){
    gl_Position = vec4(a_pos,0,1) * u_mat;
    // gl_Position = vec4((a_pos).xy,0,1);
}