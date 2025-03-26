#version 300 es

in vec4 a_pos;
in vec4 a_col;

out vec4 v_col;

uniform mat4 u_mat;

void main(){
    gl_Position = u_mat * a_pos;
    v_col = a_col;
}