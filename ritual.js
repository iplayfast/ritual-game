var RitualGame = (function () {
  var levels = [
        {
          numShapes: 10,
          shapeDescriptions: [
            { kind: 'polygon', numSides: 3 },
            { kind: 'polygon', numSides: 4 },
            { kind: 'polygon', numSides: 5 },
            { kind: 'polygon', numSides: 6 },
            { kind: 'polygon', numSides: 7 },
            { kind: 'polygon', numSides: 8 }
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
