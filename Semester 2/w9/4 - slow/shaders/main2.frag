#version 300 es

precision highp float;

in vec2 v_texCoord;

// uniform sampler2D u_tex;
out vec4 outColor;

void main(){
    // outColor = texture(u_tex,v_texCoord) * vec4(0,1,0.5,1);
    outColor = vec4(0,1,0.5,1);
}