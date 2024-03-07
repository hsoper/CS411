"use strict";

var canvas;
var gl;

var points = [];
var colors = [];
var xSlider;
var ySlider;
var zSlider;
var cubSize = .5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    xSlider =  document.getElementById("xVal");
    ySlider = document.getElementById("yVal");
    zSlider = document.getElementById("zVal");

   var vertices = [
        vec3(cubSize, cubSize, -cubSize),  //Vertex 1 
        vec3(cubSize, -cubSize, -cubSize), //Vertex 2
        vec3(-cubSize, -cubSize, -cubSize),//Vertex 3
        vec3(-cubSize, cubSize, -cubSize), //Vertex 4
        vec3(cubSize, cubSize, cubSize),  //Vertex 5
        vec3(cubSize, -cubSize, cubSize), //Vertex 6
        vec3(-cubSize, -cubSize, cubSize),//Vertex 7
        vec3(-cubSize, cubSize, cubSize)  //Vertex 8
    ];
    rendercube(vertices);
    //oninput listeners for slider input
    xSlider.oninput = function(){
        points = [];
        colors = [];
        rendercube(vertices);
    }
    ySlider.oninput = function(){
        points = [];
        colors = [];
        rendercube(vertices);
    }
    zSlider.oninput = function(){
        points = [];
        colors = [];
        rendercube(vertices);
    }
};

function rotate(arrV, x, y, z){
    arrV = rotateX(arrV, x);
    arrV = rotateY(arrV, y);
    return rotateZ(arrV, z);
}
function rendercube(vertices) {
    cube(rotate(vertices, xSlider.value, ySlider.value, zSlider.value)); // If slider doesn't work change the _slider.value for each axis.
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
}

function triangle( a, b, c, a1, b1, c1 )
{

    // add colors and vertices for one triangle

    var baseColors = [
        vec3(0.0, 0.0, 0.0, 1.0),   //corresponds to vertex 1
        vec3(1.0, 0.0, 0.0, 1.0),   //corresponds to vertex 2
        vec3(1.0, 1.0, 0.0, 1.0),   //corresponds to vertex 3
        vec3(0.0, 1.0, 0.0, 1.0),   //corresponds to vertex 4
        vec3(0.0, 0.0, 1.0, 1.0),   //corresponds to vertex 5
        vec3(1.0, 0.0, 1.0, 1.0),   //corresponds to vertex 6
        vec3(1.0, 1.0, 1.0, 1.0),   //corresponds to vertex 7
        vec3(0.0, 1.0, 1.0, 1.0)    //corresponds to vertex 8
    ];

    colors.push( baseColors[a1] );
    points.push( a );
    colors.push( baseColors[b1] );
    points.push( b );
    colors.push( baseColors[c1] );
    points.push( c );
}

function cube(arrV)
{
    // tetrahedron with each side using
    // a different color
    if(arrV.length == 8){
        //bottom of the triangle
        triangle( arrV[0], arrV[1], arrV[2], 0, 1, 2);
        triangle( arrV[0], arrV[2], arrV[3], 0, 2, 3);
        //sides of the triangle
        //side 1
        triangle( arrV[0], arrV[1], arrV[5], 0, 1, 5);
        triangle( arrV[0], arrV[4], arrV[5], 0, 4, 5);
        //side 2
        triangle( arrV[1], arrV[2], arrV[6], 1, 2, 6);
        triangle( arrV[1], arrV[5], arrV[6], 1, 5, 6);
        //side 3
        triangle( arrV[2], arrV[3], arrV[7], 2, 3, 7);
        triangle( arrV[2], arrV[6], arrV[7], 2, 6, 7);
        //side 4
        triangle( arrV[3], arrV[0], arrV[4], 3, 0, 4);
        triangle( arrV[3], arrV[7], arrV[4], 3, 7, 4);
        //top of the triangle
        triangle( arrV[4], arrV[5], arrV[6], 4, 5, 6);
        triangle( arrV[4], arrV[6], arrV[7], 4, 6, 7);
    }
}

function rotateZ(arr, angle){
    if(angle == 0){
        return arr;
    }
    var temp = [];
    var rads = angle * (Math.PI/180);
    for(var x = 0; x < arr.length; x++){
        var a = (arr[x][0] * Math.cos(rads)) + (arr[x][1] * Math.sin(rads));
        var b = (arr[x][0] * -Math.sin(rads))+ (arr[x][1] * Math.cos(rads));
        temp.push(vec3(a,b,arr[x][2]));
    }
    return temp;
}

function rotateX(arr, angle){
    if(angle == 0){
        return arr;
    }
    var temp = [];
    var rads = angle * (Math.PI/180);
    for(var x = 0; x < arr.length; x++){
        var a = (arr[x][1] * Math.cos(rads)) + (arr[x][2] * Math.sin(rads));
        var b = (arr[x][1] * -Math.sin(rads))+ (arr[x][2] * Math.cos(rads));
        temp.push(vec3(arr[x][0],a,b));
    }
    return temp;
}

function rotateY(arr, angle){
    if(angle == 0){
        return arr;
    }
    var temp = [];
    var rads = angle * (Math.PI/180);
    for(var x = 0; x < arr.length; x++){
        var a = (arr[x][0] * Math.cos(rads)) + (arr[x][2] * -Math.sin(rads));
        var b = (arr[x][0] * Math.sin(rads))+ (arr[x][2] * Math.cos(rads));
        temp.push(vec3(a, arr[x][1], b));
    }
    return temp;
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
