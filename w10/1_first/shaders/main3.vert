#version 300 es

in vec4 a_pos;
in vec3 a_normal;

uniform vec3 u_lightWorldPosition;

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

uniform mat4 u_world;

out vec3 v_normal;
out vec3 v_surfaceToLight;

void main(){
    gl_Position = u_worldViewProjection * a_pos;

    v_normal = mat3(u_worldInverseTranspose) * a_normal;

    vec3 surfaceWorldPosition = (u_world * a_pos).xyz;
    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
}