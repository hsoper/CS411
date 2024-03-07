"use strict";

var canvas;
var gl;

var pointsArray = [];

var cameraX = .8;

// near far
var near = -11;
var far = 11;

// how seperate we want the shadow to be from the square 
var separation = .2;

// distance from the light in the positive x axis
var distanceL = 4;

// scaling
var left = -4.2;
var right = 4.2;
var ytop = 4.2;
var bottom = -4.2;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var fColor;

var eye, at, up;
var light;

var m;

var blue;
var red;

// helper function which converts the slider value (which is 0-1000) a range defined by b1 and b2
function between(b1, b2, val){
    return (val/1000)*(b2-b1) + b1; 
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    light = vec3(distanceL, 0.0, 0.0);

    //camera position
    at = vec3(0.0, 0.0, 0.0); // looking at the origin
    up = vec3(0.0, 0.0, 2.0); // facing up the positive z axis
    eye = vec3(cameraX, -2.0, 2.0); // camera at (1,-1,1)

    // color square blue and shadow red
    blue = vec4(0.0, 0.0, 1.0, 1.0);
    red = vec4(1.0, 0.0, 0.0, 1.0);

    // get the slider
    var xSlider =  document.getElementById("xVal");

    // get camera slider
    var camSlider = document.getElementById("xCVal");

    // get the text containers 
    var sliderC = document.getElementById("con");
    var sliderC1 = document.getElementById("con1");

    // calculate the xPosition with respect to the xSliders value 
    var xpos = between(0, 3.5, xSlider.value);

    // send that value to the HTML
    sliderC.innerHTML = "current x axis position of the blue square: " + xpos;

    // send the camera position to the HTML
    sliderC1.innerHTML = "current x-axis position of the camera: " + eye[0];

    // the matrix for the shadow
    m = mat4();
    m[0][0] = (1-(xpos/distanceL))+separation;
    m[1][1] = (1-(xpos/distanceL))+separation;
    m[2][2] = (1-(xpos/distanceL))+separation;
    m[3][3] = 0;
    m[3][0] = -1/light[0]; // show is coming from the positive x axis 
    
    // square vertices
    var squareSize = 1;
    pointsArray = [
        vec4(xpos, squareSize, -squareSize,1),
        vec4(xpos, -squareSize, -squareSize, 1),
        vec4(xpos, -squareSize, squareSize, 1),
        vec4(xpos, squareSize, squareSize, 1),
    ]

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    fColor = gl.getUniformLocation(program, "fColor");

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    render();
    
    // callback function for the slider 
    xSlider.oninput = function(){
        xpos = between(0, 3.5, xSlider.value);

        // recalc the square vertices
        pointsArray = [
            vec4(xpos, squareSize, -squareSize,1),
            vec4(xpos, -squareSize, -squareSize, 1),
            vec4(xpos, -squareSize, squareSize, 1),
            vec4(xpos, squareSize, squareSize, 1),
        ]

        
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

        // recalc the shadow matrix
        m[0][0] = (1-(xpos/distanceL))+separation;
        m[1][1] = (1-(xpos/distanceL))+separation;
        m[2][2] = (1-(xpos/distanceL))+separation;
        sliderC.innerHTML = "current x axis position of the blue square:: " + xpos; 
        render();
    }

    //changes the camera x position between 0 and 5
    camSlider.oninput = function(){
        eye[0] = camSlider.value/200;
        sliderC1.innerHTML = "current x-axis position of the camera: " + eye[0];
        render();
    }

}


function render() {

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // model-view matrix for square

        modelViewMatrix = lookAt(eye, at, up);

        // send color and matrix for square then render
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniform4fv(fColor, flatten(blue));
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        // model-view matrix for shadow then render
        modelViewMatrix = mult(modelViewMatrix, translate(light[0], light[1], light[2]));
        modelViewMatrix = mult(modelViewMatrix, m);
        modelViewMatrix = mult(modelViewMatrix, translate(-light[0], -light[1],
           -light[2]));

        // send color and matrix for shadow
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    }
