import { CommandHandler } from '../core/CommandRegistry';
import { BoardScriptCommand } from '../types';

export const WaitCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'wait' }>> = {
    action: 'wait',
    execute: (cmd, ctx) => {
        if (ctx.isRecording) {
            return ctx.enqueue({ type: 'wait', duration: cmd.duration });
        }
        return ctx.generateId(); // No-op if not recording
    }
};

export const ClearCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'clear' }>> = {
    action: 'clear',
    execute: (cmd, ctx) => {
        return ctx.generateId();
        // Clear is usually handled externally or mapped to a full board clear. 
        // We can expose a custom method on the board for this.
    }
};

export const SlideOutLeftCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'slideOutLeft' }>> = {
    action: 'slideOutLeft',
    execute: (cmd, ctx) => {
        if (ctx.isRecording) {
            return ctx.enqueue({ type: 'slideOutLeft', duration: cmd.duration || 400 });
        }
        return ctx.generateId();
    }
};

export const SetColorCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'setColor' }>> = {
    action: 'setColor',
    execute: (cmd, ctx) => {
        // We'll apply this to the state manager via the Board proxy later
        return ctx.generateId(); 
    }
};

export const SetLineWidthCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'setLineWidth' }>> = {
    action: 'setLineWidth',
    execute: (cmd, ctx) => {
        return ctx.generateId();
    }
};

export const SetSpeedCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'setSpeed' }>> = {
    action: 'setSpeed',
    execute: (cmd, ctx) => {
        return ctx.generateId();
    }
};

export const SetBackgroundCommandHandler: CommandHandler<Extract<BoardScriptCommand, { action: 'setBackground' }>> = {
    action: 'setBackground',
    execute: (cmd, ctx) => {
        return ctx.generateId();
    }
};

export const SystemHandlers = [
    WaitCommandHandler,
    ClearCommandHandler,
    SlideOutLeftCommandHandler,
    SetColorCommandHandler,
    SetLineWidthCommandHandler,
    SetSpeedCommandHandler,
    SetBackgroundCommandHandler
];
