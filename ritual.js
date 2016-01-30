var RitualGame = (function () {
  var levels = [
        {
          numShapes: 10,
          shapeDescriptions: [
	    { kind: 'wine'}
            /*{ kind: 'polygon', numSides: 3 },
            { kind: 'polygon', numSides: 4 },
            { kind: 'polygon', numSides: 5 },
            { kind: 'polygon', numSides: 6 },
            { kind: 'polygon', numSides: 7 },
            { kind: 'polygon', numSides: 8 }*/
            // { kind: 'star', numVertices: 5 },
            // { kind: 'star', numVertices: 7 }
          ]
        }
      ],
      minSpeed = 0.5,
      maxSpeed = 10,
      size = {
        play: {}
      },
      color = {
        background: '#f1f0cf'
      },
      currentLevel,
      pi = Math.PI,
      sin = Math.sin,
      cos = Math.cos,
      containers = {},
      canvases = {},
      contexts = {},
      shapes;
function makeWine(description) {
	shape = { angle:0},
	origin = shape.origin = {x:0, y:0};
	shape.paint = function(context) {
		context.save();
		context.translate(0,0);
		context.rotate(shape.angle);
		context.scale(shape.scale / 50,shape.scale / 50);
		context.beginPath();
		context.moveTo(0,0);
		context.lineTo(26,0);
		context.lineTo(26,26);
		context.lineTo(0,26);
		context.closePath();
		context.clip();
		context.translate(0,0);
		context.translate(0,0);
		context.scale(1,1);
		context.translate(0,0);
		context.strokeStyle = 'rgba(0,0,0,0)';
		context.lineCap = 'butt';
		context.lineJoin = 'miter';
		context.miterLimit = 4;
		context.save();
		context.fillStyle = "#000000";
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
		context.restore();
		context.save();
		context.fillStyle = "rgba(0, 0, 0, 0)";
		context.strokeStyle = "#000000";
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
		context.restore();
		context.save();
		context.fillStyle = "#000000";
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
		context.restore();
		context.save();
		context.fillStyle = "rgba(0, 0, 0, 0)";
		context.strokeStyle = "#000000";
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
		context.restore();
	};
	console.log(JSON.stringify(shape));
	return shape;
}
  function makePolygon(description) {
    var i, a,
        numSides = description.numSides,
        shape = {},
        origin = shape.origin = { x: 0, y: 0 },
        exteriorAngle = 2 * pi / numSides,
        angle = shape.angle = 0,
        scale = shape.scale = 1,
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
      context.rotate(angle);
      context.scale(shape.scale, shape.scale);
      context.beginPath();
      context.moveTo(points[numSides - 1].x, points[numSides - 1].y);
      for (i = 0; i < numSides; ++i) {
        context.lineTo(points[i].x, points[i].y);
      }
      context.closePath();
      context.fill();
      context.restore();
    };
    return shape;
  }

  function makeStar(description) {
  }

  function makeShape(description) {
    var kind = description.kind,
        angle,
        shape;
    if (kind == 'wine') {
	shape = makeWine(description);
    }
    if (kind == 'polygon') {
      shape = makePolygon(description);
    }
    if (kind == 'star') {
      shape = makeStar(description);
    }
    angle = Math.random() * 2 * pi;
    speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    shape.velocity = { x: cos(angle) * speed, y: sin(angle) * speed };
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
      shape.scale = size.play / 10;
      shape.origin.x = shape.origin.y = size.play / 2;
    }
  }

  function updateGame() {
    shapes.forEach(function (shape) {
      shape.origin.x = (shape.origin.x + shape.velocity.x +
          size.play) % size.play;
      shape.origin.y = (shape.origin.y + shape.velocity.y +
          size.play) % size.play;
    });
    paintFrame();
    window.requestAnimationFrame(updateGame);
  }
 
  function layout() {
    size.play = Math.min(window.innerWidth, window.innerHeight);
    Object.keys(canvases).forEach(function (name) {
      var canvas = canvases[name];
      canvas.width = canvas.height = size.play;
    });
    paintBackground();
  }

  function load() {
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
