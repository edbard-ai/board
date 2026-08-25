import { CommandHandler, SizeEstimate } from '../core/CommandRegistry';
import { BoardScriptCommand, SizeCoord } from '../types';

export const BoxCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'box' }>> = {
    action: 'box',
    estimateSize: (cmd, ctx) => {
        const normalizedItems: BoardScriptCommand[] = (cmd.items || []).map(item => {
            if (typeof item === 'string') {
                return { action: 'paragraph', text: item, x: 0, y: 0, width: (cmd.width === 'auto' || cmd.width === undefined) ? 600 : '100%', fontSize: 20, color: cmd.color || '#ffffff' } as BoardScriptCommand;
            }
            return item as BoardScriptCommand;
        });
        const items = normalizedItems;
        const gap = cmd.gap ?? 12;
        const isRow = cmd.direction === 'horizontal' || cmd.direction === 'row' || !cmd.direction;

        let pTop = 16, pRight = 16, pBottom = 16, pLeft = 16;
        if (typeof cmd.padding === 'number') {
            pTop = pRight = pBottom = pLeft = cmd.padding;
        } else if (cmd.padding && typeof cmd.padding === 'object') {
            pTop = cmd.padding.top ?? 16;
            pRight = cmd.padding.right ?? 16;
            pBottom = cmd.padding.bottom ?? 16;
            pLeft = cmd.padding.left ?? 16;
        }

        const itemSizes = items.map((childCmd) => ctx.estimateCommandSize(childCmd));

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

        const boxW = (cmd.width === undefined || cmd.width === 'auto')
            ? calculatedWidth
            : ctx.resolver.resolveWidth(cmd.width as SizeCoord);
        const boxH = (cmd.height === undefined || cmd.height === 'auto')
            ? calculatedHeight
            : ctx.resolver.resolveHeight(cmd.height as SizeCoord);

        return { w: boxW, h: boxH };
    },
    
    offset: (cmd, x, y) => {
        const copy = { ...cmd };
        copy.x = x;
        copy.y = y;
        return copy;
    },

    execute: (cmd, ctx) => {
        const itemId = ctx.generateId();
        const normalizedItems: BoardScriptCommand[] = (cmd.items || []).map(item => {
            if (typeof item === 'string') {
                return { action: 'paragraph', text: item, x: 0, y: 0, width: (cmd.width === 'auto' || cmd.width === undefined) ? 600 : '100%', fontSize: 24, color: cmd.color || '#ffffff' } as BoardScriptCommand;
            }
            return item as BoardScriptCommand;
        });
        const items = normalizedItems;
        const gap = cmd.gap ?? 12;
        const isRow = cmd.direction === 'horizontal' || cmd.direction === 'row' || !cmd.direction;
        const alignH = cmd.alignHorizontal ?? 'center';
        const alignV = cmd.alignVertical ?? 'center';

        let pTop = 16, pRight = 16, pBottom = 16, pLeft = 16;
        if (typeof cmd.padding === 'number') {
            pTop = pRight = pBottom = pLeft = cmd.padding;
        } else if (cmd.padding && typeof cmd.padding === 'object') {
            pTop = cmd.padding.top ?? 16;
            pRight = cmd.padding.right ?? 16;
            pBottom = cmd.padding.bottom ?? 16;
            pLeft = cmd.padding.left ?? 16;
        }

        const itemSizes = items.map((childCmd) => ctx.estimateCommandSize(childCmd));

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

        const boxW = (cmd.width === undefined || cmd.width === 'auto')
            ? calculatedWidth
            : ctx.resolver.resolveWidth(cmd.width as SizeCoord);
        const boxH = (cmd.height === undefined || cmd.height === 'auto')
            ? calculatedHeight
            : ctx.resolver.resolveHeight(cmd.height as SizeCoord);

        const { posX: rawX, posY: rawY } = ctx.resolver.resolveXY(cmd.x ?? 'center', cmd.y ?? 'center');

        let boxX = rawX;
        if (cmd.x === 'center' || cmd.x === undefined) {
            boxX = rawX - boxW / 2;
        }
        let boxY = rawY;
        if (cmd.y === 'center' || cmd.y === undefined) {
            boxY = rawY - boxH / 2;
        }

        if (cmd.fillColor || cmd.color) {
            const rectCmd: BoardScriptCommand = {
                action: 'rect',
                x: boxX,
                y: boxY,
                width: boxW,
                height: boxH,
                color: cmd.color,
                fillColor: cmd.fillColor,
                radius: cmd.radius ?? 12,
            };
            ctx.executeScript([rectCmd]);
        }

        if (cmd.title) {
            const textCmd: BoardScriptCommand = {
                action: 'text',
                text: cmd.title,
                x: boxX + pLeft,
                y: boxY + Math.min(pTop, 20),
                fontSize: 26,
                fontWeight: 'bold',
                color: cmd.color || '#ffffff',
            };
            ctx.executeScript([textCmd]);
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
            items.forEach((childCmd, idx) => {
                const sz = itemSizes[idx];
                let itemY = contentAreaY;
                if (alignV === 'center') {
                    itemY = contentAreaY + (contentAreaH - sz.h) / 2;
                } else if (alignV === 'bottom') {
                    itemY = contentAreaY + contentAreaH - sz.h;
                }

                const positionedCmd = ctx.offsetCommand(childCmd, currX, itemY, sz);
                ctx.executeScript([positionedCmd]);

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
            items.forEach((childCmd, idx) => {
                const sz = itemSizes[idx];
                let itemX = contentAreaX;
                if (alignH === 'center') {
                    itemX = contentAreaX + (contentAreaW - sz.w) / 2;
                } else if (alignH === 'right') {
                    itemX = contentAreaX + contentAreaW - sz.w;
                }

                const positionedCmd = ctx.offsetCommand(childCmd, itemX, currY, sz);
                ctx.executeScript([positionedCmd]);

                currY += sz.h + gap;
            });
        }

        return itemId;
    }
};
