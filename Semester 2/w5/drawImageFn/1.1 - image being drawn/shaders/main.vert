#version 300 es

in vec4 a_pos;
in vec2 a_texCoord;

uniform mat4 u_matrix;

out vec2 v_texCoord;

void main(){
    gl_Position = u_matrix * a_pos;
    v_texCoord = a_texCoord;
}