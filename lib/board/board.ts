import { ViewportManager } from './core/ViewportManager';
import { CoordinateResolver } from './core/CoordinateResolver';
import { CanvasStateManager } from './core/CanvasStateManager';
import { CommandRegistry, CommandContext, SizeEstimate } from './core/CommandRegistry';

import { PrimitiveHandlers } from './commands/PrimitiveCommands';
import { MathAndMiscHandlers } from './commands/MiscCommands';
import { SystemHandlers } from './commands/SystemCommands';
import { BoxCommandHandler } from './components/BoxCommandHandler';
import { TableCommandHandler } from './components/TableCommandHandler';

import { runDrawQueueAnimation } from './animation/runner';
import { renderDrawItem } from './animation/renderers';

import { BoardOptions, BoardScriptCommand, DrawItem, Point } from './types';

export class Board {
    public id: string;
    
    // Core Managers
    public viewportManager: ViewportManager;
    public resolver: CoordinateResolver;
    public stateManager: CanvasStateManager;
    public registry: CommandRegistry;

    // Board State
    public isRecording = false;
    public isAnimating = false;
    public drawQueue: DrawItem[] = [];
    public renderedItems: Map<string, { item: DrawItem, node: HTMLElement | SVGElement }> = new Map();
    public speed: number = 15;
    
    private idCounter = 0;

    public get container(): HTMLDivElement { return this.viewportManager.container; }
    public get viewport(): HTMLDivElement { return this.viewportManager.viewport; }
    public get width(): number { return this.viewportManager.logicalWidth; }
    public get height(): number { return this.viewportManager.logicalHeight; }

    constructor(id: string, width: number, height: number, options?: BoardOptions) {
        this.id = id;
        this.speed = options?.speed ?? 15;
        
        // Initialize Core Managers
        this.viewportManager = new ViewportManager(
            id, 
            width, 
            height, 
            options?.fitMode ?? 'contain', 
            options?.responsive !== false, 
            options?.background
        );

        this.resolver = new CoordinateResolver(width, height);
        
        this.stateManager = new CanvasStateManager({
            color: '#000000',
            lineWidth: 2,
            opacity: 1,
            lineDash: []
        });

        // Initialize Command Registry
        this.registry = new CommandRegistry();
        
        // Register Handlers
        [...PrimitiveHandlers, ...MathAndMiscHandlers, ...SystemHandlers, BoxCommandHandler, TableCommandHandler].forEach(handler => {
            this.registry.register(handler as any);
        });
    }

    // --- ID Generation ---
    public generateId(): string {
        this.idCounter++;
        return `_id_${this.idCounter}`;
    }

    // --- State Proxies ---
    public setColor(color: string) { this.stateManager.setColor(color); }
    public setLineWidth(width: number) { this.stateManager.setLineWidth(width); }
    public setSpeed(speed: number) { this.speed = speed; }
    public setOpacity(opacity: number) { this.stateManager.setOpacity(opacity); }
    public setLineDash(dash: number[]) { this.stateManager.setLineDash(dash); }
    public save() { this.stateManager.save(); }
    public restore() { this.stateManager.restore(); }
    public setBackground(color: string) { this.viewportManager.setBackground(color); }
    public clear() {
        this.renderedItems.forEach(({ node }) => {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        });
        this.renderedItems.clear();
        this.drawQueue = [];
    }

    public destroy() {
        this.clear();
        this.viewportManager.destroy();
    }

    // --- Coordinate Translation Proxy ---
    public clientToLogical(clientX: number, clientY: number): Point {
        return this.viewportManager.clientToLogical(clientX, clientY);
    }
    public center(): Point {
        return { x: this.viewportManager.logicalWidth / 2, y: this.viewportManager.logicalHeight / 2 };
    }
    public redraw() {
        this.viewportManager.updateViewport();
    }

    // --- Command Context Factory ---
    private createContext(): CommandContext {
        return {
            resolver: this.resolver,
            generateId: this.generateId.bind(this),
            enqueue: (item: DrawItem) => {
                this.drawQueue.push(item);
                return 'id' in item ? item.id : '';
            },
            renderDirect: (item: DrawItem) => {
                const node = renderDrawItem(item);
                if (node) {
                    this.viewportManager.viewport.appendChild(node);
                    if ('id' in item) {
                        this.renderedItems.set(item.id, { item, node });
                    }
                }
                return 'id' in item ? item.id : '';
            },
            isRecording: this.isRecording,
            currentColor: this.stateManager.currentState.color,
            currentLineWidth: this.stateManager.currentState.lineWidth,
            currentFontFamily: '"Playpen Sans", sans-serif',
            currentLineDash: this.stateManager.currentState.lineDash,
            executeScript: this.processScript.bind(this),
            estimateCommandSize: this.estimateCommandSize.bind(this),
            offsetCommand: this.offsetCommand.bind(this)
        };
    }

    // --- Script Processing API ---
    public processScript(commands: BoardScriptCommand[]): void {
        const ctx = this.createContext();
        for (const cmd of commands) {
            // Intercept direct state modifiers
            if (cmd.action === 'setColor') {
                this.setColor((cmd as any).color);
            } else if (cmd.action === 'setLineWidth') {
                this.setLineWidth((cmd as any).width);
            } else if (cmd.action === 'setSpeed') {
                this.setSpeed((cmd as any).speed);
            } else if (cmd.action === 'setBackground') {
                this.setBackground((cmd as any).color);
            } else if (cmd.action === 'clear') {
                this.clear();
            } else {
                this.registry.execute(cmd, ctx);
            }
        }
    }

    // --- Layout Utilities ---
    public estimateCommandSize(cmd: BoardScriptCommand): SizeEstimate {
        const handler = this.registry.getHandler(cmd.action);
        if (handler && handler.estimateSize) {
            return handler.estimateSize(cmd, this.createContext());
        }
        return { w: 60, h: 40 }; // Default fallback
    }

    public offsetCommand(cmd: BoardScriptCommand, x: number, y: number, sz: SizeEstimate): BoardScriptCommand {
        const handler = this.registry.getHandler(cmd.action);
        if (handler && handler.offset) {
            return handler.offset(cmd, x, y, sz, this.createContext());
        }
        // Generic fallback if not implemented
        const copy: any = { ...cmd };
        if (copy.x !== undefined) copy.x = x;
        if (copy.y !== undefined) copy.y = y;
        return copy;
    }

    // --- Trigger / Animation Control ---
    public beginTrigger() {
        this.idCounter = 0;
        this.clear();
        this.isRecording = true;
        this.drawQueue = [];
    }

    public completeTrigger() {
        this.isRecording = false;
        if (this.drawQueue.length > 0 && !this.isAnimating) {
            this.isAnimating = true;
            runDrawQueueAnimation(
                this.viewportManager.viewport,
                this.drawQueue,
                this.speed,
                () => {
                    this.isAnimating = false;
                },
                (duration: number) => {
                    return this.slideOutLeft(duration);
                },
                this.renderedItems
            );
        }
    }

    public wait(durationMs: number) {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'wait', duration: durationMs });
        }
    }

    // Helper for animations (delete, move, etc)
    public delete(id: string, durationMs: number = 500) {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'delete', id, duration: durationMs });
        }
    }

    public changeColor(id: string, color: string, durationMs: number = 500) {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'changeColor', id, color, duration: durationMs });
        }
    }

    public move(id: string, dx: number, dy: number, durationMs: number = 500) {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'move', id, dx, dy, duration: durationMs });
        }
    }

    public slideOutLeft(durationMs: number = 400): Promise<void> {
        if (this.isRecording) {
            this.drawQueue.push({ type: 'slideOutLeft', duration: durationMs });
            return Promise.resolve();
        }
        // Direct slide out left if not recording
        return new Promise(resolve => {
            this.viewportManager.viewport.style.transition = `transform ${durationMs}ms ease-in-out`;
            this.viewportManager.viewport.style.transform = `translate(-100vw, ${this.viewportManager.viewportOffsetY}px) scale(${this.viewportManager.viewportScale})`;
            setTimeout(() => {
                this.clear();
                this.viewportManager.viewport.style.transition = 'none';
                this.viewportManager.updateViewport();
                resolve();
            }, durationMs);
        });
    }

    // Playback & Timeline Stubs for backwards-compatibility
    public loadTimeline(timeline: any) {}
    public seek(time: number) {}
    public play() {}
    public pause() {}
    public setPlaybackSpeed(speed: number) { this.speed = 15 * speed; }

    // Legacy Aliases (Can be removed later, but kept to prevent breakages)
    public writeText(options: any) { this.processScript([{ action: 'text', ...options }]); }
    public writeParagraph(options: any) { this.processScript([{ action: 'paragraph', ...options }]); }
    public drawLine(options: any) { this.processScript([{ action: 'line', ...options }]); }
    public drawRect(options: any) { this.processScript([{ action: 'rect', ...options }]); }
    public fillRect(options: any) { this.processScript([{ action: 'fillRect', ...options }]); }
    public drawBox(options: any) { this.processScript([{ action: 'box', ...options }]); }
    public drawTable(options: any) { this.processScript([{ action: 'table', ...options }]); }
    public fillPolygon(options: any) { this.processScript([{ action: 'polygon', points: options.points, fillColor: options.fillColor }]); }
    public drawPolygon(options: any) { this.processScript([{ action: 'polygon', points: options.points, color: options.color }]); }
}