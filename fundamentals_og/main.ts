const can = document.querySelector("canvas");
const gl = can.getContext("webgl2",{
    antialias:true
});

type GL = WebGL2RenderingContext;

let vs_src = `#version 300 es

in vec4 a_position;

void main(){
    gl_Position = a_position;
    gl_PointSize = 4.0;
}

`;
let fs_src = `#version 300 es

precision highp float; // have to set this in fragment shader

out vec4 outColor;

void main(){
    outColor = vec4(1,0,0.5,1);
}

`;

function createShader(gl:GL,type:any,source:string){
    let shader = gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        throw gl.getShaderInfoLog(shader);
    }

    return shader;
}

function createProgram(gl:GL,vertexShader:WebGLShader,fragmentShader:WebGLShader){
    let program = gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        throw gl.getProgramInfoLog(program);
    }

    return program;
}

let vertexShader = createShader(gl,gl.VERTEX_SHADER,vs_src);
let fragmentShader = createShader(gl,gl.FRAGMENT_SHADER,fs_src);

let program = createProgram(gl,vertexShader,fragmentShader);

// 

let aPositionLoc = gl.getAttribLocation(program,"a_position");
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer); // this allows bufferData to access this through gl.ARRAY_BUFFER

// three 2d points
let pos = [
    0,0,
    0,0.5,
    0.7,0,
];
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

// 
let vao = gl.createVertexArray();
gl.bindVertexArray(vao); // set this one as the one we are going to configure
gl.enableVertexAttribArray(aPositionLoc); // specifies that we want to get data out of it and edit it
gl.vertexAttribPointer(aPositionLoc,2,gl.FLOAT,false,0,0); // this also binds ARRAY_BUFFER to this vao

// 
gl.viewport(0,0,gl.canvas.width,gl.canvas.height); // need this every time you resize the canvas -- -1 to 1 means 0 to can.width

// 
gl.clearColor(0,0,0,0);
gl.clear(gl.COLOR_BUFFER_BIT);

// drawing
gl.useProgram(program);
gl.bindVertexArray(vao);
gl.drawArrays(gl.TRIANGLES,0,3);