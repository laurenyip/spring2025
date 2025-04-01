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
    // front 
    1, -1, 1,    -1, -1, 1,    -1, 1, 1,
    1, -1, 1,    -1, 1, 1,     1, 1, 1,
    // right
    1, -1, -1,   1, -1, 1,     1, 1, 1,  
    1, -1, -1,   1, 1, 1,      1, 1, -1,  
    // top
    1, 1, 1,     -1, 1, 1,     -1, 1, -1,
    1, 1, 1,     -1, 1, -1,    1, 1, -1,    
    // bottom
    1, -1, -1,   -1, -1, -1,   -1, -1, 1, 
    1, -1, -1,   -1, -1, 1,    1, -1, 1, 
    // left
    -1, -1, 1,   -1, -1, -1,   -1, 1, -1, 
    -1, -1, 1,   -1, 1, -1,    -1, 1, 1,
    // back
    -1, -1, -1,   1, -1, -1,   1, 1, -1,  
    -1, -1, -1,   1, 1, -1,    -1, 1, -1, 
  ];
  
  this.normals = [
    // front
    0,0,1,  0,0,1,  0,0,1,  0,0,1,  0,0,1,  0,0,1,
    // right
    1,0,0,  1,0,0,  1,0,0,  1,0,0,  1,0,0,  1,0,0,
    // top
    0,1,0,  0,1,0,  0,1,0,  0,1,0,  0,1,0,  0,1,0,
    // bottom
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
    // left
    -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0,
    // back
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
  ];

  this.uvCoords = [
    // front
    1/2, 2/3,   0, 2/3,     0, 1, 
    1/2, 2/3,   0, 1,       1/2, 1,
    // right
    1/2, 1/3,   0, 1/3,     0, 2/3, 
    1/2, 1/3,   0, 2/3,     1/2, 2/3,
    // top
    1/2, 0,     0, 0,       0, 1/3,
    1/2, 0,     0, 1/3,     1/2, 1/3,
    // bottom
    1, 2/3,     1/2, 2/3,   1/2, 1, 
    1, 2/3,     1/2, 1,     1, 1,
    // left
    1, 1/3,     1/2, 1/3,   1/2, 2/3,
    1, 1/3,     1/2, 2/3,   1, 2/3, 
    // back
    1/2, 0,     1/2, 1/3,   1, 1/3, 
    1/2, 0,     1, 1/3,     1, 0, 
  ];
}

TriangleMesh.prototype.createSphere = function(numStacks, numSectors) {

  this.positions = [];
  this.normals = [];
  this.uvCoords = [];
  this.indices = [];

  const radius = 1;
  
  // angle steps for spherical coordinates
  const sectorStep = 2 * Math.PI / numSectors;
  const stackStep = Math.PI / numStacks;

  // vertices, normals and UVs
  for (let i = 0; i <= numStacks; i++) {
    const stackAngle = Math.PI / 2 - i * stackStep;  // top pole
    
    for (let j = 0; j <= numSectors; j++) {
      const sectorAngle = j * sectorStep;
      
      // vertex position
      const x = radius * Math.cos(stackAngle) * Math.cos(sectorAngle);
      const y = radius * Math.cos(stackAngle) * Math.sin(sectorAngle);
      const z = radius * Math.sin(stackAngle);
      
      this.positions.push(x, y, z);
      
      //normal (same as position for unit sphere)
      this.normals.push(x, y, z);
      
      // correct UV coordinates for globe texture
      const u = 1- j / numSectors; //rotate!
      const v = i / numStacks;  
      this.uvCoords.push(u, v);
    }
  }

  // indices
  for (let i = 0; i < numStacks; i++) {
    let k1 = i * (numSectors + 1);
    let k2 = k1 + numSectors + 1;

    for (let j = 0; j < numSectors; j++, k1++, k2++) {
      if (i !== 0) {
        this.indices.push(k1, k2, k1 + 1);
      }
      if (i !== numStacks - 1) {
        this.indices.push(k1 + 1, k2, k2 + 1);
      }
    }
  }
};

Scene.prototype.computeTransformation = function(transformSequence) {
  // make an identity matrix to start
  let fullTransform = Mat4.create();

  // iterate through the transformation sequence 
  // computing T*Rx first then S*(T*Rx)
  for (let i = transformSequence.length - 1; i >= 0; --i) {
    let transform = transformSequence[i];
    let resultTransform = Mat4.create(); 
    let theta = (Math.PI / 180) * -transform[1];

    // determine the transformation type
    switch (transform[0]) {
      
      case "T": // translation
        Mat4.set(
          resultTransform,
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          transform[1], transform[2], transform[3], 1
        );
        break;

      case "S": // scale
        Mat4.set(
          resultTransform,
          transform[1], 0, 0, 0,
          0, transform[2], 0, 0,
          0, 0, transform[3], 0,
          0, 0, 0, 1
        );
        break;
        
      case "Rx": // rotation around x-axis
        Mat4.set(
          resultTransform,
          1, 0, 0, 0,
          0, Math.cos(theta), -Math.sin(theta), 0,
          0, Math.sin(theta), Math.cos(theta), 0,
          0, 0, 0, 1
        );
        break;

      case "Ry": // rotation around y-axis
        Mat4.set(
          resultTransform,
          Math.cos(theta), 0, Math.sin(theta), 0,
          0, 1, 0, 0,
          -Math.sin(theta), 0, Math.cos(theta), 0,
          0, 0, 0, 1
        );
        break;

      case "Rz": // rotation around z-axis
        Mat4.set(
          resultTransform,
          Math.cos(theta), -Math.sin(theta), 0, 0,
          Math.sin(theta), Math.cos(theta), 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        );
        break;
    }
    Mat4.multiply(fullTransform, fullTransform, resultTransform);
  }

  return fullTransform;
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
/*const DEF_INPUT = [
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
].join("\n");*/

const DEF_INPUT = [
  "c,myCamera,perspective,8,5,8,0,1,0,0,1,0;",
  "l,myLight,point,5,10,5,1.5,1.5,1.5;",
  "p,unitCube,cube;",
  "p,unitSphere,sphere,20,20;",
  "m,shellMat,0.2,0.15,0.1,0.5,0.4,0.3,0.3,0.3,0.3,10;",
  "m,bodyMat,0.1,0.2,0.1,0.3,0.5,0.3,0.5,0.5,0.5,30;",
  "m,headMat,0.8,0.7,0.1,0.9,0.8,0.2,0.8,0.8,0.8,50;",
  "m,waterMat,0.1,0.1,0.3,0.3,0.3,0.8,0.8,0.8,0.8,100;",
  "o,shell,unitSphere,shellMat;X,shell,S,1.5,0.8,1.5;",
  "o,body,unitSphere,bodyMat;X,body,S,1.2,0.6,1.2;X,body,T,0,-0.2,0;",
  "o,head,unitSphere,headMat;X,head,S,0.5,0.5,0.7;X,head,T,1.2,0.3,0;",
  "o,water,unitCube,waterMat;X,water,S,5,0.1,5;X,water,T,0,-0.9,0;",
  "X,shell,Ry,20;X,head,Ry,-30;",
  "m,redDiceMat,0.3,0,0,0.7,0,0,1,1,1,15,dice.jpg;",
  "m,grnDiceMat,0,0.3,0,0,0.7,0,1,1,1,15,dice.jpg;",
  "m,bluDiceMat,0,0,0.3,0,0,0.7,1,1,1,15,dice.jpg;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,rd,unitCube,redDiceMat;X,rd,Rz,75;X,rd,Rx,90;X,rd,S,0.5,0.5,0.5;X,rd,T,-1,0,2;",
  "o,gd,unitCube,grnDiceMat;X,gd,Ry,45;X,gd,S,0.5,0.5,0.5;X,gd,T,2,0,2;",
  "o,bd,unitCube,bluDiceMat;X,bd,S,0.5,0.5,0.5;X,bd,Rx,90;X,bd,T,2,0,-1;",
  "o,gl,unitSphere,globeMat;X,gl,S,1.5,1.5,1.5;X,gl,Rx,90;X,gl,Ry,-150;X,gl,T,0,1.5,0;"
  
].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Parser, Scene, Renderer, DEF_INPUT };
