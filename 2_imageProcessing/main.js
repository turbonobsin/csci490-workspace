var can = document.querySelector("canvas");
var gl = can.getContext("webgl2");
var vs_src = "#version 300 es\n\nin vec2 a_position;\nin vec2 a_texCoord;\n\nout vec2 v_texCoord;\n\nuniform vec2 u_resolution;\n\nvoid main(){\n    vec2 pos = a_position / u_resolution * 2.0 - 1.0;\n    pos.y = -pos.y;\n    gl_Position = vec4(pos,0,1);\n    v_texCoord = a_texCoord;\n}\n\n";
var fs_src = "#version 300 es\n\nprecision highp float; // have to set this in fragment shader\n\nin vec2 v_texCoord;\nuniform sampler2D u_image;\n\nout vec4 outColor;\n\nuniform vec4 u_color;\n\n\nvoid main(){\n    // outColor = vec4(1,0,0.5,1);\n    // outColor = u_color;\n    outColor = texture(u_image,v_texCoord);\n}\n\n";
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
function main() {
    var image = new Image();
    image.src = "/images/oak_sapling.png";
    image.onload = function () {
        render(image);
    };
}
// 
function render(image) {
    var aPositionLoc = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // this allows bufferData to access this through gl.ARRAY_BUFFER
    var texCoordAttrLoc = gl.getAttribLocation(program, "a_texCoord");
    var uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    var uColorLoc = gl.getUniformLocation(program, "u_color");
    var imageLoc = gl.getUniformLocation(program, "u_image");
    // 2d points
    var pos = [
        10, 20,
        80, 20,
        10, 30,
        10, 30,
        80, 20,
        80, 30,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    // 
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao); // set this one as the one we are going to configure
    gl.enableVertexAttribArray(aPositionLoc); // specifies that we want to get data out of it and edit it
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0); // this also binds ARRAY_BUFFER to this vao
    // 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // need this every time you resize the canvas -- -1 to 1 means 0 to can.width
    // 
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // drawing
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(uResolutionLoc, gl.canvas.width, gl.canvas.height);
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
        pos = [
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
    for (var i = 0; i < 10; i++) {
        drawRect();
    }
}
main();
//# sourceMappingURL=main.js.map