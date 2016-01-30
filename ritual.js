var RitualGame = (function () {
  var pi = Math.PI,
      hammertime,
      levels = [
        {
          numShapes: 10,
          shapeDescriptions: [
            { kind: 'wine'},
            { kind: 'polygon', numSides: { min: 3, max: 8 } }
          ]
        }
      ],
      minSpeed = 0.5,
      maxSpeed = 5,
      minRotate = pi / 600,
      maxRotate = pi / 120,
      size = {
        play: {}
      },
      color = {
        background: '#000',
        shape: {
          fill: [
            '#aebf94', '#99bfa6', '#95b5bf', '#969bbf', '#a68dbf',
            '#bf8a97', '#bf9d8e', '#bfba95', '#ddd47e', '#9fdd75',
            '#8bc9dd', '#9e9ddd', '#d797dd', '#dd6f87', '#dd8360'
          ],
          stroke: '#444'
        }
      },
      currentLevel,
      sin = Math.sin,
      cos = Math.cos,
      containers = {},
      canvases = {},
      contexts = {},
      ritualCanvas,
      ritualContext,
      shapes,
      rituals = ["dat","dom","dor","jak","jet","jor","kal","kan","kor","lar","lok","lun","man","naz","nok","pan","pod","rel","ron","tan","tik","tok","tor","ver","viz","wax","zam","zim","zor"];

function makeWine(description) {
var	shape = { rotate:0, scale:7/1000},
	origin = shape.origin = {x:0, y:0},
        fillColor = color.shape.fill[Math.floor(Math.random() *
            color.shape.fill.length)];
	shape.paint = function(context) {
/*context.beginPath();
context.arc(size.play/2,size.play/2,100,0,2 * pi);
context.closePath();
context.fillStyle = '#fff';
context.fill();
*/
		context.save();
		context.translate(origin.x -13 * shape.scale,origin.y -13*shape.scale);
		context.rotate(shape.rotate);
      context.scale(shape.scale * size.play, shape.scale * size.play);
		context.beginPath();
		context.moveTo(0,0);
		context.lineTo(26,0);
		context.lineTo(26,26);
		context.lineTo(0,26);
		context.closePath();
		context.clip();
		context.strokeStyle = 'rgba(0,0,0,0)';
		context.lineCap = 'butt';
		context.lineJoin = 'miter';
		context.miterLimit = 4;
	//	context.fillStyle = "#ff0000";
		context.fillStyle = fillColor;
		context.beginPath();
		context.moveTo(6,26);
		context.bezierCurveTo(6,25.455,6.449,25,7,25);
		context.bezierCurveTo(7,25,13,23.881,13,21);
		context.bezierCurveTo(13,23.881,19,25,19,25);
		context.bezierCurveTo(19.551,25,20,25.449,20,26);
		context.lineTo(6,26);
		context.closePath();
		context.fill();
		context.stroke();
		context.fillStyle = "rgba(0, 0, 0, 0)";
		//context.strokeStyle = "#ff0000";
		context.fillStyle = "#ffffff";
		context.strokeStyle = fillColor;
		context.lineWidth = 2;
		context.lineCap = "round";
		context.lineJoin = "round";
		context.miterLimit = 10;
		context.beginPath();
		context.moveTo(7.38,1);
		context.bezierCurveTo(7.38,1,6.128,4.4879999999999995,6.128,9.738);
		context.bezierCurveTo(6.128,12.869,9.423,16,13.016,16);
		context.bezierCurveTo(16.608,16,19.872,12.581,19.872,9.738);
		context.bezierCurveTo(19.872,4.4879999999999995,18.651,1,18.651,1);
		context.lineTo(7.38,1);
		context.closePath();
		context.fill();
		context.stroke();
		//context.fillStyle = "#000000";
		context.fillStyle = fillColor;
		context.beginPath();
		context.moveTo(9.983,4);
		context.bezierCurveTo(9.983,4,9.037,6.393,9.037,10.36);
		context.bezierCurveTo(9.037,12.725,11.527000000000001,15.091999999999999,14.243000000000002,15.091999999999999);
		context.bezierCurveTo(16.958000000000002,15.091999999999999,19.425000000000004,12.508,19.425000000000004,10.36);
		context.bezierCurveTo(19.425000000000004,6.3919999999999995,18.503000000000004,3.999999999999999,18.503000000000004,3.999999999999999);
		context.lineTo(9.983,3.999999999999999);
		context.closePath();
		context.fill();
		context.stroke();
		//context.strokeStyle = "#000000";
		context.fillStyle = fillColor;
		context.lineWidth = 2;
		context.lineCap = "round";
		context.lineJoin = "round";
		context.miterLimit = 10;
		context.beginPath();
		context.moveTo(13,16);
		context.lineTo(13,24);
		context.fill();
		context.stroke();
		context.restore();
	};
	return shape;
}
  function makePolygon(description) {
    var i, a,
        minSides = description.numSides.min,
        maxSides = description.numSides.max,
        numSides = minSides +
            Math.floor(Math.random() * (maxSides - minSides)),
        shape = {},
        origin = shape.origin = { x: 0, y: 0 },
        exteriorAngle = 2 * pi / numSides,
        rotate = shape.rotate = 0,
        scale = shape.scale = 0.1,
        fillColor = color.shape.fill[Math.floor(Math.random() *
            color.shape.fill.length)],
        strokeColor = color.shape.stroke,
        points = shape.points = new Array(numSides);
    a = (pi - exteriorAngle) / 2;
    for (i = 0; i < numSides; ++i) {
      a += exteriorAngle;
      points[i] = { x: cos(a), y: sin(a) };
    }
    shape.paint = function (context) {
      var x0 = origin.x,
          y0 = origin.y,
          i;
      context.save();
      context.translate(x0, y0);
      context.rotate(shape.rotate);
      context.scale(shape.scale * size.play, shape.scale * size.play);
      context.beginPath();
      context.moveTo(points[numSides - 1].x, points[numSides - 1].y);
      for (i = 0; i < numSides; ++i) {
        context.lineTo(points[i].x, points[i].y);
      }
      context.closePath();
      context.fillStyle = fillColor;
      context.fill();
      context.lineWidth = 4 / (shape.scale * size.play);
      context.strokeStyle = strokeColor;
      context.stroke();
      context.restore();
    };
    return shape;
  }

  function makeShape(description) {
    var kind = description.kind,
        rotate,
        shape;
    if (kind == 'wine') {
	shape = makeWine(description);
    }
    if (kind == 'polygon') {
      shape = makePolygon(description);
    }
    rotate = Math.random() * 2 * pi;
    speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    shape.move = { x: cos(rotate) * speed, y: sin(rotate) * speed,
      rotate: minRotate + Math.random() * (maxRotate - minRotate)
    };
    if (Math.random() < 0.5) {
      shape.move.rotate *= -1;
    }
    return shape;
  }

  function paintFrame() {
    var canvas = canvases.shapes,
        context = contexts.shapes,
        shape,
        i;
    context.clearRect(0, 0, size.play, size.play);
    for (i = 0; i < shapes.length; ++i) {
      shape = shapes[i];
      shape.paint(context);
    }
  }

  function paintBackground() {
    var context = contexts.background;
    context.fillStyle = "#000000";
    context.fillRect(0, 0, size.play, size.play);
  }
  
  function paintRitualBackground() {
    var context = ritualContext;
    context.fillStyle = "#111111";

    context.fillRect(0, 0, ritualCanvas.width, ritualCanvas.height );
    console.log(ritualCanvas.width + ',' + ritualCanvas.height);

    // add border and divider horizontally
    var lineWidth = 5;
    context.beginPath();
    context.lineWidth = lineWidth;
    context.strokeStyle = '#ffffff';
    context.moveTo(lineWidth/2, lineWidth/2);
    context.lineTo(ritualCanvas.width - lineWidth/2, lineWidth/2);
    context.lineTo(ritualCanvas.width - lineWidth/2, ritualCanvas.height - lineWidth/2);
    context.lineTo(lineWidth/2, ritualCanvas.height - lineWidth/2);
    context.lineTo(lineWidth/2, 0);
    context.stroke();
    
    if(isLandscape() || ritualCanvas.height > ritualCanvas.width ){
        // draw horizontal divider
        context.beginPath();
        context.moveTo(lineWidth/2, ritualCanvas.height / 2 - lineWidth/2);
        context.lineTo(ritualCanvas.width - lineWidth/2, ritualCanvas.height / 2 - lineWidth/2);
        context.stroke();   
    }
    else {
        // draw vertical divider
        context.beginPath();
        context.moveTo(ritualCanvas.width / 2, lineWidth/2);
        context.lineTo(ritualCanvas.width / 2, ritualCanvas.height - lineWidth/2);
        context.stroke();
    }
    drawRituals();
  }
  
  function isLandscape() {
    if(window.innerWidth > window.innerHeight){
        return true;
    }
    else {
        return false;
    }
  }
  
  function drawRituals() {
    var ritualAmount = rituals.length - 1;
    var magicWord = "";
    for (var i = 0; i < 3; i++) {
        var randomElement = Math.floor((Math.random() * ritualAmount));
        console.log("we got a random ritual: " + rituals[randomElement]);
        magicWord = magicWord + rituals[randomElement];
    }
    magicWord = magicWord.charAt(0).toUpperCase() + magicWord.slice(1);
    ritualContext.font = "24px Arial";
    ritualContext.fillStyle = 'blue';
    ritualContext.fillText(magicWord,10,50);
  
    /*rituals.forEach(function (ritual) {
        // ritual
        rituals.forEach(function (ritual) {
            // shape
            if(ritual == "win") {
                shape = makeWine();
            }
        });
    });*/
  }

  function loadLevel() {
    var level = currentLevel,
        numShapes = level.numShapes,
        shapeDescriptions = level.shapeDescriptions,
        shape,
        i;
    shapes = new Array(numShapes);
    for (i = 0; i < numShapes; ++i) {
      shape = shapes[i] = makeShape(shapeDescriptions[
          Math.floor(shapeDescriptions.length * Math.random())]);
      shape.origin.x = shape.origin.y = size.play / 2;
    }
  }

  function updateGame() {
    shapes.forEach(function (shape) {
      shape.origin.x = (shape.origin.x + shape.move.x +
          size.play) % size.play;
      shape.origin.y = (shape.origin.y + shape.move.y +
          size.play) % size.play;
      shape.rotate = (shape.rotate + shape.move.rotate);
      while (shape.rotate > 2 * pi) {
        shape.rotate -= 2 * pi;
      }
      while (shape.rotate < -2 * pi) {
        shape.rotate += 2 * pi;
      }
    });

    paintFrame();
    window.requestAnimationFrame(updateGame);
  }
  
  function centrePlayView() {
    // if we have a gap between the ritual view and the play view, center the play view
    if(size.play < window.innerHeight || size.play < window.innerWidth) {
        if(isLandscape()){
            containers.canvas.style.top = (ritualCanvas.height - size.play) / 2 + "px";
            containers.canvas.style.left = "0px";
        }
        else {
            containers.canvas.style.top = "0px";
            containers.canvas.style.left = (ritualCanvas.width - size.play) / 2 + "px"; 
        }
    }
  }
 
  function layout() {
    if(isLandscape()){
        size.play = Math.min(window.innerHeight, window.innerWidth - (window.innerWidth * 0.2));
        ritualViewWidth = Math.max(window.innerWidth - size.play, window.innerWidth * 0.2);
        ritualViewHeight = window.innerHeight;
        ritualCanvas.style.top = "0px";
        ritualCanvas.style.left = size.play + "px";
    }
    else {
        size.play = Math.min(window.innerWidth, window.innerHeight - (window.innerHeight * 0.2));
        ritualViewWidth = window.innerWidth;
        ritualViewHeight = Math.max(window.innerHeight - size.play, window.innerHeight * 0.2);
        ritualCanvas.style.top = size.play + "px";
        ritualCanvas.style.left = "0px";
    }
    ritualCanvas.style.width = ritualViewWidth + "px";
    ritualCanvas.style.height = ritualViewHeight + "px";
    ritualCanvas.width = ritualViewWidth;
    ritualCanvas.height = ritualViewHeight;
    
    centrePlayView();

    console.log("width: " + ritualViewWidth);
    Object.keys(canvases).forEach(function (name) {
      var canvas = canvases[name];
      canvas.width = canvas.height = size.play;
    });
    paintBackground();
    paintRitualBackground();
  }

  function load() {
    // setup ritual
    containers.ritual = document.getElementById('ritualContainer');
    ritualCanvas = document.createElement('canvas');
    containers.ritual.appendChild(ritualCanvas);
    ritualContext = ritualCanvas.getContext('2d');

    // It's hammer time -- break it down -- um-buh-buh-umm-buh-buh.
    //hammertime = new Hammer(

    containers.canvas = document.getElementById('gameContainer');
    [ 'background', 'shapes' ].forEach(function (name) {
      var canvas = canvases[name] = document.createElement('canvas');
      containers.canvas.appendChild(canvas);
      contexts[name] = canvas.getContext('2d');
    });
    currentLevel = levels[0];
    window.onresize = layout;
    layout();
    loadLevel();
    updateGame();
  }

  return {
    load: load
  };
})();

window.onload = RitualGame.load;
