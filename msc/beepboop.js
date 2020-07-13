const width = 8;
const height = 8;
window.addEventListener('load', () => {
    let [source, intermediate, scale] = setup(width, height);
    renderIntermediate(source, intermediate.getContext('2d'), scale, width, height);
    source.addEventListener('play', () => {
        renderIntermediate(source, intermediate.getContext('2d'), scale, width, height);
    });
});
function setup(width, height) {
    let canvas = document.getElementById('intermediate');
    let source = document.getElementById('source');
    document.getElementById('cores').style.setProperty('--width', String(width));
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
    const pixels = grayscalePixels(intermediate, width, height);
    manager.innerHTML = '';
    manager.append(...pixels);
}
function grayscalePixels(ctx, width, height) {
    let img = ctx.getImageData(0, 0, width, height);
    let coresElems = [];
    for (let row = 0; row < width; row++) {
        for (let col = 0; col < height; col++) {
            let percentElem = document.createElement('div');
            percentElem.classList.add('percent');
            let [r, g, b, a] = getPixel(img, row * width + col);
            let grayscale = (r + g + b) * a / 3 / 255;
            // let piece = String((255 - grayscale) / 255 * 100).split('.', 1)[0].padStart(3, ' ')
            // display += piece + ' '
            // display += `${r} ${g} ${b} ${a} ${grayscale}, `
            percentElem.innerText = `${Math.round((255 - grayscale) / 255 * 100)}%`;
            let bgElem = document.createElement('div');
            bgElem.style.setProperty('opacity', percentElem.innerText);
            bgElem.classList.add('background');
            let cellElem = document.createElement('div');
            cellElem.classList.add('cell');
            cellElem.appendChild(bgElem);
            cellElem.appendChild(percentElem);
            coresElems.push(cellElem);
        }
        // display += '\n'
        // display += '\n'
    }
    return coresElems;
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