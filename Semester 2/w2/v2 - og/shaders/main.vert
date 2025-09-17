#version 300 es

in vec2 a_pos;
in vec4 a_color;
uniform vec2 u_res;

out vec4 v_color;

void main(){
    vec2 pos = a_pos / u_res * 2.0 - 1.0;
    gl_PointSize = 1.0;
    gl_Position = vec4(pos * vec2(1,-1),0,1);

    v_color = a_color;
}