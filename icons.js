/*
  steps
  :%s/context/context/g
  remove draw var and function
  add setContext function
  remove translate,rotate and scale
  set fillstyle to shape.fillcolor
  set strokeStyle to shape.fillcolor
  */

function setContext(shape,size,context,iconMaxX,iconMaxY)
{
    context.translate(shape.origin.x -iconMaxX/2 * shape.scale,shape.origin.y -iconMaxY/2*shape.scale);
    context.rotate(shape.rotate);
    context.scale(shape.scale * size.play, shape.scale * size.play);
}
