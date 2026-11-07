import { CommandHandler, CommandContext, SizeEstimate } from '../core/CommandRegistry';
import { BoardScriptCommand, DrawItem } from '../types';

function createSimpleHandler<T extends BoardScriptCommand>(
    action: string,
    toDrawItem: (cmd: T, ctx: CommandContext, id: string) => DrawItem,
    defaultSize: SizeEstimate = { w: 60, h: 40 },
    offsetCoordinates: (cmd: T, dx: number, dy: number, sz: SizeEstimate) => void
): CommandHandler<T> {
    return {
        action,
        estimateSize: (cmd, ctx) => {
            if ('width' in cmd && 'height' in cmd) {
                return {
                    w: cmd.width ? ctx.resolver.resolveWidth(cmd.width as any) : defaultSize.w,
                    h: cmd.height ? ctx.resolver.resolveHeight(cmd.height as any) : defaultSize.h
                };
            }
            if ('radius' in cmd) {
                const r = ctx.resolver.resolveSize(cmd.radius as any);
                return { w: r * 2, h: r * 2 };
            }
            if ('radiusX' in cmd && 'radiusY' in cmd) {
                return {
                    w: ctx.resolver.resolveWidth(cmd.radiusX as any) * 2,
                    h: ctx.resolver.resolveHeight(cmd.radiusY as any) * 2
                };
            }
            return defaultSize;
        },
        offset: (cmd, x, y, sz, ctx) => {
            const copy = { ...cmd };
            offsetCoordinates(copy, x, y, sz);
            return copy;
        },
        execute: (cmd, ctx) => {
            const id = ctx.generateId();
            const item = toDrawItem(cmd, ctx, id);
            if (ctx.isRecording) {
                return ctx.enqueue(item);
            }
            return ctx.renderDirect(item);
        }
    };
}

export const RectCommandHandler = createSimpleHandler<Extract<BoardScriptCommand, { action: 'rect' }>>(
    'rect',
    (cmd, ctx, id) => {
        const { posX, posY } = ctx.resolver.resolveXY(cmd.x, cmd.y || 0);
        return {
            type: 'drawRect',
            id,
            x: posX,
            y: posY,
            width: ctx.resolver.resolveWidth(cmd.width),
            height: ctx.resolver.resolveHeight(cmd.height),
            color: cmd.color || ctx.currentColor,
            fillColor: cmd.fillColor,
            radius: cmd.radius ? ctx.resolver.resolveSize(cmd.radius) : 0,
            lineWidth: ctx.currentLineWidth
        };
    },
    { w: 100, h: 100 },
    (cmd, x, y) => {
        cmd.x = x;
        cmd.y = y;
    }
);

export const FillRectCommandHandler = createSimpleHandler<Extract<BoardScriptCommand, { action: 'fillRect' }>>(
    'fillRect',
    (cmd, ctx, id) => {
        const { posX, posY } = ctx.resolver.resolveXY(cmd.x, cmd.y || 0);
        return {
            type: 'fillRect',
            id,
            x: posX,
            y: posY,
            width: ctx.resolver.resolveWidth(cmd.width),
            height: ctx.resolver.resolveHeight(cmd.height),
            fillColor: cmd.fillColor,
            radius: cmd.radius ? ctx.resolver.resolveSize(cmd.radius) : 0
        };
    },
    { w: 100, h: 100 },
    (cmd, x, y) => {
        cmd.x = x;
        cmd.y = y;
    }
);

export const TextCommandHandler = createSimpleHandler<Extract<BoardScriptCommand, { action: 'text' }>>(
    'text',
    (cmd, ctx, id) => {
        const { posX, posY } = ctx.resolver.resolveXY(cmd.x, cmd.y || 0);
        return {
            type: 'text',
            id,
            text: cmd.text,
            x: posX,
            y: posY,
            fontSize: ctx.resolver.resolveSize(cmd.fontSize || 24),
            fontFamily: cmd.fontFamily || ctx.currentFontFamily,
            color: cmd.color || ctx.currentColor,
            textAlign: cmd.textAlign ?? (cmd.x === 'center' || cmd.x === '50%' ? 'center' : undefined),
            fontWeight: cmd.fontWeight,
            fontStyle: cmd.fontStyle,
            textDecoration: cmd.textDecoration,
            underline: cmd.underline
        };
    },
    { w: 120, h: 40 },
    (cmd, x, y) => {
        cmd.x = x;
        cmd.y = y;
    }
);

export const ParagraphCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'paragraph' }>> = {
    action: 'paragraph',
    estimateSize: (cmd, ctx) => {
        const width = cmd.width !== undefined ? ctx.resolver.resolveWidth(cmd.width) : 600;
        const fontSize = cmd.fontSize !== undefined ? ctx.resolver.resolveSize(cmd.fontSize) : 24;
        const lineHeight = cmd.lineHeight || 1.5;
        const text = cmd.text || '';
        const avgCharWidth = fontSize * 0.55;
        const charsPerLine = Math.max(1, Math.floor(width / avgCharWidth));
        const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
        const height = lines * fontSize * lineHeight;
        return { w: width, h: height };
    },
    offset: (cmd, x, y, sz) => {
        const copy = { ...cmd };
        copy.x = x;
        copy.y = y;
        if (sz && sz.w) {
            copy.width = sz.w;
        }
        return copy;
    },
    execute: (cmd, ctx) => {
        const id = ctx.generateId();
        const { posX, posY } = ctx.resolver.resolveXY(cmd.x, cmd.y || 0);
        const item: DrawItem = {
            type: 'paragraph',
            id,
            text: cmd.text,
            x: posX,
            y: posY,
            width: ctx.resolver.resolveWidth(cmd.width),
            lineHeight: cmd.lineHeight || 1.5,
            fontSize: ctx.resolver.resolveSize(cmd.fontSize || 24),
            fontFamily: cmd.fontFamily || ctx.currentFontFamily,
            color: cmd.color || ctx.currentColor,
            textAlign: cmd.textAlign ?? (cmd.x === 'center' || cmd.x === '50%' ? 'center' : undefined),
            fontWeight: cmd.fontWeight,
            fontStyle: cmd.fontStyle,
            textDecoration: cmd.textDecoration,
            underline: cmd.underline
        };
        if (ctx.isRecording) {
            return ctx.enqueue(item);
        }
        return ctx.renderDirect(item);
    }
};

export const CircleCommandHandler = createSimpleHandler<Extract<BoardScriptCommand, { action: 'circle' }>>(
    'circle',
    (cmd, ctx, id) => {
        const { posX, posY } = ctx.resolver.resolveXY(cmd.cx, cmd.cy || 0);
        return {
            type: 'circle',
            id,
            cx: posX,
            cy: posY,
            radius: ctx.resolver.resolveSize(cmd.radius),
            color: cmd.color || ctx.currentColor,
            fillColor: cmd.fillColor,
            lineWidth: ctx.currentLineWidth
        };
    },
    { w: 100, h: 100 },
    (cmd, x, y, sz) => {
        cmd.cx = x + sz.w / 2;
        cmd.cy = y + sz.h / 2;
    }
);

export const LineCommandHandler = createSimpleHandler<Extract<BoardScriptCommand, { action: 'line' }>>(
    'line',
    (cmd, ctx, id) => {
        return {
            type: 'line',
            id,
            x1: ctx.resolver.resolveX(cmd.x1),
            y1: ctx.resolver.resolveY(cmd.y1),
            x2: ctx.resolver.resolveX(cmd.x2),
            y2: ctx.resolver.resolveY(cmd.y2),
            color: cmd.color || ctx.currentColor,
            lineWidth: ctx.currentLineWidth,
            lineDash: cmd.lineDash || ctx.currentLineDash
        };
    },
    { w: 100, h: 2 },
    (cmd, x, y, sz) => {
        cmd.x1 = x;
        cmd.y1 = y + sz.h / 2;
        cmd.x2 = x + sz.w;
        cmd.y2 = y + sz.h / 2;
    }
);

export const ArrowCommandHandler = createSimpleHandler<Extract<BoardScriptCommand, { action: 'arrow' }>>(
    'arrow',
    (cmd, ctx, id) => {
        return {
            type: 'arrow',
            id,
            x1: ctx.resolver.resolveX(cmd.x1),
            y1: ctx.resolver.resolveY(cmd.y1),
            x2: ctx.resolver.resolveX(cmd.x2),
            y2: ctx.resolver.resolveY(cmd.y2),
            color: cmd.color || ctx.currentColor,
            headSize: cmd.headSize,
            lineWidth: ctx.currentLineWidth
        };
    },
    { w: 100, h: 2 },
    (cmd, x, y, sz) => {
        cmd.x1 = x;
        cmd.y1 = y + sz.h / 2;
        cmd.x2 = x + sz.w;
        cmd.y2 = y + sz.h / 2;
    }
);

export const ImageCommandHandler = createSimpleHandler<Extract<BoardScriptCommand, { action: 'image' }>>(
    'image',
    (cmd, ctx, id) => {
        const { posX, posY } = ctx.resolver.resolveXY(cmd.x, cmd.y || 0);
        return {
            type: 'image',
            id,
            src: cmd.src,
            x: posX,
            y: posY,
            width: cmd.width !== undefined ? ctx.resolver.resolveWidth(cmd.width) : undefined,
            height: cmd.height !== undefined ? ctx.resolver.resolveHeight(cmd.height) : undefined,
            opacity: cmd.opacity || 1
        };
    },
    { w: 200, h: 200 },
    (cmd, x, y) => {
        cmd.x = x;
        cmd.y = y;
    }
);

export const PolygonCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'polygon' }>> = {
    action: 'polygon',
    estimateSize: (cmd, ctx) => ({ w: 100, h: 100 }),
    offset: (cmd, x, y) => ({ ...cmd }),
    execute: (cmd, ctx) => {
        const id = ctx.generateId();
        const resolvedPoints = cmd.points.map(p => ({
            x: ctx.resolver.resolveX(p.x),
            y: ctx.resolver.resolveY(p.y)
        }));
        const item: DrawItem = {
            type: 'fillPolygon',
            id,
            points: resolvedPoints,
            fillColor: cmd.fillColor || ctx.currentColor
        };
        if (ctx.isRecording) {
            return ctx.enqueue(item);
        }
        return ctx.renderDirect(item);
    }
};

export const PrimitiveHandlers = [
    RectCommandHandler,
    FillRectCommandHandler,
    TextCommandHandler,
    ParagraphCommandHandler,
    CircleCommandHandler,
    LineCommandHandler,
    ArrowCommandHandler,
    ImageCommandHandler,
    PolygonCommandHandler
];
