#version 300 es

in vec4 a_pos;
in vec4 a_col;

out vec4 v_col;

uniform mat4 u_mat;
uniform float u_fudgeFactor;

void main(){
    vec4 pos = u_mat * a_pos;
    float zToDivideBy = 1.0 + pos.z * u_fudgeFactor;
    
    gl_Position = vec4(pos.xyz,zToDivideBy);
    v_col = a_col;
}