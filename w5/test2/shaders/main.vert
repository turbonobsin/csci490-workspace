#version 300 es

in vec2 a_pos;

uniform vec2 u_res;
uniform vec2 u_rot;
uniform vec2 u_scale;

void main(){
    vec2 pos = a_pos;
    pos = pos / u_res * 2.0 - 1.0;

    gl_Position = vec4(pos * vec2(1,-1),0,1);
}