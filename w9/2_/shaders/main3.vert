#version 300 es

in vec4 a_pos;
in vec3 a_normal;
uniform mat4 u_mat;

out vec3 v_normal;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

void main(){
    // gl_Position = u_mat * a_pos * vec4(1,-1,1,1); // <-- testing interesting effect

    gl_Position = u_mat * a_pos;
    // gl_Position = u_worldViewProjection * a_pos;
    // v_col = a_col;
    v_normal = mat3(u_world) * a_normal;
}