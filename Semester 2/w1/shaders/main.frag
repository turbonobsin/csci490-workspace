#version 300 es

precision highp float;

in vec2 v_pos;
uniform vec2 u_res;

out vec4 outColor;

float m = -0.001;

float derivative(float x, float y){
    return m * 3.0 * x * x;
}

bool eq(float x, float y){
    // float left = m * pow(x,3.0);
    // float left = m * x * x * x;
    // float left = m * x * x / 40.0;
    float left = -1.0 * x * x * x;
    // float left = -1.0 * sin(x) * 4.0;
    float right = y;

    return abs(left - right) <= 1.0; // just line
    // return (left - right) <= 1.0; // fill below

    // float d = derivative(x,y);

    // return abs(left-right) < max(abs(d),1.0); // regular

    // return abs(left-right) < 1.0;
    // return y <= left && y >= right; // fill up
}

void main(){
    // float line = eq(v_pos.x,v_pos.y);
    // bool match = eq(v_pos.x,v_pos.y);

    // outColor = vec4(v_pos / u_res,0,1);
    // return;
    // float scale = 100.0;
    // float scale = 30.0;
    float scale = 70.0;
    // bool match = eq(v_pos.x / u_res.x * scale,v_pos.y / u_res.x * scale); // the knot xD
    bool match = eq(v_pos.x / u_res.x * scale  * u_res.y/u_res.x,v_pos.y / u_res.y * scale);
    
    // bool match = eq(gl_FragCoord.x / u_res.x + 0.5,gl_FragCoord.y / u_res.y + 0.5);
    // bool match = eq(gl_FragCoord.x / u_res.x,(u_res.y - gl_FragCoord.y) / u_res.y);
    // float r = 5.0;

    // float cx = 0.0;
    // float cy = 0.0;
    // float dx = v_pos.x - cx;
    // float dy = v_pos.y - cy;
    // float dist = sqrt(dx*dx + dy*dy);

    // if(dist < 20.0){ // for circle
    // if(abs(line - v_pos.y) < 1.0){ // for line
    // if(abs(line - v_pos.y) < 1.0){
    if(match){
        outColor = vec4(1,0,0,1);
    }
    // else outColor = vec4(0,1,0,1); // for other cut color
    else outColor = vec4(0,0,0,0);
}