var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var can = document.querySelector("canvas");
can.height *= 2;
var gl = can.getContext("webgl2");
var vs_src = "#version 300 es\n\nin vec2 a_position;\nin vec2 a_texCoord;\n\nout vec2 v_texCoord;\n\nuniform vec2 u_resolution;\n\nvoid main(){\n    vec2 pos = a_position / u_resolution * 2.0 - 1.0;\n    pos.y = -pos.y;\n    gl_Position = vec4(pos,0,1);\n    v_texCoord = a_texCoord;\n}\n\n";
var fs_src = "#version 300 es\n\nprecision highp float; // have to set this in fragment shader\n\nin vec2 v_texCoord; // texture coords\nuniform sampler2D u_image; // actual image texture\n\nout vec4 outColor;\n\nuniform vec4 u_color;\nuniform float u_kernel[9];\nuniform float u_kernelWeight;\n\nvoid main(){\n    vec2 onePixel = vec2(1) / vec2(textureSize(u_image,0));\n\n    // vec4 col = texture(u_image,v_texCoord + onePixel * vec2(1,-1) * 100.0);\n    // col.r = 0.0;\n    // outColor = col;\n\n    vec4 colorSum = \n        texture(u_image, v_texCoord + onePixel * vec2(-1,-1)) * u_kernel[0] +\n        texture(u_image, v_texCoord + onePixel * vec2(0,-1)) * u_kernel[1] +\n        texture(u_image, v_texCoord + onePixel * vec2(1,-1)) * u_kernel[2] +\n        texture(u_image, v_texCoord + onePixel * vec2(-1,0)) * u_kernel[3] +\n        texture(u_image, v_texCoord + onePixel * vec2(0,0)) * u_kernel[4] +\n        texture(u_image, v_texCoord + onePixel * vec2(1,0)) * u_kernel[5] +\n        texture(u_image, v_texCoord + onePixel * vec2(-1,1)) * u_kernel[6] +\n        texture(u_image, v_texCoord + onePixel * vec2(0,1)) * u_kernel[7] +\n        texture(u_image, v_texCoord + onePixel * vec2(1,1)) * u_kernel[8];\n\n    outColor = vec4((colorSum / u_kernelWeight).rgb, 1);\n   \n    \n}\n\n";
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
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(shader);
    }
    return shader;
}
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }
    return program;
}
var vertexShader = createShader(gl, gl.VERTEX_SHADER, vs_src);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs_src);
var program = createProgram(gl, vertexShader, fragmentShader);
// 
function loadImage(path) {
    var image = new Image();
    // image.src = "/images/oak_sapling.png";
    image.src = path;
    return new Promise(function (resolve) {
        image.onload = function () {
            resolve(image);
        };
    });
}
function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}
function computeKernelWeight(kernel) {
    var weight = kernel.reduce(function (prev, curr) {
        return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
}
// 
function render(image, x, y) {
    // get vertex data positions
    var aPositionLoc = gl.getAttribLocation(program, "a_position");
    var texCoordAttrLoc = gl.getAttribLocation(program, "a_texCoord");
    // get uniform locations
    var uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    var uColorLoc = gl.getUniformLocation(program, "u_color");
    var imageLoc = gl.getUniformLocation(program, "u_image");
    var kernelLoc = gl.getUniformLocation(program, "u_kernel[0]");
    var kernelWeightLoc = gl.getUniformLocation(program, "u_kernelWeight");
    // create VAO
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao); // set this one as the one we are going to configure
    var positionBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(aPositionLoc); // specifies that we want to get data out of it and edit it
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // this allows bufferData to access this through gl.ARRAY_BUFFER
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0); // this also binds ARRAY_BUFFER to this vao
    // provide tex coords to the rectangle
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordAttrLoc);
    gl.vertexAttribPointer(texCoordAttrLoc, 2, gl.FLOAT, false, 0, 0);
    // create a texture
    var texture = gl.createTexture();
    // make unit 0 the active texture unit
    gl.activeTexture(gl.TEXTURE0 + 0);
    // bind texture to "texture unit 0" 2D bind point
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // upload the image into the texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // need this every time you resize the canvas -- -1 to 1 means 0 to can.width
    // 
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // ----------- drawing
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(uResolutionLoc, gl.canvas.width, gl.canvas.height);
    // tell the shader to get the texture from texture unit 0
    gl.uniform1i(imageLoc, 0);
    // load kernel stuff
    var edgeDetectKernel = [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1
    ];
    gl.uniform1fv(kernelLoc, edgeDetectKernel);
    gl.uniform1f(kernelWeightLoc, computeKernelWeight(edgeDetectKernel));
    // make sure for drawing the rectangles the position buffer is in use
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var w = image.width;
    var h = image.height;
    setRectangle(gl, x, y, w, h);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    //////////////////
    function randInt(n) {
        return Math.floor(Math.random() * n);
    }
    function drawRect() {
        var w = randInt(50);
        var h = randInt(50);
        var x = randInt(gl.canvas.width - w);
        var y = randInt(gl.canvas.height - h);
        var x2 = x + w;
        var y2 = y + h;
        var pos = [
            x, y,
            x2, y,
            x, y2,
            x, y2,
            x2, y,
            x2, y2
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
        gl.uniform4f(uColorLoc, Math.random(), Math.random(), Math.random(), 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
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
    if (false)
        for (var i = 0; i < 10; i++) {
            drawRect();
        }
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = render;
                    return [4 /*yield*/, loadImage("/images/leaves.png")];
                case 1:
                    _a.apply(void 0, [_b.sent(), 0, 0]);
                    return [2 /*return*/];
            }
        });
    });
}
init();
//# sourceMappingURL=main.js.map