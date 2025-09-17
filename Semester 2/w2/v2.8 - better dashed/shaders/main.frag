#version 300 es

precision highp float;

out vec4 outColor;

in vec4 v_color;
in vec2 v_pos;
in vec2 v_pos2;

void main(){
    // outColor = vec4(v_pos,0,1);
    // outColor = v_color;
    // outColor = vec4(0,0.5,1,1);
    // outColor = vec4(v_pos,0,1);
    
    outColor = vec4(
        // gl_Frag
        (v_pos2 - v_pos) * 20.0,
        // v_pos*20.0,
        0,1
    );
}