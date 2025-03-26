#version 300 es

in vec4 a_pos;
// in vec4 a_col;
in vec3 a_normal;

// out vec4 v_col;
out vec3 v_normal;

uniform mat4 u_mat;

void main(){
    // gl_Position = u_mat * a_pos * vec4(1,-1,1,1); // <-- testing interesting effect

    gl_Position = u_mat * a_pos;
    // v_col = a_col;
    v_normal = a_normal;
}