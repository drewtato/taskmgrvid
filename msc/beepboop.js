const width = 16;
const numCores = 128;
function getId(id) {
    return document.getElementById(id);
}
window.addEventListener('load', () => {
    let renderer = new VideoRenderer(width, numCores);
    renderer.source.addEventListener('play', () => {
        requestAnimationFrame(function frame() {
            renderer.drawCores();
            if (!renderer.source.paused && !renderer.source.ended) {
                requestAnimationFrame(frame);
            }
        });
    });
    let form = getId('form');
    form['width'].value = String(renderer.width);
    form['numCores'].value = String(renderer.numCores);
    form['url'].value = String(renderer.source.src);
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        renderer.setDimensions(this['width'].value, this['numCores'].value);
        console.log(renderer.source.src);
        console.log(this['url'].value);
        if (renderer.source.src !== this['url'].value) {
            renderer.source.src = this['url'].value;
        }
        renderer.drawCores();
    });
    let renderButton = getId('render');
    renderButton.addEventListener('click', () => { renderer.drawCores(); });
});
// A premade cell
let defaultCell = document.createElement('div');
defaultCell.classList.add('cell');
let background = document.createElement('div');
background.classList.add('background');
let percent = document.createElement('div');
percent.classList.add('percent');
defaultCell.append(background, percent);
class VideoRenderer {
    constructor(width, numCores) {
        this.source = getId('source');
        this.canvas = getId('intermediate');
        this.cores = getId('cores');
        this.utilization = getId('utilization');
        this.setDimensions(width, numCores);
        this.setupCells();
    }
    setWidth(width) {
        this.setDimensions(width, this.numCores);
    }
    setCores(numCores) {
        this.setDimensions(this.width, numCores);
    }
    setDimensions(width, numCores) {
        this.width = width;
        this.numCores = numCores;
        this.height = Math.ceil(numCores / width);
        this.canvas.width = width;
        this.canvas.height = this.height;
        this.intermediate = this.canvas.getContext('2d', {
            alpha: false,
            desynchronized: true,
        });
        this.setupCells();
    }
    setupCells() {
        this.cores.style.setProperty('--width', String(this.width));
        while (this.cores.childNodes.length > this.numCores) {
            this.cores.removeChild(this.cores.lastChild);
        }
        while (this.cores.childNodes.length < this.numCores) {
            this.cores.appendChild(this.createCell(0));
        }
    }
    createCell(percent) {
        let newCell = defaultCell.cloneNode(true);
        this.updateCell(newCell, percent);
        return newCell;
    }
    updateCell(cell, percent) {
        let percentString = `${Math.round(percent)}%`;
        let [bgDiv, percentDiv] = cell.childNodes;
        bgDiv.style.opacity = percentString;
        percentDiv.textContent = percentString;
    }
    drawToIntermediate() {
        this.intermediate.drawImage(this.source, 0, 0, this.width, this.height);
    }
    drawCores() {
        this.drawToIntermediate();
        let data = this.intermediate.getImageData(0, 0, this.width, this.height).data;
        let i = 0;
        let sum = 0;
        for (const cell of this.cores.childNodes) {
            if (i > data.length) {
                break;
            }
            let grey = (data[i] + data[i + 1] + data[i + 2]) / 3;
            let percent = 100 - grey / 255 * 100;
            this.updateCell(cell, percent);
            sum += percent;
            i += 4;
        }
        sum /= this.cores.childNodes.length;
        // Sadly, this tanks performance
        // this.utilization.textContent = `${Math.round(sum)}%`
    }
}
//# sourceMappingURL=beepboop.js.map