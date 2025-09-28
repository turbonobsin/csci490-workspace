#version 300 es

in vec4 a_pos;
uniform vec2 u_res;

void main(){
    vec2 pos = a_pos.xy / u_res * 2.0 - 1.0;
    gl_Position = vec4(pos,0,1);
    gl_PointSize = 4.0;
}