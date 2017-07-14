const Tortuga = require('tortuga-js/lib/tortuga.min.js');

// Create a figure using poly
var turtle = new Tortuga('#tortuga-poly-figure');
function poly(angle, size) {
  for (var i = 0; i < 360; i += angle) {
    turtle.forward(size);
    turtle.right(angle);
  }
}
for (var i = 0; i <= 30; i++) {
  turtle.color(0, 15 + 8 * i, 255 - 8 * i);
  poly(27, 50);
  turtle.right(100);
}
turtle.drawPath();
