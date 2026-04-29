const can = document.querySelector("canvas");
can.width *= 2;
can.height *= 2;
const gl = can.getContext("webgl2");

let program;
let a_pos;
let u_res;
let u_tex;
let u_mat;

let posBuffer;
let vao;

async function init(){
    program = webglUtils.createProgramFromSources(gl,[
        await (await fetch("shaders/main.vert")).text(),
        await (await fetch("shaders/main.frag")).text(),
    ]);

    gl.useProgram(program);

    a_pos = gl.getAttribLocation(program,"a_pos");
    let a_texCoord = gl.getAttribLocation(program,"a_texCoord");

    u_res = gl.getUniformLocation(program,"u_res");
    u_tex = gl.getUniformLocation(program,"u_tex");
    u_mat = gl.getUniformLocation(program,"u_matrix");

    gl.uniform2f(u_res,can.width,can.height);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        -1,-1,
        -1,1,
        1,1,
        1,1,
        -1,1,
        1,-1
        
        // -1,-1,
        // 1,-1,
        // -1,1,
        // -1,1,
        // 1,-1,
        // 1,1
    ]),gl.STATIC_DRAW);

    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos,2,gl.FLOAT,false,0,0);

    // texCoord buffer
    let texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        0,0,
        0,1,
        1,0,
        1,0,
        0,1,
        1,1,
    ]),gl.STATIC_DRAW);

    gl.enableVertexAttribArray(a_texCoord);
    gl.vertexAttribPointer(a_texCoord,2,gl.FLOAT,true,0,0);

    // 
    draw();
}

function loadImage(url){
    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,tex);

    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

    let img = new Image();
    img.src = url;

    let texInfo = {
        width:1,
        height:1,
        texture:tex,
        img
    };

    img.addEventListener("load",e=>{
        texInfo.width = img.width;
        texInfo.height = img.height;

        gl.bindTexture(gl.TEXTURE_2D,texInfo.texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    return texInfo;
}

let images = [
    loadImage("images/bc_computingclub.png")
];

let objs = [];
for(let i = 0; i < 1; i++){
    objs.push({
        x:Math.random()*can.width,
        y:Math.random()*can.height,
        vx:Math.random()-0.5 ? 1 : -1,
        vy:Math.random()-0.5 ? 1 : -1,
        texInfo:images[0]
    });
}

function updateObjs(){
    for(let i = 0; i < objs.length; i++){
        let o = objs[i];

        o.x += o.vx;
        o.y += o.vy;

        if(o.x < 0){
            o.x = 0;
            o.vx = Math.abs(o.vx);
        }
        else if(o.x >= can.width){
            o.x = can.width-1;
            o.vx = -Math.abs(o.vx);
        }
        if(o.y < 0){
            o.y = 0;
            o.vy = Math.abs(o.vy);
        }
        else if(o.y >= can.height){
            o.y = can.height-1;
            o.vy = -Math.abs(o.vy);
        }

        drawImage(o.texInfo.texture,o.texInfo.width,o.texInfo.height,o.x,o.y);
    }
}

function drawImage(tex,texWidth,texHeight,dstX,dstY){
    gl.useProgram(program);

    gl.bindVertexArray(vao);

    let textureUnit = 0;
    gl.uniform1i(u_tex,textureUnit);

    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D,tex);

    // convert from pixels to clip space
    let matrix = m4.orthographic(0,can.width,can.height,0,-1,1);

    // translate quad to dstX, dstY
    matrix = m4.translate(matrix,dstX,dstY,0);

    // scale the 1 unit quad
    matrix = m4.scale(matrix,texWidth,texHeight,1);

    // set the matrix
    gl.uniformMatrix4fv(u_mat,false,matrix);

    // draw the quad
    gl.drawArrays(gl.TRIANGLES,0,6);
}

function draw(time){
    time /= 1000; // convert to seconds

    requestAnimationFrame(draw);
    gl.viewport(0,0,can.width,can.height);
    
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    // gl.drawArrays(gl.TRIANGLES,0,6);

    updateObjs();
}

init();