#version 300 es

in vec2 a_vert;
in vec2 a_pos;
in vec4 a_color;
uniform vec2 u_res;

out vec4 v_color;
out vec2 v_pos;
out vec2 v_pos2;
out vec2 v_pos3;
out vec2 v_pos4;

void main(){
    // vec2 pos = (a_pos + a_vert * float(gl_InstanceID)) / u_res * 2.0 - 1.0;
    vec2 pos = (a_pos + a_vert) / u_res * 2.0 - 1.0;
    gl_PointSize = 1.0;
    gl_Position = vec4(pos * vec2(1,-1),0,1);

    v_color = a_color;
    v_pos = a_pos / u_res;
    v_pos2 = (a_pos + a_vert) / u_res;
    v_pos3 = a_pos;
    v_pos4 = (a_pos + a_vert);
}