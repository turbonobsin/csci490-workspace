#version 300 es

in vec4 a_pos;
// in vec2 a_pos;
uniform vec2 u_res;
uniform vec2[1000] u_pos;

void main(){
    // vec2 pos = a_pos.xy / u_res * 2.0 - 1.0;
    vec2 pos = u_pos[gl_VertexID].xy / u_res * 2.0 - 1.0;
    // vec2 pos = a_pos / u_res * 2.0 - 1.0;

    // pos.x += 4.0;
    // if(a_pos.x == a_pos.z) pos.x += 4.0;

    // float dist = distance(a_pos.xy,a_pos.zw);
    // if(dist > 40.0){
    //     pos.x += 6.0;
    // }

    // 
    
    gl_Position = vec4(pos,0,1);
    gl_PointSize = 4.0;
}