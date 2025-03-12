const can = document.querySelector("canvas");
can.width = 1920/2;
can.height = 1080/2;
const gl = can.getContext("webgl2",{
    antialias:false
});

async function createProgram(name){
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs,await (await fetch("shaders/"+name+".vert")).text());
    gl.compileShader(vs);

    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs,await (await fetch("shaders/"+name+".frag")).text());
    gl.compileShader(fs);

    let program = gl.createProgram();
    gl.attachShader(program,vs);
    gl.attachShader(program,fs);
    gl.linkProgram(program);

    return program;
}
function loadImage(src){
    let img = new Image();
    img.src = src;
    return new Promise(resolve=>{
        img.onload = function(){
            resolve(img);
        };
    });
}

let program = await createProgram("main3");
let img = await loadImage("/images/kappapt_redleaves.png");
// 

// attributes
let aPos = gl.getAttribLocation(program,"a_pos");
let aCol = gl.getAttribLocation(program,"a_col");

let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);

let a = 70;

// NOTE: to flip the direction of a triangle just flip the last 2 vertices

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
    a,a,-a

    
];

gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

// vao
let vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,0,0);

// let aTexCoord = gl.getAttribLocation(program,"a_texCoord");
// let texCoordBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER,texCoordBuffer);
// gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
//     0,0,
//     1,0,
//     0,1,
//     0,1,
//     1,0,
//     1,1
// ]),gl.STATIC_DRAW);
// gl.enableVertexAttribArray(aTexCoord);
// gl.vertexAttribPointer(aTexCoord,2,gl.FLOAT,false,0,0);

// textures
// let texture = gl.createTexture();
// gl.activeTexture(gl.TEXTURE0);
// gl.bindTexture(gl.TEXTURE_2D,texture);
// gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
// gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
// gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
// gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);

// gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);

// SETUP color attr

function setColors(/**@type {WebGL2RenderingContext} */gl){
    let c1 = [255,0,0];
    let c2 = [0,255,0];
    let c3 = [0,0,255];
    let c4 = [255,0,255];
    
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
        ]),
    gl.STATIC_DRAW);
}

let colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
setColors(gl);

gl.enableVertexAttribArray(aCol);
gl.vertexAttribPointer(aCol,3,gl.UNSIGNED_BYTE,true,0,0);

// uniforms
let rot = [0,0,0];
let s = 1; // 50
let loc = [can.width/2,can.height/2,0];
// let scale = [80*s,50*s,20*s];
let scale = [1,1,1];
let anchor = [0.5,0.5];

window.loc = loc;
window.rot = rot;
window.scale = scale;

let uRes = gl.getUniformLocation(program,"u_res");
let uLoc = gl.getUniformLocation(program,"u_loc");
let uRot = gl.getUniformLocation(program,"u_rot");
let uScale = gl.getUniformLocation(program,"u_scale");
let uAnchor = gl.getUniformLocation(program,"u_anchor");
let uMat = gl.getUniformLocation(program,"u_mat");

window.setAnchor = (a,b)=>{
    anchor[0] = a;
    anchor[1] = b;
};

// let uImg = gl.getUniformLocation(program,"u_image");

gl.useProgram(program);
gl.viewport(0,0,can.width,can.height);

// CULL BACK FACES
gl.enable(gl.CULL_FACE);

// gl.uniform1i(uImg,0);

const m4 = {
    translation: function(tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },

    xRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
     
        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },
    
    yRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        
        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },
    
    zRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        
        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },
   
    rotation2D: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c,-s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    },
   
    scaling: function(sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    },

    translate: function(m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },
     
    xRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },
     
    yRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },
     
    zRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },
     
    scale: function(m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

    multiply3: function(a, b) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
     
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },

    multiply: function(a, b) {
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
     
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    identity3: function () {
        return [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
        ];
    },
    identity: function () {
        return [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        ];
    },

    projection: function (width, height, depth) {
        // Note: This matrix flips the Y axis so that 0 is at the top.
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1,
        ];
    },
};

function render(){
    requestAnimationFrame(render);
    rot[2] += 0.02;
    rot[1] -= 0.01;
    // rot = 0;
    
    gl.useProgram(program);

    gl.bindVertexArray(vao); // optional?

    gl.uniform2f(uRes,can.width,can.height);
    // gl.uniform2f(uLoc,can.width/2,can.height/2);
    // gl.uniform2f(uRot,Math.cos(rot),Math.sin(rot));
    // gl.uniform2fv(uScale,scale);
    // gl.uniform2fv(uAnchor,anchor);

    if(1){
        // compute the matrices
        // let mat = m3.identity();
        // let an = [
        //     (anchor[0] - 0.5) * scale[0],
        //     -(anchor[1] - 0.5) * scale[1]
        // ];

        // MY PIVOT METHOD
        // mat = m3.multiply(mat,m3.translation(an[0],an[1]));
        // mat = m3.multiply(mat,m3.translation(can.width/2,can.height/2));
        // mat = m3.multiply(mat,m3.rotation(rot));
        // mat = m3.multiply(mat,m3.translation(-an[0],-an[1]));
        // mat = m3.multiply(mat,m3.scaling(scale[0],scale[1]));

        // THEIR PIVOT METHOD
        // mat = m3.multiply(mat,m3.projection(can.width,can.height));
        // mat = m3.multiply(mat,m3.translation(can.width/2,can.height/2));
        // mat = m3.multiply(mat,m3.rotation(rot));
        // mat = m3.multiply(mat,m3.scaling(scale[0],scale[1]));
        // mat = m3.multiply(mat,m3.translation(anchor[0]-0.5,anchor[1]-0.5));
        // mat = m3.multiply(mat,m3.projection(can.clientWidth,can.clientHeight)); // coordinates are based on screen pixels but you can keep the canvas a lower resolution

        // --- 2D
        // mat = m3.multiply(mat,m3.projection(can.width,can.height)); // coordinates are in pixel coords
        // mat = m3.translate(mat,can.width/2,can.height/2);
        // mat = m3.rotate(mat,rot);
        // mat = m3.scale(mat,scale[0],scale[1]);
        // mat = m3.translate(mat,anchor[0]-0.5,anchor[1]-0.5);

        let mat = m4.identity();
        mat = m4.projection(can.width,can.height,300);
        mat = m4.translate(mat,loc[0],loc[1],loc[2]);
        mat = m4.xRotate(mat,rot[0]);
        mat = m4.yRotate(mat,rot[1]);
        mat = m4.zRotate(mat,rot[2]);
        mat = m4.scale(mat,scale[0],scale[1],scale[2]);


        gl.uniformMatrix4fv(uMat,false,mat);

        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES,0,24);
    }
    else{
        // Compute the matrices
        var translationMatrix = m3.translation(can.width/2, can.height/2);
        var rotationMatrix = m3.rotation(rot);
        var scaleMatrix = m3.scaling(scale[0], scale[1]);

        // Starting Matrix.
        var matrix = m3.identity();
        matrix = m3.multiply(matrix, translationMatrix);
        matrix = m3.multiply(matrix, rotationMatrix);
        matrix = m3.multiply(matrix, scaleMatrix);

        for (var i = 0; i < 5; ++i) {
            // Multiply the matrices.
            // matrix = m3.multiply(matrix, translationMatrix);
            matrix = m3.multiply(matrix, rotationMatrix);
            // matrix = m3.multiply(matrix, scaleMatrix);

            // Set the matrix.
            gl.uniformMatrix3fv(uMat, false, matrix);

            // Draw the geometry.
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 6;
            gl.drawArrays(primitiveType, offset, count);
        }
    }
}
render();