// type GL = WebGLRenderingContext;

async function createProgram(/**@type {WebGLRenderingContext}*/gl,path){
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs,await (await fetch(`shaders/${path}.vert`)).text());
    gl.compileShader(vs);

    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs,await (await fetch(`shaders/${path}.frag`)).text());
    gl.compileShader(fs);

    let program = gl.createProgram();
    gl.attachShader(program,vs);
    gl.attachShader(program,fs);
    gl.linkProgram(program);

    return program;
}