import { createProgram } from "./util.js";

let scale = 4;
// let scale = 2;

const can = document.querySelector("canvas");
can.width *= scale;
can.height *= scale;
const gl = can.getContext("webgl2",{
    premultipliedAlpha:false,
    antialias:false
});

let posBuffer;
let indexBuffer;
let indexLen = 0;
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
        x,y,0,0,
        x+w,y,0,0,
        x,y+h,0,0,
        x,y+h,0,0,
        x+w,y,0,0,
        x+w,y+h,0,0
    ]),gl.STATIC_DRAW);
    
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos,4,gl.FLOAT,false,0,0);

    // 
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([
        0,1,2,
        2,1,3
    ]),gl.STATIC_DRAW);

    // 

    gl.drawArrays(gl.LINES,0,6);
    gen();
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
    let mode = 0;
    if(mode == 0){
        for(let i = 0; i < 400; i++){ // 40
            objs.push(new Obj(
                Math.random()*can.width,
                Math.random()*can.height,
                Math.random()-0.5,
                Math.random()-0.5
            ));
        }
    }
    else if(mode == 1){
        // for(let i = 0; i < 40; i++){
        let inc = 6.28 / 4;
        for(let i = 0; i <= 6.28; i += inc){
            // objs.push(new Obj(
            //     Math.random()*can.width,
            //     Math.random()*can.height,
            //     Math.random()-0.5,
            //     Math.random()-0.5
            // ));

            let ang = i;
            let rad = 50;
            let cx = can.width/2;
            let cy = can.height/2;
            let tx = Math.cos(ang)*rad + cx;
            let ty = Math.sin(ang)*rad + cy;
            objs.push(new Obj(
                tx,ty,0,0
            ));
        }
    }

    // generate element array
    let index = [];
    for(let i = 0; i < objs.length; i++){
        // let o1 = objs[i];
        for(let j = i+1; j < objs.length; j++){
            // let o2 = objs[j];

            index.push(i,j);
            // index.push(j,i);
            
            // let dx = o2.x - o1.x;
            // let dy = o2.y - o1.y;
            // let dist = Math.sqrt(dx**2+dy**2);
            
        }
    }

    console.log(index);
    indexLen = index.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(index),gl.STATIC_DRAW);
}

function update(){
    requestAnimationFrame(update);

    let pos = [];

    for(let i = 0; i < objs.length; i++){
        let o = objs[i];
        
        o.x += o.vx;
        o.y += o.vy;
        
        // pos.push(o.x,o.y,o.x,o.y);
        // pos.push(o.x,o.y);
        
        for(let j = i+1; j < objs.length; j++){
            let o2 = objs[j];
            pos.push(
                o.x,o.y,o2.x,o2.y,
                o2.x,o2.y,o.x,o.y
            );
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);
    
    gl.uniform4f(u_color,1,0.5,0,1);
    gl.drawArrays(gl.POINTS,0,pos.length); // draw particle points

    gl.uniform4f(u_color,0,1,0.5,1);
    gl.drawArrays(gl.LINES,0,pos.length/4);
    // gl.drawElements(gl.LINES,indexLen,gl.UNSIGNED_SHORT,0);
}

// 

init();