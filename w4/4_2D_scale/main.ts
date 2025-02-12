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
let rotation = [0,1];
let scale = [1,1];
let width = 100;
let height = 30;
let color = [
    Math.random(),
    Math.random(),
    Math.random(),
    1
];

class Rect{
    constructor(x:number,y:number,rot:number,w:number,l:number){
        this.x = x;
        this.y = y;
        this.rot = rot;
        this.w = w;
        this.l = l;
    }
    x = 0;
    y = 0;
    rot = 0;
    w = 0;
    l = 0;
}
function rot(x:number,y:number,rx:number,ry:number,ox:number,oy:number){
    return [
        x * ry + y * rx,
        y * ry - x * rx
    ];
}
function setRectangle(gl:GL, x:number, y:number, width:number, height:number) {
    let pos:number[] = [];
    
    let rects = [
        new Rect(5,5,0,5,10)
        // new Rect(0,0,0.3,1,5)
    ];

    for(const r of rects){
        let w = r.w;
        let l = r.l;
        let x = r.x * l;
        let y = r.y * w - w/2;
        let rx = Math.sin(r.rot);
        let ry = Math.cos(r.rot);

        let [x1,y1] = rot(x,y-w/2,rx,ry,x,y);
        let [x2,y2] = rot(x,y+w/2,rx,ry,x,y);
        let [x3,y3] = rot(x+l,y+w/2,rx,ry,x,y);
        let [x4,y4] = rot(x+l,y-w/2,rx,ry,x,y);

        pos.push(
            x1,y1,
            x4,y4,
            x2,y2,
            x2,y2,
            x4,y4,
            x3,y3,
        );
    }

    console.log(pos);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
}
function setRectangleOG(gl:GL, x:number, y:number, width:number, height:number) {
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
    let uRotationLoc = gl.getUniformLocation(program,"u_rotation");
    let uScaleLoc = gl.getUniformLocation(program,"u_scale");
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

    setRectangleOG(gl,translation[0],translation[1],width,height); // set ONCE now

    function draw(){
        gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);

        gl.bindVertexArray(vao);
        gl.uniform2f(uResolutionLoc,gl.canvas.width,gl.canvas.height);
        gl.uniform4fv(uColorLoc,color);

        gl.uniform2fv(uTranslationLoc,translation);
        gl.uniform2fv(uRotationLoc,rotation);
        gl.uniform2fv(uScaleLoc,scale);
    
        gl.drawArrays(gl.TRIANGLES,0,6);
    }
    
    draw();

    // Setup a ui.
    webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});
    webglLessonsUI.setupSlider("#rot", {slide: function(event:Event,ui:any){            
        let ang = ui.value;
        let x = Math.sin(ang);
        let y = Math.cos(ang);
        rotation[0] = x;
        rotation[1] = y;
        draw();
    }, max: 3.14, min: -3.14, step: 0.05});
    webglLessonsUI.setupSlider("#scaleX", {slide: function(event:Event,ui:any){            
        scale[0] = ui.value;
        draw();
    }, max: 4, min: -4, step: 0.05});
    webglLessonsUI.setupSlider("#scaleY", {slide: function(event:Event,ui:any){            
        scale[1] = ui.value;
        draw();
    }, max: 4, min: -4, step: 0.05});

    function updatePosition(index:number){
        return function(event:Event,ui:any){
            translation[index] = ui.value;
            draw();
        };
    }

    // let results = new Uint8Array(4);
    // gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,results);
}

init();