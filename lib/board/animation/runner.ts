import { DrawItem, Point } from '../types';
import { getCirclePoints, getEllipsePoints, getArcPoints } from '../shapes';
import { renderDrawItem, getItemCenter, moveDrawItem } from './renderers';

function parseColorToRgba(colorStr: string): [number, number, number, number] {
    if (colorStr.startsWith('rgba') || colorStr.startsWith('rgb')) {
        const nums = colorStr.match(/[\d.]+/g);
        if (nums && nums.length >= 3) {
            return [
                parseFloat(nums[0]),
                parseFloat(nums[1]),
                parseFloat(nums[2]),
                nums[3] !== undefined ? parseFloat(nums[3]) : 1
            ];
        }
    } else if (colorStr.startsWith('#')) {
        let hex = colorStr.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return [r, g, b, 1];
        }
    }
    return [0, 0, 0, 1];
}

function interpolateColor(color1Str: string, color2Str: string, factor: number): string {
    const c1 = parseColorToRgba(color1Str);
    const c2 = parseColorToRgba(color2Str);
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * factor);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * factor);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * factor);
    const a = c1[3] + (c2[3] - c1[3]) * factor;
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

export function runDrawQueueAnimation(
    ctx: CanvasRenderingContext2D,
    drawQueue: DrawItem[],
    speed: number,
    onComplete: () => void,
    onSlideOut: (duration: number) => Promise<void>,
    activeElementsMap?: Map<string, DrawItem>
): void {
    if (drawQueue.length === 0) {
        onComplete();
        return;
    }

    let queueIndex = 0;
    const activeElements: Map<string, DrawItem> = activeElementsMap || new Map();

    let currentX = 0;
    let currentY = 0;
    let currentPathPoints: Point[] | null = null;
    let currentPathIndex = 0;

    let textCharIndex = 0;
    let textX = 0;
    let imageAlpha = 0;
    let pointerAnimScale = 0;
    let waitStartTime = 0;

    let actionAnimStartTime = 0;

    const renderActiveElementsExcept = (excludeId?: string) => {
        activeElements.forEach((item, id) => {
            if (id !== excludeId) {
                renderDrawItem(ctx, item);
            }
        });
    };

    const drawFrame = (now: number) => {
        if (queueIndex >= drawQueue.length) {
            onComplete();
            return;
        }

        let remainingDistanceBudget = speed;

        while (remainingDistanceBudget > 0 && queueIndex < drawQueue.length) {
            const currentItem = drawQueue[queueIndex];

            if (currentItem.type === 'wait') {
                if (waitStartTime === 0) {
                    waitStartTime = now;
                }
                if (now - waitStartTime >= currentItem.duration) {
                    queueIndex++;
                    waitStartTime = 0;
                } else {
                    remainingDistanceBudget = 0;
                }
            } else if (currentItem.type === 'delete') {
                if (actionAnimStartTime === 0) {
                    actionAnimStartTime = now;
                }
                const duration = currentItem.duration ?? 300;
                const elapsed = now - actionAnimStartTime;
                const progress = Math.min(1, elapsed / duration);

                const targetItem = activeElements.get(currentItem.id);
                ctx.clearRect(-10000, -10000, 20000, 20000);
                renderActiveElementsExcept(currentItem.id);

                if (targetItem) {
                    const center = getItemCenter(targetItem);
                    const scale = Math.max(0, 1 - progress * progress);
                    const offsetY = progress * progress * 40;
                    const alpha = Math.max(0, 1 - progress);

                    ctx.save();
                    ctx.translate(center.x, center.y + offsetY);
                    ctx.scale(scale, scale);
                    ctx.translate(-center.x, -center.y);
                    ctx.globalAlpha = alpha;
                    renderDrawItem(ctx, targetItem);
                    ctx.restore();
                }

                if (progress >= 1) {
                    activeElements.delete(currentItem.id);
                    ctx.clearRect(-10000, -10000, 20000, 20000);
                    renderActiveElementsExcept();
                    queueIndex++;
                    actionAnimStartTime = 0;
                } else {
                    remainingDistanceBudget = 0;
                }
            } else if (currentItem.type === 'move') {
                if (actionAnimStartTime === 0) {
                    actionAnimStartTime = now;
                }
                const duration = currentItem.duration ?? 300;
                const elapsed = now - actionAnimStartTime;
                const progress = Math.min(1, elapsed / duration);
                const ease = progress * (2 - progress);

                const targetItem = activeElements.get(currentItem.id);
                const dx = currentItem.dx ?? 0;
                const dy = currentItem.dy ?? 0;

                ctx.clearRect(-10000, -10000, 20000, 20000);
                renderActiveElementsExcept(currentItem.id);

                if (targetItem) {
                    ctx.save();
                    ctx.translate(dx * ease, dy * ease);
                    renderDrawItem(ctx, targetItem);
                    ctx.restore();
                }

                if (progress >= 1) {
                    if (targetItem) {
                        moveDrawItem(targetItem, dx, dy);
                    }
                    ctx.clearRect(-10000, -10000, 20000, 20000);
                    renderActiveElementsExcept();
                    queueIndex++;
                    actionAnimStartTime = 0;
                } else {
                    remainingDistanceBudget = 0;
                }
            } else if (currentItem.type === 'changeColor') {
                if (actionAnimStartTime === 0) {
                    actionAnimStartTime = now;
                }
                const duration = currentItem.duration ?? 300;
                const elapsed = now - actionAnimStartTime;
                const progress = Math.min(1, elapsed / duration);
                const targetItem = activeElements.get(currentItem.id);

                if (targetItem) {
                    const startColor = (targetItem as any).color || (targetItem as any).fillColor || '#000000';
                    if (!('originalColor' in targetItem)) {
                        (targetItem as any).originalColor = startColor;
                    }
                    const currentColor = interpolateColor((targetItem as any).originalColor, currentItem.color, progress);
                    if ('color' in targetItem) (targetItem as any).color = currentColor;
                    if ('fillColor' in targetItem) (targetItem as any).fillColor = currentColor;
                }

                ctx.clearRect(-10000, -10000, 20000, 20000);
                renderActiveElementsExcept();

                if (progress >= 1) {
                    if (targetItem) {
                        delete (targetItem as any).originalColor;
                        if ('color' in targetItem) (targetItem as any).color = currentItem.color;
                        if ('fillColor' in targetItem) (targetItem as any).fillColor = currentItem.color;
                    }
                    queueIndex++;
                    actionAnimStartTime = 0;
                } else {
                    remainingDistanceBudget = 0;
                }
            } else if (currentItem.type === 'slideOutLeft') {
                const duration = currentItem.duration;
                queueIndex++;

                onSlideOut(duration).then(() => {
                    activeElements.clear();
                    if (queueIndex < drawQueue.length) {
                        requestAnimationFrame(drawFrame);
                    } else {
                        onComplete();
                    }
                });
                return;
            } else if (currentItem.type === 'pointer') {
                pointerAnimScale += 0.1 * (speed / 15);
                if (pointerAnimScale >= 1) {
                    pointerAnimScale = 1;
                }

                ctx.clearRect(-10000, -10000, 20000, 20000);
                renderActiveElementsExcept();

                ctx.save();
                ctx.fillStyle = currentItem.color;
                ctx.beginPath();
                ctx.arc(currentItem.x, currentItem.y, currentItem.size * pointerAnimScale, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                if (pointerAnimScale >= 1) {
                    activeElements.set(currentItem.id, currentItem);
                    queueIndex++;
                    pointerAnimScale = 0;
                } else {
                    remainingDistanceBudget = 0;
                }
            } else if (currentItem.type === 'highlightRect' || currentItem.type === 'gradientRect' || currentItem.type === 'fillRect' || currentItem.type === 'fillPolygon' || currentItem.type === 'drawRect' || currentItem.type === 'codeBlock' || currentItem.type === 'table') {
                activeElements.set(currentItem.id, currentItem);
                ctx.clearRect(-10000, -10000, 20000, 20000);
                renderActiveElementsExcept();
                queueIndex++;
            } else if (currentItem.type === 'image') {
                imageAlpha += 0.05 * (speed / 15);
                if (imageAlpha >= (currentItem.opacity ?? 1)) {
                    imageAlpha = currentItem.opacity ?? 1;
                }

                ctx.clearRect(-10000, -10000, 20000, 20000);
                renderActiveElementsExcept();

                ctx.save();
                ctx.globalAlpha = imageAlpha;
                let img: CanvasImageSource;
                if (typeof currentItem.src === 'string') {
                    const newImg = new Image();
                    newImg.src = currentItem.src;
                    img = newImg;
                } else {
                    img = currentItem.src;
                }
                try {
                    if (currentItem.width && currentItem.height) {
                        ctx.drawImage(img, currentItem.x, currentItem.y, currentItem.width, currentItem.height);
                    } else {
                        ctx.drawImage(img, currentItem.x, currentItem.y);
                    }
                } catch (e) { }
                ctx.restore();

                if (imageAlpha >= (currentItem.opacity ?? 1)) {
                    activeElements.set(currentItem.id, currentItem);
                    queueIndex++;
                    imageAlpha = 0;
                } else {
                    remainingDistanceBudget = 0;
                }
            } else if (currentItem.type === 'line' || currentItem.type === 'circle' || currentItem.type === 'ellipse' || currentItem.type === 'arc') {
                if (!currentPathPoints) {
                    if (currentItem.type === 'line') {
                        currentPathPoints = [{ x: currentItem.x1, y: currentItem.y1 }, { x: currentItem.x2, y: currentItem.y2 }];
                    } else if (currentItem.type === 'circle') {
                        currentPathPoints = getCirclePoints(currentItem.cx, currentItem.cy, currentItem.radius);
                    } else if (currentItem.type === 'ellipse') {
                        currentPathPoints = getEllipsePoints(currentItem.cx, currentItem.cy, currentItem.radiusX, currentItem.radiusY, currentItem.rotation);
                    } else if (currentItem.type === 'arc') {
                        currentPathPoints = getArcPoints(currentItem.cx, currentItem.cy, currentItem.radius, currentItem.startAngle, currentItem.endAngle, 36, currentItem.counterClockwise);
                    }

                    if (currentPathPoints && currentPathPoints.length > 0) {
                        currentX = currentPathPoints[0].x;
                        currentY = currentPathPoints[0].y;
                        currentPathIndex = 1;
                    }
                }

                if (!currentPathPoints || currentPathIndex >= currentPathPoints.length) {
                    activeElements.set(currentItem.id, currentItem);
                    queueIndex++;
                    currentPathPoints = null;
                    continue;
                }

                while (remainingDistanceBudget > 0 && currentPathIndex < currentPathPoints.length) {
                    const targetPoint = currentPathPoints[currentPathIndex];
                    const dx = targetPoint.x - currentX;
                    const dy = targetPoint.y - currentY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance === 0) {
                        currentPathIndex++;
                        continue;
                    }

                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(currentX, currentY);

                    if ('lineDash' in currentItem && currentItem.lineDash) ctx.setLineDash(currentItem.lineDash);
                    if ('color' in currentItem && currentItem.color) ctx.strokeStyle = currentItem.color;
                    if ('lineWidth' in currentItem && currentItem.lineWidth) ctx.lineWidth = currentItem.lineWidth;

                    if (distance <= remainingDistanceBudget) {
                        ctx.lineTo(targetPoint.x, targetPoint.y);
                        ctx.stroke();
                        ctx.closePath();
                        remainingDistanceBudget -= distance;
                        currentX = targetPoint.x;
                        currentY = targetPoint.y;
                        currentPathIndex++;
                    } else {
                        const ratio = remainingDistanceBudget / distance;
                        const nextX = currentX + dx * ratio;
                        const nextY = currentY + dy * ratio;
                        ctx.lineTo(nextX, nextY);
                        ctx.stroke();
                        ctx.closePath();
                        currentX = nextX;
                        currentY = nextY;
                        remainingDistanceBudget = 0;
                    }
                    ctx.restore();
                }

                if (currentPathIndex >= currentPathPoints.length) {
                    activeElements.set(currentItem.id, currentItem);
                    queueIndex++;
                    currentPathPoints = null;
                }
            } else if (currentItem.type === 'text') {
                if (textCharIndex === 0) {
                    textX = currentItem.x;
                }

                ctx.save();
                const fontStyle = currentItem.fontStyle ? `${currentItem.fontStyle} ` : '';
                const fontWeight = currentItem.fontWeight ? `${currentItem.fontWeight} ` : '';
                ctx.font = `${fontStyle}${fontWeight}${currentItem.fontSize}px ${currentItem.fontFamily}`;
                ctx.fillStyle = currentItem.color;
                if (currentItem.textAlign) ctx.textAlign = currentItem.textAlign;
                if (currentItem.textBaseline) ctx.textBaseline = currentItem.textBaseline;

                if (currentItem.textAlign && currentItem.textAlign !== 'left' && currentItem.textAlign !== 'start') {
                    ctx.fillText(currentItem.text, currentItem.x, currentItem.y, currentItem.maxWidth);
                    activeElements.set(currentItem.id, currentItem);
                    queueIndex++;
                    textCharIndex = 0;
                    remainingDistanceBudget -= ctx.measureText(currentItem.text).width || 50;
                } else {
                    ctx.clearRect(-10000, -10000, 20000, 20000);
                    renderActiveElementsExcept();

                    if (textCharIndex > 0) {
                        ctx.fillText(currentItem.text.substring(0, textCharIndex), currentItem.x, currentItem.y);
                    }

                    while (remainingDistanceBudget > 0 && textCharIndex < currentItem.text.length) {
                        const char = currentItem.text[textCharIndex];
                        ctx.fillText(char, textX, currentItem.y);
                        const charWidth = Math.max(5, ctx.measureText(char).width);
                        textX += charWidth;
                        textCharIndex++;
                        remainingDistanceBudget -= charWidth;
                    }

                    if (textCharIndex >= currentItem.text.length) {
                        activeElements.set(currentItem.id, currentItem);
                        queueIndex++;
                        textCharIndex = 0;
                    }
                }
                ctx.restore();
            } else if (currentItem.type === 'paragraph') {
                activeElements.set(currentItem.id, currentItem);
                ctx.clearRect(-10000, -10000, 20000, 20000);
                renderActiveElementsExcept();
                queueIndex++;
            }
        }

        if (queueIndex < drawQueue.length) {
            requestAnimationFrame(drawFrame);
        } else {
            onComplete();
        }
    };

    requestAnimationFrame(drawFrame);
}
