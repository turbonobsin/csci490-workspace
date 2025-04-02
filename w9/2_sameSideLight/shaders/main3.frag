#version 300 es

precision highp float;

// in vec4 v_col;
in vec3 v_normal;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

out vec4 outColor;

void main(){
    // outColor = v_col;

    // it's a varying so it'll be interpolated and we need to make it normalized again
    vec3 normal = normalize(v_normal);

    // compute the light by taking the dot product of the normal to the light's reverse direction
    float light = dot(normal,u_reverseLightDirection);

    outColor = u_color;

    // multiply just the color portion (not the alpha) by the light
    outColor.rgb *= light;
}