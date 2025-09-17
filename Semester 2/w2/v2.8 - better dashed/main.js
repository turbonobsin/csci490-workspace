let scale = 2;

const can = document.querySelector("canvas");
can.width *= scale;
can.height *= scale;
const gl = can.getContext("webgl2",{
    antialias:false
});

async function createShader(type,name){
    let s = gl.createShader(type);
    gl.shaderSource(s,await (await fetch("shaders/"+name)).text());
    gl.compileShader(s);
    return s;
}
async function createProgram(name){
    let vert = await createShader(gl.VERTEX_SHADER,name+".vert");
    let frag = await createShader(gl.FRAGMENT_SHADER,name+".frag");

    let program = gl.createProgram();
    gl.attachShader(program,vert);
    gl.attachShader(program,frag);
    gl.linkProgram(program);

    return program;
}

/**@type {WebGLProgram} */
let program;

let a_vert;
let a_pos;
let a_color;
let u_res;
let vao;
let vertBuffer;
let posBuffer;
let colorBuffer;

async function init(){
    gen();
    // 
    
    program = await createProgram("main");
    gl.useProgram(program);

    a_vert = gl.getAttribLocation(program,"a_vert");
    a_pos = gl.getAttribLocation(program,"a_pos");
    a_color = gl.getAttribLocation(program,"a_color");
    u_res = gl.getUniformLocation(program,"u_res");

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // 
    let circle = [];
    let circleR = 20;
    for(let i = 0; i <= 6.28; i += 6.28 / 32){
        let tx = Math.cos(i)*circleR;
        let ty = Math.sin(i)*circleR;
        // circle.push(tx,ty,0,0);
        circle.push(tx,ty);
    }
    
    vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        // -10,-10,
        // 10,-10,
        // -10,10,
        // -10,10,
        // 10,-10,
        // 10,10
        ...circle
    ]),gl.STATIC_DRAW);

    gl.enableVertexAttribArray(a_vert);
    gl.vertexAttribPointer(a_vert,2,gl.FLOAT,false,0,0);

    // 
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        20,20,60,60,20,124
    ]),gl.DYNAMIC_DRAW);

    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos,2,gl.FLOAT,false,0,0);
    gl.vertexAttribDivisor(a_pos,1);

    // 
    let color = [];
    let black = [0,0,0,1];
    for(const o of objs){
        color.push(...(o.c ?? black));
    }

    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(color),gl.STATIC_DRAW);

    gl.enableVertexAttribArray(a_color);
    gl.vertexAttribPointer(a_color,4,gl.FLOAT,false,4,0);
    gl.vertexAttribDivisor(a_pos,1);

    // 
    gl.uniform2f(u_res,can.width,can.height);

    // 
    render();
}

function render(){
    requestAnimationFrame(render);

    gl.viewport(0,0,can.width,can.height);

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    let pos = [];
    for(let i = 0; i < objs.length; i++){
        let o = objs[i];
        o.run();

        pos.push(o.x,o.y);
    }

    // 
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.DYNAMIC_DRAW);

    // 
    // gl.drawArrays(gl.POINTS,0,objs.length);
    // gl.drawArraysInstanced(gl.POINTS,0,objs.length,1);

    // gl.drawArraysInstanced(gl.POINTS,0,4,objs.length);
    // gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,objs.length);
    // gl.drawArrays(gl.LINE_STRIP,0,64);
    gl.drawArraysInstanced(gl.LINES,0,33,objs.length);
}

init();