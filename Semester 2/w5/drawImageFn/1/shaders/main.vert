#version 300 es

in vec4 a_pos;
in vec2 a_texCoord;

uniform mat4 u_matrix;
uniform mat4 u_textureMatrix;

out vec2 v_texCoord;

void main(){
    gl_Position = u_matrix * a_pos;
    // v_texCoord = a_texCoord;
    v_texCoord = (u_textureMatrix * vec4(a_texCoord, 0, 1)).xy;
}