import { DrawItem, BoardScriptCommand } from '../types';
import { CoordinateResolver } from './CoordinateResolver';

export interface CommandContext {
    resolver: CoordinateResolver;
    generateId: () => string;
    enqueue: (item: DrawItem) => string;
    renderDirect: (item: DrawItem) => string;
    isRecording: boolean;
    currentColor: string;
    currentLineWidth: number;
    currentFontFamily: string;
    currentLineDash: number[];
    executeScript: (cmds: BoardScriptCommand[]) => void;
    estimateCommandSize: (cmd: BoardScriptCommand) => SizeEstimate;
    offsetCommand: (cmd: BoardScriptCommand, x: number, y: number, sz: SizeEstimate) => BoardScriptCommand;
}

export interface SizeEstimate {
    w: number;
    h: number;
}

export interface CommandHandler<T extends BoardScriptCommand = any> {
    action: string;
    
    // Convert the raw command into an enqueued item and return its ID
    execute: (cmd: T, context: CommandContext) => string;
    
    // Estimate size for layout components (like box and table)
    estimateSize?: (cmd: T, context: CommandContext) => SizeEstimate;
    
    // Offset the command coordinates for layout components
    offset?: (cmd: T, x: number, y: number, sz: SizeEstimate, context: CommandContext) => T;
}

export class CommandRegistry {
    private handlers: Map<string, CommandHandler> = new Map();

    public register(handler: CommandHandler) {
        this.handlers.set(handler.action, handler);
    }

    public getHandler(action: string): CommandHandler | undefined {
        return this.handlers.get(action);
    }

    public execute(cmd: BoardScriptCommand, context: CommandContext): string | null {
        const handler = this.handlers.get(cmd.action);
        if (handler) {
            return handler.execute(cmd, context);
        }
        console.warn(`[CommandRegistry] No handler registered for action: ${cmd.action}`);
        return null;
    }
}
