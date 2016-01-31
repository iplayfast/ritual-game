
var RitualGame = (function () {
  var hammertime,
      pi = Math.PI,
      sin = Math.sin,
      cos = Math.cos,
      levels = [
        {
          scale: 0.15,
          shapeConstraints: [
            { kind: 'polygon', numSides: { min: 4, max: 6 } },
            { kind: 'icon', families: [ 'food' ] }
          ],
          ritualLength: 4,
          numShapes: 12,
          timeLimit: 15
        }
      ],
      allShapeDescriptions = [],
      allShapeColors = [
        '#d38653', '#9cd37c', '#6684bc', '#e6de54', '#d24543', '#7d5695'
      ],
      iconFamilies = {},
      minSpeed = 0.05 / 60,
      maxSpeed = 0.35 / 60,
      minRotate = pi / 600,
      maxRotate = pi / 120,
      size = {
        play: {}
      },
      color = {
        background: { play: '#000', ritual: '#fff' },
        text: {
          splash: '#fff',
          syllable: { default: '#444', selected: '#999' }
        },
        shape: {
          stroke: '#444',
          selected: { fill: '#bbb', stroke: '#aaa' }
        }
      },
      currentLevel,
      containers = {},
      canvases = {},
      contexts = {},
      playCanvasNames = [ 'background', 'shapes', 'touch' ],
      shapes,
      syllables = [
        // Lawrence:
        'dat', 'dom', 'dor', 'jak', 'jet', 'jor', 'kal', 'kan', 'kor', 'lar',
        'lok', 'lun', 'man', 'naz', 'nok', 'pan', 'pod', 'rel', 'ron', 'tan',
        'tik', 'tok', 'tor', 'ver', 'viz', 'wax', 'zam', 'zim', 'zor',
        // Mike:
        'oof', 'foo', 'boo', 'gak', 'bip', 'bop', 'fop', 'dup', 'pip',
        'pop', 'pif', 'nif',
        'wiki', 'waka', 'rama', 'lama', 'ding', 'gong', 'dang', 'zoot',
        'poot', 'toot', 'boot', 'plip', 'plop', 'beep', 'boop', 'bang',
        'foof', 'moop', 'glik'
      ],
      numSyllables = syllables.length,
      ritual,
      ritualPosition,
      timePrevious,
      timeStart,
      status = {
        playing: false,
        paused: false
      },
      layout = {},
      loadingXPos = {
        get latest () {
          if (isLandscape) {
            return canvases.ritual.width / 2;
          } else {
            return canvases.ritual.width / 2  + (canvases.ritual.width / 4);
          }
        }
      },
      loadingYPos = {
        get latest () {
          if (isLandscape) {
            return (canvases.ritual.height / 2) + (canvases.ritual.height / 4);
          } else {
            return (canvases.ritual.height / 2);
          }
        }
      };

  function satisfiesConstraints(description, constraint) {
    if (constraint.kind !== description.kind) {
      return true;
    }
    if (constraint.kind == 'polygon') {
      return description.numSides >= constraint.numSides.min &&
          description.numSides <= constraint.numSides.max;
    }
    if (constraint.kind == 'icon') {
      return constraint.families.indexOf(description.name.family) !== -1;
    }
    return true;
  }

  function makeIcon(description) {
      var	shape = { rotate: 0 },
          name = description.name,
          painter = iconFamilies[name.family][name.icon];
      shape.fillColor = description.color;
      shape.paint = painter.bind(this, shape, size);
      return shape;
  }

  function makePolygon(description) {
    var i, pointAngle,
        numSides = description.numSides,
        shape = {},
        exteriorAngle = 2 * pi / numSides,
        rotate = shape.rotate = 0,
        points = shape.points = new Array(numSides);
    shape.scale = currentLevel.scale;
    shape.fillColor = description.color;
    shape.strokeColor = color.shape.stroke;
    pointAngle = (pi - exteriorAngle) / 2;
    for (i = 0; i < numSides; ++i) {
      pointAngle += exteriorAngle;
      points[i] = { x: cos(pointAngle), y: sin(pointAngle) };
    }
    shape.paint = function (context) {
      var x0 = shape.origin.x,
          y0 = shape.origin.y,
          i;
      context.save();
      context.translate(x0 * size.play, y0 * size.play);
      context.rotate(shape.rotate);
      context.scale(context.radius, context.radius);
      context.beginPath();
      context.moveTo(points[numSides - 1].x, points[numSides - 1].y);
      for (i = 0; i < numSides; ++i) {
        context.lineTo(points[i].x, points[i].y);
      }
      context.closePath();
      context.fillStyle = shape.fillColor;
      context.fill();
      context.lineWidth = 0.075;
      context.strokeStyle = shape.strokeColor;
      context.stroke();
      context.restore();
    };
    return shape;
  }

  function makeShape(description) {
    var kind = description.kind,
        direction,
        shape;
    if (kind == 'polygon') {
      shape = makePolygon(description);
    } else {
      shape = makeIcon(description);
    }
    shape.description = description;
    shape.origin = { x: Math.random(), y: Math.random() };
    direction = Math.random() * 2 * pi;
    speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    shape.move = {
      x: cos(direction) * speed,
      y: sin(direction) * speed,
      rotate: minRotate + Math.random() * (maxRotate - minRotate)
    };
    if (Math.random() < 0.5) {
      shape.move.rotate *= -1;
    }
    shape.syllable = description.syllable;
    return shape;
  }

  function paintShapeWithColor(context, shape, forceColor) {
    var saveFillColor = shape.fillColor,
        saveStrokeColor = shape.strokeColor;
    shape.fillColor = color.shape.selected.fill;
    shape.strokeColor = color.shape.selected.stroke;
    shape.paint(context);
    shape.fillColor = saveFillColor;
    shape.strokeColor = saveStrokeColor;
  }

  function paintFrame() {
    var canvas = canvases.shapes,
        context = contexts.shapes,
        shape,
        i;
    context.clearRect(0, 0, size.play, size.play);
    for (i = 0; i < shapes.length; ++i) {
      shape = shapes[i];
      if (shape.selected) {
        context.save();
        context.globalAlpha = 0.5;
        paintShapeWithColor(context, shape, color.shape.selected);
        context.restore();
      } else {
        shape.paint(context);
      }
    }
  }

  function paintBackground() {
    var context = contexts.background;
    context.fillStyle = color.background.play;
    context.fillRect(0, 0, size.play, size.play);
  }
  
  function paintRitual() {
    var canvas = canvases.ritual,
        context = contexts.ritual,
        margin,
        scale,
        shape,
        i;

    // Background.
    context.fillStyle = color.background.ritual;
    context.fillRect(0, 0, canvases.ritual.width, canvases.ritual.height);

    if (!ritual) {
      return;
    }

    if (isLandscape) {
      margin = canvas.width / 6.5;  // Leave room for the countdown bar.
      scale = Math.min(canvases.ritual.width - margin,
          canvases.ritual.height / ritual.length) / 2;
      context.radius = scale;
      context.fillStyle = color.text.syllable;
      context.font = (scale * 0.58) + "px 'Fredoka One', sans-serif";
      for (i = 0; i < ritual.length; ++i) {
        shape = ritual[i];
        context.save();
        context.translate(x = margin + scale, y = (1 + 2 * i) * scale);
        shape.origin.x = shape.origin.y = 0;
        if (shape.selected) {
          paintShapeWithColor(context, shape, color.shape.selected);
        } else {
          shape.paint(context);
        }
        context.restore();
        context.fillStyle = color.text.syllable[shape.selected ?
            'selected' : 'default'];
        context.fillText(shape.syllable, x + 1.2 * scale, y + scale * 0.2);
      }
    } else {
      margin = canvas.height / 6.5;  // Leave room for the countdown bar.
      scale = Math.min(canvases.ritual.height - margin,
          canvases.ritual.width / ritual.length) / 2;
      context.radius = scale;
      context.fillStyle = color.text.syllable;
      context.font = (scale * 0.58) + "px 'Fredoka One', sans-serif";
      for (i = 0; i < ritual.length; ++i) {
        shape = ritual[i];
        context.save();
        context.translate(x = (1 + 2 * i) * scale, y = margin + scale);
        shape.origin.x = shape.origin.y = 0;
        if (shape.selected) {
          paintShapeWithColor(context, shape, color.shape.selected);
        } else {
          shape.paint(context);
        }
        context.restore();
        context.fillStyle = color.text.syllable[shape.selected ?
            'selected' : 'default'];
        context.fillText(shape.syllable, x - scale * 0.6, y + 1.6 * scale);
      }
    }
  }
  
  function loadLevel() {
    var level = currentLevel,
        numShapes = level.numShapes,
        ritualLength = level.ritualLength,
        shapeConstraints = level.shapeConstraints,
        shapeDescriptions = [],
        numDescriptions,
        permutation,
        i, j;

    // Collect shape descriptions matching the level's constraints.
    allShapeDescriptions.forEach(function (description) {
      for (i = 0; i < shapeConstraints.length; ++i) {
        if (!satisfiesConstraints(description, shapeConstraints[i])) {
          return;
        }
      }
      shapeDescriptions.push(description);
    });
    numDescriptions = shapeDescriptions.length;

    if (numShapes > numDescriptions) {
      console.log('not enough shape descriptions: ' + numShapes + ' > ' +
          numDescriptions + ' => reducing number of shapes');
      numShapes = numDescriptions;
    }
    if (numShapes > numSyllables) {
      console.log('not enough syllables: ' + numShapes + ' > ' +
          numSyllables + ' => reducing number of shapes');
      numShapes = numSyllables;
    }

    // Make a random permutation of the description indices.
    permutation = new Array(numDescriptions);
    permutation[0] = 0;
    for (i = 1; i < numDescriptions; ++i) {
      j = Math.floor(Math.random() * (i + 1));
      permutation[i] = permutation[j];
      permutation[j] = i;
    }

    shapes = new Array(numShapes);
    for (i = 0; i < numShapes; ++i) {
      shapes[i] = makeShape(shapeDescriptions[permutation[i]]);
      shapes[i].depth = i;
    }

    ritual = new Array(ritualLength);
    ritual[0] = makeShape(shapes[0].description);
    ritual[ritualLength - 1] = makeShape(shapes[numShapes - 1].description);
    j = 0;
    for (i = 1; i < ritualLength - 1; ++i) {
      j += Math.floor(numShapes / (ritualLength - 1));
      ritual[i] = makeShape(shapes[j].description);
    }
    ritual.reverse();
    ritualPosition = 0;
    paintRitual();
    timePrevious = 0;
    timeStart = Date.now();
  }

  function paintTime(timeTotal) {
    var canvas = canvases.ritual,
        context = contexts.ritual,
        fraction = Math.min(1, timeTotal / currentLevel.timeLimit),
        color = 'rgb(' + Math.floor(fraction * 255) + ', ' +
            Math.floor((1 - fraction) * 255) + ', 0)';
    context.fillStyle = color;
    if (isLandscape) {
      context.fillRect(0, 0, canvas.width / 8, fraction * canvas.height);
    } else {
      context.fillRect(0, 0, fraction * canvas.width, canvas.height / 8);
    }
  }

  function updateGame() {
    var timeTotal = timePrevious + (Date.now() - timeStart) / 1000;
    paintTime(timeTotal);
    if (timeTotal > currentLevel.timeLimit) {
      fail();
      return;
    }
    shapes.forEach(function (shape, ix) {
      shape.origin.x += shape.move.x;
      while (shape.origin.x < 0) {
        shape.origin.x += 1;
      }
      while (shape.origin.x >= 1) {
        shape.origin.x -= 1;
      }
      shape.origin.y += shape.move.y;
      while (shape.origin.y < 0) {
        shape.origin.y += 1;
      }
      while (shape.origin.y >= 1) {
        shape.origin.y -= 1;
      }
      shape.rotate = (shape.rotate + shape.move.rotate);
      while (shape.rotate > 2 * pi) {
        shape.rotate -= 2 * pi;
      }
      while (shape.rotate < -2 * pi) {
        shape.rotate += 2 * pi;
      }
    });
    paintFrame();
    if (status.playing && !status.paused) {
      window.requestAnimationFrame(updateGame);
    }
  }
  
  layout.resize = function () {
    var windowWidth = window.innerWidth,
        windowHeight = window.innerHeight,
        width,
        height,
        widthGap = 0,
        heightGap = 0;

    if (windowWidth > windowHeight) {
      isLandscape = true;
      width = windowWidth;
      height = width * 9 / 16;
      if (height <= windowHeight) {
        heightGap = (windowHeight - height) / 2;
      } else {
        height = windowHeight;
        width = height * 16 / 9;
        widthGap = (windowWidth - width) / 2;
      }
      size.play = height;
      size.ritual = { width: size.play * 7 / 9, height: size.play };
      containers.ritual.style.top = heightGap + 'px';
      containers.ritual.style.left = widthGap + size.play + 'px';
    } else {
      isLandscape = false;
      height = windowHeight;
      width = height * 9 / 16;
      if (width <= windowWidth) {
        widthGap = (windowWidth - width) / 2;
      } else {
        width = windowWidth;
        height = width * 16 / 9;
        heightGap = (windowHeight - height) / 2;
      }
      size.play = width;
      size.ritual = { width: size.play, height: size.play * 7 / 9 };
      containers.ritual.style.left = widthGap + 'px';
      containers.ritual.style.top = heightGap + size.play + 'px';
    }

    containers.play.style.width = size.play + 'px';
    containers.play.style.height = size.play + 'px';
    containers.play.style.top = heightGap + 'px';
    containers.play.style.left = widthGap + 'px';

    playCanvasNames.forEach(function (name) {
      var canvas = canvases[name];
      canvas.width = canvas.height = size.play;
    });
    canvases.ritual.width = size.ritual.width;
    canvases.ritual.height = size.ritual.height;

    playCanvasNames.forEach(function (name) {
      var canvas = canvases[name],
          context = contexts[name];
      canvas.width = canvas.height = size.play;
      context.radius = currentLevel.scale * size.play;
    });
    paintBackground();
    paintRitual();
  }

  function succeed() {
    console.log('You have succeeded.');
    status.playing = false;
  }

  function fail() {
    console.log('You have failed.');
    status.playing = false;
  }

  function shapeTap(event) {
    var offsetLeft = containers.play.offsetLeft,
        offsetTop = containers.play.offsetTop,
        xTap = event.center.x - offsetLeft,
        yTap = event.center.y - offsetTop,
        rr = Math.pow(contexts.touch.radius, 2),
        i, shape, x, y, dd,
        ddClosest = null, target = null;
    for (i = 0; i < shapes.length; ++i) {
      shape = shapes[i];
      if (shape.selected) {
        continue;
      }
      x = shape.origin.x * size.play;
      y = shape.origin.y * size.play;
      dd = Math.pow(xTap - x, 2) + Math.pow(yTap - y, 2);
      if (dd <= rr && (ddClosest === null || dd < ddClosest)) {
        ddClosest = dd;
        target = shape;
      }
    }
    if (target !== null) {
      // handle tap
      if (target.description === ritual[ritualPosition].description) {
        console.log('hit');
        (ritual[ritualPosition].target = target).selected = true;
        ritual[ritualPosition].selected = true;
        paintRitual();
        ++ritualPosition;
        if (ritualPosition == ritual.length) {
          succeed();
        }
      } else {
        console.log('miss');
        while (ritualPosition > 0) {
          --ritualPosition;
          ritual[ritualPosition].selected = false;
          ritual[ritualPosition].target.selected = false;
          delete ritual[ritualPosition].target;
        }
        paintRitual();
      }
    }
  }

  // Load the RitualGame module.
  function load() {
    var numSides,
        permutation;

    // All polygon descriptions.
    for (numSides = 3; numSides <= 8; ++numSides) {
      allShapeColors.forEach(function (color) {
        allShapeDescriptions.push({
          kind: 'polygon',
          numSides: numSides,
          color: color
        });
      });
    }

    // All icon descriptions.
    iconFamilies.food = foodPainters;
    iconFamilies.astrology = astrologyPainters;
    Object.keys(iconFamilies).forEach(function (familyName) {
      var painters = iconFamilies[familyName];
      Object.keys(painters).forEach(function (iconName) {
        var painter = painters[iconName];
        allShapeColors.forEach(function (color) {
          allShapeDescriptions.push({
            kind: 'icon',
            name: { family: familyName, icon: iconName },
            painter: painter,
            color: color,
          });
        });
      });
    });

    // Assign a random permutation of syllables to the shape descriptions.
    permutation = new Array(numSyllables);
    permutation[0] = 0;
    for (i = 1; i < numSyllables; ++i) {
      j = Math.floor(Math.random() * (i + 1));
      permutation[i] = permutation[j];
      permutation[j] = i;
    }
    allShapeDescriptions.forEach(function (description, pos) {
      description.syllable = syllables[permutation[pos]];
    });

    console.log(allShapeDescriptions.length + ' shape descriptions');
    console.log(numSyllables + ' syllables');

    containers.wrapper = document.getElementById('wrapper');

    // Set up the ritual display.
    containers.ritual = document.getElementById('ritualContainer');
    canvases.ritual = document.createElement('canvas');
    containers.ritual.appendChild(canvases.ritual);
    contexts.ritual = canvases.ritual.getContext('2d');

    containers.play = document.getElementById('playContainer');
    playCanvasNames.forEach(function (name) {
      var canvas = canvases[name] = document.createElement('canvas');
      containers.play.appendChild(canvas);
      contexts[name] = canvas.getContext('2d');
    });

    // It's hammer time. Break it down!
    hammertime = new Hammer(canvases.touch);
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
    hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    hammertime.on('tap press swipe pan', shapeTap);

    currentLevel = levels[0];
    window.onresize = layout.resize;
    layout.resize();
    loadLevel();
    status.playing = true;
    updateGame();
  }

  return {
    load: load
  };
})();

var GameMenu = (function () {
    var canvas,
    context,
    launchedGame = false;

  function load() {
    // setup menu 
    playContainer = document.getElementById('playContainer');
    canvas = document.createElement('canvas');
    playContainer.appendChild(canvas);
    context = canvas.getContext('2d');
    document.body.addEventListener("touchstart", touchDown, false);
    document.body.addEventListener("touchend", touchUp, false);
    document.body.addEventListener("mousedown", mouseDown, false);
    document.body.addEventListener("mouseup", mouseUp, false);
    updateGame();
  }
  
   
    function mouseUp() {
        mouseIsDown = 0;
        mouseXY();
    }

    function touchUp() {
        mouseIsDown = 0;
    }

    function mouseDown() {
        mouseIsDown = 1;
        mouseXY();
    }

    function touchDown() {
        mouseIsDown = 1;
        touchXY();
    }
    
    function mouseXY(e) {
        if (!e)
            var e = event;
        var canX = e.pageX;
        var canY = e.pageY;
        pressed(canX, canY);
    }

    function touchXY(e) {
        if (!e)
            var e = event;
        e.preventDefault();
        var canX = e.targetTouches[0].pageX;
        var canY = e.targetTouches[0].pageY;
        pressed(canX, canY);
    }
    
    function pressed(xPos, yPos) {
        console.log(xPos + ', ' + yPos);
        if(pressedPlayButton(xPos, yPos)) {
            launchedGame = true;
            cleanupMenu();
            RitualGame.load();
        }
    }
    
    function pressedPlayButton(xPos, yPos) {
        if(Math.abs(xPos - window.innerWidth/2) < 50 &&
           Math.abs(yPos - window.innerHeight/2) < 25 ) {
            return true;
        }
        return false
    }
  
  function cleanupMenu() {
    console.log("cleaning up");
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    window.cancelAnimationFrame(updateGame);
    document.body.removeEventListener("touchstart", touchDown);
    document.body.removeEventListener("touchend", touchUp);
    document.body.removeEventListener("mousedown", mouseDown);
    document.body.removeEventListener("mouseup", mouseUp);
  }
  
  function layout() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.font = "28px Arial";
    context.fillStyle = color.text.splash;
    context.fillText("PLAY",window.innerWidth/2 - 50,window.innerHeight/2);
    
    context.font = "62px Arial";
    context.fillStyle = color.text.splash;
    context.fillText("Ritual Game",window.innerWidth/2 -185,window.innerHeight/2 - 150);
  }
  
  function updateGame() {   
    if(!launchedGame) {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      layout();
      window.requestAnimationFrame(updateGame);
    }
  }

  return {
    load: load
  };
})();

//window.onload = GameMenu.load;
window.onload = RitualGame.load;
