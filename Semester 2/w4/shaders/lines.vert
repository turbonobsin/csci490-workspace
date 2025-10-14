#version 300 es

// in ivec2 a_pos;
// in vec2 a_pos;
// uniform int[30] u_elm;
uniform vec2 u_res;
// uniform vec2[1000] u_pos;

precision highp isampler2D;
uniform isampler2D u_tex;
uniform isampler2D u_tex2;

flat out int v_id;

void main(){

    ivec2 data = texelFetch(u_tex2,ivec2(gl_VertexID,0),0).rg;
    // int id = gl_VertexID;
    int id = data.g;
    int id2 = data.r;
    ivec2 v = texelFetch(u_tex,ivec2(id,0),0).rg;
    ivec2 v2 = texelFetch(u_tex,ivec2(id2,0),0).rg;

    // vec2 pos = vec2(float(gl_VertexID)/u_res.x,0);//float(v.xy) / u_res * 2.0 - 1.0;
    vec2 pos = vec2(v) / u_res * 2.0 - 1.0;
    vec2 pos2 = vec2(v2) / u_res * 2.0 - 1.0;

    // pos = vec2(0,0);
    
    // vec2 pos = u_pos[0].xy / u_res * 2.0 - 1.0;
    // pos.x += float(u_elm[0]);
    // vec2 pos = u_pos[u_elm[gl_VertexID].x].xy / u_res * 2.0 - 1.0;
    // vec2 pos = a_pos / u_res * 2.0 - 1.0;

    // pos.x += 4.0;
    // if(a_pos.x == a_pos.z) pos.x += 4.0;

    // float dist = distance(a_pos.xy,a_pos.zw);
    // if(dist > 40.0){
    //     pos.x += 6.0;
    // }

    // -----
    // float dist = distance(pos,pos2);
    // if(dist > 0.5){
    //     pos.x = 6.0;
    // }

    // 

    v_id = gl_VertexID;
    
    gl_Position = vec4(pos,0,1);
    // gl_Position = vec4(0,0,0,1);
    gl_PointSize = 4.0;
}