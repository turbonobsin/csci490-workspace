#version 300 es

precision highp float;

uniform vec4 u_color;

out vec4 outColor;

uniform vec2 u_res;

precision highp isampler2D;
uniform isampler2D u_tex;
uniform isampler2D u_tex2;

flat in int v_id;

void main(){
    // outColor = vec4(0,1,0.5,1);

    int rowW = 1024;
    int rowX = v_id % rowW;
    int rowY = int(ceil(float(v_id) / float(rowW)));
    ivec2 data = texelFetch(u_tex2,ivec2(rowX,rowY),0).rg;
    int id = data.g;
    int id2 = data.r;
    ivec2 v = texelFetch(u_tex,ivec2(id,0),0).rg;
    ivec2 v2 = texelFetch(u_tex,ivec2(id2,0),0).rg;

    // vec2 pos = vec2(float(gl_VertexID)/u_res.x,0);//float(v.xy) / u_res * 2.0 - 1.0;
    vec2 pos = vec2(v) / u_res * 2.0 - 1.0;
    vec2 pos2 = vec2(v2) / u_res * 2.0 - 1.0;

    float dist = distance(pos.xy,pos2.xy);
    if(dist > 0.1){
        discard;
        return;
    }
    
    outColor = u_color;
}