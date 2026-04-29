const can = document.querySelector("canvas");
const gl = can.getContext("webgl2");

let program;
let a_pos;
let u_res;
let u_mouse;

let posBuffer;
let vao;

let mouseX = 0;
let mouseY = 0;

function setMousePos(e){
    let r = can.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / r.width * can.width;
    mouseY = (1 - (e.clientY - r.top) / r.height) * can.height;

    gl.uniform2f(u_mouse,mouseX,mouseY);

    draw();
}
document.addEventListener("mousemove",setMousePos);
document.addEventListener("touchstart",e=>{
    e.preventDefault();
},{passive:false});
document.addEventListener("touchmove",e=>{
    e.preventDefault();
    setMousePos(e.touches[0]);
},{passive:false});

async function init(){
    program = webglUtils.createProgramFromSources(gl,[
        await (await fetch("shaders/main.vert")).text(),
        await (await fetch("shaders/main.frag")).text(),
    ]);

    gl.useProgram(program);

    a_pos = gl.getAttribLocation(program,"a_pos");
    u_res = gl.getUniformLocation(program,"u_res");
    u_mouse = gl.getUniformLocation(program,"u_mouse");

    gl.uniform2f(u_res,can.width,can.height);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        -1,-1,
        1,-1,
        -1,1,
        -1,1,
        1,-1,
        1,1
    ]),gl.STATIC_DRAW);

    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos,2,gl.FLOAT,false,0,0);

    // 
    draw();
}

function draw(){
    gl.viewport(0,0,can.width,can.height);
    
    gl.useProgram(program);

    gl.bindVertexArray(vao);

    gl.drawArrays(gl.TRIANGLES,0,6);
}

init();