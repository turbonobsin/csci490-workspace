const can = document.querySelector("canvas");

const ctx = can.getContext("2d");
const gl = can.getContext("webgl2");

// ctx.fillRect(20,20,40,40);

function createProgram(){
    let vs = gl.createShader(gl.VERTEX_SHADER);
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vs,`#version es 300
        void main(){
            gl_Position = vec4(0,0,0,1);
            gl_PointSize = 4.0;
        }
    `);
    gl.shaderSource(fs,`#version es 300
        out vec4 outColor;
        
        void main(){
            outColor = vec4(1,0,0.5,1);
        }
    `);
    
    gl.compileShader(vs);
    gl.compileShader(fs);

    let program = gl.createProgram();
    gl.attachShader(program);
}