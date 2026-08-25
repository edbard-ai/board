import { CommandHandler, SizeEstimate } from '../core/CommandRegistry';
import { BoardScriptCommand, DrawItem } from '../types';

export const TableCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'table' }>> = {
    action: 'table',
    estimateSize: (cmd, ctx) => {
        const rows = cmd.data.length;
        const cols = cmd.data[0]?.length || 0;
        return {
            w: cols * ctx.resolver.resolveSize(cmd.cellWidth || 120),
            h: rows * ctx.resolver.resolveSize(cmd.cellHeight || 40, 'y')
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
            type: 'table',
            id,
            data: cmd.data,
            x: posX,
            y: posY,
            cellWidth: ctx.resolver.resolveSize(cmd.cellWidth || 120),
            cellHeight: ctx.resolver.resolveSize(cmd.cellHeight || 40, 'y'),
            headerBgColor: cmd.headerBgColor || '#f1f5f9',
            headerTextColor: cmd.headerTextColor || '#1e293b',
            rowBgColor: cmd.rowBgColor || '#ffffff',
            altRowBgColor: cmd.altRowBgColor || '#f8fafc',
            textColor: cmd.textColor || '#334155',
            borderColor: cmd.borderColor || '#e2e8f0',
            fontSize: ctx.resolver.resolveSize(cmd.fontSize || 16),
            fontFamily: cmd.fontFamily || ctx.currentFontFamily
        };
        if (ctx.isRecording) {
            return ctx.enqueue(item);
        }
        return ctx.renderDirect(item);
    }
};
