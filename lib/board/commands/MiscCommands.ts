import { CommandHandler, CommandContext, SizeEstimate } from '../core/CommandRegistry';
import { BoardScriptCommand, DrawItem } from '../types';

export const CodeBlockCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'codeBlock' }>> = {
    action: 'codeBlock',
    estimateSize: (cmd, ctx) => {
        return {
            w: ctx.resolver.resolveWidth(cmd.width),
            h: cmd.height ? ctx.resolver.resolveHeight(cmd.height) : 200 // default height estimate
        };
    },
    offset: (cmd, x, y) => {
        const copy = { ...cmd };
        copy.x = x;
        copy.y = y;
        return copy;
    },
    execute: (cmd, ctx) => {
        const id = ctx.generateId();
        const { posX, posY } = ctx.resolver.resolveXY(cmd.x, cmd.y || 0);
        const item: DrawItem = {
            type: 'codeBlock',
            id,
            code: cmd.code,
            language: cmd.language,
            x: posX,
            y: posY,
            width: ctx.resolver.resolveWidth(cmd.width),
            height: cmd.height ? ctx.resolver.resolveHeight(cmd.height) : undefined,
            fontSize: cmd.fontSize ? ctx.resolver.resolveSize(cmd.fontSize) : undefined
        };
        if (ctx.isRecording) {
            return ctx.enqueue(item);
        }
        return ctx.renderDirect(item);
    }
};

export const EllipseCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'ellipse' }>> = {
    action: 'ellipse',
    estimateSize: (cmd, ctx) => {
        return {
            w: ctx.resolver.resolveWidth(cmd.radiusX) * 2,
            h: ctx.resolver.resolveHeight(cmd.radiusY) * 2
        };
    },
    offset: (cmd, x, y, sz) => {
        const copy = { ...cmd };
        copy.cx = x + sz.w / 2;
        copy.cy = y + sz.h / 2;
        return copy;
    },
    execute: (cmd, ctx) => {
        const id = ctx.generateId();
        const { posX, posY } = ctx.resolver.resolveXY(cmd.cx, cmd.cy || 0);
        const item: DrawItem = {
            type: 'ellipse',
            id,
            cx: posX,
            cy: posY,
            radiusX: ctx.resolver.resolveWidth(cmd.radiusX),
            radiusY: ctx.resolver.resolveHeight(cmd.radiusY),
            rotation: cmd.rotation,
            color: cmd.color || ctx.currentColor,
            fillColor: cmd.fillColor,
            lineWidth: ctx.currentLineWidth
        };
        if (ctx.isRecording) {
            return ctx.enqueue(item);
        }
        return ctx.renderDirect(item);
    }
};

export const MathCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'math' }>> = {
    action: 'math',
    estimateSize: (cmd, ctx) => {
        return { w: 100, h: 40 };
    },
    offset: (cmd, x, y) => {
        const copy = { ...cmd };
        copy.x = x;
        copy.y = y;
        return copy;
    },
    execute: (cmd, ctx) => {
        const id = ctx.generateId();
        const { posX, posY } = ctx.resolver.resolveXY(cmd.x, cmd.y || 0);
        const item: DrawItem = {
            type: 'math',
            id,
            formula: cmd.formula,
            x: posX,
            y: posY,
            fontSize: ctx.resolver.resolveSize(cmd.fontSize || 24),
            fontFamily: cmd.fontFamily || ctx.currentFontFamily,
            color: cmd.color || ctx.currentColor,
            displayMode: true
        };
        if (ctx.isRecording) {
            return ctx.enqueue(item);
        }
        return ctx.renderDirect(item);
    }
};

export const MathAndMiscHandlers = [CodeBlockCommandHandler, EllipseCommandHandler, MathCommandHandler];
