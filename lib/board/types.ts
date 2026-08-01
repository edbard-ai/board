export interface Point {
    x: number;
    y: number;
}

export type XCoord = number | 'center' | 'left' | 'right';
export type YCoord = number | 'center' | 'top' | 'bottom';

export interface SemanticPoint {
    x: XCoord;
    y: YCoord;
}

export type DrawItem =
    | { type: 'line'; id: string; x1: number; y1: number; x2: number; y2: number; color: string; lineWidth: number; lineDash?: number[] }
    | { type: 'text'; id: string; text: string; x: number; y: number; fontSize: number; fontFamily: string; color: string; textAlign?: CanvasTextAlign; textBaseline?: CanvasTextBaseline; fontWeight?: string; fontStyle?: string; maxWidth?: number }
    | { type: 'paragraph'; id: string; text: string; x: number; y: number; width: number; lineHeight: number; fontSize: number; fontFamily: string; color: string; textAlign?: CanvasTextAlign; fontWeight?: string; fontStyle?: string }
    | { type: 'fillRect'; id: string; x: number; y: number; width: number; height: number; radius: number; fillColor: string }
    | { type: 'fillPolygon'; id: string; points: Point[]; fillColor: string }
    | { type: 'drawRect'; id: string; x: number; y: number; width: number; height: number; color?: string; fillColor?: string; radius?: number; lineWidth?: number }
    | { type: 'circle'; id: string; cx: number; cy: number; radius: number; color?: string; fillColor?: string; startAngle?: number; endAngle?: number; lineWidth: number; lineDash?: number[] }
    | { type: 'ellipse'; id: string; cx: number; cy: number; radiusX: number; radiusY: number; rotation?: number; color?: string; fillColor?: string; lineWidth: number; lineDash?: number[] }
    | { type: 'arc'; id: string; cx: number; cy: number; radius: number; startAngle: number; endAngle: number; color: string; counterClockwise?: boolean; lineWidth: number; lineDash?: number[] }
    | { type: 'image'; id: string; src: string | HTMLImageElement; x: number; y: number; width?: number; height?: number; opacity?: number }
    | { type: 'gradientRect'; id: string; x: number; y: number; width: number; height: number; colors: string[]; direction?: 'horizontal' | 'vertical' | 'diagonal' }
    | { type: 'pointer'; id: string; x: number; y: number; color: string; size: number }
    | { type: 'highlightRect'; id: string; x: number; y: number; width: number; height: number; color: string }
    | { type: 'codeBlock'; id: string; code: string; language?: string; x: number; y: number; width: number; height: number; fontSize?: number }
    | { type: 'table'; id: string; data: string[][]; x: number; y: number; cellWidth: number; cellHeight: number; headerBgColor: string; headerTextColor: string; rowBgColor: string; altRowBgColor: string; textColor: string; borderColor: string; fontSize: number; fontFamily: string }
    | { type: 'slideOutLeft'; duration: number }
    | { type: 'wait'; duration: number }
    | { type: 'delete'; id: string; duration?: number }
    | { type: 'move'; id: string; dx?: number; dy?: number; targetX?: number; targetY?: number; duration?: number }
    | { type: 'changeColor'; id: string; color: string; duration?: number };

export interface DrawLineOptions {
    id?: string;
    x1: XCoord;
    y1: YCoord;
    x2: XCoord;
    y2: YCoord;
    color?: string;
    lineDash?: number[];
}

export interface WriteTextOptions {
    id?: string;
    text: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    fontWeight?: string;
    fontStyle?: string;
    maxWidth?: number;
}

export interface WriteParagraphOptions {
    id?: string;
    text: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width: number;
    lineHeight?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: CanvasTextAlign;
    fontWeight?: string;
    fontStyle?: string;
}

export interface FillRectOptions {
    id?: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width: number;
    height: number;
    radius?: number;
    fillColor: string;
}

export interface FillPolygonOptions {
    id?: string;
    points: SemanticPoint[];
    fillColor: string;
}

export interface DrawRectOptions {
    id?: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width: number;
    height: number;
    color?: string;
    fillColor?: string;
    radius?: number;
}

export interface DrawDiamondOptions {
    id?: string;
    cx: XCoord | SemanticPoint;
    cy?: YCoord;
    width: number;
    height: number;
    color?: string;
    fillColor?: string;
}

export interface DrawPolygonOptions {
    id?: string;
    points: SemanticPoint[];
    color?: string;
    fillColor?: string;
}

export interface DrawRegularPolygonOptions {
    id?: string;
    cx: XCoord | SemanticPoint;
    cy?: YCoord;
    sides?: number;
    radius?: number;
    rotation?: number;
    color?: string;
    fillColor?: string;
}

export interface DrawPolynomialOptions {
    id?: string;
    coefficients: number[];
    rangeX?: [number, number];
    step?: number;
    color?: string;
    scaleX?: number;
    scaleY?: number;
    origin?: SemanticPoint;
}

export interface DrawArrowOptions {
    id?: string;
    x1: XCoord;
    y1: YCoord;
    x2: XCoord;
    y2: YCoord;
    color?: string;
    headSize?: number;
}

export interface DrawCircleOptions {
    id?: string;
    cx: XCoord | SemanticPoint;
    cy?: YCoord;
    radius: number;
    color?: string;
    fillColor?: string;
    startAngle?: number;
    endAngle?: number;
}

export interface DrawEllipseOptions {
    id?: string;
    cx: XCoord | SemanticPoint;
    cy?: YCoord;
    radiusX: number;
    radiusY: number;
    rotation?: number;
    color?: string;
    fillColor?: string;
}

export interface DrawArcOptions {
    id?: string;
    cx: XCoord | SemanticPoint;
    cy?: YCoord;
    radius: number;
    startAngle: number;
    endAngle: number;
    color?: string;
    counterClockwise?: boolean;
}

export interface DrawImageOptions {
    id?: string;
    src: string | HTMLImageElement;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width?: number;
    height?: number;
    opacity?: number;
}

export interface DrawGradientRectOptions {
    id?: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width: number;
    height: number;
    colors: string[];
    direction?: 'horizontal' | 'vertical' | 'diagonal';
}

export interface DrawGridAxesOptions {
    id?: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width: number;
    height: number;
    step?: number;
    color?: string;
}

export interface DrawCodeBlockOptions {
    id?: string;
    code: string;
    language?: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width: number;
    height?: number;
    fontSize?: number;
}

export interface DrawTableOptions {
    id?: string;
    data: string[][];
    x: XCoord | SemanticPoint;
    y?: YCoord;
    cellWidth?: number;
    cellHeight?: number;
    headerBgColor?: string;
    headerTextColor?: string;
    rowBgColor?: string;
    altRowBgColor?: string;
    textColor?: string;
    borderColor?: string;
    fontSize?: number;
    fontFamily?: string;
}

export interface BoardOptions {
    width?: number;
    height?: number;
    speed?: number;
    background?: string;
    hiDpi?: boolean;
    fontFamily?: string;
}
