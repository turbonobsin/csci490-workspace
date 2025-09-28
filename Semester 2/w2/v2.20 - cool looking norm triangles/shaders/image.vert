#version 300 es

in vec2 a_pos;
uniform vec2 u_res;

out vec2 v_texCoord;

void main(){
    vec2 pos = a_pos / u_res * 2.0 - 1.0;
    
    gl_PointSize = 3.0;
    gl_Position = vec4(pos,0,1);

    v_texCoord = a_pos;
}