import * as THREE from "three";
import { STLLoader } from "./vendor/three/STLLoader.js";
import { mergeGeometries } from "./vendor/three/BufferGeometryUtils.js";

const rpy = (values) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(...values, "ZYX"));
export class RobotModel {
  constructor(spec) {
    this.spec = spec;
    this.root = new THREE.Group();
    this.links = new Map(
      spec.links.map((link) => [link.name, new THREE.Group()]),
    );
    this.joints = new Map();
    this.values = {};
    this.resources = new Set();
    for (const link of spec.links) this.links.get(link.name).name = link.name;
    for (const joint of spec.joints) {
      const origin = new THREE.Group();
      origin.position.fromArray(joint.xyz);
      origin.quaternion.copy(rpy(joint.rpy));
      const motion = new THREE.Group();
      origin.add(motion);
      motion.add(this.links.get(joint.child));
      this.links.get(joint.parent).add(origin);
      this.joints.set(joint.name, {
        ...joint,
        motion,
        axisVector: new THREE.Vector3(...joint.axis).normalize(),
      });
    }
    for (const name of spec.roots) this.root.add(this.links.get(name));
    this.setValues(spec.initialJoints);
  }
  setValues(values) {
    for (const [name, value] of Object.entries(values)) {
      const joint = this.joints.get(name);
      if (!joint || joint.mimic || !Number.isFinite(value)) continue;
      const bounded = joint.limit
        ? THREE.MathUtils.clamp(
            value,
            joint.limit.lower ?? -Infinity,
            joint.limit.upper ?? Infinity,
          )
        : value;
      this.values[name] = bounded;
      this.applyJoint(joint, bounded);
    }
    for (const joint of this.joints.values()) {
      if (joint.mimic)
        this.applyJoint(
          joint,
          (this.values[joint.mimic.joint] ?? 0) * joint.mimic.multiplier +
            joint.mimic.offset,
        );
    }
    this.root.updateMatrixWorld(true);
  }
  applyJoint(joint, value) {
    if (joint.type === "prismatic")
      joint.motion.position.copy(joint.axisVector).multiplyScalar(value);
    if (joint.type === "revolute" || joint.type === "continuous")
      joint.motion.quaternion.setFromAxisAngle(joint.axisVector, value);
  }
  endEffector() {
    return this.links
      .get("end_effector_link")
      .getWorldPosition(new THREE.Vector3());
  }
  async loadVisuals(base, onProgress) {
    const loader = new STLLoader();
    const textures = new THREE.TextureLoader();
    const geometries = new Map();
    const maps = new Map();
    let completed = 0;
    const files = Object.keys(this.spec.assets);
    await Promise.all(
      files.map(async (file) => {
        if (/\.stl$/i.test(file)) {
          const geometry = await loader.loadAsync(base + file);
          geometry.computeVertexNormals();
          geometries.set(file, geometry);
        } else {
          const texture = await textures.loadAsync(base + file);
          texture.colorSpace = THREE.SRGBColorSpace;
          maps.set(file, texture);
          this.resources.add(texture);
        }
        onProgress(++completed, files.length);
      }),
    );
    const materials = new Map();
    for (const link of this.spec.links) {
      const batches = new Map();
      for (const visual of link.visuals) {
        const shape = visual.geometry;
        let geo;
        if (shape.type === "mesh") {
          geo = geometries.get(shape.file).clone();
          geo.scale(...shape.scale);
        } else if (shape.type === "box")
          geo = new THREE.BoxGeometry(...shape.size);
        else if (shape.type === "sphere")
          geo = new THREE.SphereGeometry(shape.radius, 16, 12);
        else if (shape.type === "cylinder") {
          geo = new THREE.CylinderGeometry(
            shape.radius,
            shape.radius,
            shape.length,
            24,
          );
          geo.rotateX(Math.PI / 2);
        } else continue;
        geo.applyMatrix4(
          new THREE.Matrix4().compose(
            new THREE.Vector3(...visual.xyz),
            rpy(visual.rpy),
            new THREE.Vector3(1, 1, 1),
          ),
        );
        if (!geo.attributes.uv)
          geo.setAttribute(
            "uv",
            new THREE.BufferAttribute(
              new Float32Array(geo.attributes.position.count * 2),
              2,
            ),
          );
        if (geo.index) {
          const old = geo;
          geo = geo.toNonIndexed();
          old.dispose();
        }
        // STL and primitives have different optional attributes. Keep a common schema before merging.
        for (const key of Object.keys(geo.attributes))
          if (!["position", "normal", "uv"].includes(key))
            geo.deleteAttribute(key);
        const key = JSON.stringify(visual.material);
        if (!materials.has(key)) {
          const rgba = visual.material.rgba;
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setRGB(
              rgba[0],
              rgba[1],
              rgba[2],
              THREE.SRGBColorSpace,
            ),
            roughness: 0.66,
            metalness: 0.14,
            transparent: rgba[3] < 1,
            opacity: rgba[3],
            map: maps.get(visual.material.texture) || null,
          });
          materials.set(key, mat);
          this.resources.add(mat);
        }
        if (!batches.has(key)) batches.set(key, []);
        batches.get(key).push(geo);
      }
      for (const [key, batch] of batches) {
        const merged = mergeGeometries(batch, false);
        if (!merged)
          throw new Error("로봇 형상을 합칠 수 없습니다: " + link.name);
        batch.forEach((geo) => geo.dispose());
        const mesh = new THREE.Mesh(merged, materials.get(key));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.links.get(link.name).add(mesh);
        this.resources.add(merged);
      }
    }
    geometries.forEach((geo) => geo.dispose());
  }
  dispose() {
    for (const item of this.resources) item.dispose();
  }
}
