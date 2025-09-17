let scale = 4;

const can = document.querySelector("canvas");
can.width *= scale;
can.height *= scale;
const gl = can.getContext("webgl2");

async function createShader(type,src){
    let shader = gl.createShader(type);
    gl.shaderSource(shader,await (await fetch(src)).text());
    gl.compileShader(shader);
    return shader;
}

async function createProgram(){
    let vs = await createShader(gl.VERTEX_SHADER,"shaders/main.vert");
    let fs = await createShader(gl.FRAGMENT_SHADER,"shaders/main.frag");
    
    let program = gl.createProgram();
    gl.attachShader(program,vs);
    gl.attachShader(program,fs);
    gl.linkProgram(program);
    return program;
}

async function init(){
    let program = await createProgram();

    // can.width /= 2;
    // can.height /= 2;
    gl.useProgram(program);

    let aPos = gl.getAttribLocation(program,"a_pos");
    let posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);

    let uRes = gl.getUniformLocation(program,"u_res");
    gl.uniform2f(uRes,can.width,can.height);
    
    // let pos = [
    //     -0.5,0.5,
    //     0.5,0.5,
    //     -0.5,-0.5,
    //     -0.5,-0.5,
    //     0.5,0.5,
    //     0.5,-0.5
    // ];
    let w = 120 * scale;
    let h = 120 * scale;
    let x = can.width/2 - w/2;
    let y = can.height/2 - h/2;
    let x2 = x+w;
    let y2 = y+h;
    let pos = [
        x,y,
        x,y2,
        x2,y,
        x2,y,
        x,y2,
        x2,y2
    ];

    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

    // 

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

    gl.useProgram(program);
    gl.viewport(0,0,can.width,can.height);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES,0,6);

    
}
init();