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

let program;
let vao;
let posBuffer;
let indexBuffer;
let indexLen = 0;
let u_color;
let u_pos;

let lineProgram;
let lineVao;
let linePosBuffer;
let lineUColor;
let lineUPos;
let lineUElm;
let lineUTex;
let lineUTex2;
let tex;
let tex2;

let pairs = [];

async function init(){
    
    lineProgram = await createProgram(gl,"lines");
    gl.useProgram(lineProgram);

    let lineAPos = gl.getAttribLocation(lineProgram,"a_pos");
    lineUColor = gl.getUniformLocation(lineProgram,"u_color");
    lineUPos = gl.getUniformLocation(lineProgram,"u_pos");
    lineUElm = gl.getUniformLocation(lineProgram,"u_elm");
    lineUTex = gl.getUniformLocation(lineProgram,"u_tex");
    lineUTex2 = gl.getUniformLocation(lineProgram,"u_tex2");

    gen();

    const data = new Int32Array(2000);
    for (let i = 0; i < 1000; i++) {
        // data[i] = i;
        data[i * 2 + 0] = i;
        data[i * 2 + 1] = i * 2;
    }

    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32I, 1000, 1, 0, gl.RED_INTEGER, gl.INT, data);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1000, 1, 0, gl.RGBA, gl.RG_INTEGER, data);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32I, 1000, 1, 0, gl.RG_INTEGER, gl.INT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(lineUTex,0);

    pairs = [];
    for(let i = 0; i < objs.length; i++){
        for(let j = i+1; j < objs.length; j++){
            pairs.push(i,j);
        }
    }

    tex2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    console.log("pair length",pairs.length/2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32I, pairs.length/2, 1, 0, gl.RG_INTEGER, gl.INT, new Int32Array(pairs));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(lineUTex2,1);

    console.log("pairs",pairs);
    
    let lineURes = gl.getUniformLocation(lineProgram,"u_res");
    gl.uniform2f(lineURes,can.width,can.height);

    
    // linePosBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER,linePosBuffer);
    // let linePos = [
    //     0,1,
    //     1,2,
    //     2,3
    // ];
    // gl.bufferData(gl.ARRAY_BUFFER,new Int32Array(linePos),gl.STATIC_DRAW);

    // lineVao = gl.createVertexArray();
    // gl.bindVertexArray(lineVao);
    // gl.enableVertexAttribArray(lineAPos);
    // gl.vertexAttribPointer(lineAPos,2,gl.INT,false,0,0);
    
    // 
    
    program = await createProgram(gl,"main");
    gl.useProgram(program);

    gl.viewport(0,0,can.width,can.height);

    let a_pos = gl.getAttribLocation(program,"a_pos");
    let u_res = gl.getUniformLocation(program,"u_res");
    u_color = gl.getUniformLocation(program,"u_color");
    u_pos = gl.getUniformLocation(program,"u_pos");

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
    
    vao = gl.createVertexArray();
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
    // gen();
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
        for(let i = 0; i < 100; i++){ // 40
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
            index.push(j,i);
            
            // let dx = o2.x - o1.x;
            // let dy = o2.y - o1.y;
            // let dist = Math.sqrt(dx**2+dy**2);
            
        }
    }

    // console.log(index);
    // indexLen = index.length;
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(index),gl.STATIC_DRAW);
}

function update(){
    requestAnimationFrame(update);

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    let pos = [];
    let simplePos = [];
    let elms = [];

    for(let i = 0; i < objs.length; i++){
        let o = objs[i];
        
        o.x += o.vx;
        o.y += o.vy;

        // if()

        simplePos.push(o.x,o.y);

        elms.push(i,i);
        
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

    // gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

    gl.uniform2fv(u_pos,pos);
    
    gl.uniform4f(u_color,1,0.5,0,1);
    gl.drawArrays(gl.POINTS,0,simplePos.length); // draw particle points

    gl.useProgram(lineProgram);
    gl.bindVertexArray(lineVao);

    // gl.bindBuffer(gl.ARRAY_BUFFER,linePosBuffer);
    // gl.uniform2fv(lineUPos,pos);
    // gl.uniform2iv(lineUElm,elms);

    gl.bindTexture(gl.TEXTURE_2D,tex);
    let data = new Int32Array(objs.length*2);
    for(let i = 0; i < objs.length; i++){
        let o = objs[i];
        data[i*2 + 0] = o.x;
        data[i*2 + 1] = o.y;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32I, objs.length, 1, 0, gl.RG_INTEGER, gl.INT, data);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(lineUTex,0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D,tex2);
    gl.uniform1i(lineUTex2,1);
    
    gl.uniform4f(lineUColor,0,1,0.5,1);
    gl.drawArrays(gl.LINES,0,9900);
    gl.drawArrays(gl.POINTS,0,9900);
    // gl.drawElements(gl.LINES,indexLen,gl.UNSIGNED_SHORT,0);
}

// 

init();