import * as THREE from "three";
import Polygon from "./polygon";
import Vertex from "./vertex";
import Node from "./node";

export default class ThreeBSP {
  Polygon;
  Vertex;
  Node;
  matrix;
  tree;

  constructor(geometry) {
    // Convert THREE.Geometry to ThreeBSP
    var i,
      _length_i,
      face,
      vertex,
      faceVertexUvs,
      uvs,
      polygon,
      polygons = [],
      tree;

    this.Polygon = Polygon;
    this.Vertex = Vertex;
    this.Node = Node;
    if (geometry instanceof THREE.Geometry) {
      this.matrix = new THREE.Matrix4();
    } else if (geometry instanceof THREE.Mesh) {
      // #todo: add hierarchy support
      geometry.updateMatrix();
      this.matrix = geometry.matrix.clone();
      geometry = geometry.geometry;
    } else if (geometry instanceof Node) {
      this.tree = geometry;
      this.matrix = new THREE.Matrix4();
      return this;
    } else {
      throw "ThreeBSP: Given geometry is unsupported";
    }

    for (i = 0, _length_i = geometry.faces.length; i < _length_i; i++) {
      face = geometry.faces[i];
      faceVertexUvs = geometry.faceVertexUvs[0][i];
      polygon = new Polygon();

      if (face instanceof THREE.Face3) {
        vertex = geometry.vertices[face.a];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[0],
          uvs
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.b];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[1],
          uvs
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.c];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[2],
          uvs
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);
      } else if (typeof THREE.Face4) {
        vertex = geometry.vertices[face.a];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[0],
          uvs
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.b];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[1],
          uvs
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.c];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[2],
          uvs
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.d];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[3].x, faceVertexUvs[3].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[3],
          uvs
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);
      } else {
        throw "Invalid face type at index " + i;
      }

      polygon.calculateProperties();
      polygons.push(polygon);
    }

    this.tree = new Node(polygons);
  }

  subtract(other_tree) {
    var a = this.tree.clone(),
      b = other_tree.tree.clone();

    a.invert();
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a.invert();
    a = new ThreeBSP(a);
    a.matrix = this.matrix;
    return a;
  }

  union(other_tree) {
    var a = this.tree.clone(),
      b = other_tree.tree.clone();

    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a = new ThreeBSP(a);
    a.matrix = this.matrix;
    return a;
  }

  intersect(other_tree) {
    var a = this.tree.clone(),
      b = other_tree.tree.clone();

    a.invert();
    b.clipTo(a);
    b.invert();
    a.clipTo(b);
    b.clipTo(a);
    a.build(b.allPolygons());
    a.invert();
    a = new ThreeBSP(a);
    a.matrix = this.matrix;
    return a;
  }

  toGeometry() {
    var i,
      j,
      matrix = new THREE.Matrix4().getInverse(this.matrix),
      geometry = new THREE.Geometry(),
      polygons = this.tree.allPolygons(),
      polygon_count = polygons.length,
      polygon,
      polygon_vertice_count,
      vertice_dict = {},
      vertex_idx_a,
      vertex_idx_b,
      vertex_idx_c,
      vertex,
      face,
      verticeUvs;

    for (i = 0; i < polygon_count; i++) {
      polygon = polygons[i];
      polygon_vertice_count = polygon.vertices.length;

      for (j = 2; j < polygon_vertice_count; j++) {
        verticeUvs = [];

        vertex = polygon.vertices[0];
        verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
        vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        vertex.applyMatrix4(matrix);

        if (
          typeof vertice_dict[vertex.x + "," + vertex.y + "," + vertex.z] !==
          "undefined"
        ) {
          vertex_idx_a =
            vertice_dict[vertex.x + "," + vertex.y + "," + vertex.z];
        } else {
          geometry.vertices.push(vertex);
          vertex_idx_a = vertice_dict[
            vertex.x + "," + vertex.y + "," + vertex.z
          ] =
            geometry.vertices.length - 1;
        }

        vertex = polygon.vertices[j - 1];
        verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
        vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        vertex.applyMatrix4(matrix);
        if (
          typeof vertice_dict[vertex.x + "," + vertex.y + "," + vertex.z] !==
          "undefined"
        ) {
          vertex_idx_b =
            vertice_dict[vertex.x + "," + vertex.y + "," + vertex.z];
        } else {
          geometry.vertices.push(vertex);
          vertex_idx_b = vertice_dict[
            vertex.x + "," + vertex.y + "," + vertex.z
          ] =
            geometry.vertices.length - 1;
        }

        vertex = polygon.vertices[j];
        verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
        vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        vertex.applyMatrix4(matrix);
        if (
          typeof vertice_dict[vertex.x + "," + vertex.y + "," + vertex.z] !==
          "undefined"
        ) {
          vertex_idx_c =
            vertice_dict[vertex.x + "," + vertex.y + "," + vertex.z];
        } else {
          geometry.vertices.push(vertex);
          vertex_idx_c = vertice_dict[
            vertex.x + "," + vertex.y + "," + vertex.z
          ] =
            geometry.vertices.length - 1;
        }

        face = new THREE.Face3(
          vertex_idx_a,
          vertex_idx_b,
          vertex_idx_c,
          new THREE.Vector3(
            polygon.normal.x,
            polygon.normal.y,
            polygon.normal.z
          )
        );

        geometry.faces.push(face);
        geometry.faceVertexUvs[0].push(verticeUvs);
      }
    }
    return geometry;
  }

  toMesh(material) {
    var geometry = this.toGeometry(),
      mesh = new THREE.Mesh(geometry, material);

    mesh.position.setFromMatrixPosition(this.matrix);
    mesh.rotation.setFromRotationMatrix(this.matrix);

    return mesh;
  }
}

