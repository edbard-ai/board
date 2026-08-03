import {
    Point,
    DrawItem,
    DrawLineOptions,
    WriteTextOptions,
    WriteParagraphOptions,
    FillRectOptions,
    FillPolygonOptions,
    DrawRectOptions,
    DrawDiamondOptions,
    DrawPolygonOptions,
    DrawRegularPolygonOptions,
    DrawPolynomialOptions,
    DrawArrowOptions,
    DrawCircleOptions,
    DrawEllipseOptions,
    DrawArcOptions,
    DrawImageOptions,
    DrawGradientRectOptions,
    DrawGridAxesOptions,
    DrawCodeBlockOptions,
    DrawTableOptions,
    BoardOptions,
    WriteMathOptions,
    XCoord,
    YCoord,
    SemanticPoint,
    SizeCoord,
    BoardScriptCommand
} from './types';
import katex from 'katex';
import {
    getSmoothSplinePoints,
    getRectPathPoints,
    getDiamondPolygonPoints,
    getRegularPolygonPoints,
    getPolynomialPoints,
    getArrowHeadLines
} from './shapes';
import {
    slideOutLeftAnimation,
    runDrawQueueAnimation,
    renderDrawItem
} from './animation';

export type {
    Point,
    DrawItem,
    DrawLineOptions,
    WriteTextOptions,
    WriteParagraphOptions,
    FillRectOptions,
    FillPolygonOptions,
    DrawRectOptions,
    DrawDiamondOptions,
    DrawPolygonOptions,
    DrawRegularPolygonOptions,
    DrawPolynomialOptions,
    DrawArrowOptions,
    DrawCircleOptions,
    DrawEllipseOptions,
    DrawArcOptions,
    DrawImageOptions,
    DrawGradientRectOptions,
    DrawGridAxesOptions,
    DrawCodeBlockOptions,
    DrawTableOptions,
    BoardOptions,
    WriteMathOptions,
    XCoord,
    YCoord,
    SemanticPoint,
    BoardScriptCommand
};

export class Board {
    id: string;
    container: HTMLDivElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    private isRecording = false;
    private drawQueue: DrawItem[] = [];
    private isAnimating = false;
    private _logicalWidth: number;
    private _logicalHeight: number;
    private idCounter = 0;

    color: string = '#000000';
    lineWidth: number = 2;
    speed: number = 15;
    fontFamily: string = '"Playpen Sans", sans-serif';
    
    private stateStack: { color: string; lineWidth: number; opacity: number; lineDash: number[] }[] = [];

    constructor(id: string, width: number, height: number, options?: BoardOptions) {
        this.id = id;
        this.speed = options?.speed ?? 15;
        if (options?.fontFamily) {
            this.fontFamily = options.fontFamily;
        }
        this._logicalWidth = width;
        this._logicalHeight = height;
        this.container = document.getElementById(id)! as HTMLDivElement;

        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.width = width + 'px';
        this.container.style.height = height + 'px';

        this.canvas = document.createElement('canvas');
        
        const hiDpi = options?.hiDpi ?? true;
        const dpr = hiDpi ? (window.devicePixelRatio || 1) : 1;
        
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.style.cursor = 'crosshair';
        this.canvas.style.touchAction = 'none';
        this.container.appendChild(this.canvas);

        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2D context from canvas");
        this.ctx = ctx;
        
        if (hiDpi && dpr !== 1) {
            this.ctx.scale(dpr, dpr);
        }

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (options?.background) {
            this.setBackground(options.background);
        }
    }

    get width(): number {
        return this._logicalWidth;
    }

    get height(): number {
        return this._logicalHeight;
    }

    generateId(): string {
        this.idCounter++;
        return `_id_${this.idCounter}`;
    }


    private resolveWidth(w: SizeCoord): number {
        if (typeof w === 'number') return w;
        if (typeof w === 'string' && w.endsWith('%')) {
            const val = parseFloat(w);
            return !isNaN(val) ? (val / 100) * this._logicalWidth : 0;
        }
        return 0;
    }

    private resolveHeight(h: SizeCoord): number {
        if (typeof h === 'number') return h;
        if (typeof h === 'string' && h.endsWith('%')) {
            const val = parseFloat(h);
            return !isNaN(val) ? (val / 100) * this._logicalHeight : 0;
        }
        return 0;
    }

    private resolveSize(s: SizeCoord | string): number {
        if (typeof s === 'number') return s;
        if (typeof s === 'string') {
            const str = s.trim();
            if (str.endsWith('%')) {
                const val = parseFloat(str);
                const ref = Math.min(this._logicalWidth, this._logicalHeight);
                return !isNaN(val) ? (val / 100) * ref : 0;
            }
            if (str.endsWith('vw')) {
                const val = parseFloat(str);
                return !isNaN(val) ? (val / 100) * this._logicalWidth : 0;
            }
            if (str.endsWith('vh')) {
                const val = parseFloat(str);
                return !isNaN(val) ? (val / 100) * this._logicalHeight : 0;
            }
            if (str.endsWith('px')) {
                const val = parseFloat(str);
                return !isNaN(val) ? val : 0;
            }
            const val = parseFloat(str);
            return !isNaN(val) ? val : 0;
        }
        return 0;
    }

    private resolveX(x: XCoord): number {
        if (typeof x === 'number') return x;
        if (typeof x === 'string' && x.endsWith('%')) {
            const val = parseFloat(x);
            return !isNaN(val) ? (val / 100) * this._logicalWidth : 0;
        }
        if (x === 'center') return this._logicalWidth / 2;
        if (x === 'left') return 0;
        if (x === 'right') return this._logicalWidth;
        return 0;
    }

    private resolveY(y: YCoord): number {
        if (typeof y === 'number') return y;
        if (typeof y === 'string' && y.endsWith('%')) {
            const val = parseFloat(y);
            return !isNaN(val) ? (val / 100) * this._logicalHeight : 0;
        }
        if (y === 'center') return this._logicalHeight / 2;
        if (y === 'top') return 0;
        if (y === 'bottom') return this._logicalHeight;
        return 0;
    }

    private resolveXY(x: XCoord | SemanticPoint, y?: YCoord): { posX: number, posY: number } {
        if (typeof x === 'object' && x !== null) {
            return { posX: this.resolveX((x as SemanticPoint).x), posY: this.resolveY((x as SemanticPoint).y) };
        }
        return { posX: this.resolveX(x as XCoord), posY: this.resolveY(y ?? 0) };
    }

    center(): SemanticPoint {
        return { x: 'center', y: 'center' };
    }

    setColor(color: string) {
        this.color = color;
    }

    setLineWidth(width: number) {
        this.lineWidth = width;
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    setOpacity(alpha: number) {
        this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    }

    setLineDash(segments: number[]) {
        this.ctx.setLineDash(segments);
    }

    save() {
        this.ctx.save();
        this.stateStack.push({
            color: this.color,
            lineWidth: this.lineWidth,
            opacity: this.ctx.globalAlpha,
            lineDash: this.ctx.getLineDash()
        });
    }

    restore() {
        this.ctx.restore();
        const state = this.stateStack.pop();
        if (state) {
            this.color = state.color;
            this.lineWidth = state.lineWidth;
            this.ctx.globalAlpha = state.opacity;
            this.ctx.setLineDash(state.lineDash);
        }
    }

    setBackground(color: string) {
        this.container.style.backgroundColor = color;
    }

    clear() {
        this.ctx.clearRect(0, 0, this._logicalWidth, this._logicalHeight);
    }

    beginTrigger() {
        this.isRecording = true;
        this.drawQueue = [];
        this.idCounter = 0;
    }

    completeTrigger() {
        this.isRecording = false;
        this.animateDrawQueue();
    }
    
    wait(durationMs: number) {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'wait', duration: durationMs });
        }
    }

    delete(id: string, durationMs: number = 300) {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'delete', id, duration: durationMs });
        }
    }

    deleteComponent = this.delete;
    remove = this.delete;

    move(id: string, dx: number, dy: number, durationMs: number = 300) {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'move', id, dx, dy, duration: durationMs });
        }
    }

    moveTo(id: string, x: XCoord, y: YCoord, durationMs: number = 300) {
        const posX = this.resolveX(x);
        const posY = this.resolveY(y);
        if (this.isRecording) {
            this.drawQueue.push({ type: 'move', id, targetX: posX, targetY: posY, duration: durationMs });
        }
    }

    changeColor(id: string, color: string, durationMs: number = 300) {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'changeColor', id, color, duration: durationMs });
        }
    }

    private animateDrawQueue() {
        if (this.isAnimating || this.drawQueue.length === 0) return;
        this.isAnimating = true;

        runDrawQueueAnimation(
            this.ctx,
            this.drawQueue,
            this.speed,
            () => {
                this.isAnimating = false;
            },
            (duration) => this.slideOutLeftHelper(duration)
        );
    }

    drawLine({ id, x1, y1, x2, y2, color, lineDash }: DrawLineOptions): string {
        const itemId = id || this.generateId();
        const posX1 = this.resolveX(x1);
        const posY1 = this.resolveY(y1);
        const posX2 = this.resolveX(x2);
        const posY2 = this.resolveY(y2);
        const strokeColor = color || this.color;
        const item: DrawItem = { type: 'line', id: itemId, x1: posX1, y1: posY1, x2: posX2, y2: posY2, color: strokeColor, lineWidth: this.lineWidth, lineDash };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    writeText({
        id,
        text,
        x,
        y = 0,
        fontSize: rawFontSize = 24,
        fontFamily = this.fontFamily,
        color,
        textAlign,
        textBaseline,
        fontWeight,
        fontStyle,
        maxWidth
    }: WriteTextOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const itemColor = color || this.color;
        const font = fontFamily || this.fontFamily;
        const item: DrawItem = { type: 'text', id: itemId, text, x: posX, y: posY, fontSize: this.resolveSize(rawFontSize), fontFamily: font, color: itemColor, textAlign, textBaseline, fontWeight, fontStyle, maxWidth };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    drawText = this.writeText;
    
    writeParagraph({
        id,
        text,
        x,
        y = 0,
        width,
        lineHeight = 1.5,
        fontSize: rawFontSize = 24,
        fontFamily = this.fontFamily,
        color,
        textAlign,
        fontWeight,
        fontStyle
    }: WriteParagraphOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const itemColor = color || this.color;
        const font = fontFamily || this.fontFamily;
        const item: DrawItem = { type: 'paragraph', id: itemId, text, x: posX, y: posY, width: this.resolveWidth(width), lineHeight, fontSize: this.resolveSize(rawFontSize), fontFamily: font, color: itemColor, textAlign, fontWeight, fontStyle };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    fillRect({ id, x, y = 0, width, height, radius = 12, fillColor }: FillRectOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const item: DrawItem = { type: 'fillRect', id: itemId, x: posX, y: posY, width: this.resolveWidth(width), height: this.resolveHeight(height), radius: radius ? this.resolveSize(radius) : 0, fillColor };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    drawGradientRect({ id, x, y = 0, width, height, colors, direction = 'vertical' }: DrawGradientRectOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const item: DrawItem = { type: 'gradientRect', id: itemId, x: posX, y: posY, width: this.resolveWidth(width), height: this.resolveHeight(height), colors, direction };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    fillPolygon({ id, points, fillColor }: FillPolygonOptions): string {
        const itemId = id || this.generateId();
        const resolvedPoints = points.map(p => ({ x: this.resolveX(p.x), y: this.resolveY(p.y) }));
        const item: DrawItem = { type: 'fillPolygon', id: itemId, points: resolvedPoints, fillColor };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    drawRect({
        id,
        x,
        y = 0,
        width,
        height,
        color,
        fillColor,
        radius = 12
    }: DrawRectOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const strokeColor = color || this.color;
        const item: DrawItem = { type: 'drawRect', id: itemId, x: posX, y: posY, width: this.resolveWidth(width), height: this.resolveHeight(height), color: strokeColor, fillColor, radius: radius ? this.resolveSize(radius) : undefined, lineWidth: this.lineWidth };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    drawCircle({
        id,
        cx,
        cy = 0,
        radius,
        color,
        fillColor,
        startAngle = 0,
        endAngle = 2 * Math.PI
    }: DrawCircleOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(cx, cy);
        const strokeColor = color || this.color;
        const item: DrawItem = { type: 'circle', id: itemId, cx: posX, cy: posY, radius: this.resolveSize(radius), color: strokeColor, fillColor, startAngle, endAngle, lineWidth: this.lineWidth };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    drawEllipse({
        id,
        cx,
        cy = 0,
        radiusX,
        radiusY,
        rotation = 0,
        color,
        fillColor
    }: DrawEllipseOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(cx, cy);
        const strokeColor = color || this.color;
        const item: DrawItem = { type: 'ellipse', id: itemId, cx: posX, cy: posY, radiusX: this.resolveWidth(radiusX), radiusY: this.resolveHeight(radiusY), rotation, color: strokeColor, fillColor, lineWidth: this.lineWidth };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    drawArc({
        id,
        cx,
        cy = 0,
        radius,
        startAngle,
        endAngle,
        color,
        counterClockwise
    }: DrawArcOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(cx, cy);
        const strokeColor = color || this.color;
        const item: DrawItem = { type: 'arc', id: itemId, cx: posX, cy: posY, radius: this.resolveSize(radius), startAngle, endAngle, color: strokeColor, counterClockwise, lineWidth: this.lineWidth };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    drawImage({
        id,
        src,
        x,
        y = 0,
        width,
        height,
        opacity = 1
    }: DrawImageOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const item: DrawItem = { type: 'image', id: itemId, src, x: posX, y: posY, width: width !== undefined ? this.resolveWidth(width) : undefined, height: height !== undefined ? this.resolveHeight(height) : undefined, opacity };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    writeMath({
        id,
        formula,
        x,
        y = 0,
        fontSize = 24,
        color = '#ffffff',
        fontFamily,
        displayMode = true
    }: WriteMathOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const resolvedSize = this.resolveSize(fontSize);
        const activeFont = fontFamily || this.fontFamily;
        const htmlContent = katex.renderToString(formula, {
            displayMode: displayMode,
            throwOnError: false
        });

        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300">
            <style>
                .katex-mathml { display: none; }
            </style>
            <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="color:${color};font-size:${resolvedSize}px;font-family:${activeFont};line-height:1.2;display:inline-block;">
                    ${htmlContent}
                </div>
            </foreignObject>
        </svg>`;

        const img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

        return this.drawImage({
            id: itemId,
            src: img,
            x: posX,
            y: posY
        });
    }

    drawMath(options: WriteMathOptions): string {
        return this.writeMath(options);
    }

    writeFormula(options: WriteMathOptions): string {
        return this.writeMath(options);
    }

    drawPointer(x: XCoord, y: YCoord, color = '#ff3366', size: SizeCoord = 8, id?: string): string {
        const itemId = id || this.generateId();
        const posX = this.resolveX(x);
        const posY = this.resolveY(y);
        const item: DrawItem = { type: 'pointer', id: itemId, x: posX, y: posY, color, size: this.resolveSize(size) };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    highlightRect(x: XCoord, y: YCoord, width: SizeCoord, height: SizeCoord, color = 'rgba(255, 235, 59, 0.4)', id?: string): string {
        const itemId = id || this.generateId();
        const posX = this.resolveX(x);
        const posY = this.resolveY(y);
        const item: DrawItem = { type: 'highlightRect', id: itemId, x: posX, y: posY, width: this.resolveWidth(width), height: this.resolveHeight(height), color };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    drawGridAxes({ id, x, y = 0, width, height, step = 50, color = '#333' }: DrawGridAxesOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const w = this.resolveWidth(width);
        const h = this.resolveHeight(height);
        const strokeColor = color;
        const originalWidth = this.lineWidth;
        this.setLineWidth(1);
        for (let i = 0; i <= w; i += step) {
            this.drawLine({ x1: posX + i, y1: posY, x2: posX + i, y2: posY + h, color: strokeColor });
        }
        for (let i = 0; i <= h; i += step) {
            this.drawLine({ x1: posX, y1: posY + i, x2: posX + w, y2: posY + i, color: strokeColor });
        }
        this.setLineWidth(2);
        this.drawLine({ x1: posX + w / 2, y1: posY, x2: posX + w / 2, y2: posY + h, color: '#666' });
        this.drawLine({ x1: posX, y1: posY + h / 2, x2: posX + w, y2: posY + h / 2, color: '#666' });
        this.setLineWidth(originalWidth);
        return itemId;
    }

    drawCodeBlock({ id, code, language, x, y = 0, width, height = 0, fontSize = 16 }: DrawCodeBlockOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const lines = code.split('\n');
        const resolvedFontSize = this.resolveSize(fontSize);
        const resolvedHeight = this.resolveHeight(height);
        const h = resolvedHeight > 0 ? resolvedHeight : lines.length * (resolvedFontSize * 1.5) + (language ? 50 : 30);
        const item: DrawItem = { type: 'codeBlock', id: itemId, code, language, x: posX, y: posY, width: this.resolveWidth(width), height: h, fontSize: resolvedFontSize };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    drawTable(options: DrawTableOptions): string {
        const itemId = options.id || this.generateId();
        const { posX, posY } = this.resolveXY(options.x, options.y);
        const cellWidth = options.cellWidth ?? 120;
        const cellHeight = options.cellHeight ?? 36;
        const headerBgColor = options.headerBgColor ?? '#1a2332';
        const headerTextColor = options.headerTextColor ?? '#4dd0e1';
        const rowBgColor = options.rowBgColor ?? '#0f1b26';
        const altRowBgColor = options.altRowBgColor ?? '#142230';
        const textColor = options.textColor ?? '#ffffff';
        const borderColor = options.borderColor ?? '#2a3b50';
        const fontSize = options.fontSize ?? 14;
        const fontFamily = options.fontFamily || this.fontFamily;

        const item: DrawItem = {
            type: 'table',
            id: itemId,
            data: options.data,
            x: posX,
            y: posY,
            cellWidth,
            cellHeight,
            headerBgColor,
            headerTextColor,
            rowBgColor,
            altRowBgColor,
            textColor,
            borderColor,
            fontSize: this.resolveSize(fontSize),
            fontFamily
        };

        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        renderDrawItem(this.ctx, item);
        return itemId;
    }

    createTable = this.drawTable;
    writeTable = this.drawTable;

    drawDiamond({ id, cx, cy = 0, width, height, color = '#000000', fillColor }: DrawDiamondOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(cx, cy);
        const points = getDiamondPolygonPoints({ x: posX, y: posY }, this.resolveWidth(width), this.resolveHeight(height));
        if (fillColor) {
            this.fillPolygon({ points, fillColor });
        }
        this.drawPath([...points, points[0]], color, false);
        return itemId;
    }

    drawPolygon({ id, points, color = '#000000', fillColor }: DrawPolygonOptions): string {
        const itemId = id || this.generateId();
        if (points.length < 3) return itemId;
        const resolvedPoints = points.map(p => ({ x: this.resolveX(p.x), y: this.resolveY(p.y) }));
        if (fillColor) {
            this.fillPolygon({ points: resolvedPoints, fillColor });
        }
        const closedPoints = [...resolvedPoints, resolvedPoints[0]];
        this.drawPath(closedPoints, color, false);
        return itemId;
    }

    drawRegularPolygon({ id, cx, cy = 0, sides = 5, radius = 50, rotation = -90, color = '#000000', fillColor }: DrawRegularPolygonOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(cx, cy);
        if (sides < 3) return itemId;
        const points = getRegularPolygonPoints({ x: posX, y: posY }, sides, this.resolveSize(radius), rotation);
        return this.drawPolygon({ id: itemId, points, color, fillColor });
    }

    drawPolynomial({ id, coefficients, rangeX = [-10, 10], step = 0.2, color = '#000000', scaleX = 20, scaleY = 20, origin }: DrawPolynomialOptions): string {
        const itemId = id || this.generateId();
        let o = { x: this._logicalWidth / 2, y: this._logicalHeight / 2 };
        if (origin) {
            o = { x: this.resolveX(origin.x), y: this.resolveY(origin.y) };
        }
        const points = getPolynomialPoints(coefficients, rangeX, step, scaleX, scaleY, o);
        this.drawPath(points, color, true);
        return itemId;
    }

    drawArrow({ id, x1, y1, x2, y2, color = '#000000', headSize = 12 }: DrawArrowOptions): string {
        const itemId = id || this.generateId();
        this.drawLine({ x1, y1, x2, y2, color });
        const posX1 = this.resolveX(x1);
        const posY1 = this.resolveY(y1);
        const posX2 = this.resolveX(x2);
        const posY2 = this.resolveY(y2);
        const { h1, h2 } = getArrowHeadLines(posX1, posY1, posX2, posY2, headSize);
        this.drawLine({ x1: posX2, y1: posY2, x2: h1.x, y2: h1.y, color });
        this.drawLine({ x1: posX2, y1: posY2, x2: h2.x, y2: h2.y, color });
        return itemId;
    }

    drawPath(points: Point[], color: string, smooth: boolean = true): string {
        const itemId = this.generateId();
        if (points.length < 2) return itemId;
        if (!smooth || points.length < 3) {
            for (let i = 0; i < points.length - 1; i++) {
                this.drawLine({ x1: points[i].x, y1: points[i].y, x2: points[i + 1].x, y2: points[i + 1].y, color });
            }
            return itemId;
        }
        const smoothPoints = getSmoothSplinePoints(points);
        for (let i = 0; i < smoothPoints.length - 1; i++) {
            this.drawLine({ x1: smoothPoints[i].x, y1: smoothPoints[i].y, x2: smoothPoints[i + 1].x, y2: smoothPoints[i + 1].y, color });
        }
        return itemId;
    }

    private slideOutLeftHelper(durationMs: number = 400): Promise<void> {
        return slideOutLeftAnimation(this.canvas, this.ctx, durationMs, () => this.clear());
    }

    slideOutLeft(durationMs: number = 400): Promise<void> {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'slideOutLeft', duration: durationMs });
            return Promise.resolve();
        }
        return this.slideOutLeftHelper(durationMs);
    }

    clearWithSlideLeft = this.slideOutLeft;
    slideLeft = this.slideOutLeft;

    processScript(commands: BoardScriptCommand[]): void {
        this.beginTrigger();
        for (const cmd of commands) {
            switch (cmd.action) {
                case "text":
                    this.writeText({ text: cmd.text, x: cmd.x, y: cmd.y, fontSize: cmd.fontSize, fontFamily: cmd.fontFamily, color: cmd.color, textAlign: cmd.textAlign, fontWeight: cmd.fontWeight, fontStyle: cmd.fontStyle });
                    break;
                case "paragraph":
                    this.writeParagraph({ text: cmd.text, x: cmd.x, y: cmd.y, width: cmd.width, lineHeight: cmd.lineHeight, fontSize: cmd.fontSize, fontFamily: cmd.fontFamily, color: cmd.color, textAlign: cmd.textAlign, fontWeight: cmd.fontWeight, fontStyle: cmd.fontStyle });
                    break;
                case "line":
                    this.drawLine({ x1: cmd.x1, y1: cmd.y1, x2: cmd.x2, y2: cmd.y2, color: cmd.color, lineDash: cmd.lineDash });
                    break;
                case "rect":
                    this.drawRect({ x: cmd.x, y: cmd.y, width: cmd.width, height: cmd.height, color: cmd.color, fillColor: cmd.fillColor, radius: cmd.radius });
                    break;
                case "fillRect":
                    this.fillRect({ x: cmd.x, y: cmd.y, width: cmd.width, height: cmd.height, fillColor: cmd.fillColor, radius: cmd.radius });
                    break;
                case "circle":
                    this.drawCircle({ cx: cmd.cx, cy: cmd.cy, radius: cmd.radius, color: cmd.color, fillColor: cmd.fillColor });
                    break;
                case "ellipse":
                    this.drawEllipse({ cx: cmd.cx, cy: cmd.cy, radiusX: cmd.radiusX, radiusY: cmd.radiusY, rotation: cmd.rotation, color: cmd.color, fillColor: cmd.fillColor });
                    break;
                case "arrow":
                    this.drawArrow({ x1: cmd.x1, y1: cmd.y1, x2: cmd.x2, y2: cmd.y2, color: cmd.color, headSize: cmd.headSize });
                    break;
                case "image":
                    this.drawImage({ src: cmd.src, x: cmd.x, y: cmd.y, width: cmd.width, height: cmd.height, opacity: cmd.opacity });
                    break;
                case "codeBlock":
                    this.drawCodeBlock({ code: cmd.code, language: cmd.language, x: cmd.x, y: cmd.y, width: cmd.width, height: cmd.height, fontSize: cmd.fontSize });
                    break;
                case "table":
                    this.drawTable({ data: cmd.data, x: cmd.x, y: cmd.y, cellWidth: cmd.cellWidth, cellHeight: cmd.cellHeight, headerBgColor: cmd.headerBgColor, headerTextColor: cmd.headerTextColor, rowBgColor: cmd.rowBgColor, altRowBgColor: cmd.altRowBgColor, textColor: cmd.textColor, borderColor: cmd.borderColor, fontSize: cmd.fontSize, fontFamily: cmd.fontFamily });
                    break;
                case "math":
                    this.writeMath({ formula: cmd.formula, x: cmd.x, y: cmd.y, fontSize: cmd.fontSize, color: cmd.color, fontFamily: cmd.fontFamily, displayMode: cmd.displayMode });
                    break;
                case "polygon":
                    this.drawPolygon({ points: cmd.points, color: cmd.color, fillColor: cmd.fillColor });
                    break;
                case "diamond":
                    this.drawDiamond({ cx: cmd.cx, cy: cmd.cy, width: cmd.width, height: cmd.height, color: cmd.color, fillColor: cmd.fillColor });
                    break;
                case "gridAxes":
                    this.drawGridAxes({ x: cmd.x, y: cmd.y, width: cmd.width, height: cmd.height, step: cmd.step, color: cmd.color });
                    break;
                case "gradientRect":
                    this.drawGradientRect({ x: cmd.x, y: cmd.y, width: cmd.width, height: cmd.height, colors: cmd.colors, direction: cmd.direction });
                    break;
                case "pointer":
                    this.drawPointer(cmd.x, cmd.y, cmd.color, cmd.size);
                    break;
                case "highlight":
                    this.highlightRect(cmd.x, cmd.y, cmd.width, cmd.height, cmd.color);
                    break;
                case "wait":
                    this.wait(cmd.duration);
                    break;
                case "clear":
                    this.clear();
                    break;
                case "slideOutLeft":
                    this.slideOutLeft(cmd.duration);
                    break;
                case "setColor":
                    this.setColor(cmd.color);
                    break;
                case "setLineWidth":
                    this.setLineWidth(cmd.width);
                    break;
                case "setSpeed":
                    this.setSpeed(cmd.speed);
                    break;
                case "setBackground":
                    this.setBackground(cmd.color);
                    break;
            }
        }
        this.completeTrigger();
    }
}