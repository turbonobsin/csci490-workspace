#version 300 es

precision highp float;

uniform vec2 iResolution;
uniform vec3 iMouse;
uniform float iTime;

out vec4 outColor;

//Exponential smooth minimum
float smin( float a, float b, float k )
{
    float r = exp2(-a/k) + exp2(-b/k);
    return -k*log2(r);
}

// The MIT License
// Copyright © 2020 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// Signed distance to a disk

// List of some other 2D distances: https://www.shadertoy.com/playlist/MXdSRf
//
// and iquilezles.org/articles/distfunctions2d

// b.x = half width
// b.y = half height
// r.x = roundness top-right  
// r.y = roundness boottom-right
// r.z = roundness top-left
// r.w = roundness bottom-left
float sdRoundBox( in vec2 p, in vec2 b, in vec4 r ) 
{
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

float sdCircle( in vec2 p, in float r ) 
{
    return length(p)-r;
}

float sdPentagram(in vec2 p, in float r )
{
    // p.y = abs(float(int(floor(p.x / p.y)) & 0xff));
    // p.y = abs(float(int(floor(p.x / p.y)) & 0xf));
    // p.y = abs(float(int(floor(p.x / p.y)) ^ int(1.0/p.y)));
    // p.y = abs(float(int(floor(p.x)) & int(1.0/floor(p.y))));
    // p.y = abs(float(int(p.x) - int(p.y)));
    // p.y *= sin(p.x*8.0) * 8.0;

    // p.xy += vec2(cos(iTime),sin(iTime)); // spin

    const float k1x = 0.809016994; // cos(π/ 5) = ¼(√5+1)
    const float k2x = 0.309016994; // sin(π/10) = ¼(√5-1)
    const float k1y = 0.587785252; // sin(π/ 5) = ¼√(10-2√5)
    const float k2y = 0.951056516; // cos(π/10) = ¼√(10+2√5)
    const float k1z = 0.726542528; // tan(π/ 5) = √(5-2√5)
    const vec2  v1  = vec2( k1x,-k1y);
    const vec2  v2  = vec2(-k1x,-k1y);
    const vec2  v3  = vec2( k2x,-k2y);
    
    p.x = abs(p.x);
    p -= 2.0*max(dot(v1,p),0.0)*v1;
    p -= 2.0*max(dot(v2,p),0.0)*v2;
    p.x = abs(p.x);
    p.y -= r;
    return length(p-v3*clamp(dot(p,v3),0.0,k1z*r))
           * sign(p.y*v3.x-p.x*v3.y);
}


void mainImage( in vec2 fragCoord )
{
	vec2 p = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    vec2 m = (2.0*iMouse.xy-iResolution.xy)/iResolution.y;

    //// CIRCLE
	// float d = sdCircle(p,0.5);

    // ROUND SQUARE
    vec2 si = vec2(0.9,0.6) + 0.3*cos(iTime+vec2(0,2));
    vec4 ra = 0.3 + 0.3*cos( 2.0*iTime + vec4(0,1,2,3) );
    ra = min(ra,min(si.x,si.y));

	float dRB = sdRoundBox( p, si, ra );
    // float d = sdPentagram(p,0.7 + m.x); // weird rounded pentagon
    float d = sdPentagram(p,0.7);
    // ///

    float thickness = 10.0/iResolution.x;

    float round_dist = d - thickness * 4. * sin(iTime);
    d = round_dist;

    float spacing = 0.5;

    //Repeat in spaced-out layers
    float layered_edge = mod(d + spacing/2.0, spacing) - spacing/2.0;
    //Set layer thickness
    float layered_dist = abs(layered_edge) - thickness;
    d = layered_dist;

    // d = max(d,dRB); // intersect
    // d = max(-d,dRB); // subtract star from rounded box
    // d = smin(-d,dRB,0.05); // subtract star from rounded box
    d = smin(d,dRB,0.05); 
    // d = smin(d,dRB,0.1);


    // float light_r = 0.05 / d;
    float light_r = 0.4 / d;
    // float light_r = 0.1 / d;
    // float light_b = pow(max(1.0 - d*1.0, 0.0), 10.0);
    
    // outColor = vec4(abs(light_r),0,0,1);
    outColor = vec4(1,0.1,0.1,1) * abs(light_r);
    // outColor = vec4(abs(light_b),0,0,1);
    return;

    // float hollow_dist = abs(d) - thickness;
    // d - hollow_dist;
    
	// coloring
    vec3 col = (d>0.0) ? vec3(0.9,0.6,0.3) : vec3(0.65,0.85,1.0);
    // col *= 1.0 - exp(-6.0*abs(d));
	// col *= 0.8 + 0.2*cos(150.0*d);
	// col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.1,abs(d)) );
    if(d > -thickness && d < 0.0) col = vec3(1.0);

    // if(d > 0.0) discard;
    // if(d < 0.0) discard;

    if( iMouse.z>0.001 )
    {
    d = sdCircle(m,0.5);
    col = mix(col, vec3(1.0,1.0,0.0), 1.0-smoothstep(0.0, 0.005, abs(length(p-m)-abs(d))-0.0025));
    col = mix(col, vec3(1.0,1.0,0.0), 1.0-smoothstep(0.0, 0.005, length(p-m)-0.015));
    }

	outColor = vec4(col,1.0);
}

void main(){
    mainImage(gl_FragCoord.xy);
}