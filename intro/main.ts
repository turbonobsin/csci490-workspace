const can = document.querySelector("canvas");
const gl = can.getContext("webgl2");

let vertGLSL = `#version 300 es

uniform vec2 u_canRes;
uniform vec2 u_offset;

void main(){
    vec2 pos = u_offset / u_canRes * 2.0 - 1.0;
    pos.y = -pos.y;
    gl_Position = vec4(pos,0,1);
    gl_PointSize = 150.0;
}
`;

let fragGLSL = `#version 300 es
precision highp float;

out vec4 outColor;

void main(){
    outColor = vec4(1,0,0.5,1);
}
`;

let vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader,vertGLSL);
gl.compileShader(vertexShader);
if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
    throw new Error(gl.getShaderInfoLog(vertexShader));
}

let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader,fragGLSL);
gl.compileShader(fragmentShader);
if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
    throw new Error(gl.getShaderInfoLog(fragmentShader));
}

let program = gl.createProgram();
gl.attachShader(program,vertexShader);
gl.attachShader(program,fragmentShader);
gl.linkProgram(program);
if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    throw new Error(gl.getProgramInfoLog(program));
}

let uCanResLoc = gl.getUniformLocation(program,"u_canRes");
let uOffsetLoc = gl.getUniformLocation(program,"u_offset");

// 
gl.useProgram(program);

gl.uniform2f(uCanResLoc,gl.canvas.width,gl.canvas.height);
gl.uniform2f(uOffsetLoc,150+75,75);

// draw 1 point
gl.drawArrays(gl.POINTS,0,1);