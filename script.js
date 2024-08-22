const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const brushSelect = document.getElementById('brush-select');
const colorPicker = document.getElementById('color-picker');
const lineWidth = document.getElementById('line-width');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const newBtn = document.getElementById('new');
const clearBtn = document.getElementById('clear');
const saveBtn = document.getElementById('save');
const downloadBtn = document.getElementById('download');
const bgColorPicker = document.getElementById('bg-color');
const eraserBtn = document.getElementById('eraser');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let historyData = [];
let historyIndex = -1;
let currentBrush = 'pen';

// Set canvas size
function resizeCanvas() {
    const toolbarWidth = document.querySelector('.toolbar').offsetWidth;
    canvas.width = window.innerWidth - toolbarWidth - 40;  
    canvas.height = window.innerHeight - 100; 
    redrawCanvas();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

ctx.strokeStyle = '#000000';
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 5;

function draw(e) {
    if (!isDrawing) return;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    
    switch (currentBrush) {
        case 'spray':
            for (let i = 0; i < 20; i++) {
                let angle = Math.random() * 2 * Math.PI;
                let radius = Math.random() * 10;
                ctx.fillRect(
                    e.offsetX + radius * Math.cos(angle),
                    e.offsetY + radius * Math.sin(angle),
                    1, 1
                );
            }
            break;
        case 'marker':
            ctx.globalAlpha = 0.5;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            ctx.globalAlpha = 1;
            break;
        case 'crayon':
            ctx.globalAlpha = 0.3;
            for(let i = 0; i < 3; i++) {
                ctx.lineTo(e.offsetX + Math.random() * 10 - 5, e.offsetY + Math.random() * 10 - 5);
                ctx.stroke();
            }
            break;
        case 'pencil':
            ctx.globalAlpha = 1;
            for(let i = 0; i < 3; i++) {
                ctx.lineTo(e.offsetX + Math.random() * 5 - .5, e.offsetY + Math.random() * 5 - 0.5);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            break;
        default:
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
    }
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    saveState();
});

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

brushSelect.addEventListener('change', () => {
    currentBrush = brushSelect.value;
    ctx.globalAlpha = 1;
    if (currentBrush !== 'eraser') {
        ctx.strokeStyle = colorPicker.value;
    }
});

colorPicker.addEventListener('change', () => {
    ctx.strokeStyle = colorPicker.value;
});

lineWidth.addEventListener('input', () => {
    ctx.lineWidth = lineWidth.value;
});

eraserBtn.addEventListener('click', () => {
    currentBrush = 'eraser';
    ctx.strokeStyle = bgColorPicker.value;
});

function saveState() {
    historyIndex++;
    historyData = historyData.slice(0, historyIndex);
    historyData.push(canvas.toDataURL());
    undoBtn.disabled = false;
    redoBtn.disabled = true;
}

undoBtn.addEventListener('click', () => {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState();
        redoBtn.disabled = false;
    }
    if (historyIndex === 0) {
        undoBtn.disabled = true;
    }
});

redoBtn.addEventListener('click', () => {
    if (historyIndex < historyData.length - 1) {
        historyIndex++;
        restoreState();
        undoBtn.disabled = false;
    }
    if (historyIndex === historyData.length - 1) {
        redoBtn.disabled = true;
    }
});

function restoreState() {
    const img = new Image();
    img.src = historyData[historyIndex];
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

function redrawCanvas() {
    if (historyData.length > 0) {
        const img = new Image();
        img.src = historyData[historyIndex];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }
}

newBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyData = [];
    historyIndex = -1;
    saveState();
});

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
});

saveBtn.addEventListener('click', () => {
    localStorage.setItem('savedDrawing', canvas.toDataURL());
    alert('Drawing saved!');
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = canvas.toDataURL();
    link.click();
});

bgColorPicker.addEventListener('change', () => {
    canvas.style.backgroundColor = bgColorPicker.value;
    // Redraw the canvas to apply the new background color
    redrawCanvas();
});

// Initial state save
saveState();