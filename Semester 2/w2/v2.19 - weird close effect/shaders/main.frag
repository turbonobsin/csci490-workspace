#version 300 es

precision highp float;

out vec4 outColor;
uniform vec2 u_res;
uniform sampler2D u_tex;

in vec4 v_color;
in vec2 v_pos; // my center
in vec2 v_pos2;
in vec2 v_pos3;
in vec2 v_pos4;

in vec2 v_texCoord;

bool check(vec4 pixel, vec2 myNormal){
    if(pixel.a != 0.0){
        // compare
        float tol = 0.01;
        vec2 v1 = pixel.ba;
        // if(abs(pixel.b-v_pos.x) < tol && abs(pixel.a-v_pos.y) < tol){
        float dist = distance(v1,v_pos);
        if(dist < 20.0 && dist > 0.01){
            // if(dot(v1-v_pos,v1-v_pos) > dot(v1-v_pos2,v1-v_pos2)){
            //     outColor = vec4(1,0,0,1);
            //     // outColor = vec4(1,0,0,1);
            //     // outColor = vec4(1,0,0,1);
            //     return true;
            // }
            // if(dot(myNormal/2.0 - 0.5,pixel.rg/2.0 - 0.5) > 0.0){
            //     outColor = vec4(1,0,0,1);
            //     return true;
            // }

            outColor = vec4(1,0,0,1);
            return true;
        }
    }
    return false;
}

void main(){

    vec2 texCoord = v_texCoord / u_res * vec2(1,1);
    // vec4 pixel = texture(u_tex,texCoord);
    float amt = 5.0;
    // vec4 pixel = texture(u_tex,texCoord - vec2(amt/u_res.x,0));

    vec2 myNormal0 = ((v_pos2 - v_pos) * (127.0 / 8.0) // could use 8 or 16 here to get a nice sphere look
        * vec2(1,u_res.y/u_res.x)); // extreme normals but correct;

    vec2 myNormal = myNormal0 + 0.5;

    // vec2 incAmt = normalize(myNormal0);
    // vec2 incAmt = myNormal0 * vec2(1,-1) / u_res;
    vec2 norm2 = (v_pos2 - v_pos) * vec2(1,u_res.y/u_res.x);
    // vec2 incAmt = normalize(norm2) / u_res;
    vec2 incAmt = normalize(norm2);
    float rad = 20.0;
    // vec2 pos = v_pos2;
    vec2 pos = v_pos2 * u_res; // convert to can coords
    float tol = 0.01;
    for(float i = 0.0; i < rad; i += 1.0){
        pos += incAmt;
        // vec2 pos2 = pos;
        vec2 pos2 = pos / u_res;
        pos2.y = 1.0 - pos2.y;
        vec4 pixel = texture(u_tex,pos2);
        if(abs(pixel.b - v_pos.x) < tol && abs(pixel.a - v_pos.y) < tol){
            continue;
        }
        if(pixel.a != 0.0){
            vec2 norm = pixel.rg - 0.5;
            float d = dot(myNormal0,norm);

            if(abs(d) > 0.1){
                outColor = vec4(1,0,0,1);
            }

            return;
        }
    }

    // if(check(pixel,myNormal)) return;
    // pixel = texture(u_tex,texCoord - vec2(-amt/u_res.x,0));
    // if(check(pixel,myNormal)) return;
    // pixel = texture(u_tex,texCoord - vec2(0,amt/u_res.y));
    // if(check(pixel,myNormal)) return;
    // pixel = texture(u_tex,texCoord - vec2(0,-amt/u_res.y));
    // if(check(pixel,myNormal)) return;
    
    // outColor = vec4(v_pos,0,1);
    // outColor = v_color;
    // outColor = vec4(0,0.5,1,1);
    // outColor = vec4(v_pos,0,1);
    
    outColor = vec4(
        // gl_Frag
        // (v_pos2 - v_pos) * 20.0,
        // (v_pos2 - v_pos) * 20.0,
        // normalize(v_pos2 - v_pos),
        // (normalize(v_pos2)),
        // normalize((v_pos2 - v_pos)) / 2.0 * 1.0 + 1.0,
        // v_pos*20.0,
        // normalize((v_pos2 - v_pos)) * 1.0,
        // (normalize(v_pos2) - v_pos) * 1.0 + 1.0,

        // (v_pos) * 1.0, // per circle
        // gl_FragCoord.xy/u_res * vec2(3,0) + vec2(-1,1) - (gl_FragCoord.xy)/u_res * 1.0, // smooth over screen
        // ((gl_FragCoord.xy)/u_res - v_pos) * 1.0, // attempt to mix but fragCoord is flipped in y
        // (gl_FragCoord.xy/u_res * vec2(3,0) + vec2(-1,1) - (gl_FragCoord.xy)/u_res) - v_pos,

        // ((v_pos2 - v_pos) * vec2(1,u_res.y/u_res.x)) + 0.5, // GOOD finally!
        // (normalize(v_pos2 - v_pos) * 127.0
        // * vec2(1,u_res.y/u_res.x)) + 0.5, // extreme normals but correct

        myNormal,

        // 0.5,0.5,
        // 1,1
        v_pos
    );
}