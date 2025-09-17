#version 300 es

precision highp float;

out vec4 outColor;
uniform sampler2D u_tex;
uniform vec2 u_res;

in vec2 v_texCoord;

void main(){
    vec2 texCoord = v_texCoord / u_res * vec2(1,1);
    outColor = texture(u_tex,texCoord);
    // outColor = texture(u_tex,texCoord);
    // outColor = vec4(1,0,0.5,1);
}