const width = 32;
const height = 32;
window.addEventListener('load', () => {
    let [source, intermediate, scale] = setup(width, height);
    source.addEventListener('play', () => {
        renderIntermediate(source, intermediate.getContext('2d'), scale, width, height);
    });
});
function setup(width, height) {
    let canvas = document.getElementById('intermediate');
    let source = document.getElementById('source');
    canvas.width = width;
    canvas.height = height;
    let widthScale = width / source.videoWidth;
    let heightScale = height / source.videoHeight;
    let scale = Math.min(widthScale, heightScale);
    return [source, canvas, scale];
}
function renderIntermediate(source, intermediate, scale, width, height) {
    intermediate.drawImage(source, 0, 0, source.videoWidth * scale, source.videoHeight * scale);
    renderTaskManager(intermediate, width, height, document.getElementById('cores'));
    if (!source.paused && !source.ended) {
        window.requestAnimationFrame(() => renderIntermediate(source, intermediate, scale, width, height));
    }
}
function renderTaskManager(intermediate, width, height, manager) {
    manager.innerText = grayscalePixels(intermediate, width, height);
}
function grayscalePixels(ctx, width, height) {
    let img = ctx.getImageData(0, 0, width, height);
    let display = '';
    for (let row = 0; row < width; row++) {
        for (let col = 0; col < height; col++) {
            let [r, g, b, a] = getPixel(img, row * width + col);
            let grayscale = (r + g + b) * a / 3 / 255;
            let piece = String((255 - grayscale) / 255 * 100).split('.', 1)[0].padStart(3, ' ');
            display += piece + ' ';
            // display += `${r} ${g} ${b} ${a} ${grayscale}, `
        }
        display += '\n';
        display += '\n';
    }
    return display;
}
function getPixel(img, index) {
    let adjusted = index * 4;
    return [
        img.data[adjusted],
        img.data[adjusted + 1],
        img.data[adjusted + 2],
        img.data[adjusted + 3]
    ];
}
//# sourceMappingURL=beepboop.js.map