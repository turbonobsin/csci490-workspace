const can = document.querySelector("canvas");
const gl = can.getContext("webgl2",{
    // antialias:false
});

let program1;
let program2;
let vao;
let posBuffer;
let aPos = 0;
let aTexCoord = 1;
let uMat;
let uMat2;

async function init(){
    program1 = await createProgram(gl,"main");
    program2 = await createProgram(gl,"main2");

    gl.useProgram(program1);

    aPos = gl.getAttribLocation(program1,"a_pos");
    aTexCoord = gl.getAttribLocation(program1,"a_texCoord");
    
    uMat = gl.getUniformLocation(program1,"u_mat");
    uMat2 = gl.getUniformLocation(program2,"u_mat");


    let x = can.width/2;
    let y = can.height/2;
    let w = 50;
    let h = 30;
    let x2 = x+w;
    let y2 = y+h;
    
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        -0.5,-0.5,
        -0.5,0.5,
        0.5,0.5,
        0.5,0.5,
        -0.5,-0.5,
        0.5,-0.5

        // x,y,
        // x2,y,
        // x,y2,
        // x,y2,
        // x2,y,
        // x2,y2

    ]),gl.STATIC_DRAW);

    // let posBuffer2 = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer2);
    // gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
    //     -0.5 - 0.2,  -0.5 - 0.2,
    //     -0.5 - 0.2,  0.5  - 0.2,
    //     0.5  - 0.2,  0.5  - 0.2,
    //     0.5  - 0.2,  0.5  - 0.2,
    //     -0.5 - 0.2,  -0.5 - 0.2,
    //     0.5  - 0.2,  -0.5 - 0.2,
    // ]),gl.STATIC_DRAW);

    // let mat1 = m4.orthographic(0,can.width,can.height,0,-1,1);
    let mat1 = m4.orthographic(-1,1,1,-1,-1,1);
    mat1 = m4.translate(mat1,-0.2,-0.2,0);
    mat1 = m4.zRotate(mat1,Math.PI/4);
    gl.uniformMatrix4fv(uMat,true,mat1);

    // let mat2 = m4.translation(Math.sin(performance.now()/500)/2,Math.cos(performance.now()/500)/2);
    
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

    // 

    gl.useProgram(program1);

    gl.drawArrays(gl.TRIANGLES,0,6);

    gl.useProgram(program2);
    
    let mat2 = m4.translation(-0.2,0.2,0);
    // mat2 = m4.rotate();
    gl.uniformMatrix4fv(uMat2,false,mat2);

    gl.drawArrays(gl.TRIANGLES,0,6);
    
    requestAnimationFrame(init);
    
}
init();