const can = document.querySelector("canvas");
can.width *= 2;
can.height *= 2;
const gl = can.getContext("webgl2");

let program;
let a_pos;
let u_res;
let u_tex;
let u_mat;
let u_texMat;

let posBuffer;
let vao;

class MatrixStack{
    constructor(){
        this.restore();
    }
    stack = [];

    restore(){
        this.stack.pop();
        // never let the stack be totally empty
        if(this.stack.length < 1){
            this.stack[0] = m4.identity();
        }
    }

    // push a copy of the current mat onto the stack
    save(){
        this.stack.push(this.getCurrentMatrix());
    }

    getCurrentMatrix(){
        return this.stack[this.stack.length - 1].slice(); // make a copy
    }

    setCurrentMatrix(m){
        this.stack[this.stack.length - 1] = m;
    }

    translate(x,y,z){
        if(z == undefined) z = 0;
        let m = this.getCurrentMatrix();
        this.setCurrentMatrix(m4.translate(m,x,y,z));
    }

    rotateZ(rad){
        let m = this.getCurrentMatrix();
        this.setCurrentMatrix(m4.zRotate(m,rad));
    }

    scale(x,y,z){
        if(z == undefined) z = 1;
        let m = this.getCurrentMatrix();
        this.setCurrentMatrix(m4.scale(m,x,y,z));
    }
}

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
    u_texMat = gl.getUniformLocation(program,"u_textureMatrix");

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
        -1,-1,
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
        1,1,
        1,1,
        0,0,
        1,0,
        
        // 0,0,
        // 0,1,
        // 1,0,
        // 1,0,
        // 0,1,
        // 1,1,
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

let matrixStack = new MatrixStack();

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

        matrixStack.save();
        matrixStack.translate(can.width/2,can.height/2);
        matrixStack.rotateZ(performance.now()/1000);
        drawImage3(o.texInfo.texture,o.texInfo.width,o.texInfo.height,0,0, undefined, undefined, 0,0,o.texInfo.width/2,o.texInfo.height/2);

        //////

        matrixStack.save();
        matrixStack.translate(o.texInfo.width/-2,o.texInfo.height/-2);
        matrixStack.rotateZ(Math.sin(performance.now()/300*2.2));
        matrixStack.scale(0.2,0.2);
        drawImage3(o.texInfo.texture,o.texInfo.width,o.texInfo.height,0,0,undefined,undefined,undefined,undefined);
        // drawImage3(o.texInfo.texture,o.texInfo.width,o.texInfo.height,0,0,undefined,undefined,undefined,undefined,o.texInfo.width/4,o.texInfo.height/4);
        matrixStack.restore();

        matrixStack.save();
        matrixStack.translate(o.texInfo.width/2,o.texInfo.height/-2);
        matrixStack.rotateZ(Math.sin(performance.now()/300*0.8)/2);
        matrixStack.scale(0.2,0.2);
        drawImage3(o.texInfo.texture,o.texInfo.width,o.texInfo.height,0,0,undefined,undefined,undefined,undefined);
        // drawImage3(o.texInfo.texture,o.texInfo.width,o.texInfo.height,0,0,undefined,undefined,undefined,undefined,o.texInfo.width/4,o.texInfo.height/4);
        matrixStack.restore();

        matrixStack.save();
        matrixStack.translate(o.texInfo.width/2,o.texInfo.height/2);
        matrixStack.rotateZ(Math.PI+Math.cos(performance.now()/300*0.3)*3.14);
        matrixStack.translate(o.texInfo.width/-1*0.2,o.texInfo.height/-1*0.2);
        matrixStack.scale(0.2,0.2);
        drawImage3(o.texInfo.texture,o.texInfo.width,o.texInfo.height,0,0,undefined,undefined,undefined,undefined);
        // drawImage3(o.texInfo.texture,o.texInfo.width,o.texInfo.height,0,0,undefined,undefined,undefined,undefined,o.texInfo.width/4,o.texInfo.height/4);
        matrixStack.restore();
        
        
        //////

        // drawImage(o.texInfo.texture,o.texInfo.width,o.texInfo.height,o.x,o.y);
        // drawImage2(o.texInfo.texture,o.texInfo.width,o.texInfo.height,o.x,o.y, 40-o.x/2, 40);
        // drawImage3(o.texInfo.texture,o.texInfo.width,o.texInfo.height,-o.x/7,-o.y/7, undefined, undefined, o.x,o.y,40+60-o.x/3,40);
        // drawImage3(o.texInfo.texture,o.texInfo.width,o.texInfo.height,0,0, undefined, undefined, o.x,o.y,o.texInfo.width/2,o.texInfo.height/2);

        matrixStack.restore();
    }
}

// 

function drawImage(tex,texWidth,texHeight,dstX,dstY){
    gl.useProgram(program);

    gl.bindVertexArray(vao);

    let textureUnit = 0;
    gl.uniform1i(u_tex,textureUnit);

    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D,tex);

    // convert from pixels to clip space
    let matrix = m4.orthographic(0,can.width,can.height,0,-1,1);

    // the matrix stack is in pixels so it goes after the projection
    matrix = m4.multiply(matrix,matrixStack.getCurrentMatrix());

    // translate quad to dstX, dstY
    matrix = m4.translate(matrix,dstX,dstY,0);

    // scale the 1 unit quad
    matrix = m4.scale(matrix,texWidth,texHeight,1);

    // set the matrix
    gl.uniformMatrix4fv(u_mat,false,matrix);

    // draw the quad
    gl.drawArrays(gl.TRIANGLES,0,6);
}

function drawImage2(tex,texWidth,texHeight,dstX,dstY,dstWidth=texWidth,dstHeight=texHeight){
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    let textureUnit = 0;
    gl.uniform1i(u_tex,textureUnit);

    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D,tex);

    let matrix = m4.orthographic(0,can.width,can.height,0,-1,1);

    // the matrix stack is in pixels so it goes after the projection
    matrix = m4.multiply(matrix,matrixStack.getCurrentMatrix());

    matrix = m4.translate(matrix,dstX,dstY,0);

    // scale our 1 unit quad
    matrix = m4.scale(matrix,dstWidth,dstHeight,1);

    // set the matrix
    gl.uniformMatrix4fv(u_mat,false,matrix);

    // draw the quad
    gl.drawArrays(gl.TRIANGLES,0,6);
}

function drawImage3(
    tex,
    texWidth,texHeight,
    srcX,srcY,
    srcWidth=texWidth,srcHeight=texHeight,
    dstX=srcX,dstY=srcY,
    dstWidth=srcWidth,dstHeight=srcHeight
){
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,tex);

    let matrix = m4.orthographic(0,can.width,can.height,0,-1,1);

    // the matrix stack is in pixels so it goes after the projection
    matrix = m4.multiply(matrix,matrixStack.getCurrentMatrix());

    matrix = m4.translate(matrix,dstX,dstY,0);

    matrix = m4.scale(matrix,dstWidth,dstHeight,1);

    gl.uniformMatrix4fv(u_mat,false,matrix);

    // 

    let texMatrix = m4.translation(srcX / texWidth,srcY / texHeight, 0);
    texMatrix = m4.scale(texMatrix,srcWidth / texWidth,srcHeight / texHeight,1);

    gl.uniformMatrix4fv(u_texMat,false,texMatrix);

    gl.drawArrays(gl.TRIANGLES,0,6);
}

// 

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