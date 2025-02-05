var can = document.querySelector("canvas");
can.width = 1920 / 2;
can.height = 1080 / 2;
// can.width = 4096;
// can.height = 4096/1.1;
var gl = can.getContext("webgl2", {
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance"
    // preserveDrawingBuffer:true,
    // alpha:false,
});
var vs_src = "#version 300 es\n\nin vec2 a_position;\n// out vec2 v_position;\n\nuniform vec2 u_resolution;\n\nvoid main(){\n    vec2 pos = a_position / u_resolution * 2.0 - 1.0;\n    pos.y = -pos.y;\n    gl_Position = vec4(pos,0,1);\n    gl_PointSize = 1.0;\n\n    // v_position = a_position;\n}\n\n";
var fs_src = "#version 300 es\n\nprecision highp float; // have to set this in fragment shader\n\nout vec4 outColor;\nuniform vec4 u_color;\n\nin vec2 v_position;\n\nvoid main(){\n    outColor = u_color;\n    // outColor = vec4(1,0,0.5,1);\n    // if(u_color.a == 0.0){\n    //     outColor = u_color;\n    //     return;\n    // }\n    // outColor = vec4(\n    //     float(int(v_position.x/1.0) % 256)/256.0,\n    //     float(int(v_position.y/1.0) % 256)/256.0,\n    //     float(int(v_position.y - v_position.x) % 256)/256.0,\n    //     1\n    // );\n}\n\n";
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
var aPositionLoc = gl.getAttribLocation(program, "a_position");
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // this allows bufferData to access this through gl.ARRAY_BUFFER
var uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
var uColorLoc = gl.getUniformLocation(program, "u_color");
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
// gl.colorMask(true,false,false,true);
gl.clearColor(1, 1, 1, 0);
// gl.clearColor(0,0,0,0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.enable(gl.BLEND);
// gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
// gl.blendFunc(gl.SRC_COLOR,gl.ONE_MINUS_DST_COLOR);
// gl.blendFunc(gl.SRC_ALPHA,gl.DST_COLOR); // crazy white glow effect
// drawing
gl.useProgram(program);
gl.bindVertexArray(vao);
gl.uniform2f(uResolutionLoc, gl.canvas.width, gl.canvas.height);
function randInt(n) {
    return Math.floor(Math.random() * n);
}
var cx = gl.canvas.width / 2;
var cy = gl.canvas.height / 2;
function drawRect(x, y, w, h) {
    // let w = randInt(50);
    // let h = randInt(50);
    // let x = randInt(gl.canvas.width-w);
    // let y = randInt(gl.canvas.height-h);
    if (h == undefined)
        h = w;
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
function drawCircle(x, y, fill, w, h) {
    if (fill === void 0) { fill = false; }
    if (h == undefined)
        h = w;
    var sx = 1;
    var sy = 0.5;
    var brushW = 300; // 1
    var rad = w;
    var pos = [];
    for (var i = 0; i < 360; i++) {
        var ang = i / 180 * Math.PI;
        // let rad2 = w/2;
        var rad2 = w - 1;
        // let rad2 = 0;
        rad *= 1.01; // funny
        rad -= 6;
        brushW *= 0.993;
        pos.push(Math.cos(ang) * rad * sx + x, Math.sin(ang) * rad * sy + y);
        if (fill)
            pos.push(x, y);
        else {
            pos.push(Math.cos(ang) * (rad * sx - brushW) + x, Math.sin(ang) * (rad * sy - brushW) + y);
        }
    }
    pos.push(x + Math.cos(1 / 6.28) * w * sx, y + Math.sin(1 / 6.28) * w * sy);
    var n = pos.length / 2;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    // gl.uniform4f(uColorLoc,Math.random(),Math.random(),Math.random(),1);
    // if(!ctrlKey) gl.uniform4f(uColorLoc,1,0,0.5,1);
    gl.uniform4f(uColorLoc, 1, 0, 0.5, 0.5);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}
function drawLine(x1, y1, x2, y2, w) {
    var fill = !shiftKey;
    var brushW = 50; // 1
    var dx = x2 - x1;
    var dy = y2 - y1;
    var ang0 = Math.atan2(dy, dx);
    var a1 = ang0 + Math.PI / 2;
    var a2 = ang0 - Math.PI / 2;
    if (a1 < 0)
        a1 += Math.PI * 2;
    else if (a1 >= Math.PI * 2)
        a1 -= Math.PI * 2;
    if (a2 < 0)
        a2 += Math.PI * 2;
    else if (a2 >= Math.PI * 2)
        a2 -= Math.PI * 2;
    var inc = Math.PI * 2 / 360;
    // let skip = 20; // 1 is full resolution
    var skip = 1;
    var pos = [];
    var ang = a1;
    var rad = w;
    // pos.push(x1+Math.cos(1/6.28)*rad,y1+Math.sin(1/6.28)*rad);
    rad = w;
    for (var i = 0; i < 180 + skip; i += skip) {
        ang += inc * skip;
        // rad -= 2; // funny
        pos.push(Math.cos(ang) * rad + x1, Math.sin(ang) * rad + y1);
        if (fill) {
            // pos.push(x1+dx,y1+dy); // <-- almost
            pos.push(x1, y1);
        }
        else {
            pos.push(Math.cos(ang) * (rad - brushW) + x1, Math.sin(ang) * (rad - brushW) + y1);
        }
    }
    ang = a2;
    for (var i = 0; i < 180 + skip; i += skip) {
        ang += inc * skip;
        // let rad = w;
        pos.push(Math.cos(ang) * rad + x2, Math.sin(ang) * rad + y2);
        if (fill) {
            pos.push(x2, y2);
        }
        else {
            pos.push(Math.cos(ang) * (rad - brushW) + x2, Math.sin(ang) * (rad - brushW) + y2);
        }
    }
    pos.push(x1 + Math.cos(a1 + inc) * rad, y1 + Math.sin(a1 + inc) * rad);
    if (fill)
        pos.push(x1, y1);
    else {
        pos.push(x1 + Math.cos(a1 + inc) * (rad - brushW), y1 + Math.sin(a1 + inc) * (rad - brushW));
    }
    // console.log("len: ",pos.length);
    var n = pos.length / 2;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    // gl.uniform4f(uColorLoc,Math.random(),Math.random(),Math.random(),1);
    // gl.enable(gl.BLEND);
    var alpha = 1;
    if (altKey) {
        gl.disable(gl.BLEND);
        gl.uniform4f(uColorLoc, 1, 1, 1, 0);
    }
    else {
        // if(altKey){
        //     alpha = 0;
        //     // gl.disable(gl.BLEND);
        // }
        if (ctrlKey)
            alpha = 0.1;
        // gl.uniform4f(uColorLoc,1,0,0.5,alpha);
        gl.uniform4f(uColorLoc, 1, 0, 0, alpha);
    }
    // gl.drawArrays(gl.TRIANGLE_STRIP,0,n);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    gl.enable(gl.BLEND);
}
if (0)
    for (var i = 0; i < 10; i++) {
        var w = randInt(50);
        var h = randInt(50);
        var x = randInt(gl.canvas.width - w);
        var y = randInt(gl.canvas.height - h);
        drawRect(x, y, w, h);
    }
var start = performance.now();
// drawRect(cx,cy,60);
// drawCircle(cx,cy,true,100);
// drawCircle(cx,cy,true,1700);
// console.log("time: ",performance.now()-start);
var mouseDown = [false, false, false];
var keys = {};
var altKey = false;
var shiftKey = false;
var ctrlKey = false;
document.addEventListener("mousedown", function (e) {
    calcMXMY(e);
    mouseDown[e.button] = true;
    draw();
});
document.addEventListener("mouseup", function (e) {
    mouseDown[e.button] = false;
});
document.addEventListener("keydown", function (e) {
    altKey = e.altKey;
    shiftKey = e.shiftKey;
    ctrlKey = e.ctrlKey;
    keys[e.key.toLowerCase()] = true;
    // if(altKey) gl.blendFuncSeparate(gl.ZERO,gl.ONE_MINUS_SRC_ALPHA,gl.ZERO,gl.ZERO);
    // if(altKey) gl.disable(gl.BLEND);
});
document.addEventListener("keyup", function (e) {
    altKey = e.altKey;
    shiftKey = e.shiftKey;
    ctrlKey = e.ctrlKey;
    keys[e.key.toLowerCase()] = false;
    if (e.key.toLowerCase() == "alt") {
        // gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE);
        // gl.enable(gl.BLEND);
    }
});
var mx = cx;
var my = cy;
var lmx = mx;
var lmy = my;
function calcMXMY(e) {
    lmx = mx;
    lmy = my;
    mx = (e.clientX - can.offsetLeft) / can.offsetWidth * gl.canvas.width;
    my = (e.clientY - can.offsetTop) / can.offsetHeight * gl.canvas.height;
}
document.addEventListener("mousemove", function (e) {
    calcMXMY(e);
    if (mouseDown[0]) {
        draw();
    }
});
function draw() {
    // drawCircle(Math.floor(mx),Math.floor(my),true,300);
    // let start = performance.now();
    // console.log("TIME: ",performance.now()-start);
    // drawLine(Math.floor(lmx),Math.floor(lmy),Math.floor(mx),Math.floor(my),900);
    drawLine(Math.floor(lmx), Math.floor(lmy), Math.floor(mx), Math.floor(my), 10);
    // Set the color to red with 0.5 opacity
    // gl.color4f(1.0, 0.0, 0.0, 0.5);
    // drawCircle(Math.floor(mx),Math.floor(my),true,500);
}
// 
// drawLine(gl.canvas.width*0.35,gl.canvas.height*0.35,gl.canvas.width*0.65,gl.canvas.height*0.65,50);
// drawCircle(cx,cy,false,700);
var _lx = 0;
var _ly = 0;
var _mx = 0;
var _my = 0;
var lastFrameTime = 0;
var updateTimeReal = 16.667;
var updateTimeTheory = 16.667;
function update() {
    requestAnimationFrame(update);
    // console.log("update time: ",performance.now()-lastFrameTime);
    updateTimeReal = performance.now() - lastFrameTime;
    lastFrameTime = performance.now();
    var ang = performance.now() / 500;
    var rad = gl.canvas.width * 0.35;
    var dx = Math.cos(ang) * rad;
    var dy = Math.sin(ang) * rad;
    var tx = dx + cx;
    var ty = dy + cy;
    var tx2 = -dx + cx;
    var ty2 = -dy + cy;
    _lx = _mx;
    _ly = _my;
    _mx = tx;
    _my = ty;
    // drawLine(_ly,_ly,_mx,_my,100); // funny thing
    drawLine(_lx, _ly, _mx, _my, 900);
    // drawLine(tx2,ty2,_mx,_my,50);
    // for(let i = 0; i < 2000; i += 50){
    //     drawLine(tx2+i,ty2+i,_mx,_my,50);
    // }
    // console.log("update time (theory): ",performance.now()-lastFrameTime);
    updateTimeTheory = performance.now() - lastFrameTime;
}
if (1) {
    // update();
    setInterval(function () {
        var fps = (16.666667 / updateTimeReal) * 60;
        var fpsTheory = (16.666667 / updateTimeTheory) * 60;
        console.log({
            fps: fps,
            fpsTheory: fpsTheory
        });
    }, 1000);
}
var can2 = document.createElement("canvas");
can2.width = can.width;
can2.height = can.height;
var ctx2 = can2.getContext("2d");
ctx2.fillStyle = "red";
document.body.appendChild(can2);
var mode = 0;
var Obj = /** @class */ (function () {
    function Obj(x, y, vx, vy) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }
    return Obj;
}());
var objs = [];
function drawParticles() {
    var pos = [];
    for (var i = 0; i < objs.length; i++) {
        var o = objs[i];
        pos.push(o.x, o.y);
    }
    if (mode == 0) {
        // gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);
        gl.uniform4f(uColorLoc, 1, 0, 0, 1);
        gl.drawArrays(gl.POINTS, 0, pos.length / 2);
    }
    else {
        ctx2.clearRect(0, 0, can.width, can.height);
        for (var i = 0; i < objs.length; i++) {
            var o = objs[i];
            ctx2.fillRect(Math.floor(o.x), Math.floor(o.y), 1, 1);
        }
    }
}
function gen2() {
    for (var i = 0; i < 100000; i++) {
        objs.push(new Obj(Math.random() * gl.canvas.width, Math.random() * gl.canvas.height, Math.random() - 0.5, Math.random() - 0.5));
    }
}
gen2();
function update2() {
    requestAnimationFrame(update2);
    updateTimeReal = performance.now() - lastFrameTime;
    lastFrameTime = performance.now();
    for (var i = 0; i < objs.length; i++) {
        var o = objs[i];
        if (keys.w) {
            var dx = o.x - cx;
            var dy = o.y - cy;
            var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            o.vx -= dx / dist / 10;
            o.vy -= dy / dist / 10;
        }
        if (keys.q) {
            o.vx *= 0.97;
            o.vy *= 0.97;
        }
        o.x += o.vx;
        o.y += o.vy;
    }
    drawParticles();
    updateTimeTheory = performance.now() - lastFrameTime;
}
update2();
//# sourceMappingURL=main.js.map