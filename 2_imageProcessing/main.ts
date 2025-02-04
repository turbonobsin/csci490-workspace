const can = document.querySelector("canvas");
can.height *= 2;
const gl = can.getContext("webgl2");

type GL = WebGL2RenderingContext;

let vs_src = `#version 300 es

in vec2 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

uniform vec2 u_resolution;

void main(){
    vec2 pos = a_position / u_resolution * 2.0 - 1.0;
    pos.y = -pos.y;
    gl_Position = vec4(pos,0,1);
    v_texCoord = a_texCoord;
}

`;
let fs_src = `#version 300 es

precision highp float; // have to set this in fragment shader

in vec2 v_texCoord; // texture coords
uniform sampler2D u_image; // actual image texture

out vec4 outColor;

uniform vec4 u_color;
uniform float u_kernel[9];
uniform float u_kernelWeight;

void main(){
    vec2 onePixel = vec2(1) / vec2(textureSize(u_image,0));

    // vec4 col = texture(u_image,v_texCoord + onePixel * vec2(1,-1) * 100.0);
    // col.r = 0.0;
    // outColor = col;

    vec4 colorSum = 
        texture(u_image, v_texCoord + onePixel * vec2(-1,-1)) * u_kernel[0] +
        texture(u_image, v_texCoord + onePixel * vec2(0,-1)) * u_kernel[1] +
        texture(u_image, v_texCoord + onePixel * vec2(1,-1)) * u_kernel[2] +
        texture(u_image, v_texCoord + onePixel * vec2(-1,0)) * u_kernel[3] +
        texture(u_image, v_texCoord + onePixel * vec2(0,0)) * u_kernel[4] +
        texture(u_image, v_texCoord + onePixel * vec2(1,0)) * u_kernel[5] +
        texture(u_image, v_texCoord + onePixel * vec2(-1,1)) * u_kernel[6] +
        texture(u_image, v_texCoord + onePixel * vec2(0,1)) * u_kernel[7] +
        texture(u_image, v_texCoord + onePixel * vec2(1,1)) * u_kernel[8];

    outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
   
    
}

`;

/** // KERNEL ALGO
    // vec2 onePixel = vec2(1) / vec2(textureSize(u_image,0));

    // vec4 colorSum = 
    //     texture(u_image, v_texCoord + onePixel * vec2(-1,-1)) * u_kernel[0] +
    //     texture(u_image, v_texCoord + onePixel * vec2(0,-1)) * u_kernel[1] +
    //     texture(u_image, v_texCoord + onePixel * vec2(1,-1)) * u_kernel[2] +
    //     texture(u_image, v_texCoord + onePixel * vec2(-1,0)) * u_kernel[3] +
    //     texture(u_image, v_texCoord + onePixel * vec2(0,0)) * u_kernel[4] +
    //     texture(u_image, v_texCoord + onePixel * vec2(1,0)) * u_kernel[5] +
    //     texture(u_image, v_texCoord + onePixel * vec2(-1,1)) * u_kernel[6] +
    //     texture(u_image, v_texCoord + onePixel * vec2(0,1)) * u_kernel[7] +
    //     texture(u_image, v_texCoord + onePixel * vec2(1,1)) * u_kernel[8];

    // outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
    
    // BLUR
    // outColor = (
    //     texture(u_image,v_texCoord) +
    //     texture(u_image,v_texCoord + vec2(onePixel.x,0.0)) +
    //     texture(u_image,v_texCoord + vec2(-onePixel.x,0.0))
    // ) / 3.0;

    // outColor = vec4(1,0,0.5,1);
    // outColor = u_color;
    // outColor = texture(u_image,v_texCoord);

    // TESTING
    // vec4 col = texture(u_image,v_texCoord);
    // col.r = 1.0 - col.r;
    // col.g = 1.0 - col.g;
    // col.b = 1.0 - col.b;
    // outColor = col;

    // OTHER TESTING
    // int r = int(col.r*255.0);
    // if(col.r > 0.5){
        // r %= 100;
        // col.r = float(r) / 255.0;
        col.r = sin(col.g / 5.0) / 2.0 + 0.5;
    // }
    // col.r = 0.0; */

function createShader(gl:GL,type:any,source:string){
    let shader = gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        throw gl.getShaderInfoLog(shader);
    }

    return shader;
}

function createProgram(gl:GL,vertexShader:WebGLShader,fragmentShader:WebGLShader){
    let program = gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        throw gl.getProgramInfoLog(program);
    }

    return program;
}

let vertexShader = createShader(gl,gl.VERTEX_SHADER,vs_src);
let fragmentShader = createShader(gl,gl.FRAGMENT_SHADER,fs_src);

let program = createProgram(gl,vertexShader,fragmentShader);

// 

function loadImage(path:string){
    let image = new Image();
    // image.src = "/images/oak_sapling.png";
    image.src = path;
    return new Promise<HTMLImageElement>(resolve=>{
        image.onload = function(){
            resolve(image);
        };
    });
}

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
  
function computeKernelWeight(kernel:number[]){
    let weight = kernel.reduce(function(prev, curr) {
        return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
}

// 
function render(image:HTMLImageElement,x:number,y:number){
    // get vertex data positions
    let aPositionLoc = gl.getAttribLocation(program,"a_position");
    let texCoordAttrLoc = gl.getAttribLocation(program,"a_texCoord");

    // get uniform locations
    let uResolutionLoc = gl.getUniformLocation(program,"u_resolution");
    let uColorLoc = gl.getUniformLocation(program,"u_color");
    let imageLoc = gl.getUniformLocation(program,"u_image");
    let kernelLoc = gl.getUniformLocation(program,"u_kernel[0]");
    let kernelWeightLoc = gl.getUniformLocation(program,"u_kernelWeight");

    // create VAO
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao); // set this one as the one we are going to configure

    let positionBuffer = gl.createBuffer();

    gl.enableVertexAttribArray(aPositionLoc); // specifies that we want to get data out of it and edit it
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer); // this allows bufferData to access this through gl.ARRAY_BUFFER
    
    gl.vertexAttribPointer(aPositionLoc,2,gl.FLOAT,false,0,0); // this also binds ARRAY_BUFFER to this vao
    
    // provide tex coords to the rectangle
    let texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
    ]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordAttrLoc);
    gl.vertexAttribPointer(texCoordAttrLoc,2,gl.FLOAT,false,0,0);

    // create a texture
    let texture = gl.createTexture();

    // make unit 0 the active texture unit
    gl.activeTexture(gl.TEXTURE0 + 0);

    // bind texture to "texture unit 0" 2D bind point
    gl.bindTexture(gl.TEXTURE_2D,texture);

    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);

    // upload the image into the texture
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);

    // 
    gl.viewport(0,0,gl.canvas.width,gl.canvas.height); // need this every time you resize the canvas -- -1 to 1 means 0 to can.width

    // 
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ----------- drawing
    gl.useProgram(program);

    gl.bindVertexArray(vao);
    gl.uniform2f(uResolutionLoc,gl.canvas.width,gl.canvas.height);

    // tell the shader to get the texture from texture unit 0
    gl.uniform1i(imageLoc,0);

    // load kernel stuff
    let edgeDetectKernel = [
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1
    ];
    gl.uniform1fv(kernelLoc,edgeDetectKernel);
    gl.uniform1f(kernelWeightLoc,computeKernelWeight(edgeDetectKernel));

    // make sure for drawing the rectangles the position buffer is in use
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

    let w = image.width;
    let h = image.height;
    setRectangle(gl, x, y, w, h);
    gl.drawArrays(gl.TRIANGLES,0,6);

    //////////////////
    
    function randInt(n:number){
        return Math.floor(Math.random()*n);
    }
    function drawRect(){
        let w = randInt(50);
        let h = randInt(50);
        let x = randInt(gl.canvas.width-w);
        let y = randInt(gl.canvas.height-h);
        let x2 = x+w;
        let y2 = y+h;
        
        let pos = [
            x,y,
            x2,y,
            x,y2,
            x,y2,
            x2,y,
            x2,y2
        ];
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);

        gl.uniform4f(uColorLoc,Math.random(),Math.random(),Math.random(),1);
        
        gl.drawArrays(gl.TRIANGLES,0,6);
    }

    // // 2d points
    // let pos = [
    //     10, 20,
    //     80, 20,
    //     10, 30,
    //     10, 30,
    //     80, 20,
    //     80, 30,
    // ];
    // gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);
    if(false) for(let i = 0; i < 10; i++){
        drawRect();
    }
}

async function init(){
    render(await loadImage("/images/leaves.png"),0,0);
    // render(await main("/images/oak_sapling.png"),100,40);
}
init();