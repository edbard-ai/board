export class ViewportManager {
    public container: HTMLDivElement;
    public viewport: HTMLDivElement;
    public logicalWidth: number;
    public logicalHeight: number;
    public fitMode: 'contain' | 'cover' | 'fill';
    public viewportScale: number = 1;
    public viewportOffsetX: number = 0;
    public viewportOffsetY: number = 0;
    private resizeObserver: ResizeObserver | null = null;

    constructor(
        containerId: string,
        logicalWidth: number,
        logicalHeight: number,
        fitMode: 'contain' | 'cover' | 'fill' = 'contain',
        responsive: boolean = true,
        backgroundColor?: string
    ) {
        this.logicalWidth = logicalWidth;
        this.logicalHeight = logicalHeight;
        this.fitMode = fitMode;

        this.container = document.getElementById(containerId)! as HTMLDivElement;
        
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        if (backgroundColor) {
            this.container.style.backgroundColor = backgroundColor;
        }

        this.viewport = document.createElement('div');
        this.viewport.style.position = 'absolute';
        this.viewport.style.left = '0';
        this.viewport.style.top = '0';
        this.viewport.style.width = `${this.logicalWidth}px`;
        this.viewport.style.height = `${this.logicalHeight}px`;
        this.viewport.style.transformOrigin = '0 0';
        this.container.appendChild(this.viewport);

        this.updateViewport();

        if (responsive) {
            this.initResizeObserver();
        }
    }

    private initResizeObserver() {
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                this.updateViewport();
            });
            this.resizeObserver.observe(this.container);
        }
    }

    public updateViewport() {
        const containerWidth = this.container.clientWidth || this.logicalWidth;
        const containerHeight = this.container.clientHeight || this.logicalHeight;

        const scaleX = containerWidth / this.logicalWidth;
        const scaleY = containerHeight / this.logicalHeight;

        if (this.fitMode === 'contain') {
            const scale = Math.min(scaleX, scaleY);
            this.viewportScale = scale;
            this.viewportOffsetX = (containerWidth - this.logicalWidth * scale) / 2;
            this.viewportOffsetY = (containerHeight - this.logicalHeight * scale) / 2;
        } else if (this.fitMode === 'cover') {
            const scale = Math.max(scaleX, scaleY);
            this.viewportScale = scale;
            this.viewportOffsetX = (containerWidth - this.logicalWidth * scale) / 2;
            this.viewportOffsetY = (containerHeight - this.logicalHeight * scale) / 2;
        } else {
            this.viewportScale = scaleX;
            this.viewportOffsetX = 0;
            this.viewportOffsetY = 0;
        }

        this.applyViewportTransform();
    }

    private applyViewportTransform() {
        if (this.fitMode === 'fill') {
            const containerWidth = this.container.clientWidth || this.logicalWidth;
            const containerHeight = this.container.clientHeight || this.logicalHeight;
            const scaleX = containerWidth / this.logicalWidth;
            const scaleY = containerHeight / this.logicalHeight;
            this.viewport.style.transform = `scale(${scaleX}, ${scaleY})`;
        } else {
            this.viewport.style.transform = `translate(${this.viewportOffsetX}px, ${this.viewportOffsetY}px) scale(${this.viewportScale})`;
        }
    }

    public setBackground(color: string) {
        if (this.container) {
            this.container.style.backgroundColor = color;
        }
    }

    public clientToLogical(clientX: number, clientY: number): { x: number; y: number } {
        const rect = this.container.getBoundingClientRect();
        const containerX = clientX - rect.left;
        const containerY = clientY - rect.top;

        if (this.fitMode === 'fill') {
            const scaleX = rect.width / this.logicalWidth;
            const scaleY = rect.height / this.logicalHeight;
            return {
                x: containerX / scaleX,
                y: containerY / scaleY
            };
        }

        return {
            x: (containerX - this.viewportOffsetX) / this.viewportScale,
            y: (containerY - this.viewportOffsetY) / this.viewportScale
        };
    }

    public destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}
