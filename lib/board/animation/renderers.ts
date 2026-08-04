import { DrawItem, Point } from '../types';

export function renderLine(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'line' }>): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(item.x1, item.y1);
    ctx.lineTo(item.x2, item.y2);
    ctx.strokeStyle = item.color;
    ctx.lineWidth = item.lineWidth;
    if (item.lineDash) ctx.setLineDash(item.lineDash);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

export function renderText(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'text' }>): void {
    ctx.save();
    const fStyle = item.fontStyle ? `${item.fontStyle} ` : '';
    const fWeight = item.fontWeight ? `${item.fontWeight} ` : '';
    ctx.font = `${fStyle}${fWeight}${item.fontSize}px ${item.fontFamily}`;
    ctx.fillStyle = item.color;
    if (item.textAlign) ctx.textAlign = item.textAlign;
    if (item.textBaseline) ctx.textBaseline = item.textBaseline;
    const lines = item.text.split('\n');
    if (lines.length > 1) {
        const lh = item.fontSize * 1.3;
        lines.forEach((line, i) => {
            ctx.fillText(line, item.x, item.y + i * lh, item.maxWidth);
        });
    } else {
        ctx.fillText(item.text, item.x, item.y, item.maxWidth);
    }
    ctx.restore();
}

export function renderParagraph(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'paragraph' }>): void {
    ctx.save();
    const fStyle = item.fontStyle ? `${item.fontStyle} ` : '';
    const fWeight = item.fontWeight ? `${item.fontWeight} ` : '';
    ctx.font = `${fStyle}${fWeight}${item.fontSize}px ${item.fontFamily}`;
    ctx.fillStyle = item.color;
    if (item.textAlign) ctx.textAlign = item.textAlign;

    const paragraphLines = item.text.split('\n');
    let currY = item.y;
    const lh = item.fontSize * item.lineHeight;

    for (const pLine of paragraphLines) {
        const words = pLine.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > item.width && n > 0) {
                ctx.fillText(line, item.x, currY);
                line = words[n] + ' ';
                currY += lh;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, item.x, currY);
        currY += lh;
    }
    ctx.restore();
}

export function renderFillRect(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'fillRect' }>): void {
    ctx.save();
    ctx.fillStyle = item.fillColor;
    ctx.beginPath();
    const r = Math.min(item.radius, item.width / 2, item.height / 2);
    if (ctx.roundRect) {
        ctx.roundRect(item.x, item.y, item.width, item.height, r);
    } else {
        ctx.rect(item.x, item.y, item.width, item.height);
    }
    ctx.fill();
    ctx.restore();
}

export function renderDrawRect(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'drawRect' }>): void {
    ctx.save();
    const r = Math.min(item.radius ?? 12, item.width / 2, item.height / 2);
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(item.x, item.y, item.width, item.height, r);
    } else {
        ctx.rect(item.x, item.y, item.width, item.height);
    }
    if (item.fillColor) {
        ctx.fillStyle = item.fillColor;
        ctx.fill();
    }
    if (item.color && item.color !== 'transparent') {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.lineWidth ?? 2;
        ctx.stroke();
    }
    ctx.restore();
}

export function renderFillPolygon(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'fillPolygon' }>): void {
    ctx.save();
    ctx.fillStyle = item.fillColor;
    ctx.beginPath();
    item.points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

export function renderCircle(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'circle' }>): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(item.cx, item.cy, item.radius, item.startAngle ?? 0, item.endAngle ?? Math.PI * 2);
    if (item.fillColor) {
        ctx.fillStyle = item.fillColor;
        ctx.fill();
    }
    if (item.color && item.color !== 'transparent') {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.lineWidth ?? 2;
        if (item.lineDash) ctx.setLineDash(item.lineDash);
        ctx.stroke();
    }
    ctx.restore();
}

export function renderEllipse(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'ellipse' }>): void {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(item.cx, item.cy, item.radiusX, item.radiusY, item.rotation ?? 0, 0, Math.PI * 2);
    if (item.fillColor) {
        ctx.fillStyle = item.fillColor;
        ctx.fill();
    }
    if (item.color && item.color !== 'transparent') {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.lineWidth ?? 2;
        ctx.stroke();
    }
    ctx.restore();
}

export function renderArc(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'arc' }>): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(item.cx, item.cy, item.radius, item.startAngle, item.endAngle, item.counterClockwise);
    ctx.strokeStyle = item.color;
    ctx.lineWidth = item.lineWidth ?? 2;
    ctx.stroke();
    ctx.restore();
}

export function renderImage(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'image' }>): void {
    ctx.save();
    ctx.globalAlpha = item.opacity ?? 1;
    let img: CanvasImageSource;
    if (typeof item.src === 'string') {
        const newImg = new Image();
        newImg.src = item.src;
        img = newImg;
    } else {
        img = item.src;
    }
    try {
        if (item.width && item.height) {
            ctx.drawImage(img, item.x, item.y, item.width, item.height);
        } else {
            ctx.drawImage(img, item.x, item.y);
        }
    } catch (e) { }
    ctx.restore();
}

export function renderGradientRect(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'gradientRect' }>): void {
    ctx.save();
    let gradient: CanvasGradient;
    if (item.direction === 'horizontal') {
        gradient = ctx.createLinearGradient(item.x, item.y, item.x + item.width, item.y);
    } else if (item.direction === 'diagonal') {
        gradient = ctx.createLinearGradient(item.x, item.y, item.x + item.width, item.y + item.height);
    } else {
        gradient = ctx.createLinearGradient(item.x, item.y, item.x, item.y + item.height);
    }
    item.colors.forEach((c, i) => gradient.addColorStop(i / (item.colors.length - 1 || 1), c));
    ctx.fillStyle = gradient;
    ctx.fillRect(item.x, item.y, item.width, item.height);
    ctx.restore();
}

export function renderPointer(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'pointer' }>): void {
    ctx.save();
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

export function renderHighlightRect(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'highlightRect' }>): void {
    ctx.save();
    ctx.fillStyle = item.color;
    ctx.fillRect(item.x, item.y, item.width, item.height);
    ctx.restore();
}

export function renderCodeBlock(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'codeBlock' }>): void {
    ctx.save();
    const fontSize = item.fontSize ?? 16;
    const lines = item.code.split('\n');
    const headerHeight = item.language ? fontSize * 2.2 : fontSize * 1.2;
    const paddingX = Math.max(10, fontSize * 0.8);
    const lineHeight = fontSize * 1.5;
    const h = item.height > 0 ? item.height : lines.length * lineHeight + headerHeight + fontSize * 0.4;
    ctx.fillStyle = '#1e1e1e';
    ctx.beginPath();
    const radius = Math.max(4, fontSize * 0.5);
    if (ctx.roundRect) {
        ctx.roundRect(item.x, item.y, item.width, h, radius);
    } else {
        ctx.rect(item.x, item.y, item.width, h);
    }
    ctx.fill();
    if (item.language) {
        const langFontSize = Math.max(10, fontSize * 0.85);
        ctx.font = `${langFontSize}px monospace`;
        ctx.fillStyle = '#888';
        ctx.fillText(item.language, item.x + paddingX, item.y + langFontSize * 1.6);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(item.x, item.y + headerHeight);
        ctx.lineTo(item.x + item.width, item.y + headerHeight);
        ctx.stroke();
    }
    let currY = item.y + headerHeight + fontSize * 1.1;
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = '#d4d4d4';
    lines.forEach(line => {
        ctx.fillText(line, item.x + paddingX, currY);
        currY += lineHeight;
    });
    ctx.restore();
}

export function renderTable(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { type: 'table' }>): void {
    ctx.save();
    const { data, x, y, cellWidth, cellHeight, headerBgColor, headerTextColor, rowBgColor, altRowBgColor, textColor, borderColor, fontSize, fontFamily } = item;
    const font = fontFamily || 'sans-serif';
    const numRows = data.length;
    if (numRows > 0) {
        const numCols = Math.max(...data.map(row => row.length));
        let currentY = y;
        for (let r = 0; r < numRows; r++) {
            const isHeader = r === 0;
            const bg = isHeader ? headerBgColor : (r % 2 === 0 ? altRowBgColor : rowBgColor);
            const txtColor = isHeader ? headerTextColor : textColor;
            const rowData = data[r];
            let currentX = x;
            for (let c = 0; c < numCols; c++) {
                const cellText = rowData[c] !== undefined ? String(rowData[c]) : '';
                if (bg && bg !== 'transparent') {
                    ctx.fillStyle = bg;
                    ctx.fillRect(currentX, currentY, cellWidth, cellHeight);
                }
                if (borderColor && borderColor !== 'transparent') {
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(currentX, currentY, cellWidth, cellHeight);
                }
                ctx.font = `${isHeader ? 'bold ' : ''}${fontSize}px ${font}`;
                ctx.fillStyle = txtColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cellText, currentX + cellWidth / 2, currentY + cellHeight / 2);
                currentX += cellWidth;
            }
            currentY += cellHeight;
        }
    }
    ctx.restore();
}

export function renderDrawItem(ctx: CanvasRenderingContext2D, item: DrawItem): void {
    switch (item.type) {
        case 'line':
            renderLine(ctx, item);
            break;
        case 'text':
            renderText(ctx, item);
            break;
        case 'paragraph':
            renderParagraph(ctx, item);
            break;
        case 'fillRect':
            renderFillRect(ctx, item);
            break;
        case 'drawRect':
            renderDrawRect(ctx, item);
            break;
        case 'fillPolygon':
            renderFillPolygon(ctx, item);
            break;
        case 'circle':
            renderCircle(ctx, item);
            break;
        case 'ellipse':
            renderEllipse(ctx, item);
            break;
        case 'arc':
            renderArc(ctx, item);
            break;
        case 'image':
            renderImage(ctx, item);
            break;
        case 'gradientRect':
            renderGradientRect(ctx, item);
            break;
        case 'pointer':
            renderPointer(ctx, item);
            break;
        case 'highlightRect':
            renderHighlightRect(ctx, item);
            break;
        case 'codeBlock':
            renderCodeBlock(ctx, item);
            break;
        case 'table':
            renderTable(ctx, item);
            break;
    }
}

export function getItemCenter(item: DrawItem): Point {
    if (item.type === 'table') {
        const numCols = item.data.length > 0 ? Math.max(...item.data.map(row => row.length)) : 1;
        const totalW = numCols * item.cellWidth;
        const totalH = item.data.length * item.cellHeight;
        return { x: item.x + totalW / 2, y: item.y + totalH / 2 };
    }
    if ('cx' in item && typeof item.cx === 'number' && 'cy' in item && typeof item.cy === 'number') {
        return { x: item.cx, y: item.cy };
    }
    if ('x' in item && 'y' in item && 'width' in item && 'height' in item) {
        return { x: (item as any).x + (item as any).width / 2, y: (item as any).y + (item as any).height / 2 };
    }
    if ('x1' in item && 'y1' in item && 'x2' in item && 'y2' in item) {
        return { x: ((item as any).x1 + (item as any).x2) / 2, y: ((item as any).y1 + (item as any).y2) / 2 };
    }
    if ('points' in item && Array.isArray((item as any).points) && (item as any).points.length > 0) {
        const pts = (item as any).points as Point[];
        const sumX = pts.reduce((acc, p) => acc + p.x, 0);
        const sumY = pts.reduce((acc, p) => acc + p.y, 0);
        return { x: sumX / pts.length, y: sumY / pts.length };
    }
    if ('x' in item && 'y' in item) {
        return { x: (item as any).x, y: (item as any).y };
    }
    return { x: 0, y: 0 };
}

export function moveDrawItem(item: DrawItem, dx: number, dy: number): void {
    if ('x' in item && typeof (item as any).x === 'number') (item as any).x += dx;
    if ('y' in item && typeof (item as any).y === 'number') (item as any).y += dy;
    if ('x1' in item && typeof (item as any).x1 === 'number') (item as any).x1 += dx;
    if ('y1' in item && typeof (item as any).y1 === 'number') (item as any).y1 += dy;
    if ('x2' in item && typeof (item as any).x2 === 'number') (item as any).x2 += dx;
    if ('y2' in item && typeof (item as any).y2 === 'number') (item as any).y2 += dy;
    if ('cx' in item && typeof (item as any).cx === 'number') (item as any).cx += dx;
    if ('cy' in item && typeof (item as any).cy === 'number') (item as any).cy += dy;
    if ('points' in item && Array.isArray((item as any).points)) {
        (item as any).points.forEach((p: Point) => { p.x += dx; p.y += dy; });
    }
}
