const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const imageInput = document.getElementById('imageInput');
const contrastInput = document.getElementById('contrast');
const sizeInput = document.getElementById('size');
const asciiOutput = document.getElementById('asciiOutput');
const copyBtn = document.getElementById('copyBtn');
const dropZone = document.getElementById('dropZone');

// Using Pollinations.ai for free image generation (no API key needed)
const IMAGE_API_URL = 'https://image.pollinations.ai/prompt/';

let currentImage = null;
let currentWidth = 100;

document.querySelectorAll("input[type=range]").forEach(r => {
  r.addEventListener("input", (e) => r.nextElementSibling.textContent = e.target.value)
})

const ASCII_CHARS = '@%#*+=-:. ';

generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating image...';
    asciiOutput.textContent = '';
    copyBtn.classList.add('hidden');

    try {
        // Generate image using Pollinations.ai (free, no API key)
        const imageUrl = `${IMAGE_API_URL}${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
        console.log('Generating image from:', imageUrl);
        
        // Fetch image as blob to avoid CORS issues
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch image from API');
        }
        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        
        const img = new Image();
        
        await new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load generated image'));
            img.src = dataUrl;
        });

        currentImage = img;
        currentWidth = parseInt(sizeInput.value);

        generateBtn.textContent = 'Converting to ASCII...';
        
        // Convert image to ASCII
        const asciiArt = convertImageToASCII(img, currentWidth);
        await typewriterEffect(asciiArt);
        copyBtn.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error:', error);
        asciiOutput.textContent = `Error: ${error.message}. Please try again.`;
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate ASCII';
    }
});

contrastInput.addEventListener('input', () => {
    if (currentImage) {
        const contrast = parseInt(contrastInput.value) / 100;
        const asciiArt = convertImageToASCII(currentImage, currentWidth, contrast);
        asciiOutput.textContent = asciiArt;
    }
});

sizeInput.addEventListener('input', () => {
    if (currentImage) {
        currentWidth = parseInt(sizeInput.value);
        const contrast = parseInt(contrastInput.value) / 100;
        const asciiArt = convertImageToASCII(currentImage, currentWidth, contrast);
        asciiOutput.textContent = asciiArt;
    }
});

// Image upload handlers
imageInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) processImage(file);
});

dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
});

document.addEventListener('paste', e => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();

            if (file) {
                processImage(file);
                break;
            }
        }
    }
});

function processImage(file) {
    const reader = new FileReader();

    reader.onload = event => {
        const img = new Image();

        img.onload = () => {
            currentImage = img;
            currentWidth = parseInt(sizeInput.value);
            
            const contrast = parseInt(contrastInput.value) / 100;
            const asciiArt = convertImageToASCII(img, currentWidth, contrast);
            asciiOutput.textContent = asciiArt;
            copyBtn.classList.remove('hidden');
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function convertImageToASCII(img, width, contrast = 1) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const aspectRatio = img.height / img.width;
    const height = Math.floor(width * aspectRatio * 0.555);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let ascii = '';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            let brightness = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
            brightness = ((brightness - 128) * contrast) + 128;
            brightness = Math.max(0, Math.min(255, brightness));

            const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
            ascii += ASCII_CHARS[charIndex];
        }
        ascii += '\n';
    }

    return ascii;
}

async function typewriterEffect(text) {
    asciiOutput.textContent = '';
    const lines = text.split('\n');
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        for (let charIndex = 0; charIndex < line.length; charIndex++) {
            asciiOutput.textContent += line[charIndex];
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        if (lineIndex < lines.length - 1) {
            asciiOutput.textContent += '\n';
        }
    }
}

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(asciiOutput.textContent).then(() => {
        copyBtn.textContent = 'Copied!';

        setTimeout(() => {
            copyBtn.textContent = 'Copy to Clipboard';
        }, 2000);
    });
});
