var RitualGame = (function () {
  var pi = Math.PI,
      levels = [
        {
          numShapes: 10,
          shapeDescriptions: [
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
