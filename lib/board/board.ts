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
    DrawBoxOptions,
    BoardOptions,
    WriteMathOptions,
    XCoord,
    YCoord,
    SemanticPoint,
    SizeCoord,
    BoardScriptCommand
} from './types';
import {
    getSmoothSplinePoints,
    getRectPathPoints,
    getDiamondPolygonPoints,
    getRegularPolygonPoints,
    getPolynomialPoints,
    getArrowHeadLines
} from './shapes';
import {
    runDrawQueueAnimation
} from './animation/runner';
import {
    renderDrawItem
} from './animation/renderers';

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
    DrawBoxOptions,
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
    viewport: HTMLDivElement;

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
    
    fitMode: 'contain' | 'cover' | 'fill' = 'contain';
    hiDpi: boolean = true; // Kept for API compatibility, but unused in DOM
    viewportScale: number = 1;
    viewportOffsetX: number = 0;
    viewportOffsetY: number = 0;
    private resizeObserver: ResizeObserver | null = null;
    renderedItems: Map<string, { item: DrawItem, node: HTMLElement | SVGElement }> = new Map();
    private stateStack: { color: string; lineWidth: number; opacity: number; lineDash: number[] }[] = [];
    
    private currentOpacity: number = 1;
    private currentLineDash: number[] = [];

    constructor(id: string, width: number, height: number, options?: BoardOptions) {
        this.id = id;
        this.speed = options?.speed ?? 15;
        if (options?.fontFamily) {
            this.fontFamily = options.fontFamily;
        }
        this.fitMode = options?.fitMode ?? 'contain';
        this.hiDpi = options?.hiDpi ?? true;
        this._logicalWidth = width;
        this._logicalHeight = height;
        this.container = document.getElementById(id)! as HTMLDivElement;

        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.width = '100%';
        this.container.style.height = '100%';

        this.viewport = document.createElement('div');
        this.viewport.style.position = 'absolute';
        this.viewport.style.left = '0';
        this.viewport.style.top = '0';
        this.viewport.style.width = `${this._logicalWidth}px`;
        this.viewport.style.height = `${this._logicalHeight}px`;
        this.viewport.style.transformOrigin = '0 0';
        this.container.appendChild(this.viewport);

        this.updateViewport();

        if (options?.background) {
            this.setBackground(options.background);
        }

        if (options?.responsive !== false) {
            this.initResizeObserver();
        }
    }

    private initResizeObserver() {
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                this.updateViewport();
            });
            this.resizeObserver.observe(this.container);
        }
    }

    public updateViewport() {
        const containerWidth = this.container.clientWidth || this._logicalWidth;
        const containerHeight = this.container.clientHeight || this._logicalHeight;

        const scaleX = containerWidth / this._logicalWidth;
        const scaleY = containerHeight / this._logicalHeight;

        if (this.fitMode === 'contain') {
            const scale = Math.min(scaleX, scaleY);
            this.viewportScale = scale;
            this.viewportOffsetX = (containerWidth - this._logicalWidth * scale) / 2;
            this.viewportOffsetY = (containerHeight - this._logicalHeight * scale) / 2;
        } else if (this.fitMode === 'cover') {
            const scale = Math.max(scaleX, scaleY);
            this.viewportScale = scale;
            this.viewportOffsetX = (containerWidth - this._logicalWidth * scale) / 2;
            this.viewportOffsetY = (containerHeight - this._logicalHeight * scale) / 2;
        } else {
            this.viewportScale = scaleX;
            this.viewportOffsetX = 0;
            this.viewportOffsetY = 0;
        }

        this.applyViewportTransform();
    }

    public applyViewportTransform() {
        if (this.fitMode === 'fill') {
            const containerWidth = this.container.clientWidth || this._logicalWidth;
            const containerHeight = this.container.clientHeight || this._logicalHeight;
            const scaleX = containerWidth / this._logicalWidth;
            const scaleY = containerHeight / this._logicalHeight;
            this.viewport.style.transform = `scale(${scaleX}, ${scaleY})`;
        } else {
            this.viewport.style.transform = `translate(${this.viewportOffsetX}px, ${this.viewportOffsetY}px) scale(${this.viewportScale})`;
        }
    }

    public redraw() {
        // With DOM, redraw is usually not needed just for resize,
        // but we keep it for API compatibility.
        this.updateViewport();
    }

    public clientToLogical(clientX: number, clientY: number): Point {
        const rect = this.container.getBoundingClientRect();
        const containerX = clientX - rect.left;
        const containerY = clientY - rect.top;
        if (this.fitMode === 'fill') {
            const containerWidth = this.container.clientWidth || this._logicalWidth;
            const containerHeight = this.container.clientHeight || this._logicalHeight;
            return {
                x: containerX / (containerWidth / this._logicalWidth),
                y: containerY / (containerHeight / this._logicalHeight)
            };
        }
        return {
            x: (containerX - this.viewportOffsetX) / (this.viewportScale || 1),
            y: (containerY - this.viewportOffsetY) / (this.viewportScale || 1)
        };
    }

    public destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        this.viewport.innerHTML = '';
        this.renderedItems.clear();
    }

    private renderDirect(item: DrawItem) {
        const node = renderDrawItem(item);
        if (node) {
            this.viewport.appendChild(node);
            if ('id' in item && item.id) {
                this.renderedItems.set(item.id, { item, node });
            }
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
        if (typeof x === 'number') return Math.max(x, 25);
        if (typeof x === 'string' && x.endsWith('%')) {
            const val = parseFloat(x);
            const calculated = !isNaN(val) ? (val / 100) * this._logicalWidth : 0;
            return Math.max(calculated, 25);
        }
        if (x === 'center') return this._logicalWidth / 2;
        if (x === 'left') return 25;
        if (x === 'right') return this._logicalWidth - 25;
        return 25;
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
        this.currentOpacity = Math.max(0, Math.min(1, alpha));
    }

    setLineDash(segments: number[]) {
        this.currentLineDash = segments;
    }

    save() {
        this.stateStack.push({
            color: this.color,
            lineWidth: this.lineWidth,
            opacity: this.currentOpacity,
            lineDash: [...this.currentLineDash]
        });
    }

    restore() {
        const state = this.stateStack.pop();
        if (state) {
            this.color = state.color;
            this.lineWidth = state.lineWidth;
            this.currentOpacity = state.opacity;
            this.currentLineDash = state.lineDash;
        }
    }

    setBackground(color: string) {
        this.container.style.backgroundColor = color;
    }

    clear() {
        this.renderedItems.clear();
        this.viewport.innerHTML = '';
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
        } else {
            const el = this.renderedItems.get(id);
            if (el && el.node.parentNode) {
                el.node.parentNode.removeChild(el.node);
            }
            this.renderedItems.delete(id);
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
        // Note: we'd need current coords to calculate dx/dy but runner doesn't use targetX/targetY right now.
        // For DOM, move action needs to know relative dx, dy if we are using translate.
        // Simplified version for DOM compatibility.
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
            this.viewport,
            this.drawQueue,
            this.speed,
            () => {
                this.isAnimating = false;
            },
            (duration) => this.slideOutLeftHelper(duration),
            this.renderedItems
        );
    }

    drawLine({ id, x1, y1, x2, y2, color, lineDash }: DrawLineOptions): string {
        const itemId = id || this.generateId();
        const posX1 = this.resolveX(x1);
        const posY1 = this.resolveY(y1);
        const posX2 = this.resolveX(x2);
        const posY2 = this.resolveY(y2);
        const strokeColor = color || this.color;
        const item: DrawItem = { type: 'line', id: itemId, x1: posX1, y1: posY1, x2: posX2, y2: posY2, color: strokeColor, lineWidth: this.lineWidth, lineDash: lineDash || (this.currentLineDash.length > 0 ? this.currentLineDash : undefined) };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        this.renderDirect(item);
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
        textDecoration,
        underline,
        maxWidth
    }: WriteTextOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const itemColor = color || this.color;
        const font = fontFamily || this.fontFamily;
        const item: DrawItem = { type: 'text', id: itemId, text, x: posX, y: posY, fontSize: this.resolveSize(rawFontSize), fontFamily: font, color: itemColor, textAlign, textBaseline, fontWeight, fontStyle, textDecoration, underline, maxWidth };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        this.renderDirect(item);
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
        fontStyle,
        textDecoration,
        underline
    }: WriteParagraphOptions): string {
        const itemId = id || this.generateId();
        const { posX, posY } = this.resolveXY(x, y);
        const itemColor = color || this.color;
        const font = fontFamily || this.fontFamily;
        const item: DrawItem = { type: 'paragraph', id: itemId, text, x: posX, y: posY, width: this.resolveWidth(width), lineHeight, fontSize: this.resolveSize(rawFontSize), fontFamily: font, color: itemColor, textAlign, fontWeight, fontStyle, textDecoration, underline };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        this.renderDirect(item);
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
        this.renderDirect(item);
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
        this.renderDirect(item);
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
        this.renderDirect(item);
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
        this.renderDirect(item);
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
        const item: DrawItem = { type: 'circle', id: itemId, cx: posX, cy: posY, radius: this.resolveSize(radius), color: strokeColor, fillColor, startAngle, endAngle, lineWidth: this.lineWidth, lineDash: this.currentLineDash.length > 0 ? this.currentLineDash : undefined };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        this.renderDirect(item);
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
        const item: DrawItem = { type: 'ellipse', id: itemId, cx: posX, cy: posY, radiusX: this.resolveWidth(radiusX), radiusY: this.resolveHeight(radiusY), rotation, color: strokeColor, fillColor, lineWidth: this.lineWidth, lineDash: this.currentLineDash.length > 0 ? this.currentLineDash : undefined };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        this.renderDirect(item);
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
        const item: DrawItem = { type: 'arc', id: itemId, cx: posX, cy: posY, radius: this.resolveSize(radius), startAngle, endAngle, color: strokeColor, counterClockwise, lineWidth: this.lineWidth, lineDash: this.currentLineDash.length > 0 ? this.currentLineDash : undefined };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        this.renderDirect(item);
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
        this.renderDirect(item);
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
        
        const item: DrawItem = {
            type: 'math',
            id: itemId,
            formula,
            x: posX,
            y: posY,
            fontSize: resolvedSize,
            color,
            fontFamily: activeFont,
            displayMode
        };

        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        this.renderDirect(item);
        return itemId;
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
        this.renderDirect(item);
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
        this.renderDirect(item);
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
        const resolvedFontSize = this.resolveSize(fontSize);
        const resolvedHeight = this.resolveHeight(height);
        
        const item: DrawItem = { type: 'codeBlock', id: itemId, code, language, x: posX, y: posY, width: this.resolveWidth(width), height: resolvedHeight, fontSize: resolvedFontSize };
        if (this.isRecording) {
            this.drawQueue.push(item);
            return itemId;
        }
        this.renderDirect(item);
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
        this.renderDirect(item);
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

    estimateCommandSize(cmd: BoardScriptCommand): { w: number; h: number } {
        switch (cmd.action) {
            case 'text': {
                const fs = cmd.fontSize ? this.resolveSize(cmd.fontSize) : 18;
                const lines = (cmd.text || '').split('\n');
                let maxLen = 0;
                lines.forEach((l) => { if (l.length > maxLen) maxLen = l.length; });
                return { w: maxLen * fs * 0.6, h: lines.length * fs * 1.2 };
            }
            case 'paragraph': {
                const fs = cmd.fontSize ? this.resolveSize(cmd.fontSize) : 16;
                const w = this.resolveWidth(cmd.width);
                const approxLines = Math.max(1, Math.ceil(((cmd.text || '').length * fs * 0.5) / w));
                return { w, h: approxLines * fs * (cmd.lineHeight || 1.4) };
            }
            case 'rect':
            case 'fillRect':
            case 'gradientRect': {
                return { w: this.resolveWidth(cmd.width), h: this.resolveHeight(cmd.height) };
            }
            case 'circle': {
                const r = this.resolveSize(cmd.radius);
                return { w: r * 2, h: r * 2 };
            }
            case 'ellipse': {
                const rx = this.resolveSize(cmd.radiusX);
                const ry = this.resolveSize(cmd.radiusY);
                return { w: rx * 2, h: ry * 2 };
            }
            case 'diamond': {
                return { w: this.resolveWidth(cmd.width), h: this.resolveHeight(cmd.height) };
            }
            case 'codeBlock': {
                const w = this.resolveWidth(cmd.width);
                const h = cmd.height ? this.resolveHeight(cmd.height) : 120;
                return { w, h };
            }
            case 'table': {
                const cols = cmd.data?.[0]?.length || 1;
                const rows = cmd.data?.length || 1;
                const cw = cmd.cellWidth || 100;
                const ch = cmd.cellHeight || 36;
                return { w: cols * cw, h: rows * ch };
            }
            case 'math': {
                const fs = cmd.fontSize ? this.resolveSize(cmd.fontSize) : 22;
                return { w: Math.max(80, (cmd.formula || '').length * fs * 0.55), h: fs * 1.8 };
            }
            case 'image': {
                const w = cmd.width ? this.resolveWidth(cmd.width) : 120;
                const h = cmd.height ? this.resolveHeight(cmd.height) : 120;
                return { w, h };
            }
            case 'line':
            case 'arrow': {
                const x1 = this.resolveX(cmd.x1);
                const x2 = this.resolveX(cmd.x2);
                const y1 = this.resolveY(cmd.y1);
                const y2 = this.resolveY(cmd.y2);
                return { w: Math.max(20, Math.abs(x2 - x1)), h: Math.max(20, Math.abs(y2 - y1)) };
            }
            case 'box': {
                const gap = cmd.gap ?? 12;
                const isRow = cmd.direction === 'horizontal' || cmd.direction === 'row' || !cmd.direction;
                const items = cmd.items || [];
                const childSizes = items.map((child) => this.estimateCommandSize(child));
                let cW = 0, cH = 0;
                if (isRow) {
                    childSizes.forEach((sz, idx) => {
                        cW += sz.w + (idx > 0 ? gap : 0);
                        cH = Math.max(cH, sz.h);
                    });
                } else {
                    childSizes.forEach((sz, idx) => {
                        cW = Math.max(cW, sz.w);
                        cH += sz.h + (idx > 0 ? gap : 0);
                    });
                }
                let pTop = 16, pRight = 16, pBottom = 16, pLeft = 16;
                if (typeof cmd.padding === 'number') {
                    pTop = pRight = pBottom = pLeft = cmd.padding;
                } else if (cmd.padding && typeof cmd.padding === 'object') {
                    pTop = cmd.padding.top ?? 16;
                    pRight = cmd.padding.right ?? 16;
                    pBottom = cmd.padding.bottom ?? 16;
                    pLeft = cmd.padding.left ?? 16;
                }
                const finalW = (cmd.width === undefined || cmd.width === 'auto') ? (cW + pLeft + pRight) : this.resolveWidth(cmd.width as SizeCoord);
                const finalH = (cmd.height === undefined || cmd.height === 'auto') ? (cH + pTop + pBottom) : this.resolveHeight(cmd.height as SizeCoord);
                return { w: finalW, h: finalH };
            }
            default:
                return { w: 60, h: 40 };
        }
    }

    private offsetCommand(cmd: BoardScriptCommand, itemX: number, itemY: number, sz: { w: number; h: number }): BoardScriptCommand {
        const copy: any = { ...cmd };
        switch (cmd.action) {
            case 'text':
                copy.x = itemX;
                copy.y = itemY;
                break;
            case 'paragraph':
            case 'rect':
            case 'fillRect':
            case 'gradientRect':
            case 'codeBlock':
            case 'table':
            case 'image':
            case 'box':
                copy.x = itemX;
                copy.y = itemY;
                break;
            case 'circle':
            case 'ellipse':
            case 'diamond':
                copy.cx = itemX + sz.w / 2;
                copy.cy = itemY + sz.h / 2;
                break;
            case 'math':
                copy.x = itemX;
                copy.y = itemY;
                break;
            case 'line':
            case 'arrow':
                copy.x1 = itemX;
                copy.y1 = itemY + sz.h / 2;
                copy.x2 = itemX + sz.w;
                copy.y2 = itemY + sz.h / 2;
                break;
        }
        return copy;
    }

    drawBox(options: DrawBoxOptions): string {
        const itemId = options.id || this.generateId();
        const items = options.items || [];
        const gap = options.gap ?? 12;
        const isRow = options.direction === 'horizontal' || options.direction === 'row' || !options.direction;
        const alignH = options.alignHorizontal ?? 'center';
        const alignV = options.alignVertical ?? 'center';

        let pTop = 16, pRight = 16, pBottom = 16, pLeft = 16;
        if (typeof options.padding === 'number') {
            pTop = pRight = pBottom = pLeft = options.padding;
        } else if (options.padding && typeof options.padding === 'object') {
            pTop = options.padding.top ?? 16;
            pRight = options.padding.right ?? 16;
            pBottom = options.padding.bottom ?? 16;
            pLeft = options.padding.left ?? 16;
        }

        const itemSizes = items.map((cmd) => this.estimateCommandSize(cmd));

        let contentWidth = 0;
        let contentHeight = 0;

        if (isRow) {
            let totalW = 0;
            let maxH = 0;
            itemSizes.forEach((sz, idx) => {
                totalW += sz.w + (idx > 0 ? gap : 0);
                maxH = Math.max(maxH, sz.h);
            });
            contentWidth = totalW;
            contentHeight = maxH;
        } else {
            let maxW = 0;
            let totalH = 0;
            itemSizes.forEach((sz, idx) => {
                maxW = Math.max(maxW, sz.w);
                totalH += sz.h + (idx > 0 ? gap : 0);
            });
            contentWidth = maxW;
            contentHeight = totalH;
        }

        const calculatedWidth = contentWidth + pLeft + pRight;
        const calculatedHeight = contentHeight + pTop + pBottom;

        const boxW = (options.width === undefined || options.width === 'auto')
            ? calculatedWidth
            : this.resolveWidth(options.width as SizeCoord);
        const boxH = (options.height === undefined || options.height === 'auto')
            ? calculatedHeight
            : this.resolveHeight(options.height as SizeCoord);

        const { posX: rawX, posY: rawY } = this.resolveXY(options.x ?? 'center', options.y ?? 'center');

        let boxX = rawX;
        if (options.x === 'center' || options.x === undefined) {
            boxX = rawX - boxW / 2;
        }
        let boxY = rawY;
        if (options.y === 'center' || options.y === undefined) {
            boxY = rawY - boxH / 2;
        }

        if (options.fillColor || options.color) {
            this.drawRect({
                id: itemId + '_bg',
                x: boxX,
                y: boxY,
                width: boxW,
                height: boxH,
                color: options.color,
                fillColor: options.fillColor,
                radius: options.radius ?? 12,
            });
        }

        if (options.title) {
            this.writeText({
                id: itemId + '_title',
                text: options.title,
                x: boxX + pLeft,
                y: boxY + Math.min(pTop, 16),
                fontSize: 14,
                fontWeight: 'bold',
                color: options.color || this.color,
            });
        }

        const contentAreaX = boxX + pLeft;
        const contentAreaY = boxY + pTop;
        const contentAreaW = Math.max(0, boxW - pLeft - pRight);
        const contentAreaH = Math.max(0, boxH - pTop - pBottom);

        if (isRow) {
            let startX = contentAreaX;
            if (alignH === 'center') {
                startX = contentAreaX + (contentAreaW - contentWidth) / 2;
            } else if (alignH === 'right') {
                startX = contentAreaX + contentAreaW - contentWidth;
            }

            let currX = startX;
            items.forEach((cmd, idx) => {
                const sz = itemSizes[idx];
                let itemY = contentAreaY;
                if (alignV === 'center') {
                    itemY = contentAreaY + (contentAreaH - sz.h) / 2;
                } else if (alignV === 'bottom') {
                    itemY = contentAreaY + contentAreaH - sz.h;
                }

                const positionedCmd = this.offsetCommand(cmd, currX, itemY, sz);
                this.processScript([positionedCmd]);

                currX += sz.w + gap;
            });
        } else {
            let startY = contentAreaY;
            if (alignV === 'center') {
                startY = contentAreaY + (contentAreaH - contentHeight) / 2;
            } else if (alignV === 'bottom') {
                startY = contentAreaY + contentAreaH - contentHeight;
            }

            let currY = startY;
            items.forEach((cmd, idx) => {
                const sz = itemSizes[idx];
                let itemX = contentAreaX;
                if (alignH === 'center') {
                    itemX = contentAreaX + (contentAreaW - sz.w) / 2;
                } else if (alignH === 'right') {
                    itemX = contentAreaX + contentAreaW - sz.w;
                }

                const positionedCmd = this.offsetCommand(cmd, itemX, currY, sz);
                this.processScript([positionedCmd]);

                currY += sz.h + gap;
            });
        }

        return itemId;
    }

    private slideOutLeftHelper(durationMs: number = 400): Promise<void> {
        return new Promise((resolve) => {
            this.viewport.style.transition = `transform ${durationMs}ms ease-in-out`;
            this.viewport.style.transform = `translate(-100vw, ${this.viewportOffsetY}px) scale(${this.viewportScale})`;
            setTimeout(() => {
                this.clear();
                this.viewport.style.transition = 'none';
                this.applyViewportTransform();
                resolve();
            }, durationMs);
        });
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
                    this.writeText({ text: cmd.text, x: cmd.x, y: cmd.y, fontSize: cmd.fontSize, fontFamily: cmd.fontFamily, color: cmd.color, textAlign: cmd.textAlign, fontWeight: cmd.fontWeight, fontStyle: cmd.fontStyle, textDecoration: cmd.textDecoration, underline: cmd.underline });
                    break;
                case "paragraph":
                    this.writeParagraph({ text: cmd.text, x: cmd.x, y: cmd.y, width: cmd.width, lineHeight: cmd.lineHeight, fontSize: cmd.fontSize, fontFamily: cmd.fontFamily, color: cmd.color, textAlign: cmd.textAlign, fontWeight: cmd.fontWeight, fontStyle: cmd.fontStyle, textDecoration: cmd.textDecoration, underline: cmd.underline });
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
                case "box":
                    this.drawBox(cmd);
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