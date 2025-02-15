const can = document.querySelector("canvas");
const gl = can.getContext("webgl2",{
    antialias:false,
    preserveDrawingBuffer:true,
    premultipliedAlpha:false
});

async function loadProgram(vert="main",frag="main"){
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh,await (await fetch("shaders/"+vert+".vert")).text());
    gl.compileShader(vsh);

    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh,await(await fetch("shaders/"+frag+".frag")).text());
    gl.compileShader(fsh);

    let program = gl.createProgram();
    gl.attachShader(program,vsh);
    gl.attachShader(program,fsh);
    gl.linkProgram(program);

    return program;
}

let program = await loadProgram();

let curProgram = program;

// shader vars

let aPos = gl.getAttribLocation(program,"a_pos");
let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
let vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

let uRes = gl.getUniformLocation(program,"u_res");
let uPalette = gl.getUniformLocation(program,"u_palette[0]");
let uI = gl.getUniformLocation(program,"u_i");
let uScale = gl.getUniformLocation(program,"u_scale");
let uRot = gl.getUniformLocation(program,"u_rot");

// run

let mouseDown = [false,false,false];
let lx = 0;
let ly = 0;
let mx = 0;
let my = 0;
function calcMouse(/**@type {MouseEvent}*/e){
    lx = mx;
    ly = my;
    mx = (e.clientX-can.offsetLeft)/can.offsetWidth*can.width;
    my = (e.clientY-can.offsetTop)/can.offsetHeight*can.height;
}
function draw(/**@type {MouseEvent}*/e){
    // let r = 5;
    // drawRect(mx-r,my-r,r*2,r*2);
    drawLine(lx,ly,mx,my);
}
document.addEventListener("mousemove",e=>{
    calcMouse(e);
});
document.addEventListener("mousedown",e=>{
    calcMouse(e);

    mouseDown[e.button] = true;
});
document.addEventListener("mouseup",e=>{
    mouseDown[e.button] = false;
});
document.addEventListener("keydown",e=>{
    let k = e.key.toLowerCase();

    if(k == "w"){
        pIndex++;
        pIndex %= palette.length;
    }
    else if(k == "q"){
        pIndex--;
        if(pIndex < 0) pIndex = palette.length-1;
    }
});

let palette = [
    [1,0,0,1],
    [1,0,0.5,1],
    [0,0.5,0.5,1]
];
let pIndex = 0;

// render

function render(){
    requestAnimationFrame(render);
    
    gl.useProgram(program);
    gl.uniform2f(uRes,can.width,can.height);

    gl.uniform1i(uI,pIndex);
    let palette2 = [];
    for(const p of palette){
        palette2.push(...p);
    }
    gl.uniform1fv(uPalette,new Float32Array(palette2));
    
    if(mouseDown[0]){
        draw();
    }
}

function drawRect(x,y,w,h){
    let x2 = x+w;
    let y2 = y+h;
    
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        x,y,
        x2,y,
        x,y2,
        x,y2,
        x2,y,
        x2,y2
    ]),gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES,0,6);
}

function rot2D(x=0,y=0,ox=0,oy=0,a=0){
    return [
        Math.cos(a)*(x-ox)-Math.sin(a)*(y-oy)+ox,
        Math.sin(a)*(x-ox)+Math.cos(a)*(y-oy)+oy
    ];
}

function drawLine(x,y,x2,y2){
    let w = 10;
    // y2 = y+50;
    // x2 = x + 100;

    let dx = x2-x;
    let dy = y2-y;
    let dist = Math.sqrt(dx**2+dy**2);
    let ang = Math.atan2(dy,dx);
    // let ang = Math.PI/4;

    gl.uniform2f(uRot,Math.cos(ang),Math.sin(ang));
    gl.uniform2f(uScale,dist,1);

    let points = [
        x,y-w,
        x+dist,y-w,
        x,y+w,
        x,y+w,
        x+dist,y-w,
        x+dist,y+w
    ];
    for(let i = 0; i < points.length; i += 2){
        let [x0,y0] = rot2D(points[i],points[i+1],x,y,ang);
        points[i] = x0;
        points[i+1] = y0;
    }

    points.push(
        // x-w,y-w,
        // x+w,y-w,
        // x-w,y+w,
        // x-w,y+w,
        // x+w,y-w,
        // x+w,y+w,
        x  ,y-w,
        x+w,y,
        x  ,y+w,
        x  ,y+w,
        x-w,y,
        x  ,y-w,

        x2  ,y2-w,
        x2+w,y2,
        x2  ,y2+w,
        x2  ,y2+w,
        x2-w,y2,
        x2  ,y2-w,

        // x2-w,y2-w,
        // x2+w,y2-w,
        // x2-w,y2+w,
        // x2-w,y2+w,
        // x2+w,y2-w,
        // x2+w,y2+w
    );
    
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        ...points
        
        // x,y-w,
        // x+dist,y-w,
        // x,y+w,
        // x,y+w,
        // x+dist,y-w,
        // x+dist,y+w
        
        // x,y-a,
        // x2,y-a,
        // x,y+a,
        // x,y+a,
        // x2,y-a,
        // x2,y+a
        // x,y,
        // x2,y,
        // x,y2,
        // x,y2,
        // x2,y,
        // x2,y2
    ]),gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES,0,18);
}

render();