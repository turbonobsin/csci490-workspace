/* notes
* every vertex has a normal for each face that it's in corresponding to the direction in that face
*/ 


import { createProgram, m4, normalize } from "./util.js";

const can = document.querySelector("canvas");
can.width = 1920/2;
can.height = 1080/2;
const gl = can.getContext("webgl2",{
    antialias:false
});

let vertCount = 0;

let program = await createProgram(gl,"main3");
// 

// attributes
let aPos = gl.getAttribLocation(program,"a_pos");
// let aCol = gl.getAttribLocation(program,"a_col");
let aNormal = gl.getAttribLocation(program,"a_normal");

let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
let a = 70;
setGeometry(gl);

// 

// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.
function setGeometry(gl) {
    vertCount = 16*6;

    let pos = [
        // left column front
        0,   0,  0,
        0, 150,  0,
        30,   0,  0,
        0, 150,  0,
        30, 150,  0,
        30,   0,  0,

        // top rung front
        30,   0,  0,
        30,  30,  0,
        100,   0,  0,
        30,  30,  0,
        100,  30,  0,
        100,   0,  0,

        // middle rung front
        30,  60,  0,
        30,  90,  0,
        67,  60,  0,
        30,  90,  0,
        67,  90,  0,
        67,  60,  0,

        // left column back
          0,   0,  30,
         30,   0,  30,
          0, 150,  30,
          0, 150,  30,
         30,   0,  30,
         30, 150,  30,

        // top rung back
         30,   0,  30,
        100,   0,  30,
         30,  30,  30,
         30,  30,  30,
        100,   0,  30,
        100,  30,  30,

        // middle rung back
         30,  60,  30,
         67,  60,  30,
         30,  90,  30,
         30,  90,  30,
         67,  60,  30,
         67,  90,  30,

        // top
          0,   0,   0,
        100,   0,   0,
        100,   0,  30,
          0,   0,   0,
        100,   0,  30,
          0,   0,  30,

        // top rung right
        100,   0,   0,
        100,  30,   0,
        100,  30,  30,
        100,   0,   0,
        100,  30,  30,
        100,   0,  30,

        // under top rung
        30,   30,   0,
        30,   30,  30,
        100,  30,  30,
        30,   30,   0,
        100,  30,  30,
        100,  30,   0,

        // between top rung and middle
        30,   30,   0,
        30,   60,  30,
        30,   30,  30,
        30,   30,   0,
        30,   60,   0,
        30,   60,  30,

        // top of middle rung
        30,   60,   0,
        67,   60,  30,
        30,   60,  30,
        30,   60,   0,
        67,   60,   0,
        67,   60,  30,

        // right of middle rung
        67,   60,   0,
        67,   90,  30,
        67,   60,  30,
        67,   60,   0,
        67,   90,   0,
        67,   90,  30,

        // bottom of middle rung.
        30,   90,   0,
        30,   90,  30,
        67,   90,  30,
        30,   90,   0,
        67,   90,  30,
        67,   90,   0,

        // right of bottom
        30,   90,   0,
        30,  150,  30,
        30,   90,  30,
        30,   90,   0,
        30,  150,   0,
        30,  150,  30,

        // bottom
        0,   150,   0,
        0,   150,  30,
        30,  150,  30,
        0,   150,   0,
        30,  150,  30,
        30,  150,   0,

        // left side
        0,   0,   0,
        0,   0,  30,
        0, 150,  30,
        0,   0,   0,
        0, 150,  30,
        0, 150,   0,
    ];
    
    // gl.bufferData(
    //     gl.ARRAY_BUFFER,
    //     new Float32Array(pos),
    //     gl.STATIC_DRAW);

    // Center the F around the origin and Flip it around. We do this because
    // we're in 3D now with and +Y is up where as before when we started with 2D
    // we had +Y as down.

    // We could do by changing all the values above but I'm lazy.
    // We could also do it with a matrix at draw time but you should
    // never do stuff at draw time if you can do it at init time.
    var matrix = m4.xRotation(Math.PI);
    matrix = m4.translate(matrix, -50, -75, -15);

    for (var ii = 0; ii < pos.length; ii += 3) {
        var vector = m4.transformVector(matrix, [pos[ii + 0], pos[ii + 1], pos[ii + 2], 1]);
        pos[ii + 0] = vector[0];
        pos[ii + 1] = vector[1];
        pos[ii + 2] = vector[2];
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
}
  
// Fill the current ARRAY_BUFFER buffer with colors for the 'F'.
function setColors(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array([
            // left column front
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
  
            // top rung front
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
  
            // middle rung front
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
  
            // left column back
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
  
            // top rung back
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
  
            // middle rung back
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
          80, 70, 200,
  
            // top
          70, 200, 210,
          70, 200, 210,
          70, 200, 210,
          70, 200, 210,
          70, 200, 210,
          70, 200, 210,
  
            // top rung right
          200, 200, 70,
          200, 200, 70,
          200, 200, 70,
          200, 200, 70,
          200, 200, 70,
          200, 200, 70,
  
            // under top rung
          210, 100, 70,
          210, 100, 70,
          210, 100, 70,
          210, 100, 70,
          210, 100, 70,
          210, 100, 70,
  
            // between top rung and middle
          210, 160, 70,
          210, 160, 70,
          210, 160, 70,
          210, 160, 70,
          210, 160, 70,
          210, 160, 70,
  
            // top of middle rung
          70, 180, 210,
          70, 180, 210,
          70, 180, 210,
          70, 180, 210,
          70, 180, 210,
          70, 180, 210,
  
            // right of middle rung
          100, 70, 210,
          100, 70, 210,
          100, 70, 210,
          100, 70, 210,
          100, 70, 210,
          100, 70, 210,
  
            // bottom of middle rung.
          76, 210, 100,
          76, 210, 100,
          76, 210, 100,
          76, 210, 100,
          76, 210, 100,
          76, 210, 100,
  
            // right of bottom
          140, 210, 80,
          140, 210, 80,
          140, 210, 80,
          140, 210, 80,
          140, 210, 80,
          140, 210, 80,
  
            // bottom
          90, 130, 110,
          90, 130, 110,
          90, 130, 110,
          90, 130, 110,
          90, 130, 110,
          90, 130, 110,
  
            // left side
          160, 160, 220,
          160, 160, 220,
          160, 160, 220,
          160, 160, 220,
          160, 160, 220,
          160, 160, 220,
        ]),
        gl.STATIC_DRAW);
}

function setNormals(gl) {
    var normals = new Float32Array([
            // left column front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
   
            // top rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
   
            // middle rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
   
            // left column back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
   
            // top rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
   
            // middle rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
   
            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
   
            // top rung right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
   
            // under top rung
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
   
            // between top rung and middle
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
   
            // top of middle rung
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
   
            // right of middle rung
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
   
            // bottom of middle rung.
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
   
            // right of bottom
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
   
            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
   
            // left side
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}

// NOTE: to flip the direction of a triangle just flip the last 2 vertices

function setGeometryCube(gl){
    vertCount = 36;
    
    let pos = [
        // -0.5,0.5,
        // 0.5,0.5,
        // -0.5,-0.5,
        // -0.5,-0.5,
        // 0.5,0.5,
        // 0.5,-0.5
    
        // 2D F shape
        // 0,   0,  0,
        // 30,   0,  0,
        // 0, 150,  0,
        // 0, 150,  0,
        // 30,   0,  0,
        // 30, 150,  0,
    
        // // top rung
        // 30,   0,  0,
        // 100,   0,  0,
        // 30,  30,  0,
        // 30,  30,  0,
        // 100,   0,  0,
        // 100,  30,  0,
    
        // // middle rung
        // 30,  60,  0,
        // 67,  60,  0,
        // 30,  90,  0,
        // 30,  90,  0,
        // 67,  60,  0,
        // 67,  90,  0
    
        // 3D CUBE
        // bottom
        -a,-a,-a,
        a,-a,-a,
        -a,a,-a,
        -a,a,-a,
        a,-a,-a,
        a,a,-a,
        
        // top
        -a,-a,a,
        -a,a,a,
        a,-a,a,
        -a,a,a,
        a,a,a,
        a,-a,a,
    
        // left
        -a,-a,a,
        -a,-a,-a,
        -a,a,a,
        -a,-a,-a,
        -a,a,-a,
        -a,a,a,
    
        // right
        a,-a,a,
        a,a,a,
        a,-a,-a,
        a,-a,-a,
        a,a,a,
        a,a,-a,
    
        // front
        -a,a,a,
        -a,a,-a,
        a,a,a,
        a,a,a,
        -a,a,-a,
        a,a,-a,
    
        // back
        -a,-a,a,
        a,-a,a,
        -a,-a,-a,
        a,-a,a,
        a,-a,-a,
        -a,-a,-a,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);
}

function setColorsCube(/**@type {WebGL2RenderingContext} */gl){
    let c1 = [255,0,0];
    let c2 = [0,255,0];
    let c3 = [0,0,255];
    let c4 = [255,0,255];
    let c5 = [0,255,255];
    let c6 = [255,255,0];
    
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array([
            // left column front
          ...c1,
          ...c1,
          ...c1,
          ...c1,
          ...c1,
          ...c1,
   
          ...c2,
          ...c2,
          ...c2,
          ...c2,
          ...c2,
          ...c2,

          ...c3,
          ...c3,
          ...c3,
          ...c3,
          ...c3,
          ...c3,

          ...c4,
          ...c4,
          ...c4,
          ...c4,
          ...c4,
          ...c4,

          ...c5,
          ...c5,
          ...c5,
          ...c5,
          ...c5,
          ...c5,

          ...c6,
          ...c6,
          ...c6,
          ...c6,
          ...c6,
          ...c6,
        ]),
    gl.STATIC_DRAW);
}

// vao
let vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,0,0);

// SETUP color attr
// let colorBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
// setColors(gl);

// gl.enableVertexAttribArray(aCol);
// gl.vertexAttribPointer(aCol,3,gl.UNSIGNED_BYTE,true,0,0);

// SETUP normal attr
let normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
gl.enableVertexAttribArray(aNormal);
gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,0,0);

setNormals(gl);

// uniforms
let rot = [0,0,0];
let loc = [-150,0,-360];
let scale = [1,1,1];
let anchor = [0.5,0.5];
let fov = 60;

window.loc = loc;
window.rot = rot;
window.scale = scale;
window.setFOV = (v)=>{
  fov = v;
};

let uRes = gl.getUniformLocation(program,"u_res");
let uMat = gl.getUniformLocation(program,"u_mat");
let uColorLoc = gl.getUniformLocation(program,"u_color");
let uReverseLightDirectionLoc = gl.getUniformLocation(program,"u_reverseLightDirection");

let uWorldViewProjectionLoc = gl.getUniformLocation(program,"u_worldViewProjection");
let uWorldLoc = gl.getUniformLocation(program,"u_world");

gl.useProgram(program);
gl.viewport(0,0,can.width,can.height);

// CULL BACK FACES
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

function run(){
    requestAnimationFrame(run);
    rot[2] += 0.02;
    rot[1] -= 0.01;

    drawScene();
}

let cameraAngle = Math.PI;
let cameraRadius = 200;
let numFs = 5;

let i_camAng = document.querySelector("#i-cam-angle");
i_camAng.addEventListener("input",e=>{
    cameraAngle = i_camAng.value * Math.PI*2;
});

function drawScene(){
    gl.useProgram(program);

    // clear the color pixels and the depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindVertexArray(vao); // optional?

    // set uniforms
    // gl.uniform2f(uRes,can.width,can.height);

    // compute the mats
    let projectionMat = m4.projection(
        fov/180*Math.PI,
        can.width/can.height,
        1,2000
    );

    // compute the position of the first F
    let fPos = [cameraRadius, 0, 0];

    // let cameraMat = m4.yRotation(cameraAngle);
    // cameraMat = m4.translate(cameraMat,0,50,cameraRadius*1.5);
    let camera = [100,150,200];
    let target = [0,35,0];
    let up = [0,1,0];
    let cameraMat = m4.lookAt(camera,target,up);

    // make a view matrix from the camera matrix
    let viewMatrix = m4.inverse(cameraMat);

    // move the projection space to view space (the space in front of the camera)
    // both applys perspective AND moves the world so that the camera is effectively at the origin
    let viewProjectionMat = m4.multiply(projectionMat,viewMatrix);

    // draw Fs in a circle
    if(false) for(let i = 0; i < numFs; ++i){
        let ang = i * Math.PI*2 / numFs;

        let x = Math.cos(ang) * cameraRadius;
        let z = Math.sin(ang) * cameraRadius;

        // add in translation for this F
        let mat = m4.translate(viewProjectionMat,x,-100,z);

        // set the matrix
        gl.uniformMatrix4fv(uMat,false,mat);

        // let worldMatrix = m4.yRotation(cameraAngle);
        // let worldViewProjectionMatrix = m4.multiply(viewProjectionMat,worldMatrix);

        // gl.uniformMatrix4fv(uWorldViewProjectionLoc,false,worldViewProjectionMatrix);
        // gl.uniformMatrix2fv(uWorldLoc,false,worldMatrix);

        // set the color to use
        gl.uniform4fv(uColorLoc,[0.2,1,0.2,1]); // green

        // set the light direction
        // gl.uniform3fv(uReverseLightDirectionLoc,normalize([0.5+Math.sin(performance.now()/500)*1,0.7,1]));
        gl.uniform3fv(uReverseLightDirectionLoc,normalize([-0.5,-0.7,1]));

        // draw the geometry
        gl.drawArrays(gl.TRIANGLES,0,16*6);
    }
    else{
      // OLD CODE for rotating F

        let worldMat = m4.yRotation(cameraAngle);
        let worldViewProjectionMatrix = m4.multiply(viewProjectionMat,worldMat);
        gl.uniformMatrix4fv(uWorldViewProjectionLoc,false,worldViewProjectionMatrix);
        gl.uniformMatrix4fv(uWorldLoc,false,worldMat);

        // let mat = m4.translate(viewProjectionMat,x,-100,z);
        let mat = m4.yRotate(viewProjectionMat,cameraAngle+Math.PI);

        gl.uniformMatrix4fv(uMat,false,mat);

        // set the color to use
        gl.uniform4fv(uColorLoc,[0.2,1,0.2,1]); // green

        // set the light direction
        // gl.uniform3fv(uReverseLightDirectionLoc,normalize([0.5+Math.sin(performance.now()/500)*1,0.7,1]));
        gl.uniform3fv(uReverseLightDirectionLoc,normalize([0.5,0.7,1]));

        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES,0,vertCount);
    }
}

run();