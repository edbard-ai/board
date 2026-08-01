export function slideOutLeftAnimation(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    durationMs: number = 400,
    onClear: () => void
): Promise<void> {
    return new Promise((resolve) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
            onClear();
            resolve();
            return;
        }
        tempCtx.drawImage(canvas, 0, 0);

        const startTime = performance.now();
        const width = canvas.width;

        const animateSlide = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / durationMs);
            const easeProgress = progress * (2 - progress);
            const offsetX = easeProgress * width;

            ctx.clearRect(-10000, -10000, 20000, 20000);
            ctx.drawImage(tempCanvas, -offsetX, 0);

            if (progress < 1) {
                requestAnimationFrame(animateSlide);
            } else {
                onClear();
                resolve();
            }
        };

        requestAnimationFrame(animateSlide);
    });
}
