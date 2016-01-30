var RitualGame = (function () {
  var pi = Math.PI,
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
          fill: [ '#aebf94', '#99bfa6', '#95b5bf', '#969bbf', '#a68dbf',
                  '#bf8a97', '#bf9d8e', '#bfba95' ],
          stroke: '#444'
        }
      },
      currentLevel,
      sin = Math.sin,
      cos = Math.cos,
      containers = {},
      canvases = {},
      contexts = {},
      shapes;
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
	console.log(JSON.stringify(shape));
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
    context.fillStyle = color.background;
    context.fillRect(0, 0, size.play, size.play);
  }
  
  function paintRitualBackground() {
    var context = ritualView.context;
    context.fillStyle = "#111111";

    context.fillRect(0, 0, ritualView.rCanvas.width, ritualView.rCanvas.height );
        
    
    console.log(ritualView.rCanvas.width + ',' + ritualView.rCanvas.height);
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
 
  function layout() {
    if(window.innerWidth > window.innerHeight){
        // in landscape
        ritualViewWidth = window.innerWidth / 5;
        ritualViewHeight = window.innerHeight;
        size.play = Math.min(window.innerHeight, window.innerWidth - ritualViewWidth);
        ritualView.canvas.style.top = "0px";
        ritualView.canvas.style.left = size.play + "px";
    }
    else {
        // in portrait
        ritualViewWidth = window.innerWidth;
        ritualViewHeight = window.innerHeight / 5;
        size.play = Math.min(window.innerWidth, window.innerHeight - ritualViewHeight);
        ritualView.canvas.style.top = size.play + "px";
        ritualView.canvas.style.left = "0px";
    }
    ritualView.canvas.style.width = ritualViewWidth + "px";
    ritualView.canvas.style.height = ritualViewHeight + "px";
    ritualView.rCanvas.width = ritualViewWidth;
    ritualView.rCanvas.height = ritualViewHeight;

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
    ritualView.canvas = document.getElementById('ritualView');
    rCanvas = document.createElement('canvas');
    ritualView.canvas.appendChild(rCanvas);
    ritualView.context = rCanvas.getContext('2d');
    ritualView.rCanvas = rCanvas;

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
