#version 300 es

precision highp float;

out vec4 outColor;
in vec2 v_col;
in vec2 v_texCoord;

uniform sampler2D u_image;

void main(){
    // outColor = vec4(1,0,0.5,1);
    // outColor = vec4(v_col,0,1);

    outColor = texture(u_image,v_texCoord);
}