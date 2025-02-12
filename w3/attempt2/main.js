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

let program = await createProgram("main");
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
for(let i = 0; i < pos.length; i += 2){
    // pos[i] = can.width/2 + pos[i] * 50;
    // pos[i+1] = can.height/2 + pos[i+1] * 50;
    // pos[i] *= 50;
    // pos[i+1] *= 50;
}

gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

// vao
let vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

let aTexCoord = gl.getAttribLocation(program,"a_texCoord");
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

// textures
let texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D,texture);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);

gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);

// uniforms
let rot = Math.PI/2;
let s = 1; // 50
let scale = [80*s,50*s];
let anchor = [0.5,0.5];
let uRes = gl.getUniformLocation(program,"u_res");
let uLoc = gl.getUniformLocation(program,"u_loc");
let uRot = gl.getUniformLocation(program,"u_rot");
let uScale = gl.getUniformLocation(program,"u_scale");
let uAnchor = gl.getUniformLocation(program,"u_anchor");

let uImg = gl.getUniformLocation(program,"u_image");

gl.useProgram(program);
gl.viewport(0,0,can.width,can.height);
// gl.clearColor(0,0,0,1);
// gl.clear(gl.COLOR_BUFFER_BIT);

gl.uniform1i(uImg,0);

function render(){
    requestAnimationFrame(render);
    rot += 0.01;
    // rot = 0;
    
    gl.useProgram(program);

    gl.uniform2f(uRes,can.width,can.height);
    gl.uniform2f(uLoc,can.width/2,can.height/2);
    gl.uniform2f(uRot,Math.cos(rot),Math.sin(rot));
    gl.uniform2fv(uScale,scale);
    gl.uniform2fv(uAnchor,anchor);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES,0,6);
}
render();