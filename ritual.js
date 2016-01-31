
var RitualGame = (function () {
  var pi = Math.PI,
      hammertime,
      levels = [
        {
          scale: 0.075,
          numShapes: 20,
          shapeDescriptions: [
            { kind: 'polygon', numSides: { min: 5, max: 5 } },
            { kind: 'icon' }
          ],
        }
      ],
      iconPainters,
      minSpeed = 0.05 / 60,
      maxSpeed = 0.35 / 60,
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
      syllables = ["dat","dom","dor","jak","jet","jor","kal","kan","kor","lar","lok","lun","man","naz","nok","pan","pod","rel","ron","tan","tik","tok","tor","ver","viz","wax","zam","zim","zor"],
      countdownStarted = false;

    var loadingXPos = {
      get latest () {
        if(isLandscape()){
            return ritualCanvas.width / 2;
        }
        else {
            return ritualCanvas.width / 2  + (ritualCanvas.width / 4);
        }
      }
    }
    
    var loadingYPos = {
      get latest () {
        if(isLandscape()){
            return  (ritualCanvas.height / 2) + (ritualCanvas.height / 4);
        }
        else {
            return (ritualCanvas.height / 2);
        }
      }
    }

    function makeIcon(description) {
        var	shape = { rotate:0, scale: currentLevel.scale * 7 / 100 },
            iconPainter = iconPainters[Math.floor(Math.random() *
                iconPainters.length)];
        shape.fillColor = color.shape.fill[Math.floor(Math.random() *
            color.shape.fill.length)];
        shape.paint = iconPainter.bind(this, shape, size);
        return shape;
    }
// to set tabs  for vim
// :se ts=2
// :se sw=2

  function makePolygon(description) {
    var i, pointAngle,
        minSides = description.numSides.min,
        maxSides = description.numSides.max,
        numSides = minSides +
            Math.floor(Math.random() * (maxSides - minSides)),
        shape = {},
        exteriorAngle = 2 * pi / numSides,
        rotate = shape.rotate = 0,
        fillColor = color.shape.fill[Math.floor(Math.random() *
            color.shape.fill.length)],
        strokeColor = color.shape.stroke,
        points = shape.points = new Array(numSides);
    shape.scale = currentLevel.scale;
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
      context.scale(size.radius, size.radius);
      context.beginPath();
      context.moveTo(points[numSides - 1].x, points[numSides - 1].y);
      for (i = 0; i < numSides; ++i) {
        context.lineTo(points[i].x, points[i].y);
      }
      context.closePath();
      context.fillStyle = fillColor;
      context.fill();
      context.lineWidth = 0.075;
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
    } else {
      shape = makeIcon(description);
    }
    shape.origin = { x: 0.5, y: 0.5 };
    rotate = Math.random() * 2 * pi;
    speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    shape.move = {
      x: cos(rotate) * speed,
      y: sin(rotate) * speed,
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
      if (shape.selected) {
        context.fillStyle = '#fff';
        context.beginPath();
        context.arc(shape.origin.x * size.play, shape.origin.y * size.play,
            size.radius, 0, 2 * pi);
        context.closePath();
        context.fill();
      }
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
    //console.log(ritualCanvas.width + ',' + ritualCanvas.height);

    // add border
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
    
    if(isLandscape()){
        // draw horizontal divider
        context.beginPath();
        context.moveTo(lineWidth/2, ritualCanvas.height / 2 - lineWidth/2);
        context.lineTo(ritualCanvas.width - lineWidth/2, ritualCanvas.height / 2 - lineWidth/2);
        context.stroke();
        drawCountdownBar(ritualCanvas.width / 2, (ritualCanvas.height / 2) + (ritualCanvas.height / 4));
    }
    else {
        // draw vertical divider
        context.beginPath();
        context.moveTo(ritualCanvas.width / 2, lineWidth/2);
        context.lineTo(ritualCanvas.width / 2, ritualCanvas.height - lineWidth/2);
        context.stroke();
        drawCountdownBar(ritualCanvas.width / 2  + (ritualCanvas.width / 4), (ritualCanvas.height / 2));
    }
    drawRituals();
  }
  
  function drawCountdownBar(xPos, yPos) {
    var imd = null;
    var circ = Math.PI * 2;
    var quart = Math.PI / 2;

    ritualContext.beginPath();
    ritualContext.strokeStyle = '#99CC33';
    ritualContext.lineCap = 'round';
    ritualContext.closePath();
    ritualContext.fill();
    ritualContext.lineWidth = 10.0;
    
    var draw = function(current) {
        if(current > 0.4) { // turn yellow
            ritualContext.strokeStyle = '#ffcc00';
        }
        if( current > 0.7) { // turn red
            ritualContext.strokeStyle = '#ff3300';
        }
        ritualContext.clearRect(5, ritualCanvas.height / 2,
            ritualCanvas.width - 10, ritualCanvas.height / 2 - 5);
        ritualContext.beginPath();
        ritualContext.arc(loadingXPos.latest, loadingYPos.latest, Math.min(ritualCanvas.width / 2, ritualCanvas.height / 4) * 0.9, -(quart), ((circ) * current) - quart, false);
        ritualContext.stroke();
    }

    if(!countdownStarted) {
        var progressBar = new Fx({
            duration: 20000,
            transition: 'linear',
            onStep: function(step){
                draw(step / 100);
            }
        });

        progressBar.set = function(now){
            var ret = Fx.prototype.set.call(this, now);
            this.fireEvent('step', now);
            return ret;
        };

        progressBar.start(0, 100);
        countdownStarted = true;
    }
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
    var numSyllables = syllables.length - 1;
    
    var YOFFSET = 30;
    var currentYOffset = 20;
    var originalYOffset = currentYOffset;
    var XOFFSET = 200;
    var currentXOffset = 10;
    for (var i = 0; i < 10; i++) {
        var magicWord = "";
        for (var j = 0; j < 3; j++) {
            var randomElement = Math.floor((Math.random() * numSyllables));
            magicWord = magicWord + syllables[randomElement];
        }
        magicWord = magicWord.charAt(0).toUpperCase() + magicWord.slice(1);
        if(isLandscape()){
            ritualContext.font = "20px Arial";
            ritualContext.fillStyle = 'blue';
            ritualContext.fillText(magicWord,currentXOffset,currentYOffset + 20);
            currentYOffset += YOFFSET;
            if(currentYOffset >= (ritualCanvas.height / 2) - 12 ) {
                currentYOffset = originalYOffset;
                currentXOffset += XOFFSET;
            }
        }
        else {
            ritualContext.font = "16px Arial";
            ritualContext.fillStyle = 'blue';
            ritualContext.fillText(magicWord,currentXOffset,currentYOffset);
            currentYOffset += 20;
            if(currentYOffset >= ritualCanvas.height - 12 ) {
                currentYOffset = originalYOffset;
                currentXOffset += 125;
            }
        }
    }
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
    }
  }

  function updateGame() {
    shapes.forEach(function (shape) {
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
    //window.requestAnimationFrame(updateGame);
    setTimeout(updateGame, 1000 / 60);
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
        size.play = Math.min(window.innerHeight,
            window.innerWidth - (window.innerWidth * 0.25));
        size.radius = currentLevel.scale * size.play;
        ritualViewWidth = Math.max(window.innerWidth - size.play, window.innerWidth * 0.25);
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

    //console.log("width: " + ritualViewWidth);
    Object.keys(canvases).forEach(function (name) {
      var canvas = canvases[name];
      canvas.width = canvas.height = size.play;
    });
    paintBackground();
    paintRitualBackground();
  }

  function shapeTap(event) {
    var offsetLeft = containers.canvas.offsetLeft,
        offsetTop = containers.canvas.offsetTop,
        xTap = event.center.x - offsetLeft,
        yTap = event.center.y - offsetTop,
        rr = Math.pow(size.radius, 2),
        i, shape, x, y, dd,
        ddClosest = null, shapeClosest = null;
    for (i = 0; i < shapes.length; ++i) {
      shape = shapes[i];
      x = shape.origin.x * size.play;
      y = shape.origin.y * size.play;
      dd = Math.pow(xTap - x, 2) + Math.pow(yTap - y, 2);
      //console.log(xTap, yTap, x, y, rr, dd);
      if (dd <= rr && (ddClosest === null || dd < ddClosest)) {
        ddClosest = dd;
        shapeClosest = shape;
      }
    }
    if (shapeClosest !== null) {
      shapeClosest.selected = true;
    }
  }

  function load() {
    iconPainters = [
      cheeseDraw, aquariusDraw, ariesDraw, cancerDraw, capDraw,
      gemDraw, leoDraw, libraDraw, piscesDraw, sagDraw, scorpioDraw,
      taurusDraw, virgoDraw
    ],
    // setup ritual
    containers.ritual = document.getElementById('ritualContainer');
    ritualCanvas = document.createElement('canvas');
    containers.ritual.appendChild(ritualCanvas);
    ritualContext = ritualCanvas.getContext('2d');

    containers.canvas = document.getElementById('gameContainer');
    [ 'background', 'shapes', 'touch' ].forEach(function (name) {
      var canvas = canvases[name] = document.createElement('canvas');
      containers.canvas.appendChild(canvas);
      contexts[name] = canvas.getContext('2d');
    });

    // It's hammer time -- break it down -- um-buh-buh-umm-buh-buh.
    hammertime = new Hammer(canvases.touch);
    hammertime.on('tap', shapeTap);

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

var GameMenu = (function () {
    var canvas,
    context,
    ritualCanvas,
    ritualContext,
    launchedGame = false;

  function load() {
    // setup menu 
    gameContainer = document.getElementById('gameContainer');
    canvas = document.createElement('canvas');
    gameContainer.appendChild(canvas);
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
        console.log(xPos + "," + yPos);
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
    context.fillStyle = 'white';
    context.fillText("PLAY",window.innerWidth/2 - 50,window.innerHeight/2);
    
    context.font = "62px Arial";
    context.fillStyle = 'white';
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
