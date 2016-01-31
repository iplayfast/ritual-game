/*
  steps
  :%s/context/context/g
  remove draw var and function
  add setContext function
  remove translate,rotate and scale
  set fillstyle to shape.fillcolor
  set strokeStyle to shape.fillcolor
  */

function setContext(shape, size, context, iconMaxX, iconMaxY) {
    var cornerRadius = Math.sqrt(2) * size.radius,
        pi = Math.PI,
        rotate = shape.rotate,
        x0 = shape.origin.x * size.play - cornerRadius,
        y0 = shape.origin.y * size.play - cornerRadius,
        x1 = x0 + cornerRadius,
        y1 = y0 + cornerRadius,
        x2 = x1 + cornerRadius * Math.cos(3 * pi / 4 - rotate);
        y2 = y1 - cornerRadius * Math.sin(3 * pi / 4 - rotate);
    context.translate(
        //shape.origin.x - iconMaxX/2 * shape.scale,
        //shape.origin.y -iconMaxY/2*shape.scale
        //shape.origin.x * size.play,
        //shape.origin.y * size.play
        x2,
        y2
    );
    context.strokeStyle = '#888';
    context.lineWidth = 3;
    context.rotate(rotate);
    context.strokeRect(0, 0, 2 * size.radius, 2 * size.radius);
    context.scale(shape.scale * size.play, shape.scale * size.play);
}
