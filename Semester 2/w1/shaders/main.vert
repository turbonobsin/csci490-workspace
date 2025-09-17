#version 300 es

in vec2 a_pos;
uniform vec2 u_res;
out vec2 v_pos;

void main(){
    vec2 pos = a_pos / u_res - 0.5;
    pos = pos * vec2(1,-1);
    v_pos = a_pos - 0.5 * u_res;
    
    gl_Position = vec4(pos,0,1);
}