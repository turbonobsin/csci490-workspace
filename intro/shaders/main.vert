#version 300 es

uniform vec2 u_canRes;
uniform vec2 u_offset;

void main(){
    vec2 pos = u_offset / u_canRes * 2.0 - 1.0;
    pos.y = -pos.y;
    gl_Position = vec4(pos,0,1);
    gl_PointSize = 150.0;
}