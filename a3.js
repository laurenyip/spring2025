import { Framebuffer } from "./framebuffer.js";
import { Rasterizer } from "./rasterizer.js";
// do not change anything above here

////////////////////////////////////////////////////////////////////////////////
// TODO: implement functions drawLine(v1, v2) and drawTriangle(v1, v2, v3) below.
////////////////////////////////////////////////////////////////////////////////

// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function (v1, v2) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  // TODO/hint: use this.setPixel(x, y, color) in this function to draw line
  // yayayayay let's draw lines
  let line = [];

  // first edge case: v1 == v2
  if (x1 == x2 && y1 == y2) {
    this.setPixel(x1, y1, [r1, g1, b1]);
    return;
  }

  // second edge case: vertical lines - dividing by inf
  if (x1 == x2) {
    let tail = v2;
    let head = v1;

    if (y1 > y2) {
      tail = v1;
      head = v2;
    }

    let min = Math.min(y1, y2);
    let max = Math.max(y1, y2);

    for (let i = min; i <= max; i++) {
      let t =
        (i - head[1]) /
        Math.sqrt(
          Math.pow(tail[0] - head[0], 2) + Math.pow(tail[1] - head[1], 2)
        );

      let end_colour = tail;
      let start_colour = head;

      let cpR = (1 - t) * start_colour[2][0] + t * end_colour[2][0];
      let cpG = (1 - t) * start_colour[2][1] + t * end_colour[2][1];
      let cpB = (1 - t) * start_colour[2][2] + t * end_colour[2][2];

      this.setPixel(x1, i, [cpR, cpG, cpB]);
      line[i - min] = [x1, i];
    }
    return line;
  }

  // slope

  let m = (y2 - y1) / (x2 - x1);
  let tail = Math.max(x1, x2);
  let head = Math.min(x1, x2);
  let oppTail = y2;
  let oppHead = y1;
  let switched = false;

  // if it's going down
  if (x1 > x2) {
    oppTail = y1;
    oppHead = y2;
    switched = true;
  }
  let steepSlope = false;

  // inverting x and y - steep slope
  if (m < -1 || m > 1) {
    tail = Math.max(y1, y2); // higher end
    head = Math.min(y1, y2); // lower end
    oppTail = x2;
    oppHead = x1;
    switched = false;

    if (y1 > y2) {
      oppTail = x1;
      oppHead = x2;
      switched = true;
    }

    m = (x2 - x1) / (y2 - y1);
    steepSlope = true;
  }

  let start_colour = v1;
  let end_colour = v2;

  if (switched) {
    start_colour = v2;
    end_colour = v1;
  }

  let moving = oppHead;

  for (let i = head; i <= tail; i++) {
    let t =
      Math.sqrt(Math.pow(i - head, 2) + Math.pow(moving - oppHead, 2)) /
      Math.sqrt(Math.pow(tail - head, 2) + Math.pow(oppTail - oppHead, 2));

    let cpR = (1 - t) * start_colour[2][0] + t * end_colour[2][0];
    let cpG = (1 - t) * start_colour[2][1] + t * end_colour[2][1];
    let cpB = (1 - t) * start_colour[2][2] + t * end_colour[2][2];

    if (!steepSlope) {
      this.setPixel(i, Math.round(moving), [cpR, cpG, cpB]);
      line[i - head] = [i, Math.round(moving)];
    } else {
      this.setPixel(Math.round(moving), i, [cpR, cpG, cpB]);
      line[i - head] = [Math.round(moving), i];
    }

    moving += m;
  }

  return line;
};

// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function (v1, v2, v3) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  const [x3, y3, [r3, g3, b3]] = v3;
  // TODO/hint: use this.setPixel(x, y, color) in this function to draw triangle
  // edge case 1: first establish potential top edge and left edges
  let order_Y = order(v1, v2, v3, 1); // 1 -> y coordinates
  const ccw_order = [];
  // start the ccw ordering from the highest coordinate
  ccw_order[0] = order_Y[0];
  let topEdgeExists = false;
  let topEdge = [];
  let left_edge = [];
  if (order_Y[0][1] == order_Y[1][1]) {
    // horizontal line
    topEdgeExists = true;
    topEdge = [order_Y[0], order_Y[1]];

    // for left edge: order it from left to right
    if (order_Y[1][0] < order_Y[2][0]) {
      // order_Y[1] is on the left
      ccw_order[1] = order_Y[1];
      ccw_order[2] = order_Y[2];
    } else {
      ccw_order[1] = order_Y[2];
      ccw_order[2] = order_Y[1];
    }
  } else {
    // oh no there isn't a horizontal line
    if (order_Y[1][0] < order_Y[2][0]) {
      ccw_order[1] = order_Y[1];
      ccw_order[2] = order_Y[2];
    } else {
      ccw_order[1] = order_Y[2];
      ccw_order[2] = order_Y[1];
    }
  }
  // edges are in ccw order now - check for each line if the end point is strictly lower than the start
  for (let j = 0; j < 3; j++) {
    // all 3 lines in order - looping
    left_edge[j] = false;
    if (ccw_order[j % 3][1] < ccw_order[(j + 1) % 3][1]) {
      left_edge[j] = true;
    }
  }
  // draw triangle edges using drawLine
  // ordering lines to be ccw
  const line1 = this.drawLine(ccw_order[0], ccw_order[1]);
  const line2 = this.drawLine(ccw_order[1], ccw_order[2]);
  const line3 = this.drawLine(ccw_order[2], ccw_order[0]);
  const lines = [line1, line2, line3];

  // make a rectangle around the triangle to look for inside points
  let xMin = Math.min(ccw_order[0][0], ccw_order[1][0], ccw_order[2][0]);
  let xMax = Math.max(ccw_order[0][0], ccw_order[1][0], ccw_order[2][0]);
  let yMin = Math.min(ccw_order[0][1], ccw_order[1][1], ccw_order[2][1]);
  let yMax = Math.max(ccw_order[0][1], ccw_order[1][1], ccw_order[2][1]);

  let check_point_inside = false;
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      // make sure the point is in the triangle
      let p = [i, j];
      check_point_inside = pointIsInsideTriangle(
        v1,
        v2,
        v3,
        p,
        lines,
        ccw_order,
        topEdgeExists,
        topEdge,
        left_edge
      );

      // if it's inside, fill it w the avg colour
      if (check_point_inside) {
        let c = this.barycentric_coordinate(p, v1, v2, v3);
        this.setPixel(i, j, [c[0], c[1], c[2]]);
      }
    }
  }
};

// helper functions

// a simple swap function for arrays
function swap(array, a, b) {
  let temp = array[a];
  array[a] = array[b];
  array[b] = temp;
  return array;
}

// ordering vertices from largest to smallest
function order(a, b, c, coord) {
  let array = [a, b, c];
  if (array[0][coord] > array[1][coord]) {
    array = swap(array, 0, 1);
  }
  if (array[0][coord] > array[2][coord]) {
    array = swap(array, 0, 2);
  }
  if (array[1][coord] > array[2][coord]) {
    array = swap(array, 1, 2);
  }
  return array;
}

function pointIsInsideTriangle(
  v1,
  v2,
  v3,
  p,
  lines,
  ccw_order,
  topEdgeExists,
  topEdge,
  left_edge
) {
  // check if point is inside each of the 3 lines
  let check = 0; // counting to make sure a point passed the half plane test for all 3 planes
  for (let i = 0; i < 3; i++) {
    let x0 = ccw_order[i % 3][0];
    let x1 = ccw_order[(i + 1) % 3][0];
    let y0 = ccw_order[i % 3][1];
    let y1 = ccw_order[(i + 1) % 3][1];

    // coefficients
    let a = y1 - y0;
    let b = x0 - x1;
    let c = x1 * y0 - x0 * y1;
    let f = a * p[0] + b * p[1] + c;

    if (f > 0) {
      check++;
    } else if (f == 0) {
      // ddge case: on the edge lines
      if (topEdgeExists) {
        if (
          p[1] == topEdge[0][1] &&
          p[0] <= Math.max(topEdge[0][0], topEdge[1][0]) &&
          p[1] >= Math.min(topEdge[0][0], topEdge[1][0])
        ) {
          return true;
        }
      }

      // check if the line is a LEFT EDGE
      if (left_edge[i]) {
        for (let j = 0; j < lines[i].length; j++) {
          if (p[0] == lines[i][j][0] && p[1] == lines[i][j][1]) {
            return true;
          }
        }
      }
      return true;
    }
  }

  if (check == 3) {
    return true;
  } else {
    return false;
  }
}

// calculates the weighted average of the colours of the triangle's vertices
Rasterizer.prototype.barycentric_coordinate = function (p, v1, v2, v3) {
  let colour = [];

  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  const [x3, y3, [r3, g3, b3]] = v3;
  const vArray = [v1, v2, v3];

  // area of triangle = half the area of parallelogram
  // reference : https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/barycentric-coordinates.html
  let a = [];

  a[0] = Math.abs(
    (v2[0] - p[0]) * (v3[1] - p[1]) - (v2[1] - p[1]) * (v3[0] - p[0])
  );

  a[1] = Math.abs(
    (v3[0] - p[0]) * (v1[1] - p[1]) - (v3[1] - p[1]) * (v1[0] - p[0])
  );

  a[2] = Math.abs(
    (v1[0] - p[0]) * (v2[1] - p[1]) - (v1[1] - p[1]) * (v2[0] - p[0])
  );

  let A = a[0] + a[1] + a[2];
  let u = a[0] / A;
  let v = a[1] / A;
  let w = a[2] / A;

  // u + v + w = 1;
  colour[0] = u * v1[2][0] + v * v2[2][0] + w * v3[2][0];
  colour[1] = u * v1[2][1] + v * v2[2][1] + w * v3[2][1];
  colour[2] = u * v1[2][2] + v * v2[2][2] + w * v3[2][2];

  return colour;
};

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change def_input to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
  // turtleduck drawing
  // water background
  "v,0,45,0.5,0.8,1.0;",
  "v,63,45,0.5,0.8,1.0;",
  "v,0,63,0.4,0.7,0.9;",
  "v,63,63,0.4,0.7,0.9;",
  "t,0,1,2;",
  "t,1,2,3;",

  // turtle shell (dark green)
  "v,20,20,0.2,0.4,0.1;",
  "v,45,20,0.2,0.4,0.1;",
  "v,15,40,0.2,0.4,0.1;",
  "v,50,40,0.2,0.4,0.1;",
  "t,4,5,6;",
  "t,5,6,7;",

  // shell pattern (lighter green)
  "v,25,25,0.3,0.5,0.2;",
  "v,40,25,0.3,0.5,0.2;",
  "v,20,35,0.3,0.5,0.2;",
  "v,45,35,0.3,0.5,0.2;",
  "t,8,9,10;",
  "t,9,10,11;",

  // duck head (yellow)
  "v,45,15,0.9,0.8,0.2;",
  "v,55,15,0.9,0.8,0.2;",
  "v,45,25,0.9,0.8,0.2;",
  "v,55,25,0.9,0.8,0.2;",
  "t,12,13,14;",
  "t,13,14,15;",

  // beak (orange)
  "v,55,18,0.9,0.5,0.1;",
  "v,60,18,0.9,0.5,0.1;",
  "v,57,22,0.9,0.5,0.1;",
  "t,16,17,18;",

  // eye (black)
  "v,52,17,0.0,0.0,0.0;",
  "v,54,17,0.0,0.0,0.0;",
  "v,53,19,0.0,0.0,0.0;",
  "t,19,20,21;",

  // front leg
  "v,35,40,0.2,0.4,0.1;",
  "v,40,40,0.2,0.4,0.1;",
  "v,37,45,0.2,0.4,0.1;",
  "t,22,23,24;",

  // back leg
  "v,25,40,0.2,0.4,0.1;",
  "v,30,40,0.2,0.4,0.1;",
  "v,27,45,0.2,0.4,0.1;",
  "t,25,26,27;",

  // water ripples (lines)
  "v,10,50,0.4,0.7,0.9;",
  "v,20,50,0.4,0.7,0.9;",
  "l,28,29;",

  "v,40,55,0.4,0.7,0.9;",
  "v,50,55,0.4,0.7,0.9;",
  "l,30,31;",

  "v,25,60,0.4,0.7,0.9;",
  "v,35,60,0.4,0.7,0.9;",
  "l,32,33;",
].join("\n");

// DO NOT CHANGE anything below here
export { Rasterizer, Framebuffer, DEF_INPUT };
