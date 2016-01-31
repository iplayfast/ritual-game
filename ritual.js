
var RitualGame = (function () {
  var hammertime,
      pi = Math.PI,
      sin = Math.sin,
      cos = Math.cos,
      baseScale = 0.15,
      maxDegree = 1,
      timeDecrement = 0.25,
      levels = LevelPackOne,
      allShapeDescriptions = [],
      allShapeColors = [
        '#d38653', '#9cd37c', '#6684bc', '#e6de54', '#d24543', '#7d5695'
      ],
      iconFamilies = {},
      minSpeed = 0.20 / 60,
      maxSpeed = 1.05 / 60,
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
        'bad', 'bak', 'bam', 'bat', 'ben', 'bin', 'bix', 'biz', 'bog',
        'bok', 'dak', 'dat', 'ded', 'den', 'dir', 'div', 'diz', 'dom',
        'dor', 'dot', 'jag', 'jak', 'jar', 'jaz', 'jem', 'jet', 'jig',
        'jin', 'jor', 'jot', 'kal', 'kan', 'kar', 'kat', 'kel', 'kik',
        'kin', 'kit', 'kor', 'kot', 'lar', 'law', 'lit', 'lok', 'lor',
        'lot', 'luk', 'lun', 'mad', 'man', 'mar', 'maz', 'mik', 'miz',
        'mor', 'mot', 'nar', 'naz', 'nix', 'nok', 'not', 'noz', 'pan',
        'par', 'pen', 'pik', 'pix', 'pod', 'pox', 'rad', 'rag', 'ran',
        'rat', 'rax', 'rel', 'rex', 'rin', 'rip', 'rok', 'rox', 'roz',
        'rod', 'ron', 'san', 'sez', 'sim', 'sun', 'sor', 'tan', 'taz',
        'tik', 'tok', 'tor', 'var', 'vat', 'vax', 'ver', 'vik', 'vim',
        'vit', 'viz', 'vor', 'war', 'wat', 'wax', 'wik', 'wil', 'win',
        'wiz', 'won', 'zam', 'zan', 'zap', 'zar', 'zen', 'zim', 'zip',
        'zix', 'zor', 'zot'
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
      return false;
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
      var	shape = {
            rotate: 0,
            scale: currentLevel.scale,
            fillColor: description.color
          },
          name = description.name,
          painter = iconFamilies[name.family][name.icon];
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
    speed *= currentLevel.speedFactor;
    shape.move = {
      x: cos(direction) * speed,
      y: sin(direction) * speed,
      rotate: minRotate + Math.random() * (maxRotate - minRotate)
    };
    shape.move.rotate *= currentLevel.spinFactor;
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
        x = margin + scale;
        y = (1 + 2 * i) * scale;
        if (!currentLevel.shapesHidden) {
          context.save();
          context.translate(x, y);
          shape.origin.x = shape.origin.y = 0;
          if (shape.selected) {
            paintShapeWithColor(context, shape, color.shape.selected);
          } else {
            shape.paint(context);
          }
          context.restore();
        } else {
          x -= scale;
        }
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
        x = (1 + 2 * i) * scale;
        y = margin + scale;
        if (!currentLevel.shapesHidden) {
          context.save();
          context.translate(x, y);
          shape.origin.x = shape.origin.y = 0;
          if (shape.selected) {
            paintShapeWithColor(context, shape, color.shape.selected);
          } else {
            shape.paint(context);
          }
          context.restore();
        } else {
          y -= scale;
        }
        context.fillStyle = color.text.syllable[shape.selected ?
            'selected' : 'default'];
        context.fillText(shape.syllable, x - scale * 0.6, y + 1.6 * scale);
      }
    }
  }
  
  function loadLevel(levelIndex) {
    var level = currentLevel = levels[levelIndex],
        numShapes = level.numShapes,
        ritualLength = level.ritualLength,
        shapeConstraints = level.shapeConstraints,
        shapeDescriptions = [],
        numDescriptions,
        permutation,
        i, j;

    level.degree = 0;
    level.shapesHidden = false;
    level.scale = level.sizeFactor * baseScale;

    // Collect shape descriptions matching the level's constraints.
    allShapeDescriptions.forEach(function (description) {
      for (i = 0; i < shapeConstraints.length; ++i) {
        if (satisfiesConstraints(description, shapeConstraints[i])) {
          shapeDescriptions.push(description);
          return;
        }
      }
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
    restartLevel();
  }

  function restartLevel() {
    var level = currentLevel;
    console.log(level.levelId, level.degree, level.timeLimit);
    clearSelected();
    timePrevious = 0;
    timeStart = Date.now();
  }

  function paintTime(timeTotal) {
    var canvas = canvases.ritual,
        context = contexts.ritual,
        fraction = Math.min(1, timeTotal / currentLevel.timeLimit),
        color = 'rgb(' + Math.floor(fraction * 200) + ', ' +
            Math.floor((1 - fraction) * 200) + ', 0)';
    context.fillStyle = color;
    if (isLandscape) {
      context.fillRect(0, 0, canvas.width / 8, fraction * canvas.height);
    } else {
      context.fillRect(0, 0, fraction * canvas.width, canvas.height / 8);
    }
  }

  function updateGame() {
    var scale = currentLevel.scale,
        timeTotal = timePrevious + (Date.now() - timeStart) / 1000;
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
    console.log('completed degree ' + currentLevel.degree);
    if (currentLevel.degree == maxDegree) {
      if (currentLevel.shapesHidden) {
        console.log('completed level ' + currentLevel.levelId);
        currentLevelIndex += 1;
        if (currentLevelIndex == levels.length) {
          console.log('game over');
          status.playing = false;
        }
        loadLevel(currentLevelIndex);
        return;
      } else {
        console.log('hiding shapes');
        currentLevel.shapesHidden = true;
      }
    } else {
      currentLevel.degree += 1;
      currentLevel.timeLimit *= (1 - timeDecrement);
    }
    restartLevel(currentLevelIndex);
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
        (ritual[ritualPosition].target = target).selected = true;
        ritual[ritualPosition].selected = true;
        paintRitual();
        ++ritualPosition;
        if (ritualPosition == ritual.length) {
          succeed();
        }
      } else {
        clearSelected();
      }
    }
  }

  function clearSelected() {
    while (ritualPosition > 0) {
      --ritualPosition;
      ritual[ritualPosition].selected = false;
      ritual[ritualPosition].target.selected = false;
      delete ritual[ritualPosition].target;
    }
    paintRitual();
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

    // Decorative background layers.
    containers.backgroundDecor = document.getElementById('backgroundDecor');
    canvases.slowBackground = document.createElement('canvas');
    contexts.slowBackground = canvases.slowBackground.getContext('2d');
    containers.backgroundDecor.appendChild(canvases.slowBackground);

    // Decorative foreground layers.
    containers.foregroundDecor = document.getElementById('foregroundDecor');

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
    currentLevelIndex = 0;
    loadLevel(currentLevelIndex);
    layout.resize();
    status.playing = true;
    updateGame();
  }

  return {
    load: load
  };
})();

window.onload = RitualGame.load;
