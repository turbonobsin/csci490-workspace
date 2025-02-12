const can = document.querySelector("canvas");
const gl = can.getContext("webgl2",{
    antialias:false
});

type GL = WebGL2RenderingContext;
declare const webglLessonsUI:any;

let program:WebGLProgram;

async function createProgram(vsSrc:string,fsSrc:string){
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs,await (await fetch("shaders/"+vsSrc)).text());
    gl.compileShader(vs);

    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs,await (await fetch("shaders/"+fsSrc)).text());
    gl.compileShader(fs);
    
    let program = gl.createProgram();
    gl.attachShader(program,vs);
    gl.attachShader(program,fs);
    gl.linkProgram(program);

    return program;
}

// NEW VARIABLES

let translation = [0,0];
let width = 100;
let height = 30;
let color = [
    Math.random(),
    Math.random(),
    Math.random(),
    1
];

function setRectangle(gl:GL, x:number, y:number, width:number, height:number) {
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ]), gl.STATIC_DRAW);
}

// INIT

async function init(){
    program = await createProgram("main.vert","main.frag");
    // 

    let aPositionLoc = gl.getAttribLocation(program,"a_position");
    let posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    
    let uResolutionLoc = gl.getUniformLocation(program,"u_resolution");
    let uTranslationLoc = gl.getUniformLocation(program,"u_translation");
    let uColorLoc = gl.getUniformLocation(program,"u_color");

    let pos = [
        10, 20,
        80, 20,
        10, 30,
        10, 30,
        80, 20,
        80, 30,
    ];
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc,2,gl.FLOAT,false,0,0);

    setRectangle(gl,translation[0],translation[1],width,height); // set ONCE now

    function draw(){
        gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);

        gl.bindVertexArray(vao);
        gl.uniform2f(uResolutionLoc,gl.canvas.width,gl.canvas.height);
        gl.uniform4fv(uColorLoc,color);

        gl.uniform2fv(uTranslationLoc,translation);
    
        gl.drawArrays(gl.TRIANGLES,0,6);
    }
    
    draw();

     // Setup a ui.
    webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});

    function updatePosition(index:number){
        return function(event:Event,ui:any){
            translation[index] = ui.value;
            draw();
        };
    }
}

init();