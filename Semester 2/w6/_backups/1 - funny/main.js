const can = document.querySelector("canvas");
const gl = can.getContext("webgl2");

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


    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        -0.5,-0.5,
        -0.5,0.5,
        0.5,0.5,
        0.5,0.5,
        -0.5,-0.5,
        0.5,-0.5
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

    // let mat1 = m4.translation(0,0,0);
    // gl.uniformMatrix4fv(uMat,false,mat1);

    let mat2 = m4.translation(Math.sin(performance.now()/500)/2,Math.cos(performance.now()/500)/2);
    gl.uniformMatrix4fv(uMat,false,mat2);
    
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

    // 

    gl.useProgram(program1);
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);

    gl.drawArrays(gl.TRIANGLES,0,6);

    // gl.useProgram(program2);
    // gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer2);

    // gl.drawArrays(gl.TRIANGLES,0,6);
    
    requestAnimationFrame(init);
    
}
init();