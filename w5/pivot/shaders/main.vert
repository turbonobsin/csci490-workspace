#version 300 es

in vec2 a_pos;
in vec2 a_texCoord;

out vec2 v_texCoord;

uniform vec2 u_loc;
uniform vec2 u_res;
uniform vec2 u_rot;
uniform vec2 u_scale;
uniform vec2 u_anchor;

void main(){    
    vec2 anchor = (u_anchor - vec2(0.5,0.5)) * vec2(1,-1);
    vec2 pos = a_pos * u_scale - anchor * u_scale;

    pos = vec2(
        pos.x * u_rot.y + pos.y * u_rot.x,
        pos.y * u_rot.y - pos.x * u_rot.x
    );

    pos = (pos + u_loc + anchor * u_scale) / u_res * 2.0 - 1.0;

    gl_Position = vec4(pos,0,1);
    v_texCoord = a_texCoord;
}