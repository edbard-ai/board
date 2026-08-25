import { DrawItem, Point } from '../types';
import katex from 'katex';

function createSvgElement(tag: string): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function createSvgContainer(): SVGSVGElement {
    const svg = createSvgElement('svg') as SVGSVGElement;
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.overflow = 'visible';
    svg.style.pointerEvents = 'none';
    return svg;
}

export function renderLine(item: Extract<DrawItem, { type: 'line' }>): SVGElement {
    const svg = createSvgContainer();
    const line = createSvgElement('line');
    line.setAttribute('x1', item.x1.toString());
    line.setAttribute('y1', item.y1.toString());
    line.setAttribute('x2', item.x2.toString());
    line.setAttribute('y2', item.y2.toString());
    line.setAttribute('stroke', item.color);
    line.setAttribute('stroke-width', item.lineWidth.toString());
    line.setAttribute('stroke-linecap', 'round');
    if (item.lineDash && item.lineDash.length > 0) {
        line.setAttribute('stroke-dasharray', item.lineDash.join(','));
    }
    svg.appendChild(line);
    return svg;
}

export function renderText(item: Extract<DrawItem, { type: 'text' }>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${item.x}px`;
    div.style.top = `${item.y}px`;
    div.style.color = item.color;
    div.style.fontFamily = item.fontFamily;
    div.style.fontSize = `${item.fontSize}px`;
    if (item.fontWeight) div.style.fontWeight = item.fontWeight;
    if (item.fontStyle) div.style.fontStyle = item.fontStyle;
    if (item.textDecoration) {
        div.style.textDecoration = item.textDecoration;
    } else if (item.underline) {
        div.style.textDecoration = 'underline';
    }
    
    if (item.textAlign === 'center') {
        div.style.transform = 'translate(-50%, 0)';
        div.style.textAlign = 'center';
    } else if (item.textAlign === 'right') {
        div.style.transform = 'translate(-100%, 0)';
        div.style.textAlign = 'right';
    }
    
    if (item.textBaseline === 'middle') {
        div.style.transform += ' translateY(-50%)';
    } else if (item.textBaseline === 'bottom') {
        div.style.transform += ' translateY(-100%)';
    }

    if (item.maxWidth) {
        div.style.maxWidth = `${item.maxWidth}px`;
    }
    
    div.style.whiteSpace = 'pre-wrap';
    div.innerText = item.text;
    return div;
}

export function renderParagraph(item: Extract<DrawItem, { type: 'paragraph' }>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${item.x}px`;
    div.style.top = `${item.y}px`;
    div.style.width = `${item.width}px`;
    div.style.color = item.color;
    div.style.fontFamily = item.fontFamily;
    div.style.fontSize = `${item.fontSize}px`;
    div.style.lineHeight = item.lineHeight.toString();
    if (item.fontWeight) div.style.fontWeight = item.fontWeight;
    if (item.fontStyle) div.style.fontStyle = item.fontStyle;
    if (item.textDecoration) {
        div.style.textDecoration = item.textDecoration;
    } else if (item.underline) {
        div.style.textDecoration = 'underline';
    }
    if (item.textAlign) div.style.textAlign = item.textAlign === 'center' ? 'center' : (item.textAlign === 'right' ? 'right' : 'left');
    
    div.style.whiteSpace = 'pre-wrap';
    div.innerText = item.text;
    return div;
}

export function renderFillRect(item: Extract<DrawItem, { type: 'fillRect' }>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${item.x}px`;
    div.style.top = `${item.y}px`;
    div.style.width = `${item.width}px`;
    div.style.height = `${item.height}px`;
    div.style.backgroundColor = item.fillColor;
    if (item.radius) div.style.borderRadius = `${item.radius}px`;
    return div;
}

export function renderDrawRect(item: Extract<DrawItem, { type: 'drawRect' }>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${item.x}px`;
    div.style.top = `${item.y}px`;
    div.style.width = `${item.width}px`;
    div.style.height = `${item.height}px`;
    if (item.fillColor && item.fillColor !== 'transparent') {
        div.style.backgroundColor = item.fillColor;
    }
    if (item.color && item.color !== 'transparent') {
        div.style.border = `${item.lineWidth ?? 2}px solid ${item.color}`;
    }
    if (item.radius) div.style.borderRadius = `${item.radius}px`;
    div.style.boxSizing = 'border-box';
    return div;
}

export function renderFillPolygon(item: Extract<DrawItem, { type: 'fillPolygon' }>): SVGElement {
    const svg = createSvgContainer();
    const polygon = createSvgElement('polygon');
    const pointsStr = item.points.map(p => `${p.x},${p.y}`).join(' ');
    polygon.setAttribute('points', pointsStr);
    polygon.setAttribute('fill', item.fillColor);
    svg.appendChild(polygon);
    return svg;
}

export function renderCircle(item: Extract<DrawItem, { type: 'circle' }>): SVGElement {
    const svg = createSvgContainer();
    
    if ((item.startAngle && item.startAngle !== 0) || (item.endAngle && item.endAngle !== Math.PI * 2)) {
        const path = createSvgElement('path');
        const startX = item.cx + item.radius * Math.cos(item.startAngle ?? 0);
        const startY = item.cy + item.radius * Math.sin(item.startAngle ?? 0);
        const endX = item.cx + item.radius * Math.cos(item.endAngle ?? Math.PI * 2);
        const endY = item.cy + item.radius * Math.sin(item.endAngle ?? Math.PI * 2);
        const largeArcFlag = ((item.endAngle ?? Math.PI * 2) - (item.startAngle ?? 0) <= Math.PI) ? "0" : "1";
        
        const d = [
            "M", startX, startY, 
            "A", item.radius, item.radius, 0, largeArcFlag, 1, endX, endY
        ].join(" ");
        
        path.setAttribute("d", d);
        if (item.fillColor && item.fillColor !== 'transparent') path.setAttribute("fill", item.fillColor);
        else path.setAttribute("fill", "none");
        
        if (item.color && item.color !== 'transparent') {
            path.setAttribute("stroke", item.color);
            path.setAttribute("stroke-width", (item.lineWidth ?? 2).toString());
        }
        svg.appendChild(path);
    } else {
        const circle = createSvgElement('circle');
        circle.setAttribute('cx', item.cx.toString());
        circle.setAttribute('cy', item.cy.toString());
        circle.setAttribute('r', item.radius.toString());
        if (item.fillColor && item.fillColor !== 'transparent') circle.setAttribute('fill', item.fillColor);
        else circle.setAttribute('fill', 'none');
        if (item.color && item.color !== 'transparent') {
            circle.setAttribute('stroke', item.color);
            circle.setAttribute('stroke-width', (item.lineWidth ?? 2).toString());
            if (item.lineDash && item.lineDash.length > 0) circle.setAttribute('stroke-dasharray', item.lineDash.join(','));
        }
        svg.appendChild(circle);
    }
    
    return svg;
}

export function renderEllipse(item: Extract<DrawItem, { type: 'ellipse' }>): SVGElement {
    const svg = createSvgContainer();
    const ellipse = createSvgElement('ellipse');
    ellipse.setAttribute('cx', item.cx.toString());
    ellipse.setAttribute('cy', item.cy.toString());
    ellipse.setAttribute('rx', item.radiusX.toString());
    ellipse.setAttribute('ry', item.radiusY.toString());
    if (item.rotation) ellipse.setAttribute('transform', `rotate(${(item.rotation * 180) / Math.PI} ${item.cx} ${item.cy})`);
    
    if (item.fillColor && item.fillColor !== 'transparent') ellipse.setAttribute('fill', item.fillColor);
    else ellipse.setAttribute('fill', 'none');
    
    if (item.color && item.color !== 'transparent') {
        ellipse.setAttribute('stroke', item.color);
        ellipse.setAttribute('stroke-width', (item.lineWidth ?? 2).toString());
        if (item.lineDash && item.lineDash.length > 0) ellipse.setAttribute('stroke-dasharray', item.lineDash.join(','));
    }
    svg.appendChild(ellipse);
    return svg;
}

export function renderArc(item: Extract<DrawItem, { type: 'arc' }>): SVGElement {
    const svg = createSvgContainer();
    const path = createSvgElement('path');
    
    let endA = item.endAngle;
    let startA = item.startAngle;
    if (item.counterClockwise) {
        endA = item.startAngle;
        startA = item.endAngle;
    }
    
    const startX = item.cx + item.radius * Math.cos(startA);
    const startY = item.cy + item.radius * Math.sin(startA);
    const endX = item.cx + item.radius * Math.cos(endA);
    const endY = item.cy + item.radius * Math.sin(endA);
    
    let diff = endA - startA;
    while (diff < 0) diff += Math.PI * 2;
    const largeArcFlag = diff <= Math.PI ? "0" : "1";
    
    const sweepFlag = item.counterClockwise ? "0" : "1";
    
    const d = [
        "M", startX, startY, 
        "A", item.radius, item.radius, 0, largeArcFlag, sweepFlag, endX, endY
    ].join(" ");
    
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", item.color);
    path.setAttribute("stroke-width", (item.lineWidth ?? 2).toString());
    svg.appendChild(path);
    return svg;
}

export function renderImage(item: Extract<DrawItem, { type: 'image' }>): HTMLElement {
    const img = document.createElement('img');
    img.style.position = 'absolute';
    img.style.left = `${item.x}px`;
    img.style.top = `${item.y}px`;
    if (item.width) img.style.width = `${item.width}px`;
    if (item.height) img.style.height = `${item.height}px`;
    img.style.opacity = (item.opacity ?? 1).toString();
    
    if (typeof item.src === 'string') {
        img.src = item.src;
    } else {
        img.src = item.src.src;
    }
    return img;
}

export function renderGradientRect(item: Extract<DrawItem, { type: 'gradientRect' }>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${item.x}px`;
    div.style.top = `${item.y}px`;
    div.style.width = `${item.width}px`;
    div.style.height = `${item.height}px`;
    
    const colors = item.colors.join(', ');
    if (item.direction === 'horizontal') {
        div.style.background = `linear-gradient(to right, ${colors})`;
    } else if (item.direction === 'diagonal') {
        div.style.background = `linear-gradient(to bottom right, ${colors})`;
    } else {
        div.style.background = `linear-gradient(to bottom, ${colors})`;
    }
    return div;
}

export function renderPointer(item: Extract<DrawItem, { type: 'pointer' }>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${item.x - item.size}px`;
    div.style.top = `${item.y - item.size}px`;
    div.style.width = `${item.size * 2}px`;
    div.style.height = `${item.size * 2}px`;
    div.style.borderRadius = '50%';
    div.style.backgroundColor = item.color;
    return div;
}

export function renderHighlightRect(item: Extract<DrawItem, { type: 'highlightRect' }>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${item.x}px`;
    div.style.top = `${item.y}px`;
    div.style.width = `${item.width}px`;
    div.style.height = `${item.height}px`;
    div.style.backgroundColor = item.color;
    return div;
}

export function renderCodeBlock(item: Extract<DrawItem, { type: 'codeBlock' }>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${item.x}px`;
    div.style.top = `${item.y}px`;
    div.style.width = `${item.width}px`;
    
    const fontSize = item.fontSize ?? 16;
    const lines = item.code.split('\n');
    const headerHeight = item.language ? fontSize * 2.2 : fontSize * 1.2;
    const paddingX = Math.max(10, fontSize * 0.8);
    const lineHeight = fontSize * 1.5;
    const h = item.height && item.height > 0 ? item.height : lines.length * lineHeight + headerHeight + fontSize * 0.4;
    
    div.style.height = `${h}px`;
    div.style.backgroundColor = '#1e1e1e';
    const radius = Math.max(4, fontSize * 0.5);
    div.style.borderRadius = `${radius}px`;
    div.style.overflow = 'hidden';
    
    let html = '';
    if (item.language) {
        const langFontSize = Math.max(10, fontSize * 0.85);
        html += `<div style="height:${headerHeight}px; border-bottom: 1px solid #333; display: flex; align-items: center; padding-left: ${paddingX}px; color: #888; font-family: monospace; font-size: ${langFontSize}px;">${item.language}</div>`;
    }
    
    html += `<div style="padding: ${fontSize * 0.5}px ${paddingX}px; color: #d4d4d4; font-family: monospace; font-size: ${fontSize}px; line-height: ${lineHeight}px; white-space: pre;">${item.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    
    div.innerHTML = html;
    return div;
}

export function renderTable(item: Extract<DrawItem, { type: 'table' }>): HTMLElement {
    const table = document.createElement('table');
    table.style.position = 'absolute';
    table.style.left = `${item.x}px`;
    table.style.top = `${item.y}px`;
    table.style.borderCollapse = 'collapse';
    table.style.fontFamily = item.fontFamily || 'sans-serif';
    
    const numRows = item.data.length;
    if (numRows > 0) {
        for (let r = 0; r < numRows; r++) {
            const tr = document.createElement('tr');
            const isHeader = r === 0;
            const bg = isHeader ? item.headerBgColor : (r % 2 === 0 ? item.altRowBgColor : item.rowBgColor);
            const txtColor = isHeader ? item.headerTextColor : item.textColor;
            
            tr.style.backgroundColor = bg;
            tr.style.color = txtColor;
            tr.style.fontSize = `${item.fontSize}px`;
            if (isHeader) tr.style.fontWeight = 'bold';
            
            for (let c = 0; c < item.data[r].length; c++) {
                const td = document.createElement(isHeader ? 'th' : 'td');
                td.style.width = `${item.cellWidth}px`;
                td.style.height = `${item.cellHeight}px`;
                td.style.textAlign = 'center';
                td.style.verticalAlign = 'middle';
                if (item.borderColor && item.borderColor !== 'transparent') {
                    td.style.border = `1px solid ${item.borderColor}`;
                }
                td.innerText = String(item.data[r][c]);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
    }
    return table;
}

export function renderMath(item: Extract<DrawItem, { type: 'math' }>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${item.x}px`;
    div.style.top = `${item.y}px`;
    div.style.color = item.color;
    div.style.fontFamily = item.fontFamily;
    div.style.fontSize = `${item.fontSize}px`;
    // We can center it based on typical usage, or let it flow. Let's translate for centering to match canvas behavior.
    div.style.transform = 'translate(-50%, -50%)'; 
    div.innerHTML = katex.renderToString(item.formula, {
        displayMode: item.displayMode,
        throwOnError: false
    });
    return div;
}

export function renderDrawItem(item: DrawItem): HTMLElement | SVGElement | null {
    switch (item.type) {
        case 'line': return renderLine(item as any);
        case 'text': return renderText(item as any);
        case 'paragraph': return renderParagraph(item as any);
        case 'fillRect': return renderFillRect(item as any);
        case 'drawRect': return renderDrawRect(item as any);
        case 'fillPolygon': return renderFillPolygon(item as any);
        case 'circle': return renderCircle(item as any);
        case 'ellipse': return renderEllipse(item as any);
        case 'arc': return renderArc(item as any);
        case 'image': return renderImage(item as any);
        case 'gradientRect': return renderGradientRect(item as any);
        case 'pointer': return renderPointer(item as any);
        case 'highlightRect': return renderHighlightRect(item as any);
        case 'codeBlock': return renderCodeBlock(item as any);
        case 'table': return renderTable(item as any);
        case 'math': return renderMath(item as any);
        default: return null;
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
