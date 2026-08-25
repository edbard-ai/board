export interface CanvasState {
    color: string;
    lineWidth: number;
    opacity: number;
    lineDash: number[];
}

export class CanvasStateManager {
    private stack: CanvasState[] = [];
    public currentState: CanvasState;

    constructor(initialState: CanvasState) {
        this.currentState = { ...initialState };
    }

    public setColor(color: string) {
        this.currentState.color = color;
    }

    public setLineWidth(width: number) {
        this.currentState.lineWidth = width;
    }

    public setOpacity(opacity: number) {
        this.currentState.opacity = opacity;
    }

    public setLineDash(dash: number[]) {
        this.currentState.lineDash = [...dash];
    }

    public save() {
        this.stack.push({
            color: this.currentState.color,
            lineWidth: this.currentState.lineWidth,
            opacity: this.currentState.opacity,
            lineDash: [...this.currentState.lineDash]
        });
    }

    public restore() {
        if (this.stack.length > 0) {
            this.currentState = this.stack.pop()!;
        }
    }
}
