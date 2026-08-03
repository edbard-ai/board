import { Board } from './board';

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface FaceDef {
    verts: number[];
    color: string;
    stroke?: string;
    opacity?: number;
}

export interface MeshDef {
    vertices: number[][];
    faces: FaceDef[];
}

export interface EdgeDef {
    from: Vec3;
    to: Vec3;
    color: string;
    lineDash?: number[];
}

export interface Label3DDef {
    position: Vec3;
    text: string;
    color?: string;
    fontSize?: number;
    textAlign?: CanvasTextAlign;
    fontWeight?: string;
}

export interface LightConfig {
    direction: Vec3;
    ambient: number;
}

export interface Scene3DOptions {
    projection: 'isometric' | 'perspective';
    origin: { x: number; y: number };
    scale: number;
    light?: LightConfig;
    perspectiveDistance?: number;
}

interface ResolvedFace {
    projected: { x: number; y: number }[];
    avgDepth: number;
    color: string;
    stroke: string;
    opacity: number;
    normal: Vec3;
}

interface ResolvedEdge {
    from2d: { x: number; y: number };
    to2d: { x: number; y: number };
    color: string;
    lineDash?: number[];
    avgDepth: number;
}

interface ResolvedLabel {
    pos2d: { x: number; y: number };
    text: string;
    color: string;
    fontSize: number;
    textAlign: CanvasTextAlign;
    fontWeight: string;
    depth: number;
}

function vec3(arr: number[]): Vec3 {
    return { x: arr[0], y: arr[1], z: arr[2] };
}

function normalize(v: Vec3): Vec3 {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (len === 0) return { x: 0, y: 0, z: 1 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}

function dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function computeFaceNormal(verts: Vec3[]): Vec3 {
    if (verts.length < 3) return { x: 0, y: 0, z: 1 };
    const u = sub(verts[1], verts[0]);
    const v = sub(verts[verts.length - 1], verts[0]);
    return normalize(cross(u, v));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16)
    };
}

function shadeColor(hex: string, factor: number): string {
    const { r, g, b } = hexToRgb(hex);
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `rgb(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(b * factor)})`;
}

function shadeColorWithAlpha(hex: string, factor: number, alpha: number): string {
    const { r, g, b } = hexToRgb(hex);
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `rgba(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(b * factor)}, ${alpha})`;
}

export class Scene3D {
    private options: Scene3DOptions;
    private meshes: MeshDef[] = [];
    private edges: EdgeDef[] = [];
    private labels: Label3DDef[] = [];
    private lightDir: Vec3;
    private ambient: number;

    constructor(options: Scene3DOptions) {
        this.options = options;
        const light = options.light ?? { direction: { x: -1, y: -1, z: 2 }, ambient: 0.35 };
        this.lightDir = normalize(light.direction);
        this.ambient = light.ambient;
    }

    addMesh(mesh: MeshDef): void {
        this.meshes.push(mesh);
    }

    addEdge(from: Vec3 | number[], to: Vec3 | number[], color: string, lineDash?: number[]): void {
        const f = Array.isArray(from) ? vec3(from) : from;
        const t = Array.isArray(to) ? vec3(to) : to;
        this.edges.push({ from: f, to: t, color, lineDash });
    }

    addLabel(position: Vec3 | number[], text: string, opts?: Partial<Omit<Label3DDef, 'position' | 'text'>>): void {
        const pos = Array.isArray(position) ? vec3(position) : position;
        this.labels.push({
            position: pos,
            text,
            color: opts?.color ?? '#ffffff',
            fontSize: opts?.fontSize ?? 14,
            textAlign: opts?.textAlign ?? 'center',
            fontWeight: opts?.fontWeight ?? '400'
        });
    }

    project(v: Vec3): { x: number; y: number } {
        const { origin, scale, projection, perspectiveDistance } = this.options;

        if (projection === 'perspective') {
            const d = perspectiveDistance ?? 500;
            const factor = d / (d + v.y);
            return {
                x: origin.x + v.x * factor * scale,
                y: origin.y - v.z * factor * scale + v.y * 0.3 * scale
            };
        }

        return {
            x: origin.x - v.x * 0.866 * scale + v.y * 0.866 * scale,
            y: origin.y + v.x * 0.5 * scale + v.y * 0.5 * scale - v.z * scale
        };
    }

    private isometricDepth(v: Vec3): number {
        return -v.x - v.y + v.z * 0.5;
    }

    private computeShading(normal: Vec3, baseColor: string, opacity: number): { fill: string; stroke: string } {
        const d = dot(normal, this.lightDir);
        const brightness = this.ambient + (1 - this.ambient) * Math.max(0, d);
        const fill = shadeColorWithAlpha(baseColor, brightness, opacity);
        const stroke = shadeColor(baseColor, Math.min(1.2, brightness + 0.15));
        return { fill, stroke };
    }

    renderTo(board: Board): void {
        const resolvedFaces: ResolvedFace[] = [];
        const resolvedEdges: ResolvedEdge[] = [];
        const resolvedLabels: ResolvedLabel[] = [];

        for (const mesh of this.meshes) {
            const verts3d: Vec3[] = mesh.vertices.map(v => vec3(v));

            for (const faceDef of mesh.faces) {
                const faceVerts = faceDef.verts.map(i => verts3d[i]);
                const projected = faceVerts.map(v => this.project(v));
                const avgDepth = faceVerts.reduce((sum, v) => sum + this.isometricDepth(v), 0) / faceVerts.length;
                const normal = computeFaceNormal(faceVerts);
                const opacity = faceDef.opacity ?? 0.85;

                resolvedFaces.push({
                    projected,
                    avgDepth,
                    color: faceDef.color,
                    stroke: faceDef.stroke ?? faceDef.color,
                    opacity,
                    normal
                });
            }
        }

        for (const edge of this.edges) {
            const from2d = this.project(edge.from);
            const to2d = this.project(edge.to);
            const avgDepth = (this.isometricDepth(edge.from) + this.isometricDepth(edge.to)) / 2;
            resolvedEdges.push({ from2d, to2d, color: edge.color, lineDash: edge.lineDash, avgDepth });
        }

        for (const label of this.labels) {
            const pos2d = this.project(label.position);
            const depth = this.isometricDepth(label.position);
            resolvedLabels.push({
                pos2d,
                text: label.text,
                color: label.color ?? '#ffffff',
                fontSize: label.fontSize ?? 14,
                textAlign: label.textAlign ?? 'center',
                fontWeight: label.fontWeight ?? '400',
                depth
            });
        }

        resolvedFaces.sort((a, b) => a.avgDepth - b.avgDepth);

        for (const face of resolvedFaces) {
            const { fill, stroke } = this.computeShading(face.normal, face.color, face.opacity);

            board.fillPolygon({
                points: face.projected,
                fillColor: fill
            });
            board.drawPolygon({
                points: face.projected,
                color: stroke
            });
        }

        for (const edge of resolvedEdges) {
            board.drawLine({
                x1: edge.from2d.x,
                y1: edge.from2d.y,
                x2: edge.to2d.x,
                y2: edge.to2d.y,
                color: edge.color,
                lineDash: edge.lineDash
            });
        }

        for (const label of resolvedLabels) {
            board.writeText({
                text: label.text,
                x: label.pos2d.x,
                y: label.pos2d.y,
                fontSize: label.fontSize,
                color: label.color,
                textAlign: label.textAlign,
                fontWeight: label.fontWeight
            });
        }
    }
}
