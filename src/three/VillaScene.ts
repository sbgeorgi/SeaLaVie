/* Sea La Vie — architectural model built with Three.js WebGPURenderer + TSL.
 * Four stages driven by uniforms: lines → massing → detail → finished, then a sectional cutaway. */
import * as THREE from "three/webgpu";
import {
  uniform,
  color,
  mix,
  positionWorld,
  positionLocal,
  smoothstep,
  step,
  vec3,
  float,
  time,
  sin,
  mx_noise_float,
  length,
} from "three/tsl";

/* eslint-disable @typescript-eslint/no-explicit-any */
type N = any;

export type Room = { id: string; label: string; sub: string; x0: number; x1: number; z0: number; z1: number; tone: string };
export type LabelScreen = { id: string; x: number; y: number; o: number };

const CLAY = "#e9e3d7";
const FOREST = "#1d2b23";
const STUCCO = "#f5f1ea";
const ROOF = "#9b5d43";
const GLASS = "#355a58";
const TIMBER = "#7a4b2e";
const STONE = "#d9cdb8";

export const W = 22;
export const D = 12;
export const FH = 3.3; // floor height
const LOGGIA = 2.2;
const UNIT = 1; // second floor (index 1)

export const ROOMS: Room[] = [
  { id: "suite1", label: "Suite I", sub: "King · en-suite · balcony", x0: -11, x1: -4.5, z0: 1.6, z1: 6, tone: "#bcd3cc" },
  { id: "bath1", label: "Bath I", sub: "", x0: -11, x1: -7.5, z0: -1.2, z1: 1.6, tone: "#efe8dc" },
  { id: "laundry", label: "Laundry", sub: "washer · dryer", x0: -7.5, x1: -4.5, z0: -1.2, z1: 1.6, tone: "#e6e0d3" },
  { id: "entry", label: "Entry & Workspace", sub: "private entrance", x0: -11, x1: -4.5, z0: -6, z1: -1.2, tone: "#dcd6c5" },
  { id: "living", label: "Living", sub: "ocean-facing", x0: -4.5, x1: 0.5, z0: 0, z1: 6, tone: "#c9d1bd" },
  { id: "dining", label: "Dining", sub: "seats six", x0: 0.5, x1: 4.5, z0: 0, z1: 6, tone: "#d3d8c6" },
  { id: "kitchen", label: "Kitchen", sub: "full · gas range · island", x0: -4.5, x1: 4.5, z0: -6, z1: 0, tone: "#e3dccb" },
  { id: "suite2", label: "Suite II", sub: "King · kitchenette", x0: 4.5, x1: 11, z0: 1.6, z1: 6, tone: "#bcd3cc" },
  { id: "bath2", label: "Bath II", sub: "", x0: 4.5, x1: 7.75, z0: -1.2, z1: 1.6, tone: "#efe8dc" },
  { id: "bath3", label: "Bath III", sub: "", x0: 7.75, x1: 11, z0: -1.2, z1: 1.6, tone: "#efe8dc" },
  { id: "suite3", label: "Suite III", sub: "Queen · kitchenette", x0: 4.5, x1: 11, z0: -6, z1: -1.2, tone: "#bcd3cc" },
  { id: "patio", label: "Sunset Patio", sub: "arched loggia · ocean", x0: -11, x1: 11, z0: 6, z1: 6 + LOGGIA, tone: "#e9dfcf" },
];

type Pose = { az: number; el: number; r: number; tx: number; ty: number; tz: number };
const POSES: { p: number; pose: Pose }[] = [
  { p: 0.04, pose: { az: 0.95, el: 0.62, r: 80, tx: 0, ty: 5, tz: 2 } },
  { p: 0.26, pose: { az: 0.62, el: 0.42, r: 74, tx: 0, ty: 5, tz: 3 } },
  { p: 0.45, pose: { az: 0.28, el: 0.34, r: 66, tx: 0, ty: 5, tz: 4 } },
  { p: 0.64, pose: { az: -0.42, el: 0.27, r: 68, tx: 0, ty: 5.5, tz: 4 } },
  { p: 0.9, pose: { az: -0.18, el: 0.92, r: 50, tx: 0, ty: FH * UNIT, tz: 1.2 } },
];
const PLAN: Pose = { az: 0.0001, el: 1.5, r: 46, tx: 0, ty: FH * UNIT, tz: 1.1 };

const sm = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export class VillaScene {
  renderer!: THREE.WebGPURenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, 1, 0.5, 500);
  container: HTMLElement;
  mobile: boolean;
  reduced: boolean;

  progress = 0;
  plan = false;
  userAz = 0;
  userAzTarget = 0;
  userEl = 0;
  private planT = 0;
  private cur: Pose = { ...POSES[0].pose };
  private active = true;
  private ro?: ResizeObserver;
  private onLabels?: (l: LabelScreen[]) => void;

  // stage uniforms
  u = {
    draw: uniform(0),
    mass: uniform(0),
    massA: uniform(0),
    detail: uniform(0),
    finish: uniform(0),
    cutY: uniform(1000),
    upper: uniform(1),
    interior: uniform(0),
    lineA: uniform(1),
  };
  private s = { draw: 0, mass: 0, detail: 0, finish: 0, cut: 0 };

  private massMeshes: THREE.Object3D[] = [];
  private detailMeshes: THREE.Object3D[] = [];
  private interiorMeshes: THREE.Object3D[] = [];
  private upperGroups: { g: THREE.Group; base: number; k: number }[] = [];
  private labels: { id: string; pos: THREE.Vector3; kind: "room" | "site" }[] = [];
  private riseMass: N;
  private riseDraw: N;
  private matCache = new Map<string, THREE.Material>();
  private v = new THREE.Vector3();

  constructor(container: HTMLElement, opts: { mobile: boolean; reduced: boolean }) {
    this.container = container;
    this.mobile = opts.mobile;
    this.reduced = opts.reduced;
    this.riseMass = this.u.mass.mul(22).sub(1.5).add(step(0.999, this.u.mass).mul(1000));
    this.riseDraw = this.u.draw.mul(24).sub(1.5).add(step(0.999, this.u.draw).mul(1000));
  }

  async init() {
    const r = new THREE.WebGPURenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, this.mobile ? 1.5 : 2));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = !this.mobile;
    r.shadowMap.type = THREE.PCFShadowMap;
    await r.init();
    this.renderer = r;
    r.domElement.style.display = "block";
    r.domElement.style.width = "100%";
    r.domElement.style.height = "100%";
    r.domElement.setAttribute("aria-hidden", "true");
    this.container.appendChild(r.domElement);

    this.buildLights();
    this.buildSite();
    this.buildBuilding();
    this.buildInterior();
    this.buildContext();

    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.container);
    r.setAnimationLoop(() => this.frame());
  }

  setLabelCallback(cb: (l: LabelScreen[]) => void) {
    this.onLabels = cb;
  }
  setActive(a: boolean) {
    this.active = a;
  }
  rotate(dir: number) {
    this.userAzTarget += dir * (Math.PI / 4);
  }
  reset() {
    this.userAzTarget = 0;
    this.userEl = 0;
  }
  drag(dx: number, dy: number) {
    this.userAzTarget -= dx * 0.006;
    this.userEl = Math.max(-0.35, Math.min(0.5, this.userEl + dy * 0.004));
  }

  /* ---------------- materials ---------------- */
  private mat(hex: string, o: { detail?: boolean; cut?: boolean; upper?: boolean; rough?: number; metal?: number; interior?: boolean } = {}) {
    const key = JSON.stringify([hex, o]);
    const c = this.matCache.get(key);
    if (c) return c;
    const m = new THREE.MeshStandardNodeMaterial();
    m.transparent = true;
    m.roughness = o.rough ?? 0.88;
    m.metalness = o.metal ?? 0;
    m.colorNode = o.interior ? color(hex) : mix(color(CLAY), color(hex), this.u.finish);
    let op: N = o.interior ? this.u.interior : o.detail ? this.u.detail : this.u.massA;
    if (o.upper) op = op.mul(this.u.upper);
    m.opacityNode = op;
    let mask: N = o.interior ? null : positionWorld.y.lessThan(this.riseMass);
    if (o.cut) mask = mask.and(positionWorld.y.lessThan(this.u.cutY));
    if (mask) m.maskNode = mask;
    this.matCache.set(key, m);
    return m;
  }

  private lineMat(o: { cut?: boolean; upper?: boolean } = {}) {
    const key = "line" + JSON.stringify(o);
    const c = this.matCache.get(key);
    if (c) return c;
    const m = new THREE.LineBasicNodeMaterial();
    m.transparent = true;
    m.depthWrite = false;
    m.colorNode = color(FOREST);
    let op: N = this.u.lineA;
    if (o.upper) op = op.mul(this.u.upper);
    m.opacityNode = op;
    let mask: N = positionWorld.y.lessThan(this.riseDraw);
    if (o.cut) mask = mask.and(positionWorld.y.lessThan(this.u.cutY.add(0.02)));
    m.maskNode = mask;
    this.matCache.set(key, m);
    return m;
  }

  /** Adds an architectural mesh with its drafting edges. */
  private arch(
    geo: THREE.BufferGeometry,
    hex: string,
    parent: THREE.Object3D,
    pos: [number, number, number],
    o: { detail?: boolean; cut?: boolean; upper?: boolean; rough?: number; metal?: number; lines?: boolean; shadow?: boolean } = {},
  ) {
    const mesh = new THREE.Mesh(geo, this.mat(hex, o));
    mesh.position.set(...pos);
    mesh.castShadow = o.shadow !== false;
    mesh.receiveShadow = true;
    parent.add(mesh);
    (o.detail ? this.detailMeshes : this.massMeshes).push(mesh);
    if (o.lines !== false) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), this.lineMat({ cut: o.cut, upper: o.upper }));
      mesh.add(edges);
    }
    return mesh;
  }

  /* ---------------- scene ---------------- */
  private buildLights() {
    const hemi = new THREE.HemisphereLight("#f6f1e6", "#8b9a84", 1.5);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight("#ffe7c7", 2.6);
    sun.position.set(-30, 38, 26);
    sun.castShadow = !this.mobile;
    sun.shadow.mapSize.set(1536, 1536);
    const sc = sun.shadow.camera;
    sc.left = -34; sc.right = 34; sc.top = 34; sc.bottom = -34; sc.near = 1; sc.far = 120;
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.03;
    this.scene.add(sun);
  }

  private buildSite() {
    const fade = (r0: number, r1: number): N => float(1).sub(smoothstep(r0, r1, length(positionWorld.xz)));

    // Ocean — TSL waves, depth tint and radial vignette into the ivory page
    const ocean = new THREE.MeshStandardNodeMaterial();
    ocean.transparent = true;
    ocean.depthWrite = false;
    ocean.roughness = 0.25;
    ocean.metalness = 0.05;
    const t = time.mul(this.reduced ? 0 : 1);
    const n: N = mx_noise_float(vec3(positionWorld.x.mul(0.18), positionWorld.z.mul(0.18), t.mul(0.25)));
    const depth: N = smoothstep(14, 46, positionWorld.z.add(positionWorld.x.abs().mul(0.25)));
    const sea: N = mix(color("#8fd3c9"), color("#1f6f78"), depth).add(n.mul(0.05));
    ocean.colorNode = mix(color("#e7e1d4"), sea, this.u.finish);
    ocean.opacityNode = fade(34, 78).mul(this.u.massA.mul(0.35).add(this.u.finish.mul(0.65)));
    ocean.positionNode = positionLocal.add(
      vec3(0, 0, sin(positionLocal.x.mul(0.32).add(t.mul(0.9))).mul(0.12).add(n.mul(0.18)).mul(this.u.finish)),
    );
    const oceanMesh = new THREE.Mesh(new THREE.CircleGeometry(84, 128), ocean);
    oceanMesh.rotation.x = -Math.PI / 2;
    oceanMesh.position.y = -1.3;
    oceanMesh.receiveShadow = true;
    this.scene.add(oceanMesh);
    this.massMeshes.push(oceanMesh);

    // Land — the Iron Shore plateau
    const pts: [number, number][] = [
      [-60, -60], [60, -60], [60, 8], [42, 12], [30, 14.5], [19, 16.5], [9, 17.8], [-2, 17.2], [-11, 16.4], [-20, 15], [-30, 12.5], [-44, 9], [-60, 7],
    ];
    const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const landGeo = new THREE.ExtrudeGeometry(shape, { depth: 1.4, bevelEnabled: false, curveSegments: 4 });
    landGeo.rotateX(-Math.PI / 2);
    landGeo.translate(0, -1.4, 0);
    const land = new THREE.MeshStandardNodeMaterial();
    land.transparent = true;
    land.roughness = 1;
    const ln: N = mx_noise_float(vec3(positionWorld.x.mul(0.25), 0, positionWorld.z.mul(0.25)));
    land.colorNode = mix(color("#e4ddcf"), mix(color("#9aa98c"), color("#6f7f62"), ln.mul(0.5).add(0.5)), this.u.finish);
    land.opacityNode = fade(30, 62).mul(this.u.massA);
    land.maskNode = positionWorld.y.lessThan(this.riseMass);
    const landMesh = new THREE.Mesh(landGeo, land);
    landMesh.receiveShadow = true;
    this.scene.add(landMesh);
    this.massMeshes.push(landMesh);

    // Pool deck & pool
    this.arch(new THREE.BoxGeometry(30, 0.2, 9), STONE, this.scene, [0, 0.1, 12.2], { rough: 0.8 });
    const coping = STUCCO;
    const pool = { x0: -8, x1: 8, z0: 9.4, z1: 14.2 };
    const pw = pool.x1 - pool.x0, pd = pool.z1 - pool.z0;
    this.arch(new THREE.BoxGeometry(pw + 0.8, 0.28, 0.4), coping, this.scene, [0, 0.3, pool.z0 - 0.2], { detail: true });
    this.arch(new THREE.BoxGeometry(pw + 0.8, 0.28, 0.4), coping, this.scene, [0, 0.3, pool.z1 + 0.2], { detail: true });
    this.arch(new THREE.BoxGeometry(0.4, 0.28, pd), coping, this.scene, [pool.x0 - 0.2, 0.3, (pool.z0 + pool.z1) / 2], { detail: true });
    this.arch(new THREE.BoxGeometry(0.4, 0.28, pd), coping, this.scene, [pool.x1 + 0.2, 0.3, (pool.z0 + pool.z1) / 2], { detail: true });

    const water = new THREE.MeshStandardNodeMaterial();
    water.transparent = true;
    water.roughness = 0.08;
    water.metalness = 0.1;
    const wn: N = mx_noise_float(vec3(positionWorld.x.mul(0.9), positionWorld.z.mul(0.9), t.mul(0.6)));
    const caustic: N = smoothstep(0.25, 0.6, wn.abs().oneMinus()).mul(0.22);
    water.colorNode = mix(color("#e9f0ec"), mix(color("#2aa9b8"), color("#7fe0dc"), wn.mul(0.5).add(0.5)).add(caustic), this.u.finish);
    water.opacityNode = this.u.detail.mul(0.92);
    const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), water);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, 0.22, (pool.z0 + pool.z1) / 2);
    this.scene.add(waterMesh);
    this.detailMeshes.push(waterMesh);

    // Loungers
    for (let i = 0; i < 5; i++) {
      this.arch(new THREE.BoxGeometry(0.8, 0.3, 2), "#f4efe6", this.scene, [-9 + i * 2.2 + (i > 2 ? 4.6 : 0), 0.35, 16], { detail: true, lines: false });
    }

    // Palapa (outdoor dining) by the sea
    const palapa = new THREE.Group();
    palapa.position.set(14.5, 0.2, 12.5);
    this.scene.add(palapa);
    for (const [x, z] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) {
      this.arch(new THREE.CylinderGeometry(0.12, 0.14, 2.8, 8), TIMBER, palapa, [x, 1.4, z], { detail: true, lines: false });
    }
    const thatch = new THREE.ConeGeometry(3.3, 1.9, 12, 1);
    this.arch(thatch, "#b99563", palapa, [0, 3.6, 0], { detail: true, rough: 1 });
    this.arch(new THREE.BoxGeometry(2, 0.12, 1.1), TIMBER, palapa, [0, 1, 0], { detail: true, lines: false });
    this.labels.push({ id: "palapa", pos: new THREE.Vector3(14.5, 5, 12.5), kind: "site" });
    this.labels.push({ id: "pool", pos: new THREE.Vector3(0, 0.8, 11.8), kind: "site" });

    // Ironshore rocks along the waterline
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = this.mat("#3d3f3a", { detail: true, rough: 1 });
    const rocks = new THREE.InstancedMesh(rockGeo, rockMat, 46);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) {
      const x = -34 + i * 1.5 + rnd();
      const edge = 17.6 - Math.pow(Math.abs(x) / 34, 2) * 7;
      const s = 0.6 + rnd() * 1.1;
      q.setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, rnd() * 3));
      m4.compose(new THREE.Vector3(x, -0.9 + rnd() * 0.4, edge - 0.6 + rnd() * 1.2), q, new THREE.Vector3(s * 1.3, s * 0.7, s));
      rocks.setMatrixAt(i, m4);
    }
    rocks.castShadow = true;
    this.scene.add(rocks);
    this.detailMeshes.push(rocks);

    // Palms
    const palmSpots: [number, number, number][] = [[-14, 11, 0.2], [-17.5, 8, -0.15], [12, 7.5, 0.25], [19, 9, -0.2], [-12.5, 15, 0.1], [9.5, 15.5, -0.3], [-22, 4, 0.2]];
    const trunkMat = this.mat("#8a7760", { detail: true });
    const leafMat = this.mat("#4f6b45", { detail: true, rough: 0.9 });
    const leafGeo = new THREE.ConeGeometry(0.55, 3.4, 4, 1);
    leafGeo.translate(0, 1.7, 0);
    leafGeo.scale(1, 1, 0.12);
    for (const [x, z, lean] of palmSpots) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.z = lean;
      const h = 6 + Math.abs(lean) * 8;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, h, 7), trunkMat);
      trunk.position.y = h / 2;
      trunk.castShadow = true;
      g.add(trunk);
      for (let k = 0; k < 8; k++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.y = h;
        leaf.rotation.set(0, (k / 8) * Math.PI * 2, 0);
        leaf.rotateX(1.2 + (k % 2) * 0.35);
        leaf.castShadow = true;
        g.add(leaf);
      }
      this.scene.add(g);
      this.detailMeshes.push(g);
    }
  }

  private archFacade(w: number, h: number, n: number, depth: number) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, h);
    s.lineTo(-w / 2, h);
    s.lineTo(-w / 2, 0);
    const bay = w / n;
    const aw = bay * 0.8;
    const spring = h * 0.56;
    for (let i = 0; i < n; i++) {
      const cx = -w / 2 + bay * (i + 0.5);
      const p = new THREE.Path();
      p.moveTo(cx - aw / 2, 0.14);
      p.lineTo(cx + aw / 2, 0.14);
      p.lineTo(cx + aw / 2, spring);
      p.absarc(cx, spring, aw / 2, 0, Math.PI, false);
      p.lineTo(cx - aw / 2, 0.14);
      s.holes.push(p);
    }
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 14 });
  }

  private buildBuilding() {
    const facade = this.archFacade(W, FH - 0.3, 5, 0.35);
    const sideFacade = this.archFacade(LOGGIA + 0.2, FH - 0.3, 1, 0.3);
    const balGeo = new THREE.BoxGeometry(0.06, 0.95, 0.06);

    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const base = i * FH;
      g.position.y = base;
      this.scene.add(g);
      const cut = i === UNIT;
      const upper = i > UNIT;
      const o = { cut, upper };
      if (upper) this.upperGroups.push({ g, base, k: i - UNIT });

      // slab + loggia slab
      this.arch(new THREE.BoxGeometry(W + 0.6, 0.3, D + LOGGIA + 0.6), STUCCO, g, [0, 0.15, LOGGIA / 2], o);
      // walls
      this.arch(new THREE.BoxGeometry(W, FH - 0.3, 0.3), STUCCO, g, [0, FH / 2 + 0.15, -D / 2 + 0.15], o);
      this.arch(new THREE.BoxGeometry(0.3, FH - 0.3, D), STUCCO, g, [-W / 2 + 0.15, FH / 2 + 0.15, 0], o);
      this.arch(new THREE.BoxGeometry(0.3, FH - 0.3, D), STUCCO, g, [W / 2 - 0.15, FH / 2 + 0.15, 0], o);
      // inner front wall (glass line) — massing reads as a wall, detail adds glazing
      this.arch(new THREE.BoxGeometry(W - 0.6, FH - 0.3, 0.2), STUCCO, g, [0, FH / 2 + 0.15, D / 2 - 0.1], { ...o, lines: true });
      // arched loggia facades (front + sides)
      this.arch(facade, STUCCO, g, [0, 0.3, D / 2 + LOGGIA - 0.35], o);
      const sL = this.arch(sideFacade, STUCCO, g, [-W / 2 + 0.15, 0.3, D / 2 + LOGGIA / 2], o);
      sL.rotation.y = Math.PI / 2;
      const sR = this.arch(sideFacade, STUCCO, g, [W / 2 - 0.15, 0.3, D / 2 + LOGGIA / 2], o);
      sR.rotation.y = -Math.PI / 2;

      // ---- detail ----
      // glazing on the inner front wall
      for (let k = 0; k < 5; k++) {
        const x = -W / 2 + (W / 5) * (k + 0.5);
        this.arch(new THREE.BoxGeometry(2.6, 2.3, 0.06), GLASS, g, [x, 1.5, D / 2 + 0.03], { ...o, detail: true, rough: 0.12, metal: 0.3, lines: true });
      }
      // back & side windows
      for (let k = 0; k < 6; k++) {
        const x = -W / 2 + 2 + k * ((W - 4) / 5);
        this.arch(new THREE.BoxGeometry(1.1, 1.6, 0.08), GLASS, g, [x, 1.75, -D / 2 - 0.02], { ...o, detail: true, rough: 0.15, metal: 0.3 });
      }
      for (const sx of [-1, 1]) {
        for (let k = 0; k < 3; k++) {
          this.arch(new THREE.BoxGeometry(0.08, 1.6, 1.1), GLASS, g, [sx * (W / 2 + 0.02), 1.75, -D / 2 + 2.2 + k * 3.6], { ...o, detail: true, rough: 0.15, metal: 0.3 });
        }
      }
      // railing: top rail + instanced balusters
      this.arch(new THREE.BoxGeometry(W - 0.4, 0.09, 0.14), "#fbfaf6", g, [0, 1.3, D / 2 + LOGGIA - 0.45], { ...o, detail: true, lines: false });
      const count = 56;
      const bal = new THREE.InstancedMesh(balGeo, this.mat("#fbfaf6", { ...o, detail: true }), count);
      const m4 = new THREE.Matrix4();
      for (let k = 0; k < count; k++) {
        m4.makeTranslation(-W / 2 + 0.4 + k * ((W - 0.8) / (count - 1)), 0.8, D / 2 + LOGGIA - 0.45);
        bal.setMatrixAt(k, m4);
      }
      g.add(bal);
      this.detailMeshes.push(bal);
      // cornice band
      this.arch(new THREE.BoxGeometry(W + 0.8, 0.14, 0.2), "#fbfaf6", g, [0, FH - 0.05, D / 2 + LOGGIA - 0.1], { ...o, detail: true, lines: false });
    }

    // roof
    const roof = new THREE.Group();
    roof.position.y = 4 * FH;
    this.scene.add(roof);
    this.upperGroups.push({ g: roof, base: 4 * FH, k: 3.4 });
    this.arch(new THREE.BoxGeometry(W + 0.8, 0.35, D + LOGGIA + 0.8), STUCCO, roof, [0, 0.17, LOGGIA / 2], { upper: true });
    const hip = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    hip.rotateY(Math.PI / 4);
    const hipMesh = this.arch(hip, ROOF, roof, [0, 1.6, LOGGIA / 2], { upper: true, rough: 0.8 });
    hipMesh.scale.set(W + 2, 2.6, D + LOGGIA + 2);

    this.labels.push({ id: "residence", pos: new THREE.Vector3(-W / 2 - 0.5, FH * 1.6, D / 2 + LOGGIA), kind: "site" });
  }

  private buildInterior() {
    const y = UNIT * FH + 0.31;
    const g = new THREE.Group();
    this.scene.add(g);
    const wallMat = this.mat("#f7f3ec", { interior: true, rough: 0.9 });
    const furn = this.mat("#d8cfbf", { interior: true });
    const bedMat = this.mat("#fbf8f2", { interior: true });
    const wood = this.mat(TIMBER, { interior: true });
    const wallH = 1.25;

    for (const r of ROOMS) {
      const w = r.x1 - r.x0, d = r.z1 - r.z0;
      const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, d - 0.12), this.mat(r.tone, { interior: true, rough: 0.7 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(cx, y + 0.005, cz);
      floor.receiveShadow = true;
      g.add(floor);
      this.interiorMeshes.push(floor);
      this.labels.push({ id: r.id, pos: new THREE.Vector3(cx, y + 0.4, cz), kind: "room" });
      if (r.id === "patio") continue;
      const walls: [number, number, number, number][] = [
        [cx, r.z0, w, 0.12], [cx, r.z1, w, 0.12], [r.x0, cz, 0.12, d], [r.x1, cz, 0.12, d],
      ];
      for (const [x, z, ww, dd] of walls) {
        if (Math.abs(Math.abs(x) - W / 2) < 0.01 || Math.abs(z + D / 2) < 0.01) continue; // skip exterior lines
        const wall = new THREE.Mesh(new THREE.BoxGeometry(ww, wallH, dd), wallMat);
        wall.position.set(x, y + wallH / 2, z);
        wall.castShadow = true;
        g.add(wall);
        this.interiorMeshes.push(wall);
      }
    }
    const add = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, yy: number, z: number) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y + yy, z);
      mesh.castShadow = true;
      g.add(mesh);
      this.interiorMeshes.push(mesh);
    };
    // beds
    add(new THREE.BoxGeometry(2.3, 0.5, 2.5), bedMat, -7.8, 0.25, 3.8);
    add(new THREE.BoxGeometry(2.3, 0.5, 2.5), bedMat, 7.8, 0.25, 3.8);
    add(new THREE.BoxGeometry(2.0, 0.5, 2.4), bedMat, 7.8, 0.25, -3.8);
    // living sofa + dining table + kitchen island
    add(new THREE.BoxGeometry(3.2, 0.6, 1), furn, -2, 0.3, 1.2);
    add(new THREE.BoxGeometry(1.2, 0.35, 1.2), wood, -2, 0.18, 3.2);
    add(new THREE.BoxGeometry(2.6, 0.75, 1.2), wood, 2.5, 0.38, 3.2);
    add(new THREE.BoxGeometry(3.4, 0.9, 1.1), furn, 0, 0.45, -2.6);
    add(new THREE.BoxGeometry(8.4, 0.9, 0.7), wood, 0, 0.45, -5.5);
    // patio loungers
    for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(0.8, 0.35, 1.7), furn, -8 + k * 5.2, 0.18, 7.1);
  }

  private buildContext() {
    // the neighbouring twin residence — ghosted massing for context
    const g = new THREE.Group();
    g.position.set(-31, 0, -6);
    g.rotation.y = 0.35;
    this.scene.add(g);
    const m = new THREE.MeshStandardNodeMaterial();
    m.transparent = true;
    m.colorNode = color(CLAY);
    m.opacityNode = this.u.massA.mul(0.55);
    m.maskNode = positionWorld.y.lessThan(this.riseMass);
    const geo = new THREE.BoxGeometry(18, FH * 4, 11);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.y = FH * 2;
    mesh.castShadow = true;
    g.add(mesh);
    this.massMeshes.push(mesh);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), this.lineMat()));
  }

  /* ---------------- loop ---------------- */
  private resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h || !this.renderer) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 0.8 ? 44 : 32;
    // on wide screens, shift the model right of the copy column
    if (w / h > 1.2) this.camera.setViewOffset(w, h, -w * 0.17, 0, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  private poseAt(p: number): Pose {
    if (p <= POSES[0].p) return POSES[0].pose;
    for (let i = 0; i < POSES.length - 1; i++) {
      const a = POSES[i], b = POSES[i + 1];
      if (p <= b.p) {
        const t = sm(a.p, b.p, p);
        const r: any = {};
        for (const k of Object.keys(a.pose) as (keyof Pose)[]) r[k] = a.pose[k] + (b.pose[k] - a.pose[k]) * t;
        return r;
      }
    }
    return POSES[POSES.length - 1].pose;
  }

  private last = 0;
  private frame() {
    if (!this.active) { this.last = 0; return; }
    const now = performance.now();
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 1 / 60;
    this.last = now;
    const damp = (rate: number) => (this.reduced ? 1 : 1 - Math.exp(-rate * dt));
    const p = this.progress;
    const k = damp(4.8);
    const tgt = {
      draw: 0.14 + 0.86 * sm(0.0, 0.17, p),
      mass: sm(0.19, 0.35, p),
      detail: sm(0.38, 0.52, p),
      finish: sm(0.56, 0.7, p),
      cut: this.plan ? 1 : sm(0.76, 0.9, p),
    };
    if (this.plan) {
      tgt.draw = 1; tgt.mass = 1; tgt.detail = 1; tgt.finish = 1;
    }
    for (const key of Object.keys(tgt) as (keyof typeof tgt)[]) this.s[key] += (tgt[key] - this.s[key]) * k;
    const s = this.s;
    this.u.draw.value = s.draw;
    this.u.mass.value = s.mass;
    this.u.massA.value = Math.min(1, s.mass * 2.2);
    this.u.detail.value = s.detail;
    this.u.finish.value = s.finish;
    this.u.lineA.value = Math.max(0.08, 0.85 * (1 - s.mass * 0.45) * (1 - s.finish)) + s.cut * 0.28;
    const cutE = sm(0, 1, s.cut);
    this.u.cutY.value = cutE > 0.01 ? UNIT * FH + 0.3 + 1.4 + (1 - cutE) * 30 : 1000;
    this.u.upper.value = 1 - sm(0.15, 0.85, s.cut);
    this.u.interior.value = sm(0.45, 1, s.cut);

    for (const { g, base, k: kk } of this.upperGroups) {
      g.position.y = base + cutE * (9 + kk * 4.5);
      g.visible = this.u.upper.value > 0.02;
    }
    // mass meshes stay visible: their height mask discards fragments, letting drafting lines show first
    const dv = s.detail > 0.01;
    for (const m of this.detailMeshes) m.visible = dv;
    const iv = this.u.interior.value > 0.01;
    for (const m of this.interiorMeshes) m.visible = iv;

    // camera
    this.planT += ((this.plan ? 1 : 0) - this.planT) * damp(3.6);
    this.userAz += (this.userAzTarget - this.userAz) * damp(5);
    const a = this.poseAt(p);
    const target: Pose = { ...a };
    for (const key of Object.keys(PLAN) as (keyof Pose)[]) target[key] = a[key] + (PLAN[key] - a[key]) * this.planT;
    const ck = damp(4.2);
    for (const key of Object.keys(target) as (keyof Pose)[]) this.cur[key] += (target[key] - this.cur[key]) * ck;
    const c = this.cur;
    const rMul = this.camera.aspect < 0.8 ? 1.3 : this.camera.aspect < 1.2 ? 1.12 : 1;
    const az = c.az + this.userAz * (1 - this.planT * 0.0);
    const el = Math.max(0.08, Math.min(1.52, c.el + this.userEl * (1 - this.planT)));
    const R = c.r * rMul;
    this.camera.position.set(c.tx + R * Math.sin(az) * Math.cos(el), c.ty + R * Math.sin(el), c.tz + R * Math.cos(az) * Math.cos(el));
    this.camera.lookAt(c.tx, c.ty, c.tz);

    this.renderer.render(this.scene, this.camera);
    this.emitLabels();
  }

  private emitLabels() {
    if (!this.onLabels) return;
    const w = this.container.clientWidth, h = this.container.clientHeight;
    const roomO = this.u.interior.value;
    const siteO = this.s.finish * (1 - sm(0.05, 0.4, this.s.cut));
    const out: LabelScreen[] = [];
    for (const l of this.labels) {
      this.v.copy(l.pos).project(this.camera);
      const o = l.kind === "room" ? roomO : siteO;
      out.push({ id: l.id, x: (this.v.x * 0.5 + 0.5) * w, y: (-this.v.y * 0.5 + 0.5) * h, o: this.v.z < 1 ? o : 0 });
    }
    this.onLabels(out);
  }

  dispose() {
    this.ro?.disconnect();
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
      this.scene.traverse((o: any) => {
        o.geometry?.dispose?.();
      });
      this.matCache.forEach((m) => m.dispose());
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }
}
