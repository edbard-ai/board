import { Point } from './types';

export function getCatmullRomPoint(
    p0: Point,
    p1: Point,
    p2: Point,
    p3: Point,
    t: number
): Point {
    const t2 = t * t;
    const t3 = t2 * t;

    const f0 = -0.5 * t3 + t2 - 0.5 * t;
    const f1 = 1.5 * t3 - 2.5 * t2 + 1.0;
    const f2 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
    const f3 = 0.5 * t3 - 0.5 * t2;

    return {
        x: p0.x * f0 + p1.x * f1 + p2.x * f2 + p3.x * f3,
        y: p0.y * f0 + p1.y * f1 + p2.y * f2 + p3.y * f3
    };
}

export function getSmoothSplinePoints(points: Point[], stepsPerSegment: number = 10): Point[] {
    if (points.length < 3) return points;

    const smoothPoints: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        for (let t = 0; t < 1; t += 1 / stepsPerSegment) {
            smoothPoints.push(getCatmullRomPoint(p0, p1, p2, p3, t));
        }
    }
    smoothPoints.push(points[points.length - 1]);
    return smoothPoints;
}

export function getRectPathPoints(posX: number, posY: number, width: number, height: number, radius: number = 12): Point[] {
    const r = Math.min(radius, width / 2, height / 2);
    return [
        { x: posX + r, y: posY },
        { x: posX + width - r, y: posY },
        { x: posX + width, y: posY + r },
        { x: posX + width, y: posY + height - r },
        { x: posX + width - r, y: posY + height },
        { x: posX + r, y: posY + height },
        { x: posX, y: posY + height - r },
        { x: posX, y: posY + r },
        { x: posX + r, y: posY }
    ];
}

export function getDiamondPolygonPoints(centerPos: Point, width: number, height: number): Point[] {
    const top = { x: centerPos.x, y: centerPos.y - height / 2 };
    const right = { x: centerPos.x + width / 2, y: centerPos.y };
    const bottom = { x: centerPos.x, y: centerPos.y + height / 2 };
    const left = { x: centerPos.x - width / 2, y: centerPos.y };
    return [top, right, bottom, left];
}

export function getRegularPolygonPoints(centerPos: Point, sides: number, radius: number, rotation: number): Point[] {
    if (sides < 3) return [];

    const points: Point[] = [];
    const rotRad = (rotation * Math.PI) / 180;
    const angleStep = (2 * Math.PI) / sides;

    for (let i = 0; i < sides; i++) {
        const angle = rotRad + i * angleStep;
        points.push({
            x: centerPos.x + radius * Math.cos(angle),
            y: centerPos.y + radius * Math.sin(angle)
        });
    }
    return points;
}

export function getPolynomialPoints(
    coefficients: number[],
    rangeX: [number, number],
    step: number,
    scaleX: number,
    scaleY: number,
    origin: Point
): Point[] {
    const points: Point[] = [];
    const [minX, maxX] = rangeX;

    for (let xVal = minX; xVal <= maxX; xVal += step) {
        let yVal = 0;
        for (let power = 0; power < coefficients.length; power++) {
            yVal += coefficients[power] * Math.pow(xVal, power);
        }
        const canvasX = origin.x + xVal * scaleX;
        const canvasY = origin.y - yVal * scaleY;
        points.push({ x: canvasX, y: canvasY });
    }
    return points;
}

export function getArrowHeadLines(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    headSize: number = 12
): { h1: Point; h2: Point } {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const h1X = x2 - headSize * Math.cos(angle - Math.PI / 6);
    const h1Y = y2 - headSize * Math.sin(angle - Math.PI / 6);
    const h2X = x2 - headSize * Math.cos(angle + Math.PI / 6);
    const h2Y = y2 - headSize * Math.sin(angle + Math.PI / 6);
    return {
        h1: { x: h1X, y: h1Y },
        h2: { x: h2X, y: h2Y }
    };
}

export function getArcPoints(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    segments: number = 36,
    counterClockwise: boolean = false
): Point[] {
    const points: Point[] = [];
    
    // Normalize angles to positive for easier math if needed, but Math.cos/sin handle negative fine.
    let diff = endAngle - startAngle;
    if (counterClockwise) {
        while (diff > 0) diff -= 2 * Math.PI;
        while (diff <= -2 * Math.PI) diff += 2 * Math.PI;
    } else {
        while (diff < 0) diff += 2 * Math.PI;
        while (diff >= 2 * Math.PI) diff -= 2 * Math.PI;
    }
    
    // If diff is 0 it could be a full circle
    if (Math.abs(endAngle - startAngle) >= 2 * Math.PI - 0.001) {
        diff = counterClockwise ? -2 * Math.PI : 2 * Math.PI;
    }

    const actualSegments = Math.max(2, Math.floor(Math.abs((diff / (2 * Math.PI)) * segments)));
    
    for (let i = 0; i <= actualSegments; i++) {
        const t = i / actualSegments;
        const angle = startAngle + t * diff;
        points.push({
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        });
    }
    
    return points;
}

export function getCirclePoints(
    cx: number,
    cy: number,
    radius: number,
    segments: number = 36
): Point[] {
    return getArcPoints(cx, cy, radius, 0, 2 * Math.PI, segments);
}

export function getEllipsePoints(
    cx: number,
    cy: number,
    radiusX: number,
    radiusY: number,
    rotation: number = 0,
    segments: number = 36
): Point[] {
    const points: Point[] = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const x = radiusX * Math.cos(angle);
        const y = radiusY * Math.sin(angle);
        
        // Apply rotation
        const rotX = x * Math.cos(rotation) - y * Math.sin(rotation);
        const rotY = x * Math.sin(rotation) + y * Math.cos(rotation);
        
        points.push({
            x: cx + rotX,
            y: cy + rotY
        });
    }
    return points;
}
