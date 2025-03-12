#version 300 es

in vec4 a_pos;
uniform mat4 u_mat;

void main(){
    gl_Position = u_mat * a_pos;
}