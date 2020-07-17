function getId(id) {
    return document.getElementById(id);
}
window.addEventListener('load', () => {
    let form = getId('form');
    let renderer = new VideoRenderer(form.width.value, form.numCores.value, form.bootTime.value.length > 0 ? Number(form.bootTime.value) * 1000 : Date.now());
    renderer.source.addEventListener('play', () => {
        requestAnimationFrame(function frame() {
            renderer.drawCores();
            if (!renderer.source.paused && !renderer.source.ended) {
                requestAnimationFrame(frame);
            }
        });
    });
    form.url.value = String(renderer.source.src);
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        renderer.setDimensions(this.width.value, this.numCores.value);
        console.log(renderer.source.src);
        console.log(this.url.value);
        if (renderer.source.src !== this.url.value) {
            renderer.source.src = this.url.value;
        }
        renderer.setBootTime(this.bootTime.value);
        renderer.drawCores();
    });
    let taskManager = getId('taskManager');
    for (const [elem, prop, ext] of [
        ['winWidth', '--window-width', 'px'],
        ['winHeight', '--window-height', 'px'],
        ['sidebarWidth', '--sidebar-width', 'px'],
        ['winScale', '--scale-raw', '']
    ]) {
        let inputElem = form[elem];
        taskManager.style.setProperty(prop, inputElem.value + ext);
        inputElem.addEventListener('input', function () {
            taskManager.style.setProperty(prop, this.value + ext);
        });
    }
    getId('closeWindow').addEventListener('click', function () {
        getId('taskManager').style.opacity = '0';
        getId('ctrlShiftEsc').hidden = false;
    });
    getId('ctrlShiftEsc').addEventListener('click', function () {
        this.hidden = true;
        getId('taskManager').style.removeProperty('opacity');
    });
    getId('maxWindow').addEventListener('click', () => {
        toggleFullscreen();
    });
    let renderButton = getId('render');
    renderButton.addEventListener('click', () => { renderer.drawCores(); });
});
function toggleFullscreen() {
    document.body.classList.toggle('fullscreen');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    }
    else {
        document.exitFullscreen();
    }
}
// A premade cell
let defaultCell = document.createElement('div');
defaultCell.classList.add('cell');
let background = document.createElement('div');
background.classList.add('background');
let percent = document.createElement('div');
percent.classList.add('percent');
defaultCell.append(background, percent);
class VideoRenderer {
    constructor(width, numCores, bootTime) {
        this.source = getId('source');
        this.canvas = getId('intermediate');
        this.cores = getId('cores');
        this.utilization = getId('utilization');
        this.uptime = getId('uptime');
        this.bootTime = bootTime;
        this.setDimensions(width, numCores);
        this.setupCells();
        this.updateUptime();
    }
    setBootTime(time) {
        this.bootTime = time * 1000;
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
        this.utilization.textContent = `${Math.round(sum)}%`;
        this.updateUptime();
    }
    updateUptime() {
        let elapsed = Math.floor((Date.now() - this.bootTime) / 1000);
        // Only update if time is different
        if (this.lastTime === elapsed) {
            return;
        }
        this.lastTime = elapsed;
        // Seconds
        this.uptime.children[3].textContent = String(elapsed % 60).padStart(2, '0');
        elapsed = Math.floor(elapsed / 60);
        // Minutes
        this.uptime.children[2].textContent = String(elapsed % 60).padStart(2, '0');
        elapsed = Math.floor(elapsed / 60);
        // Hours
        this.uptime.children[1].textContent = String(elapsed % 24).padStart(2, '0');
        elapsed = Math.floor(elapsed / 24);
        // Days
        this.uptime.children[0].textContent = String(elapsed);
    }
}
//# sourceMappingURL=beepboop.js.map