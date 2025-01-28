const can = document.querySelector("canvas");
const gl = can.getContext("webgl2",{
    antialias:false,
    premultipliedAlpha:false
});

type GL = WebGL2RenderingContext;

let vs_src = `#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;

void main(){
    vec2 pos = a_position / u_resolution * 2.0 - 1.0;
    pos.y = -pos.y;
    gl_Position = vec4(pos,0,1);
}

`;
let fs_src = `#version 300 es

precision highp float; // have to set this in fragment shader

out vec4 outColor;
uniform vec4 u_color;

void main(){
    // outColor = vec4(1,0,0.5,1);
    outColor = u_color;
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

let uResolutionLoc = gl.getUniformLocation(program,"u_resolution");
let uColorLoc = gl.getUniformLocation(program,"u_color");

// 2d points
let pos = [
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30,
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
gl.uniform2f(uResolutionLoc,gl.canvas.width,gl.canvas.height);

function randInt(n:number){
    return Math.floor(Math.random()*n);
}
function drawRect(){
    let w = randInt(50);
    let h = randInt(50);
    let x = randInt(gl.canvas.width-w);
    let y = randInt(gl.canvas.height-h);
    let x2 = x+w;
    let y2 = y+h;
    
    pos = [
        x,y,
        x2,y,
        x,y2,
        x,y2,
        x2,y,
        x2,y2
    ];
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

    gl.uniform4f(uColorLoc,Math.random(),Math.random(),Math.random(),1);
    
    gl.drawArrays(gl.TRIANGLES,0,6);
}
for(let i = 0; i < 10; i++){
    drawRect();
}