#version 300 es

precision mediump float;

in vec2 v_texCoord;
uniform sampler2D u_image;
uniform vec4 u_col;
uniform int u_mode;

out vec4 outColor;

void main(){
    if(u_mode == 0) outColor = u_col;
    else outColor = texture(u_image,v_texCoord);
}