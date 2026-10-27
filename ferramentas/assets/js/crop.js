// Image crop: port of crop-image/main.py (Pillow's img.crop((left, top, right, bottom))).

(() => {
    const fileInput = document.querySelector('[data-crop-file]');
    const sampleButton = document.querySelector('[data-crop-sample]');
    const form = document.querySelector('[data-crop-form]');
    const runButton = document.querySelector('[data-crop-run]');
    const download = document.querySelector('[data-crop-download]');
    const preview = document.querySelector('[data-crop-preview]');
    const output = document.querySelector('[data-crop-output]');
    const sizeCaption = document.querySelector('[data-crop-size]');
    const result = document.querySelector('[data-crop-result]');
    const clearButton = document.querySelector('[data-crop-clear]');
    const labels = document.querySelectorAll('[data-crop-label]');
    const previewContext = preview.getContext('2d');
    const outputContext = output.getContext('2d');

    let source = null;
    let downloadUrl = '';

    const readBox = () => {
        const box = {
            left: Number(form.left.value) || 0,
            top: Number(form.top.value) || 0,
            right: Number(form.right.value) || 0,
            bottom: Number(form.bottom.value) || 0,
        };
        // Clamp to the image, like Pillow does when the box goes past the edges.
        box.left = Math.min(Math.max(box.left, 0), source.width);
        box.right = Math.min(Math.max(box.right, 0), source.width);
        box.top = Math.min(Math.max(box.top, 0), source.height);
        box.bottom = Math.min(Math.max(box.bottom, 0), source.height);
        return box;
    };

    const drawPreview = () => {
        if (!source) return;
        preview.width = source.width;
        preview.height = source.height;
        previewContext.drawImage(source, 0, 0);

        const box = readBox();
        const lineWidth = Math.max(2, Math.round(source.width / 300));
        previewContext.fillStyle = 'rgba(0, 0, 0, 0.55)';
        previewContext.fillRect(0, 0, source.width, box.top);
        previewContext.fillRect(0, box.bottom, source.width, source.height - box.bottom);
        previewContext.fillRect(0, box.top, box.left, box.bottom - box.top);
        previewContext.fillRect(box.right, box.top, source.width - box.right, box.bottom - box.top);
        previewContext.strokeStyle = '#ff3d9e';
        previewContext.lineWidth = lineWidth;
        previewContext.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    };

    // Error prevention: show the real limits instead of clamping silently.
    const setLimits = (width, height) => {
        labels.forEach((label) => {
            const input = document.getElementById(label.htmlFor);
            const max = input.name === 'left' || input.name === 'right' ? width : height;
            input.max = max ?? '';
            label.textContent = max ? `${label.dataset.cropLabel} (até ${max} px)` : label.dataset.cropLabel;
        });
    };

    const setSource = (image, name) => {
        source = image;
        sizeCaption.textContent = `Original — ${name} (${image.width} × ${image.height}px)`;
        runButton.disabled = false;
        clearButton.hidden = false;
        result.textContent = '';
        setLimits(image.width, image.height);
        drawPreview();
    };

    // User control: drop the image and start over.
    clearButton.addEventListener('click', () => {
        source = null;
        fileInput.value = '';
        [preview, output].forEach((canvas) => {
            canvas.width = 300;
            canvas.height = 150;
        });
        sizeCaption.textContent = 'Original';
        runButton.disabled = true;
        clearButton.hidden = true;
        download.hidden = true;
        setLimits(null, null);
        result.className = 'result result--success';
        result.textContent = 'Imagem removida.';
    });

    const makeSample = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 700;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 800, 700);
        gradient.addColorStop(0, '#2b1055');
        gradient.addColorStop(1, '#ff1493');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 800, 700);
        context.fillStyle = 'rgba(255, 255, 255, 0.12)';
        for (let x = 0; x <= 800; x += 100) context.fillRect(x, 0, 2, 700);
        for (let y = 0; y <= 700; y += 100) context.fillRect(0, y, 800, 2);
        context.font = '220px serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('🐶', 400, 340);
        context.font = 'bold 28px monospace';
        context.fillStyle = '#ffffff';
        context.fillText('dog.jpg (exemplo) · grade de 100px', 400, 640);
        return canvas;
    };

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.src = url;
        try {
            await image.decode();
            setSource(image, file.name);
        } catch {
            result.className = 'result result--error';
            result.textContent = 'Não consegui abrir esse arquivo como imagem.';
        } finally {
            URL.revokeObjectURL(url);
        }
    });

    sampleButton.addEventListener('click', () => setSource(makeSample(), 'exemplo'));

    form.addEventListener('input', drawPreview);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!source) return;
        const box = readBox();
        const width = box.right - box.left;
        const height = box.bottom - box.top;

        if (width <= 0 || height <= 0) {
            result.className = 'result result--error';
            result.textContent = 'A direita precisa ser maior que a esquerda, e baixo maior que cima.';
            return;
        }

        output.width = width;
        output.height = height;
        outputContext.drawImage(source, box.left, box.top, width, height, 0, 0, width, height);
        result.className = 'result result--success';
        result.textContent = `Recorte de ${width} × ${height}px pronto.`;

        output.toBlob((blob) => {
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
            downloadUrl = URL.createObjectURL(blob);
            download.href = downloadUrl;
            download.hidden = false;
        }, 'image/png');
    });
})();
