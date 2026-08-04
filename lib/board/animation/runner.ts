import { DrawItem, Point } from '../types';
import { renderDrawItem, getItemCenter, moveDrawItem } from './renderers';

export function runDrawQueueAnimation(
    container: HTMLElement,
    drawQueue: DrawItem[],
    speed: number,
    onComplete: () => void,
    onSlideOut: (duration: number) => Promise<void>,
    activeElementsMap?: Map<string, { item: DrawItem, node: HTMLElement | SVGElement }>
): void {
    if (drawQueue.length === 0) {
        onComplete();
        return;
    }

    let queueIndex = 0;
    const activeElements = activeElementsMap || new Map();
    const defaultFadeDurationMs = Math.max(100, 1000 - speed * 10);

    const processNext = () => {
        if (queueIndex >= drawQueue.length) {
            onComplete();
            return;
        }

        const currentItem = drawQueue[queueIndex];

        if (currentItem.type === 'wait') {
            queueIndex++;
            setTimeout(processNext, currentItem.duration);
            return;
        }

        if (currentItem.type === 'delete') {
            const el = activeElements.get(currentItem.id);
            if (el) {
                el.node.style.transition = `opacity ${currentItem.duration ?? 300}ms ease-out`;
                el.node.style.opacity = '0';
                setTimeout(() => {
                    if (el.node.parentNode) el.node.parentNode.removeChild(el.node);
                    activeElements.delete(currentItem.id);
                }, currentItem.duration ?? 300);
            }
            queueIndex++;
            processNext();
            return;
        }

        if (currentItem.type === 'move') {
            const el = activeElements.get(currentItem.id);
            if (el) {
                const duration = currentItem.duration ?? 300;
                el.node.style.transition = `transform ${duration}ms ease-in-out`;
                
                let currentTransform = el.node.style.transform || '';
                el.node.style.transform = currentTransform + ` translate(${currentItem.dx ?? 0}px, ${currentItem.dy ?? 0}px)`;
                
                moveDrawItem(el.item, currentItem.dx ?? 0, currentItem.dy ?? 0);
            }
            queueIndex++;
            processNext();
            return;
        }

        if (currentItem.type === 'changeColor') {
            const el = activeElements.get(currentItem.id);
            if (el) {
                const duration = currentItem.duration ?? 300;
                el.node.style.transition = `all ${duration}ms ease-in-out`;
                if (el.node instanceof HTMLElement) {
                    if (el.node.style.color) el.node.style.color = currentItem.color;
                    if (el.node.style.backgroundColor) el.node.style.backgroundColor = currentItem.color;
                    if (el.node.style.borderColor) el.node.style.borderColor = currentItem.color;
                } else if (el.node instanceof SVGElement) {
                    const child = el.node.firstElementChild;
                    if (child) {
                        if (child.getAttribute('fill') && child.getAttribute('fill') !== 'none') child.setAttribute('fill', currentItem.color);
                        if (child.getAttribute('stroke') && child.getAttribute('stroke') !== 'none') child.setAttribute('stroke', currentItem.color);
                    }
                }
            }
            queueIndex++;
            processNext();
            return;
        }
        
        if (currentItem.type === 'slideOutLeft') {
            onSlideOut(currentItem.duration).then(() => {
                activeElements.forEach(el => {
                    if (el.node.parentNode) el.node.parentNode.removeChild(el.node);
                });
                activeElements.clear();
                queueIndex++;
                processNext();
            });
            return;
        }

        const node = renderDrawItem(currentItem);
        if (node) {
            node.style.opacity = '0';
            node.style.transition = `opacity ${defaultFadeDurationMs}ms ease-in`;
            
            container.appendChild(node);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    node.style.opacity = '1';
                });
            });

            if ('id' in currentItem && currentItem.id) {
                activeElements.set(currentItem.id, { item: currentItem, node });
            }
            
            setTimeout(() => {
                queueIndex++;
                processNext();
            }, defaultFadeDurationMs + 50);
        } else {
            queueIndex++;
            processNext();
        }
    };

    processNext();
}
