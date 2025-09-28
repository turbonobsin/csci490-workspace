let scale = 2;

const can = document.querySelector("canvas");
can.width *= scale;
can.height *= scale;
const gl = can.getContext("webgl2",{
    antialias:false,
    premultipliedAlpha:false
});

let mx = 0;
let my = 0;

let testX = 0;
let testY = 0;

let keys = {};

document.addEventListener("mousemove",e=>{
    mx = (e.clientX - can.offsetLeft) / can.offsetWidth * can.width;
    my = (e.clientY - can.offsetTop) / can.offsetHeight * can.height;
});
document.addEventListener("keydown",e=>{
    let k = e.key.toLowerCase();
    keys[k] = true;
});
document.addEventListener("keyup",e=>{
    let k = e.key.toLowerCase();
    keys[k] = false;
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
let imageProgram;
let imageP = {
    a_pos:null,
    u_res:null,
    u_tex:null,
    posBuffer:null,
    vao:null,
};

let a_vert;
let a_pos;
let a_color;
let u_res;
let u_tex;
let u_mode;
let vao;
let vertBuffer;
let posBuffer;
let colorBuffer;

let fb1;
let tex1;
let fb2;
let tex2;

let emptyTex;

function createEmptyTexture(){
    let tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,can.width,can.height,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(can.width*can.height*4));
    return tex;
}

async function init(){
    gen();
    // 

    emptyTex = createEmptyTexture();
    
    // image program
    imageProgram = await createProgram("image");
    gl.useProgram(imageProgram);
    imageP.a_pos = gl.getAttribLocation(imageProgram,"a_pos");
    imageP.u_res = gl.getUniformLocation(imageProgram,"u_res");
    imageP.u_tex = gl.getUniformLocation(imageProgram,"u_tex");
    gl.uniform2f(imageP.u_res,can.width,can.height);

    imageP.vao = gl.createVertexArray();
    gl.bindVertexArray(imageP.vao);

    imageP.posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,imageP.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        0,0,
        can.width,0,
        0,can.height,
        0,can.height,
        can.width,0,
        can.width,can.height
    ]),gl.STATIC_DRAW);

    gl.enableVertexAttribArray(imageP.a_pos);
    gl.vertexAttribPointer(imageP.a_pos,2,gl.FLOAT,false,0,0);


    // create framebuffers
    fb1 = gl.createFramebuffer();
    tex1 = createEmptyTexture();
    gl.bindFramebuffer(gl.FRAMEBUFFER,fb1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex1,0);

    // create VAO
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    // main particle program
    program = await createProgram("main");
    gl.useProgram(program);

    gl.bindVertexArray(vao);


    a_vert = gl.getAttribLocation(program,"a_vert");
    a_pos = gl.getAttribLocation(program,"a_pos");
    a_color = gl.getAttribLocation(program,"a_color");
    u_res = gl.getUniformLocation(program,"u_res");
    u_tex = gl.getUniformLocation(program,"u_tex");
    u_mode = gl.getUniformLocation(program,"u_mode");

    // 
    let circle = [];
    let circleR = 20;
    // let circleR = 4;
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
        100,20,
        60,60,
        20,124
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
    // gl.vertexAttribDivisor(a_color,1);

    // 
    gl.uniform2f(u_res,can.width,can.height);

    // 
    render();
}

function render(){
    requestAnimationFrame(render);

    // keys
    let speed = 2;
    if(keys.a) testX -= speed;
    if(keys.d) testX += speed;
    if(keys.w) testY -= speed;
    if(keys.s) testY += speed;
    // 

    gl.viewport(0,0,can.width,can.height);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fb1);

    gl.uniform1i(u_mode,0);

    let pos = [];
    for(let i = 0; i < objs.length; i++){
        let o = objs[i];
        o.run();

        // DEBUG
        if(true){
            if(i == 0){
                o.x = can.width/2 + testX;
                o.y = can.height/2 + testY;
            }
            else if(i == 1){
                o.x = mx;
                o.y = my;
            }
        }

        pos.push(o.x,o.y);
    }

    // 
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.DYNAMIC_DRAW);

    // load empty texture for first pass
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,emptyTex);
    gl.uniform1i(u_tex,0);

    // 
    // gl.drawArrays(gl.POINTS,0,objs.length);
    // gl.drawArraysInstanced(gl.POINTS,0,objs.length,1);

    // gl.drawArraysInstanced(gl.POINTS,0,4,objs.length);
    // gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,objs.length);
    // gl.drawArrays(gl.LINE_STRIP,0,64);
    gl.drawArraysInstanced(gl.TRIANGLE_FAN,0,33,objs.length); // solid
    // gl.drawArraysInstanced(gl.LINES,0,33,objs.length); // dashed lines

    // ////////

    // draw image
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    // gl.useProgram(imageProgram);
    // gl.bindVertexArray(imageP.vao);

    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D,tex1);
    // gl.uniform1i(imageP.u_tex,0);
    
    // gl.drawArrays(gl.TRIANGLES,0,6);

    // second pass
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,tex1); // <-- not sure if this is all necessary
    gl.uniform1i(u_tex,0);

    gl.uniform1i(u_mode,1);

    gl.drawArraysInstanced(gl.TRIANGLE_FAN,0,33,objs.length);

    // clear tex1
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,can.width,can.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
}

init();