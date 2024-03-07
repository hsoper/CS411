"use strict";

var canvas;
var gl;

var points = [];
var colors = [];
var flag = true;
var colorOptions;
var framebuffer;
var colorSelected;

var color = new Uint8Array(4);
var baseColors = [
    vec3(0.0, 0.0, 0.0, 1.0),   //black (idx 0)
    vec3(1.0, 0.0, 0.0, 1.0),   //red   (idx 1)
    vec3(1.0, 1.0, 0.0, 1.0),   //yellow (idx 2)
    vec3(0.0, 1.0, 0.0, 1.0),   //green (idx 3)
    vec3(0.0, 0.0, 1.0, 1.0),   //blue (idx 4)
    vec3(255/255, 192/255, 203/255, 1.0),//pink (idx 5)
    vec3(0.0, 1.0, 1.0, 1.0)    //cyan (idx 6)
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    var menu = document.getElementById("mymenu");
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    colorOptions = [1,4,2,6];

   var vertices = [
        vec3(0,1,0), //top of roof (idx 0)
        vec3(-.5,.5,0), //top-left of home (idx 1)
        vec3(.5,.5,0), //top-right of home (idx 2)
        vec3(-.5,-.5,0), //bottom-left of home (idx 3)
        vec3(.5,-.5,0), // bottom-right of home (idx 4)
        vec3(-.2,.2,0),  //top-left of door (idx 5)
        vec3(.2,.2,0), // top-right of door (idx 6)
        vec3(-.2,-.5,0), // bottom-left of door (idx 7)
        vec3(.2,-.5,0) // bottom-right of door (idx 8)

    ];

    // slightly modified from the examples of lecture 14

    // create a texture 
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);

    // Allocate a frame buffer object

    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);


    // Attach color buffer

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);


    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // get shaders
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    // populate the points and colors array 
    house(vertices, colorOptions[0], colorOptions[1], colorOptions[2]);
    house(vertices, colorOptions[0], colorOptions[1], colorOptions[2]);
    

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // create buffers and attach to variables vColor and vPosition
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
    
    // menu listener (gets an index corresponding to colorOptions array)
    menu.addEventListener("click", function() {
        switch (menu.selectedIndex) {
        case 0:
            colorSelected = 0;
            break;
        case 1:
            colorSelected = 1;
            break;
        case 2:
            colorSelected = 2;
            break;
        case 3:
            colorSelected = 3;
            break;
        }
       });

    // changes the colors which can be selected from the menu from the colors in testcase 1 to the colors in testcase 2
    document.getElementById("toggle").onclick = function(){
        flag = !flag; // flip flag value
        colorSelected = null; // set colorSelected to null
        if(flag){
            menu.innerHTML = '<option value="0">red</option>'+
            '<option value="1">blue</option>' +
            '<option value="2">yellow</option>' +
            '<option value="3">cyan</option>'; // updates the labels of the menu

            colorOptions = [1,4,2,6]; // changes the color options based on the new menu colors (these correspond to an index in the baseColor array)

            points.splice(27,27); // delete the final 27 entries of the points and colors array (these are the entries which can be seen in the canvas)
            colors.splice(27,27);

            house(vertices,colorOptions[0], colorOptions[1], colorOptions[2], colorOptions[3]); // rebuild the final 27 entries with the new starting colors
            //rerender the house
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
            render();
        }
        else{// same as above, but for testcase 2 colors
            menu.innerHTML = '<option value="0">green</option>'+
            '<option value="1">black</option>' +
            '<option value="2">yellow</option>' +
            '<option value="3">pink</option>';
            colorOptions = [3,0,2,5];
            points.splice(27,27);
            colors.splice(27,27);
            house(vertices,colorOptions[0], colorOptions[1], colorOptions[2], colorOptions[3]);
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
            render();
        }
    };

    //modified from the lecture 14 examples
    canvas.addEventListener("mousedown", function(event){
        if(colorSelected == null) return; // if no colorSelected then exit this event 

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.clear( gl.COLOR_BUFFER_BIT);

        //accesses the first 27 entries of the buffer arrays (which are not visible in the canvas)
        for(var i=0; i<3; i++) {
            gl.uniform1i(gl.getUniformLocation(program, "i"), i+1);
            if(i == 0){
                gl.drawArrays( gl.TRIANGLES, 0, 1*3);
            }
            else if(i == 1){
                gl.drawArrays( gl.TRIANGLES, 1*3, 6*3);
            }
            else{
                gl.drawArrays( gl.TRIANGLES, 3+6*3, 2*3);
            }
        }

        // get the click location
        var x = event.clientX;
        var y = canvas.height -event.clientY;

        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
        
        if(color[0] == 255 && color[1] == 0 && color[2] == 0 && color[3] == 255){// selected the roof
            for(var x = 0+27;x <3+27;x++){
                colors[x] = baseColors[colorOptions[colorSelected]]; // Change the roofs color to current selected color
            }
            color;
        }
        else if(color[0] == 0 && color[1] == 0 && color[2] == 255 && color[3] == 255){//selected the house
            for(var x = 3+27;x <21+27;x++){
                colors[x] = baseColors[colorOptions[colorSelected]]; // Change the house color to current selected color 
            }
            color;
        }else if(color[0] == 255 && color[1] == 255 && color[2] == 0 && color[3] == 255){//selected the door
            for(var x = 21+27;x <27+27;x++){
                colors[x] =  baseColors[colorOptions[colorSelected]]; // Change the door color to current selected color
            }
            color;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.uniform1i(gl.getUniformLocation(program, "i"), 0);

        // rerender the house
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);


        render();

    });
}


// setup a triangle
function triangle( a, b, c, color)
{
    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

// build the house
function house(arrV, c1, c2, c3)
{
    if(arrV.length == 9){
        //roof
        triangle(arrV[0], arrV[1], arrV[2], c1);
        //house
        triangle(arrV[3], arrV[7], arrV[5], c2);
        triangle(arrV[1], arrV[3], arrV[5], c2);
        triangle(arrV[1], arrV[2], arrV[5], c2);
        triangle(arrV[5], arrV[2], arrV[6], c2);
        triangle(arrV[6], arrV[2], arrV[4], c2);
        triangle(arrV[6], arrV[8], arrV[4], c2);
        //door
        triangle(arrV[5], arrV[6], arrV[7], c3);
        triangle(arrV[6], arrV[7], arrV[8], c3);
        
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 27, 27);
}
