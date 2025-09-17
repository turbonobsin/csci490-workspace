#version 300 es

precision highp float;

out vec4 outColor;
uniform vec2 u_res;

in vec4 v_color;
in vec2 v_pos;
in vec2 v_pos2;
in vec2 v_pos3;
in vec2 v_pos4;

void main(){
    // outColor = vec4(v_pos,0,1);
    // outColor = v_color;
    // outColor = vec4(0,0.5,1,1);
    // outColor = vec4(v_pos,0,1);
    
    outColor = vec4(
        // gl_Frag
        // (v_pos2 - v_pos) * 20.0,
        // (v_pos2 - v_pos) * 20.0,
        // normalize(v_pos2 - v_pos),
        // (normalize(v_pos2)),
        // normalize((v_pos2 - v_pos)) / 2.0 * 1.0 + 1.0,
        // v_pos*20.0,
        // normalize((v_pos2 - v_pos)) * 1.0,
        // (normalize(v_pos2) - v_pos) * 1.0 + 1.0,

        // (v_pos) * 1.0, // per circle
        // gl_FragCoord.xy/u_res * vec2(3,0) + vec2(-1,1) - (gl_FragCoord.xy)/u_res * 1.0, // smooth over screen
        // ((gl_FragCoord.xy)/u_res - v_pos) * 1.0, // attempt to mix but fragCoord is flipped in y
        // (gl_FragCoord.xy/u_res * vec2(3,0) + vec2(-1,1) - (gl_FragCoord.xy)/u_res) - v_pos,

        ((v_pos2 - v_pos) * vec2(1,u_res.y/u_res.x)) + 0.5, // GOOD finally!
        // (normalize(v_pos2 - v_pos) * 127.0
        // * vec2(1,u_res.y/u_res.x)) + 0.5,

        // 0.5,0.5,
        1,1
    );
}