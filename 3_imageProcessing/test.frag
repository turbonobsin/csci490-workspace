#version 300 es

precision highp float; // have to set this in fragment shader

in vec2 v_texCoord; // texture coords
uniform sampler2D u_image; // actual image texture

out vec4 outColor;

uniform vec4 u_color;


void main(){
    vec2 onePixel = vec2(1) / vec2(textureSize(u_image,0));

    // outColor = vec4(1,0,0.5,1);
    // outColor = u_color;
    outColor = texture(u_image,v_texCoord);

    vec4 col = texture(u_image,v_texCoord);
    if(col.r > 0.5) col.r = 0.0;
    // col.r = 0.0;
    outColor = col;
}