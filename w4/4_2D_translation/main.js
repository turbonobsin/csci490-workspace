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
var gl = can.getContext("webgl2", {
    antialias: false
});
var program;
function createProgram(vsSrc, fsSrc) {
    return __awaiter(this, void 0, void 0, function () {
        var vs, _a, _b, _c, fs, _d, _e, _f, program;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    vs = gl.createShader(gl.VERTEX_SHADER);
                    _b = (_a = gl).shaderSource;
                    _c = [vs];
                    return [4 /*yield*/, fetch("shaders/" + vsSrc)];
                case 1: return [4 /*yield*/, (_g.sent()).text()];
                case 2:
                    _b.apply(_a, _c.concat([_g.sent()]));
                    gl.compileShader(vs);
                    fs = gl.createShader(gl.FRAGMENT_SHADER);
                    _e = (_d = gl).shaderSource;
                    _f = [fs];
                    return [4 /*yield*/, fetch("shaders/" + fsSrc)];
                case 3: return [4 /*yield*/, (_g.sent()).text()];
                case 4:
                    _e.apply(_d, _f.concat([_g.sent()]));
                    gl.compileShader(fs);
                    program = gl.createProgram();
                    gl.attachShader(program, vs);
                    gl.attachShader(program, fs);
                    gl.linkProgram(program);
                    return [2 /*return*/, program];
            }
        });
    });
}
// NEW VARIABLES
var translation = [0, 0];
var width = 100;
var height = 30;
var color = [
    Math.random(),
    Math.random(),
    Math.random(),
    1
];
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
// INIT
function init() {
    return __awaiter(this, void 0, void 0, function () {
        function draw() {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);
            gl.bindVertexArray(vao);
            gl.uniform2f(uResolutionLoc, gl.canvas.width, gl.canvas.height);
            gl.uniform4fv(uColorLoc, color);
            gl.uniform2fv(uTranslationLoc, translation);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        function updatePosition(index) {
            return function (event, ui) {
                translation[index] = ui.value;
                draw();
            };
        }
        var aPositionLoc, posBuffer, uResolutionLoc, uTranslationLoc, uColorLoc, pos, vao;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createProgram("main.vert", "main.frag")];
                case 1:
                    program = _a.sent();
                    aPositionLoc = gl.getAttribLocation(program, "a_position");
                    posBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
                    uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
                    uTranslationLoc = gl.getUniformLocation(program, "u_translation");
                    uColorLoc = gl.getUniformLocation(program, "u_color");
                    pos = [
                        10, 20,
                        80, 20,
                        10, 30,
                        10, 30,
                        80, 20,
                        80, 30,
                    ];
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
                    vao = gl.createVertexArray();
                    gl.bindVertexArray(vao);
                    gl.enableVertexAttribArray(aPositionLoc);
                    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
                    setRectangle(gl, translation[0], translation[1], width, height); // set ONCE now
                    draw();
                    // Setup a ui.
                    webglLessonsUI.setupSlider("#x", { slide: updatePosition(0), max: gl.canvas.width });
                    webglLessonsUI.setupSlider("#y", { slide: updatePosition(1), max: gl.canvas.height });
                    return [2 /*return*/];
            }
        });
    });
}
init();
//# sourceMappingURL=main.js.map