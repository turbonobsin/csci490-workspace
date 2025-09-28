import { createProgram } from "./util.js";

// let scale = 4;
let scale = 1;

const can = document.querySelector("canvas");
can.width *= scale;
can.height *= scale;
const gl = can.getContext("webgl2",{
    premultipliedAlpha:false,
    antialias:false
});

let posBuffer;
let indexBuffer;
let u_color;

async function init(){
    let program = await createProgram(gl,"main");
    gl.useProgram(program);

    gl.viewport(0,0,can.width,can.height);

    let a_pos = gl.getAttribLocation(program,"a_pos");
    let u_res = gl.getUniformLocation(program,"u_res");
    u_color = gl.getUniformLocation(program,"u_color");

    gl.uniform2f(u_res,can.width,can.height);
    gl.uniform4f(u_color,0,1,0.5,1);
    
    // 

    let w = 40;
    let h = 40;
    let x = can.width/2 - w/2;
    let y = can.height/2 - h/2;
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        x,y,
        x+w,y,
        x,y+h,
        x,y+h,
        x+w,y,
        x+w,y+h
    ]),gl.STATIC_DRAW);
    
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos,2,gl.FLOAT,false,0,0);

    // 
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([
        0,1,2,
        2,1,3
    ]),gl.STATIC_DRAW);

    // 

    gl.drawArrays(gl.LINES,0,6);
    update();
}

// particles

class Obj{
    constructor(x,y,vx,vy){
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
}

/**@type {Obj[]} */
let objs = [];

function gen(){
    for(let i = 0; i < 10; i++){
        objs.push(new Obj(
            Math.random()*can.width,
            Math.random()*can.height,
            Math.random()-0.5,
            Math.random()-0.5
        ));
    }
}
gen();

function update(){
    requestAnimationFrame(update);

    let pos = [];
    let index = [];

    for(let i = 0; i < objs.length; i++){
        let o = objs[i];
        
        o.x += o.vx;
        o.y += o.vy;
        
        index.push(i);
        pos.push(o.x,o.y);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(index),gl.STATIC_DRAW);
    
    gl.uniform4f(u_color,1,0.5,0,1);
    gl.drawArrays(gl.POINTS,0,pos.length); // draw particle points

    gl.uniform4f(u_color,0,1,0.5,1);
    // gl.drawArrays(gl.LINES,0,pos.length/2);
    gl.drawElements(gl.LINES,pos.length/2,gl.UNSIGNED_SHORT,0);
}

// 

init();