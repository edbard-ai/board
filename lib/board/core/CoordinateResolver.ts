import { XCoord, YCoord, SizeCoord, SemanticPoint } from '../types';

export class CoordinateResolver {
    private logicalWidth: number;
    private logicalHeight: number;

    constructor(logicalWidth: number, logicalHeight: number) {
        this.logicalWidth = logicalWidth;
        this.logicalHeight = logicalHeight;
    }

    public updateDimensions(width: number, height: number) {
        this.logicalWidth = width;
        this.logicalHeight = height;
    }

    public resolveX(x: XCoord): number {
        if (typeof x === 'number') return x;
        if (x === 'center') return this.logicalWidth / 2;
        if (x === 'left') return 0;
        if (x === 'right') return this.logicalWidth;
        if (typeof x === 'string' && x.endsWith('%')) {
            const val = parseFloat(x);
            return !isNaN(val) ? (val / 100) * this.logicalWidth : 0;
        }
        return 0;
    }

    public resolveY(y: YCoord): number {
        if (typeof y === 'number') return y;
        if (y === 'center') return this.logicalHeight / 2;
        if (y === 'top') return 0;
        if (y === 'bottom') return this.logicalHeight;
        if (typeof y === 'string' && y.endsWith('%')) {
            const val = parseFloat(y);
            return !isNaN(val) ? (val / 100) * this.logicalHeight : 0;
        }
        return 0;
    }

    public resolveXY(x: XCoord | SemanticPoint, y?: YCoord): { posX: number; posY: number } {
        if (typeof x === 'object' && x !== null && 'x' in x && 'y' in x) {
            return { posX: this.resolveX(x.x), posY: this.resolveY(x.y) };
        }
        return { posX: this.resolveX(x as XCoord), posY: this.resolveY(y ?? 0) };
    }

    public resolveWidth(w: SizeCoord): number {
        if (typeof w === 'number') return w;
        if (typeof w === 'string' && w.endsWith('%')) {
            const val = parseFloat(w);
            return !isNaN(val) ? (val / 100) * this.logicalWidth : 0;
        }
        return 0;
    }

    public resolveHeight(h: SizeCoord): number {
        if (typeof h === 'number') return h;
        if (typeof h === 'string' && h.endsWith('%')) {
            const val = parseFloat(h);
            return !isNaN(val) ? (val / 100) * this.logicalHeight : 0;
        }
        return 0;
    }

    public resolveSize(s: SizeCoord, axis: 'x' | 'y' = 'x'): number {
        if (typeof s === 'number') return s;
        if (typeof s === 'string' && s.endsWith('%')) {
            const val = parseFloat(s);
            const ref = axis === 'x' ? this.logicalWidth : this.logicalHeight;
            return !isNaN(val) ? (val / 100) * ref : 0;
        }
        return 0;
    }
}
