#version 300 es
in vec4 a_pos;
out vec4 v_position;

void main() {
    // Modify the position or other attributes here
    v_position = a_pos;
    v_position.x += 0.5;
    // v_position = a_pos + vec4(0.05, 0.05, 0.0, 0.0);
    // v_position = a_pos;
    gl_Position = v_position;
    // gl_Position = vec4(0,0,0.0,1.0);
    gl_PointSize = 10.0;
}
