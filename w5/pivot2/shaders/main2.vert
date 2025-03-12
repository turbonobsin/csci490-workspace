#version 300 es

in vec2 a_pos;

uniform vec2 u_res;
uniform mat3 u_mat;

void main(){
    vec2 pos = (u_mat * vec3(a_pos,1)).xy;
    gl_Position = vec4(pos / u_res * 2.0 - 1.0,0,1);

    // gl_Position = vec4((u_mat * vec3(a_pos,1)).xy,0,1);
    
}