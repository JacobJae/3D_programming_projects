

var canvas;
var gl;

var program;

var sec = 0.0;
var fps = 0;

var near = -100;
var far = 100;

var vv = 35.0;
var left = -vv;
var right = vv;
var ytop = vv;
var bottom = -vv;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0);
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0);

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
var materialShininess = 30.0;


var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var resetTimerFlag = true;
var animFlag = false;
var prevTime = 0.0;
var useTextures = 1;

// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i = 0; i < texSize; i++)  image1[i] = new Array();
for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++)
        image1[i][j] = new Float32Array(4);
for (var i = 0; i < texSize; i++) for (var j = 0; j < texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8) == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++)
        for (var k = 0; k < 4; k++)
            image2[4 * texSize * i + 4 * j + k] = 255 * image1[i][j][k];


var textureArray = [];



function isLoaded(im) {
    if (im.complete) {
        console.log("loaded");
        return true;
    }
    else {
        console.log("still not loaded!!!!");
        return false;
    }
}

function loadFileTexture(tex, filename) {
    tex.textureWebGL = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename;
    tex.isTextureReady = false;
    tex.image.onload = function () { handleTextureLoaded(tex); }
    // The image is going to be loaded asyncronously (lazy) which could be
    // after the program continues to the next functions. OUCH!
}

function loadImageTexture(tex, image) {
    tex.textureWebGL = gl.createTexture();
    tex.image = new Image();
    //tex.image.src = "CheckerBoard-from-Memory" ;

    gl.bindTexture(gl.TEXTURE_2D, tex.textureWebGL);
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true;

}

function initTextures() {
    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "tex2.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "tex3.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "tex4.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "tex5.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "floor.png");

    textureArray.push({});
    loadImageTexture(textureArray[textureArray.length - 1], image2);
}


function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src);

    textureObj.isTextureReady = true;
}

//----------------------------------------------------------------

function setColor(c) {
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);
}

function toggleTextures() {
    useTextures = 1 - useTextures;
    gl.uniform1i(gl.getUniformLocation(program,
        "useTextures"), useTextures);
}

function waitForTextures1(tex) {
    setTimeout(function () {
        console.log("Waiting for: " + tex.image.src);
        wtime = (new Date()).getTime();
        if (!tex.isTextureReady) {
            console.log(wtime + " not ready yet");
            waitForTextures1(tex);
        }
        else {
            console.log("ready to render");
            window.requestAnimFrame(render);
        }
    }, 5);
}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout(function () {
        var n = 0;
        for (var i = 0; i < texs.length; i++) {
            console.log("boo" + texs[i].image.src);
            n = n + texs[i].isTextureReady;
        }
        wtime = (new Date()).getTime();
        if (n != texs.length) {
            console.log(wtime + " not ready yet");
            waitForTextures(texs);
        }
        else {
            console.log("ready to render");
            window.requestAnimFrame(render);
        }
    }, 5);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    console.log(gl.getParameter(gl.VERSION));
    console.log(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    console.log(gl.getParameter(gl.VENDOR));

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(18, program);
    Cone.init(18, program);
    Sphere.init(36, program);
    Quad.init(program);

    gl.uniform1i(gl.getUniformLocation(program, "useTextures"), useTextures);

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // set a default material
    setColor(materialDiffuse);



    // set the callbacks for the UI elements
    document.getElementById("sliderXi").onchange = function () {
        RX = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").onchange = function () {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").onchange = function () {
        RZ = this.value;
        window.requestAnimFrame(render);
    };

    document.getElementById("animToggleButton").onclick = function () {
        if (animFlag) {
            animFlag = false;
        }
        else {
            animFlag = true;
            resetTimerFlag = true;
            window.requestAnimFrame(render);
        }
    };

    document.getElementById("textureToggleButton").onclick = function () {
        toggleTextures();
        window.requestAnimFrame(render);
    };

    var controller = new CameraController(canvas);
    controller.onchange = function (xRot, yRot) {
        RX = xRot;
        RY = yRot;
        window.requestAnimFrame(render);
    };

    // load and initialize the textures
    initTextures();

    // Recursive wait for the textures to load
    waitForTextures(textureArray);
    //setTimeout (render, 100) ;

}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    setMV();

}

// Draws a 2x2 Quad in xy centered at the origin (z=0)
function drawQuad() {
    setMV();
    Quad.draw();
}
// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV();
    Sphere.draw();
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV();
    Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x, y, z) {
    modelMatrix = mult(modelMatrix, translate([x, y, z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta, x, y, z) {
    modelMatrix = mult(modelMatrix, rotate(theta, [x, y, z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx, sy, sz) {
    modelMatrix = mult(modelMatrix, scale(sx, sy, sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}

function showTime() {
    document.getElementById("time").innerHTML = TIME;
}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(10 * Math.sin(TIME), 5, 10 * Math.cos(TIME));

    if (TIME > 15 && TIME < 18) {
        eye = vec3(10 * Math.sin(TIME) + 0.5 * Math.random(), 5, 10 * Math.cos(TIME) + 0.5 * Math.random());
    }

    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // set the camera matrix
    viewMatrix = lookAt(eye, at, up);

    // initialize the modeling matrix stack
    MS = [];
    modelMatrix = mat4();

    // apply the slider rotations
    gRotate(RZ, 0, 0, 1);
    gRotate(RY, 0, 1, 0);
    gRotate(RX, 1, 0, 0);

    // send all the matrices to the shaders
    setAllMatrices();

    // get real time
    var curTime;
    if (animFlag) {
        curTime = (new Date()).getTime() / 1000;
        if (resetTimerFlag) {
            prevTime = curTime;
            resetTimerFlag = false;
        }
        TIME = TIME + curTime - prevTime;
        prevTime = curTime;
    }

    // FPS tracking
    if (TIME - sec >= 1) {
        console.log("FPS: " + fps);
        fps = 0;
        sec = TIME;
    } else {
        fps++;
    }

    // print TIME in HTML
    showTime();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[4].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture0"), 0);

    gPush();
    {
        gTranslate(0, -2, 0);
        gScale(30, 1, 30);
        drawCube();
    }
    gPop();

    gl.bindTexture(gl.TEXTURE_2D, null);

    // size w
    if (TIME < 3) {
        var w = TIME / 3;
    } else if (TIME > 3 && TIME < 15) {
        var w = 1;
    } else if (TIME > 15 && TIME < 18) {
        var w = TIME / 3 - 4;
    } else if (TIME > 18 && TIME < 42) {
        var w = 2;
    } else if (TIME > 42 && TIME < 48) {
        var w = 16 - TIME / 3;
    } else {
        var w = 0;
    }

    if (TIME > 3 && TIME < 6) {
        gl.bindTexture(gl.TEXTURE_2D, null);
        gPush();
        {
            var t = 3;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        gPop();
    } else if (TIME > 6 && TIME < 9) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
        gPush();
        {
            var t = 6;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
        }
        gPop();
    } else if (TIME > 9 && TIME < 12) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
        gPush();
        {
            var t = 9;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
        }
        gPop();
    } else if (TIME > 12 && TIME < 15) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
        gPush();
        {
            var t = 12;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
        }
        gPop();
    } else if (TIME > 15 && TIME < 21) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    } else if (TIME > 21 && TIME < 22) {
        gPush();
        {
            // tex 0
            var t = 21;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
        }
        gPop();
    } else if (TIME > 22 && TIME < 23) {
        gPush();
        {
            // tex 0
            var t = 21;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 1
            var t = 22;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
        }
        gPop();
    } else if (TIME > 23 && TIME < 24) {
        gPush();
        {
            // tex 0
            var t = 21;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 1
            var t = 22;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 2
            var t = 23;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
        }
        gPop();
    } else if (TIME > 24 && TIME < 25) {
        gPush();
        {
            // tex 1
            var t = 22;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 2
            var t = 23;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 3
            var t = 24;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
        }
        gPop();
    } else if (TIME > 25 && TIME < 26) {
        gPush();
        {
            // tex 2
            var t = 23;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 3
            var t = 24;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 0
            var t = 25;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
        }
        gPop();
    } else if (TIME > 26 && TIME < 27) {
        gPush();
        {
            // tex 3
            var t = 24;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 0
            var t = 25;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 1
            var t = 26;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
        }
        gPop();
    } else if (TIME > 27 && TIME < 28) {
        gPush();
        {
            // tex 0
            var t = 25;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 1
            var t = 26;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 2
            var t = 27;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
        }
        gPop();
    } else if (TIME > 28 && TIME < 29) {
        gPush();
        {
            // tex 1
            var t = 26;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 2
            var t = 27;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 3
            var t = 28;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
        }
        gPop();
    } else if (TIME > 29 && TIME < 30) {
        gPush();
        {
            // tex 2
            var t = 27;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 3
            var t = 28;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 0
            var t = 29;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
        }
        gPop();
    } else if (TIME > 30 && TIME < 31) {
        gPush();
        {
            // tex 3
            var t = 28;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            // tex 0
            var t = 29;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
        }
        gPop();
    } else if (TIME > 31 && TIME < 32) {
        gPush();
        {
            // tex 0
            var t = 29;
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 4 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
        }
        gPop();
    } else if (TIME > 32 && TIME < 35) {
        var t = 32;
        gPush();
        {
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 1.5 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 1.5 * (TIME - t) * (TIME - t), 30 - (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
            gTranslate(-30 + (TIME - t) * 10, 13 * (TIME - t) - 1.5 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gPush();
        {
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
            gTranslate(30 - (TIME - t) * 10, 13 * (TIME - t) - 1.5 * (TIME - t) * (TIME - t), -30 + (TIME - t) * 10);
            drawSphere();
        }
        gPop();
        gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    } else if (TIME > 35 && TIME < 38) {
        var t = 3;
        gPush();
        gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
        gTranslate(0, 13 * 3 - 1.5 * 3 * 3 - (TIME - 35) * 3, 0);
        drawSphere();
        gPop();
        gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    } else if (TIME > 38 && TIME < 38.5) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    } else if (TIME > 38.5 && TIME < 39) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    } else if (TIME > 39 && TIME < 39.5) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    } else if (TIME > 39.5 && TIME < 40) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    } else if (TIME > 40 && TIME < 40.25) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    } else if (TIME > 40.25 && TIME < 40.5) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    } else if (TIME > 40.5 && TIME < 40.75) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    } else if (TIME > 40.75 && TIME < 41) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    } else if (TIME > 41 && TIME < 41.25) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    } else if (TIME > 41.25 && TIME < 41.5) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    } else if (TIME > 41.5 && TIME < 41.75) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    } else if (TIME > 41.75 && TIME < 42) {
        gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    }

    if (TIME < 42) {
        // make mini man
        gPush();
        {
            // current : mid of body zzzMath.sin(5 * TIME)
            gTranslate(0, 6.1 * w - 0.15 * Math.sin(5 * TIME), 0);
            gRotate(90, 1, 0, 0);
            // Head
            gPush();
            {
                gTranslate(0, 0, - 2.7 * w);
                gScale(1 * w, 1 * w, 1 * w);
                drawSphere();
            }
            gPop();
            // Leg and arm
            gPush();
            {
                // current : top of body
                gTranslate(0, 0, -2 * w);

                for (var i = 1; i > -2; i -= 2) {
                    for (var j = 1; j > -2; j -= 2) {
                        gPush();
                        {
                            // upper
                            if (TIME > 18 && TIME < 21 && i == 1) {
                                // gRotate(15 + (TIME - 18) * 20, -i, 0, 0);
                                gRotate(20 + 10 * (TIME - 18), 0, j, 0);
                            } else if (TIME > 21 && i == 1) {
                                // gRotate(75, -i, 0, 0);
                                gRotate(50, 0, j, 0);
                            } else {
                                gRotate(15 + 5 * Math.sin(5 * TIME), i, 0, 0);
                                gRotate(20, 0, j, 0);
                            }

                            gPush();
                            {
                                // lower
                                gTranslate(0, 0, 2 * w);
                                // upper-lower joint
                                gPush();
                                {
                                    gScale(0.5 * w, 0.5 * w, 0.5 * w);
                                    drawSphere();
                                }
                                gPop();

                                if (TIME > 18 && TIME < 21 && i == 1) {
                                    gRotate(30 + (10 + (TIME - 18) * 10) * Math.sin(15 * TIME), -i, 0, 0);
                                    gRotate(20 * (TIME - 18), 0, j, 0);
                                } else if (TIME > 21 && i == 1) {
                                    gRotate(30 + 40 * Math.sin(15 * TIME), -i, 0, 0);
                                    gRotate(60, 0, j, 0);
                                } else {
                                    gRotate(30 + 10 * Math.sin(5 * TIME), -i, 0, 0);
                                }

                                gPush();
                                {
                                    gTranslate(0, 0, 3 * w);
                                    gScale(0.5 * w, 0.5 * w, 0.5 * w);
                                    drawSphere();
                                }
                                gPop();
                                gTranslate(0, 0, 1.5 * w);
                                gScale(w, w, 3 * w);
                                drawCylinder();
                            }
                            gPop();
                            gTranslate(0, 0, w);
                            gScale(w, w, 2 * w);
                            drawCylinder();
                        }
                        gPop();
                    }
                    // current : end of body
                    gTranslate(0, 0, 4 * w);
                }
            }
            gPop();
            gScale(1 * w, 1 * w, 4 * w);
            // draw body
            drawCylinder();
        }
        gPop();
    } else {
        // make mini man
        gPush();
        {
            // current : mid of body zzzMath.sin(5 * TIME)
            gTranslate(0, 6.1 * w - 0.15 * Math.sin(5 * 42), 0);
            gRotate(90, 1, 0, 0);
            // Head
            gPush();
            {
                gTranslate(0, 0, - 2.7 * w);
                gScale(1 * w, 1 * w, 1 * w);
                drawSphere();
            }
            gPop();
            // Leg and arm
            gPush();
            {
                // current : top of body
                gTranslate(0, 0, -2 * w);

                for (var i = 1; i > -2; i -= 2) {
                    for (var j = 1; j > -2; j -= 2) {
                        gPush();
                        {
                            if (i == 1) {
                                // gRotate(75, -i, 0, 0);
                                gRotate(50, 0, j, 0);
                            } else {
                                gRotate(15 + 5 * Math.sin(5 * 42), i, 0, 0);
                                gRotate(20, 0, j, 0);
                            }

                            gPush();
                            {
                                // lower
                                gTranslate(0, 0, 2 * w);
                                // upper-lower joint
                                gPush();
                                {
                                    gScale(0.5 * w, 0.5 * w, 0.5 * w);
                                    drawSphere();
                                }
                                gPop();
                                if (i == 1) {
                                    gRotate(30 + 40 * Math.sin(15 * 42), -i, 0, 0);
                                    gRotate(60, 0, j, 0);
                                } else {
                                    gRotate(30 + 10 * Math.sin(5 * 42), -i, 0, 0);
                                }

                                gPush();
                                {
                                    gTranslate(0, 0, 3 * w);
                                    gScale(0.5 * w, 0.5 * w, 0.5 * w);
                                    drawSphere();
                                }
                                gPop();
                                gTranslate(0, 0, 1.5 * w);
                                gScale(w, w, 3 * w);
                                drawCylinder();
                            }
                            gPop();
                            gTranslate(0, 0, w);
                            gScale(w, w, 2 * w);
                            drawCylinder();
                        }
                        gPop();
                    }
                    // current : end of body
                    gTranslate(0, 0, 4 * w);
                }
            }
            gPop();
            gScale(1 * w, 1 * w, 4 * w);
            // draw body
            drawCylinder();
        }
        gPop();
    }

    if (animFlag)
        window.requestAnimFrame(render);
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;

    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function (ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };

    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function (ev) {
        controller.dragging = false;
    };

    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function (ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}
