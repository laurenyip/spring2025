import { Mat4 } from "./math.js";
import { Parser } from "./parser.js";
import { Scene } from "./scene.js";
import { Renderer } from "./renderer.js";
import { TriangleMesh } from "./trianglemesh.js";
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement createCube, createSphere, computeTransformation, and shaders
////////////////////////////////////////////////////////////////////////////////

// Example two triangle quad
const quad = {
  positions: [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, -1, 1, -1],
  normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  uvCoords: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
};

TriangleMesh.prototype.createCube = function () {
  this.positions = [
    -1,
    -1,
    -1, //back
    1,
    -1,
    -1,
    1,
    1,
    -1,
    -1,
    -1,
    -1,
    1,
    1,
    -1,
    -1,
    1,
    -1,

    -1,
    1,
    -1, //top
    1,
    1,
    1,
    1,
    1,
    -1,
    -1,
    1,
    -1,
    -1,
    1,
    1,
    1,
    1,
    1,

    1,
    -1,
    1, //front
    -1,
    1,
    1,
    1,
    1,
    1,
    1,
    -1,
    1,
    -1,
    -1,
    1,
    -1,
    1,
    1,

    1,
    1,
    1, //right
    1,
    -1,
    -1,
    1,
    1,
    -1,
    1,
    1,
    1,
    1,
    -1,
    -1,
    1,
    -1,
    1,

    -1,
    1,
    1, //left
    -1,
    1,
    -1,
    -1,
    -1,
    -1,
    -1,
    1,
    1,
    -1,
    -1,
    -1,
    -1,
    -1,
    1,

    -1,
    -1,
    -1, //bottom
    1,
    -1,
    1,
    -1,
    -1,
    1,
    -1,
    -1,
    -1,
    1,
    -1,
    -1,
    1,
    -1,
    1,
  ];

  this.normals = [
    0,
    0,
    -1, //back
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,

    0,
    1,
    0, //top
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,

    0,
    0,
    1, //front
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,

    1,
    0,
    0, //right
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,

    -1,
    0,
    0, //left
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,

    0,
    -1,
    0, //bottom
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
    0,
    -1,
    0,
  ];

  this.uvCoords = [
    0.5,
    0, //back
    1,
    0,
    1,
    1 / 3,

    0.5,
    0,
    1,
    1 / 3,
    0.5,
    1 / 3,

    0,
    1 / 3, //top
    0.5,
    0,
    0.5,
    1 / 3,

    0,
    1 / 3,
    0,
    0,
    0.5,
    0,

    0.5,
    2 / 3, //front
    0,
    1,
    0.5,
    1,

    0.5,
    2 / 3,
    0,
    2 / 3,
    0,
    1,

    0,
    2 / 3, //right
    0.5,
    1 / 3,
    0.5,
    2 / 3,

    0,
    2 / 3,
    0.5,
    1 / 3,
    0,
    1 / 3,

    1,
    2 / 3, //left
    0.5,
    2 / 3,
    0.5,
    1 / 3,

    1,
    2 / 3,
    0.5,
    1 / 3,
    1,
    1 / 3,

    0.5,
    1, //bottom
    1,
    2 / 3,
    1,
    1,

    0.5,
    1,
    0.5,
    2 / 3,
    1,
    2 / 3,
  ];
};

TriangleMesh.prototype.createSphere = function (stackCount, sectorCount) {
  const radius = 1;
  this.positions = [];
  this.normals = [];
  this.uvCoords = [];
  this.indices = [];

  for (let i = 0; i <= stackCount; i++) {
    const stackAngle = Math.PI / 2 - i * (Math.PI / stackCount);

    for (let j = 0; j <= sectorCount; j++) {
      const sectorAngle = (2 * Math.PI * j) / sectorCount;

      const x = Math.cos(stackAngle) * Math.cos(sectorAngle);
      const y = Math.cos(stackAngle) * Math.sin(sectorAngle);
      const z = Math.sin(stackAngle);

      this.positions.push(x * radius, y * radius, z * radius);
      this.normals.push(x, y, z);

      // Modified UV calculation to show correct area and orientation, shifted left
      const u = 1.0 - (j / sectorCount) + 0.25;  // Added 0.25 offset to shift left
      const v = 1.0 - i / stackCount;
      this.uvCoords.push(u, v);
    }
  }

  for (let i = 0; i < stackCount; i++) {
    let k1 = i * (sectorCount + 1);
    let k2 = k1 + sectorCount + 1;

    for (let j = 0; j < sectorCount; j++, k1++, k2++) {
      if (i !== 0) {
        this.indices.push(k1, k2, k1 + 1);
      }
      if (i !== stackCount - 1) {
        this.indices.push(k1 + 1, k2, k2 + 1);
      }
    }
  }
};

Scene.prototype.computeTransformation = function (transformSequence) {
  let overallTransform = Mat4.create();

  for (let i = transformSequence.length - 1; i >= 0; i--) {
    const transform = transformSequence[i];
    const matrix = Mat4.create();

    switch (transform[0]) {
      case "T":
        matrix[12] = transform[1];
        matrix[13] = transform[2];
        matrix[14] = transform[3];
        break;
      case "S":
        matrix[0] = transform[1];
        matrix[5] = transform[2];
        matrix[10] = transform[3];
        break;
      case "Rx":
      case "Ry":
      case "Rz": {
        const angle = (transform[1] * Math.PI) / 180;
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        if (transform[0] === "Rx") {
          matrix[5] = c;
          matrix[6] = -s;
          matrix[9] = s;
          matrix[10] = c;
        } else if (transform[0] === "Ry") {
          matrix[0] = c;
          matrix[2] = s;
          matrix[8] = -s;
          matrix[10] = c;
        } else {
          matrix[0] = c;
          matrix[1] = -s;
          matrix[4] = s;
          matrix[5] = c;
        }
        break;
      }
    }

    overallTransform = Mat4.multiply(
      overallTransform,
      overallTransform,
      matrix
    );
  }

  return overallTransform;
};

Renderer.prototype.VERTEX_SHADER = `
precision mediump float;
attribute vec3 position, normal;
attribute vec2 uvCoord;
uniform vec3 lightPosition;
uniform mat4 projectionMatrix, viewMatrix, modelMatrix;
uniform mat3 normalMatrix;
varying vec2 vTexCoord;
varying vec4 vectDistance;
varying vec3 fNormal;
varying vec4 pos;

void main() {
  fNormal = normalize(normalMatrix * normal);
  pos = viewMatrix * modelMatrix * vec4(position, 1.0);
  vectDistance = viewMatrix * vec4(lightPosition, 1.0) - pos;
  vTexCoord = uvCoord;
  gl_Position = projectionMatrix * pos;
}
`;

Renderer.prototype.FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 ka, kd, ks, lightIntensity;
uniform float shininess;
uniform sampler2D uTexture;
uniform bool hasTexture;
varying vec2 vTexCoord;
varying vec4 vectDistance;
varying vec3 fNormal;
varying vec4 pos;

void main() {
  vec3 L = normalize(vectDistance.xyz);
  vec3 V = normalize(-pos.xyz);
  vec3 H = normalize(L + V);
  float dist = length(vectDistance.xyz);
  float attenuation = 1.0 / (dist * dist);
  
  vec3 ambient = ka * lightIntensity;
  vec3 diffuse = kd * max(dot(fNormal, L), 0.0) * lightIntensity * attenuation;
  vec3 specular = ks * pow(max(dot(fNormal, H), 0.0), shininess) * lightIntensity * attenuation;
  
  vec3 color = ambient + diffuse + specular;
  
  if (hasTexture) {
    gl_FragColor = vec4(color, 1.0) * texture2D(uTexture, vTexCoord);
  } else {
    gl_FragColor = vec4(color, 1.0);
  }
}
`;

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
  "c,myCamera,perspective,5,5,5,0,0,0,0,1,0;",
  "l,myLight,point,0,5,0,2,2,2;",
  "p,unitCube,cube;",
  "p,unitSphere,sphere,20,20;",
  "m,redDiceMat,0.3,0,0,0.7,0,0,1,1,1,15,dice.jpg;",
  "m,grnDiceMat,0,0.3,0,0,0.7,0,1,1,1,15,dice.jpg;",
  "m,bluDiceMat,0,0,0.3,0,0,0.7,1,1,1,15,dice.jpg;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,rd,unitCube,redDiceMat;",
  "o,gd,unitCube,grnDiceMat;",
  "o,bd,unitCube,bluDiceMat;",
  "o,gl,unitSphere,globeMat;",
  "X,rd,Rz,75;X,rd,Rx,90;X,rd,S,0.5,0.5,0.5;X,rd,T,-1,0,2;",
  "X,gd,Ry,45;X,gd,S,0.5,0.5,0.5;X,gd,T,2,0,2;",
  "X,bd,S,0.5,0.5,0.5;X,bd,Rx,90;X,bd,T,2,0,-1;",
  "X,gl,S,1.5,1.5,1.5;X,gl,Rx,90;X,gl,Ry,-150;X,gl,T,0,1.5,0;",
].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Parser, Scene, Renderer, DEF_INPUT };
