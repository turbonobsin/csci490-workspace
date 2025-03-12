#version 300 es

precision highp float;

out vec4 outColor;
in vec2 v_texCoord;

uniform sampler2D u_image;

void main(){

    outColor = texture(u_image,v_texCoord);
}