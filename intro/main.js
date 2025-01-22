var can = document.querySelector("canvas");
var gl = can.getContext("webgl2");
var vertGLSL = "#version 300 es\n\nuniform vec2 u_canRes;\nuniform vec2 u_offset;\n\nvoid main(){\n    vec2 pos = u_offset / u_canRes * 2.0 - 1.0;\n    pos.y = -pos.y;\n    gl_Position = vec4(pos,0,1);\n    gl_PointSize = 150.0;\n}\n";
var fragGLSL = "#version 300 es\nprecision highp float;\n\nout vec4 outColor;\n\nvoid main(){\n    outColor = vec4(1,0,0.5,1);\n}\n";
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertGLSL);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(vertexShader));
}
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragGLSL);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(fragmentShader));
}
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}
var uCanResLoc = gl.getUniformLocation(program, "u_canRes");
var uOffsetLoc = gl.getUniformLocation(program, "u_offset");
// 
gl.useProgram(program);
gl.uniform2f(uCanResLoc, gl.canvas.width, gl.canvas.height);
gl.uniform2f(uOffsetLoc, 150 + 75, 75);
// draw 1 point
gl.drawArrays(gl.POINTS, 0, 1);
//# sourceMappingURL=main.js.map