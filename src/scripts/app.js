const imageInput = document.getElementById('imageInput');
const imageDisplay = document.getElementById('imageDisplay');
const base64Output = document.getElementById('base64Output');
const copyButton = document.getElementById('copyButton');
const pasteButton = document.getElementById('pasteButton');
const imagePlaceholder = document.getElementById('imagePlaceholder');

function setImageAndBase64(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        imageDisplay.src = e.target.result;
        imageDisplay.style.display = 'block';
        imagePlaceholder.style.display = 'none';
        // Extract base64 data
        const base64Data = e.target.result.split(',')[1];
        // Compose markdown image string
        const markdown = `![Image](data:${file.type};base64,${base64Data})`;
        base64Output.value = markdown;
    };
    reader.readAsDataURL(file);
}

// On page load, show placeholder and hide image
window.addEventListener('DOMContentLoaded', () => {
    imageDisplay.style.display = 'none';
    imagePlaceholder.style.display = 'flex';
});

// Handle file input
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    setImageAndBase64(file);
});

// Handle paste from clipboard
function handlePasteEvent(e) {
    const items = e.clipboardData.items;
    for (let item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            setImageAndBase64(file);
            break;
        }
    }
}

window.addEventListener('paste', handlePasteEvent);

pasteButton.addEventListener('click', async () => {
    // Try to use Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.read) {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        setImageAndBase64(blob);
                        return;
                    }
                }
            }
            alert('No image found in clipboard.');
        } catch (err) {
            alert('Failed to read clipboard: ' + err);
        }
    } else {
        alert('Clipboard image paste is not supported in this browser. Try Ctrl+V or Cmd+V.');
    }
});

// Copy base64 markdown to clipboard
copyButton.addEventListener('click', () => {
    base64Output.select();
    document.execCommand('copy');
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
        copyButton.textContent = 'Copy Base64';
    }, 2000);
});