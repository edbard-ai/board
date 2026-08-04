export interface Point {
    x: number;
    y: number;
}

export type XCoord = number | 'center' | 'left' | 'right' | `${number}%`;
export type YCoord = number | 'center' | 'top' | 'bottom' | `${number}%`;
export type SizeCoord = number | `${number}%`;

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
    | { type: 'math'; id: string; formula: string; x: number; y: number; fontSize: number; fontFamily: string; color: string; displayMode: boolean }
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
    fontSize?: SizeCoord;
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
    width: SizeCoord;
    lineHeight?: number;
    fontSize?: SizeCoord;
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
    width: SizeCoord;
    height: SizeCoord;
    radius?: SizeCoord;
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
    width: SizeCoord;
    height: SizeCoord;
    color?: string;
    fillColor?: string;
    radius?: SizeCoord;
}

export interface DrawDiamondOptions {
    id?: string;
    cx: XCoord | SemanticPoint;
    cy?: YCoord;
    width: SizeCoord;
    height: SizeCoord;
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
    radius?: SizeCoord;
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
    radius: SizeCoord;
    color?: string;
    fillColor?: string;
    startAngle?: number;
    endAngle?: number;
}

export interface DrawEllipseOptions {
    id?: string;
    cx: XCoord | SemanticPoint;
    cy?: YCoord;
    radiusX: SizeCoord;
    radiusY: SizeCoord;
    rotation?: number;
    color?: string;
    fillColor?: string;
}

export interface DrawArcOptions {
    id?: string;
    cx: XCoord | SemanticPoint;
    cy?: YCoord;
    radius: SizeCoord;
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
    width?: SizeCoord;
    height?: SizeCoord;
    opacity?: number;
}

export interface DrawGradientRectOptions {
    id?: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width: SizeCoord;
    height: SizeCoord;
    colors: string[];
    direction?: 'horizontal' | 'vertical' | 'diagonal';
}

export interface DrawGridAxesOptions {
    id?: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width: SizeCoord;
    height: SizeCoord;
    step?: number;
    color?: string;
}

export interface DrawCodeBlockOptions {
    id?: string;
    code: string;
    language?: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    width: SizeCoord;
    height?: SizeCoord;
    fontSize?: SizeCoord;
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
    fontSize?: SizeCoord;
    fontFamily?: string;
}

export interface BoardOptions {
    width?: SizeCoord;
    height?: SizeCoord;
    speed?: number;
    background?: string;
    hiDpi?: boolean;
    fontFamily?: string;
    fitMode?: 'contain' | 'cover' | 'fill';
    responsive?: boolean;
}

export interface WriteMathOptions {
    id?: string;
    formula: string;
    x: XCoord | SemanticPoint;
    y?: YCoord;
    fontSize?: SizeCoord;
    color?: string;
    fontFamily?: string;
    displayMode?: boolean;
}

export interface DrawBoxOptions {
    id?: string;
    x?: XCoord | SemanticPoint;
    y?: YCoord;
    width?: SizeCoord | 'auto';
    height?: SizeCoord | 'auto';
    padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    gap?: number;
    direction?: 'horizontal' | 'vertical' | 'row' | 'column';
    alignHorizontal?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
    alignVertical?: 'top' | 'center' | 'bottom' | 'space-between' | 'space-around';
    wrap?: boolean;
    color?: string;
    fillColor?: string;
    radius?: SizeCoord;
    title?: string;
    items?: BoardScriptCommand[];
}

export type BoardScriptCommand =
    | { action: "text"; text: string; x: XCoord; y?: YCoord; fontSize?: SizeCoord; fontFamily?: string; color?: string; textAlign?: CanvasTextAlign; fontWeight?: string; fontStyle?: string }
    | { action: "paragraph"; text: string; x: XCoord; y?: YCoord; width: SizeCoord; lineHeight?: number; fontSize?: SizeCoord; fontFamily?: string; color?: string; textAlign?: CanvasTextAlign; fontWeight?: string; fontStyle?: string }
    | { action: "line"; x1: XCoord; y1: YCoord; x2: XCoord; y2: YCoord; color?: string; lineDash?: number[] }
    | { action: "rect"; x: XCoord; y?: YCoord; width: SizeCoord; height: SizeCoord; color?: string; fillColor?: string; radius?: SizeCoord }
    | { action: "fillRect"; x: XCoord; y?: YCoord; width: SizeCoord; height: SizeCoord; fillColor: string; radius?: SizeCoord }
    | { action: "circle"; cx: XCoord; cy?: YCoord; radius: SizeCoord; color?: string; fillColor?: string }
    | { action: "ellipse"; cx: XCoord; cy?: YCoord; radiusX: SizeCoord; radiusY: SizeCoord; rotation?: number; color?: string; fillColor?: string }
    | { action: "arrow"; x1: XCoord; y1: YCoord; x2: XCoord; y2: YCoord; color?: string; headSize?: number }
    | { action: "image"; src: string; x: XCoord; y?: YCoord; width?: SizeCoord; height?: SizeCoord; opacity?: number }
    | { action: "codeBlock"; code: string; language?: string; x: XCoord; y?: YCoord; width: SizeCoord; height?: SizeCoord; fontSize?: SizeCoord }
    | { action: "table"; data: string[][]; x: XCoord; y?: YCoord; cellWidth?: number; cellHeight?: number; headerBgColor?: string; headerTextColor?: string; rowBgColor?: string; altRowBgColor?: string; textColor?: string; borderColor?: string; fontSize?: SizeCoord; fontFamily?: string }
    | { action: "math"; formula: string; x: XCoord; y?: YCoord; fontSize?: SizeCoord; color?: string; fontFamily?: string; displayMode?: boolean }
    | { action: "polygon"; points: SemanticPoint[]; color?: string; fillColor?: string }
    | { action: "diamond"; cx: XCoord; cy?: YCoord; width: SizeCoord; height: SizeCoord; color?: string; fillColor?: string }
    | { action: "gridAxes"; x: XCoord; y?: YCoord; width: SizeCoord; height: SizeCoord; step?: number; color?: string }
    | { action: "gradientRect"; x: XCoord; y?: YCoord; width: SizeCoord; height: SizeCoord; colors: string[]; direction?: "horizontal" | "vertical" | "diagonal" }
    | { action: "pointer"; x: XCoord; y: YCoord; color?: string; size?: SizeCoord }
    | { action: "highlight"; x: XCoord; y: YCoord; width: SizeCoord; height: SizeCoord; color?: string }
    | { action: "box"; x?: XCoord | SemanticPoint; y?: YCoord; width?: SizeCoord | 'auto'; height?: SizeCoord | 'auto'; padding?: number | { top?: number; right?: number; bottom?: number; left?: number }; gap?: number; direction?: 'horizontal' | 'vertical' | 'row' | 'column'; alignHorizontal?: 'left' | 'center' | 'right' | 'space-between' | 'space-around'; alignVertical?: 'top' | 'center' | 'bottom' | 'space-between' | 'space-around'; wrap?: boolean; color?: string; fillColor?: string; radius?: SizeCoord; title?: string; items?: BoardScriptCommand[] }
    | { action: "wait"; duration: number }
    | { action: "clear" }
    | { action: "slideOutLeft"; duration?: number }
    | { action: "setColor"; color: string }
    | { action: "setLineWidth"; width: number }
    | { action: "setSpeed"; speed: number }
    | { action: "setBackground"; color: string };

