const can = document.querySelector("canvas");
can.width = 3000;
can.height = 2000;
// const ctx = can.getContext("2d");
const gl = can.getContext("webgl2",{
    antialias:false,
    premultipliedAlpha:false,
    preserveDrawingBuffer:true,
});

async function loadProgram(path){
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh,await (await fetch(path+".vert")).text());
    gl.compileShader(vsh);
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh,await (await fetch(path+".frag")).text());
    gl.compileShader(fsh);

    let program = gl.createProgram();
    gl.attachShader(program,vsh);
    gl.attachShader(program,fsh);
    gl.linkProgram(program);

    return program;
}
function loadImage(path){
    let img = new Image();
    img.src = path;
    return new Promise(resolve=>{
        img.onload = e=>{
            resolve(img);
        };
    });
}

let program = await loadProgram("shaders/main");
let img = await loadImage("/images/kappapt_redleaves.png");
let imgTint = await loadImage("/images/tint.png");
// 

gl.enable(gl.BLEND);
gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

// attributes
let aPos = gl.getAttribLocation(program,"a_pos");
let aTexCoord = gl.getAttribLocation(program,"a_texCoord");

// uniforms
let uRes = gl.getUniformLocation(program,"u_res");
let uImage = gl.getUniformLocation(program,"u_image");
let uCol = gl.getUniformLocation(program,"u_col");
let uMode = gl.getUniformLocation(program,"u_mode");

// a position buffer
let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer); // <-- required here

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

// a tex coord buffer
let texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
    0,0,
    1,0,
    0,1,
    0,1,
    1,0,
    1,1
]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(aTexCoord);
gl.vertexAttribPointer(aTexCoord,2,gl.FLOAT,false,0,0);

// texture
function loadTexture(image,ind){
    // let start0 = performance.now();
    let texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + ind);
    gl.bindTexture(gl.TEXTURE_2D,texture);

    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);

    // gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
}
loadTexture(img,0);
// loadTexture(await loadImage("/images/tint.png"),1);

// 
gl.useProgram(program);
gl.uniform2f(uRes,can.width,can.height);
gl.uniform1i(uImage,0);

// console.log("time [tex]: ",performance.now()-start0);

// 
function drawRect(x,y,w,h,col){
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);

    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        x,y,
        x+w,y,
        x,y+h,
        x,y+h,
        x+w,y,
        x+w,y+h
    ]),gl.STATIC_DRAW);

    gl.uniform1i(uMode,0);
    gl.uniform4fv(uCol,col);

    gl.drawArrays(gl.TRIANGLES,0,6);
}

function drawImg(x,y,w,h,image){
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);

    w = image.width;
    h = image.height;

    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        x,y,
        x+w,y,
        x,y+h,
        x,y+h,
        x+w,y,
        x+w,y+h
    ]),gl.STATIC_DRAW);

    gl.uniform1i(uMode,1);
    // gl.activeTexture(gl.TEXTURE0 + ind);

    let texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,texture);

    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);

    gl.drawArrays(gl.TRIANGLES,0,6);
}

// 
function draw(){
    gl.useProgram(program);

    let start = performance.now();
    drawRect(0,0,60,30,[1,0,0,1]);
    // drawRect(0,0,can.width,can.height,[1,0,0,1]);
    console.log("time [1]: ",performance.now()-start);

    start = performance.now();
    // drawImg(10,10,150,150*img.height/img.width);
    drawImg(0,0,img.width,img.height,img);
    drawImg(300,300,img.width,img.height,imgTint);
    console.log("time [2]: ",performance.now()-start);

    start = performance.now();
    let ar = new Uint8Array(can.width*can.height*4);
    gl.readPixels(0,0,can.width,can.height,gl.RGBA,gl.UNSIGNED_BYTE,ar);
    console.log("time [3]: ",performance.now()-start);
    
    // setTimeout(()=>{
        // let ar = new Uint8Array(4);
        // gl.readPixels(0,can.height-1,1,1,gl.RGBA,gl.UNSIGNED_BYTE,ar);
        // console.log("AR:",ar);
    // },1000);
}
draw();