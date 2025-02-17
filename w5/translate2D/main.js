const can = document.querySelector("canvas");
// can.width = 1920*4;
// can.height = 1080*4;
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

let program = await createProgram("main2");
let img = await loadImage("/images/kappapt_redleaves.png");
// 

// attributes
let aPos = gl.getAttribLocation(program,"a_pos");
let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);

let pos = [
    -0.5,0.5,
    0.5,0.5,
    -0.5,-0.5,
    -0.5,-0.5,
    0.5,0.5,
    0.5,-0.5
];

gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

// vao
let vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

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

// uniforms
let rot = 0;
let s = 1; // 50
let scale = [80*s,50*s];
let anchor = [0.5,0.5];
let uRes = gl.getUniformLocation(program,"u_res");
let uLoc = gl.getUniformLocation(program,"u_loc");
let uRot = gl.getUniformLocation(program,"u_rot");
let uScale = gl.getUniformLocation(program,"u_scale");
let uAnchor = gl.getUniformLocation(program,"u_anchor");
let uMat = gl.getUniformLocation(program,"u_mat");

// let uImg = gl.getUniformLocation(program,"u_image");

gl.useProgram(program);
gl.viewport(0,0,can.width,can.height);

// gl.uniform1i(uImg,0);

const m3 = {
    translation: function(tx, ty) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ];
    },
   
    rotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c,-s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    },
   
    scaling: function(sx, sy) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1,
        ];
    },

    multiply: function(a, b) {
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

    identity: function () {
        return [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
        ];
    },
};

function render(){
    requestAnimationFrame(render);
    rot += 0.01;
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
        let mat = m3.identity();
        let an = [
            (anchor[0] - 0.5) * scale[0],
            -(anchor[1] - 0.5) * scale[1]
        ];
        mat = m3.multiply(mat,m3.translation(an[0],an[1]));
        mat = m3.multiply(mat,m3.translation(can.width/2,can.height/2));
        mat = m3.multiply(mat,m3.rotation(rot));
        mat = m3.multiply(mat,m3.translation(-an[0],-an[1]));
        mat = m3.multiply(mat,m3.scaling(scale[0],scale[1]));

        // 2
        // let mat = m3.multiply(scaleMat,rotMat);
        // mat = m3.multiply(mat,transMat);

        gl.uniformMatrix3fv(uMat,false,mat);

        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES,0,6);
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