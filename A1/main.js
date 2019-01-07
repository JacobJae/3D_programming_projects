// 그거발류
var drag;
var curX;
var curY;

var canvas;
var gl;

var program;

var near = -100;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop = 6.0;
var bottom = -6.0;


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

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var prevTime = 0.0;
var resetTimerFlag = true;
var animFlag = false;

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

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    setColor(materialDiffuse);

    Cube.init(program);
    Cylinder.init(9, program);
    Cone.init(9, program);
    Sphere.init(36, program);


    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");


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
        console.log(animFlag);
    };

    canvas.addEventListener("mousedown", function (event) {
        drag = true;
        curX = event.x;
        curY = event.y;
        canvas.addEventListener("mousemove", movePerspective, false);
    }, false);
    canvas.addEventListener("mouseup", function () {
        drag = false;
        canvas.removeEventListener("mousemove", movePerspective, false);
    }, false);

    render();
}

// 코멘트!!!!!!!!!@@@@@@@@@@@@
function movePerspective(event) {
    if (drag) {
        // var x = new Number();
        // var y = new Number();

        if (RX <= 180 && RY <= 180 && RX >= -180 && RY >= -180) {
            RY += event.x - curX;
            RX += event.y - curY;
            curX = event.x;
            curY = event.y;
        } else if (RX > 180) {
            RX -= 360;
        } else if (RY > 180) {
            RY -= 360;
        } else if (RX < -180) {
            RX += 360;
        } else if (RY < -180) {
            RY += 360;
        }
        document.getElementById("demo").innerHTML = "RX is : " + RX + "   RY is : " + RY;
        window.requestAnimFrame(render);
    }
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
// and replaces the modeling matrix with the result
function gTranslate(x, y, z) {
    modelMatrix = mult(modelMatrix, translate([x, y, z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta, x, y, z) {
    modelMatrix = mult(modelMatrix, rotate(theta, [x, y, z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx, sy, sz) {
    modelMatrix = mult(modelMatrix, scale(sx, sy, sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}



function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(0, 0, 10);
    MS = []; // Initialize modeling matrix stack

    modelMatrix = mat4();

    // set the camera matrix
    viewMatrix = lookAt(eye, at, up);

    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);


    gRotate(RZ, 0, 0, 1);
    gRotate(RY, 0, 1, 0);
    gRotate(RX, 1, 0, 0);



    setAllMatrices();

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
    // Defualt size
    var size = 0.3;

    // Move whole view down to -2
    gTranslate(0, -7 * size, 0);

    // Board
    gPush();
    {
        gTranslate(0, 0, 0);
        setColor(vec4(0.4, 0.6, 0.4, 1.0));
        gScale(10, size, 10);
        drawCube();
    }
    gPop();

    // Main sphere
    gPush();
    {
        gTranslate(0, 3 * size, 0);
        setColor(vec4(0.6, 0.6, 0.6, 1.0));
        gScale(2 * size, 2 * size, 2 * size);
        drawSphere();
    }
    gPop();

    // Side sphere
    gPush();
    {
        gTranslate(-2 * 1.414213562 * size, 2 * size, 0);
        setColor(vec4(0.6, 0.6, 0.6, 1.0));
        gScale(size, size, size);
        drawSphere();
    }
    gPop();

    // Seaweed
    gPush();
    {
        setColor(vec4(0.6, 0.8, 0.2, 1.0));
        gTranslate(-4 * size, 4 * size, 0);
        for (i = 0; i < 3; i++) {
            gTranslate(2 * size, -Math.cos(i * Math.PI) * 2 * size, 0);
            for (k = 0; k < 10; k++) {
                gPush();
                gTranslate(0, 1 * size, 0);
                gRotate(10 * Math.cos(k + TIME), 0, 0, 1);
                gTranslate(0, 1 * size, 0);
            }
            for (k = 0; k < 10; k++) {
                gScale(size * 0.4, size, size * 0.4);
                drawSphere();
                gPop();
            }
        }
    }
    gPop();

    // Fish
    gPush();
    {
        // Rotate around rock
        // For the motions, you may want to use functions of the form x(t) = Acos(w*TIME+h)
        gRotate(TIME * 30, 0, -1, 0);
        gTranslate(10 * size, 3 * size * Math.cos(TIME) + 7 * size, 0);

        // Eye
        for (i = -1; i < 2; i += 2) {
            gPush();
            {
                setColor(vec4(1.0, 1.0, 1.0, 1.0));
                gTranslate(i * size, 1 * size, 1 * size);
                gScale(0.4 * size, 0.4 * size, 0.4 * size);
                drawSphere();
                setColor(vec4(0.0, 0.0, 0.0, 1.0));
                gTranslate(0, 0, 3 * size);
                gScale(0.5, 0.5, 0.5);
                drawSphere();
            }
            gPop();
        }

        // Head
        gPush();
        {
            gTranslate(0, 0, 1 * size);
            setColor(vec4(0.8, 0.8, 1.0, 1.0));
            gScale(2 * size, 2 * size, 2 * size);
            drawCone();
        }
        gPop();

        setColor(vec4(1.0, 0.2, 0.4, 1.0));

        // Body
        gPush();
        {
            gTranslate(0, 0, -4 * size);
            gScale(2 * size, 2 * size, -8 * size);
            drawCone();
        }
        gPop();

        // Tail
        gTranslate(0, 0, -8 * size);
        gRotate(45 * Math.sin(5 * TIME), 0, 1, 0);
        gPush();
        {
            gRotate(45, 1, 0, 0);
            gTranslate(0, 0, -2 * size);
            gScale(0.5 * size, 0.5 * size, -4 * size);
            drawCone();
        }
        gPop();
        gPush();
        {
            gRotate(45, -1, 0, 0);
            gTranslate(0, 0, -1 * size);
            gScale(0.5 * size, 0.5 * size, -2 * size);
            drawCone();
        }
        gPop();

    }
    gPop();

    if (animFlag)
        window.requestAnimFrame(render);
}
