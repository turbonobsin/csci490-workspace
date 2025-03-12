const can = document.querySelector("canvas");
// can.width = 3000;
// can.height = 2000;
// const ctx = can.getContext("2d");
const gl = can.getContext("webgl2",{
    antialias:false,
    premultipliedAlpha:false,
    preserveDrawingBuffer:true,
});
console.log(gl.getSupportedExtensions());
console.log(gl.getExtension('WEBGL_shader_storage_buffer_objects'));

async function loadProgram(path){
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh,await (await fetch(path+".vert")).text());
    gl.compileShader(vsh);

    let log = gl.getShaderInfoLog(vsh);
    console.log("vsh",log);

    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh,await (await fetch(path+".frag")).text());
    gl.compileShader(fsh);

    let program = gl.createProgram();
    gl.attachShader(program,vsh);
    gl.attachShader(program,fsh);

    const varyings = ['v_position'];
    gl.transformFeedbackVaryings(program, varyings, gl.INTERLEAVED_ATTRIBS);
    
    gl.linkProgram(program);

    return program;
}

let program = await loadProgram("shaders/main");
// 

// gl.enable(gl.BLEND);
// gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

// attributes
let aPos = gl.getAttribLocation(program,"a_pos");

// uniforms
let uRes = gl.getUniformLocation(program,"u_res");

// a position buffer
// let posBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer); // <-- required here

const initialData = new Float32Array([
    0.10,0.10,0,1,
    20,0.20,0,1,
    0.30,0.10,0,1,
    0.40,0.40,0,1,
    0.50,0.20,0,1
]);

// let vao = gl.createVertexArray();
// gl.bindVertexArray(vao);
// gl.enableVertexAttribArray(aPos);
// gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

// 
// const ssbo = gl.createBuffer();
// gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, ssbo);
// const initialData = new Float32Array([
//     10,10,0,0,
//     20,20,0,0,
//     30,10,0,0,
//     40,40,0,0,
//     50,20,0,0
// ]);
// gl.bufferData(gl.SHADER_STORAGE_BUFFER, initialData, gl.DYNAMIC_COPY);
// gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 0, ssbo);

// 
gl.useProgram(program);
// gl.uniform2f(uRes,can.width,can.height);

const inputBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, inputBuffer);
gl.bufferData(gl.ARRAY_BUFFER, initialData, gl.DYNAMIC_COPY);

const outputBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, outputBuffer);
gl.bufferData(gl.ARRAY_BUFFER, initialData.length * 4, gl.DYNAMIC_COPY);

const transformFeedback = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, outputBuffer);

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

    gl.drawArrays(gl.TRIANGLES,0,6);
}

// 
function draw(draw=true){
    gl.useProgram(program);

    // drawRect(20,20,60,30,[1,0,0,1]);


    const positionLocation = gl.getAttribLocation(program, 'a_pos');
    gl.bindBuffer(gl.ARRAY_BUFFER, inputBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 4, gl.FLOAT, false, 0, 0);
    
    if(!draw) gl.enable(gl.RASTERIZER_DISCARD); // Disable rasterization to use Transform Feedback
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, initialData.length / 4);
    gl.endTransformFeedback();
    if(!draw) gl.disable(gl.RASTERIZER_DISCARD);
}
draw();

window.draw = draw;