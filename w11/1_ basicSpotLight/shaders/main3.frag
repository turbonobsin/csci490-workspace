#version 300 es

precision highp float;

in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform vec4 u_color;
uniform float u_shininess;
uniform vec3 u_lightColor;
uniform vec3 u_specularColor;

uniform vec3 u_lightDirection;
uniform float u_limit; // in dot space

out vec4 outColor;

void main(){
    // it's a varying so it'll be interpolated and we need to make it normalized again
    vec3 normal = normalize(v_normal);

    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    // compute the light by taking the dot product of the normal to the light's reverse direction
    // float light = dot(normal,surfaceToLightDirection); // <-- OLD METHOD for point light
    // float specular = dot(normal,halfVector);
    // float specular = 0.0;
    // if(light > 0.0){ // <-- can't raise a negative number to a power in webgl
    //     specular = pow(dot(normal,halfVector), u_shininess);
    // }

    float light = 0.0;
    float specular = 0.0;

    float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection);

    // vvv - USING a conditional
    // if(dotFromDirection >= u_limit){
    //     light = dot(normal,surfaceToLightDirection);
    //     if(light > 0.0){
    //         specular = pow(dot(normal,halfVector), u_shininess);
    //     }
    // }

    // vvv - using STEP
    float inLight = step(u_limit,dotFromDirection); // returns 1 if dotFromDirection >= u_limit, 0 otherwise
    light = inLight * dot(normal,surfaceToLightDirection);
    specular = inLight * pow(dot(normal,halfVector), u_shininess);


    outColor = u_color;

    // multiply just the color portion (not the alpha) by the light
    outColor.rgb *= light * u_lightColor;

    // add the specular
    outColor.rgb += specular * u_specularColor;
}