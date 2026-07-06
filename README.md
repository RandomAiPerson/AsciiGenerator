# ASCII Art Maker

A web-based tool that converts images to ASCII art. You can generate images from text prompts using AI or upload your own images.

## Features

- **Text-to-Image**: Enter a prompt to generate an image with AI
- **Image Upload**: Upload your own images directly
- **Paste Support**: Paste images from clipboard
- **Adjustable Size**: Control the width of the ASCII output
- **Contrast Control**: Adjust the contrast for better detail

## How to Use

1. **Generate from Prompt**: Enter a description in the text area and click "Generate ASCII"
2. **Upload Image**: Click "Or Upload Image" or drag and drop an image file
3. **Adjust Settings**: Use the Size and Contrast sliders to customize the output
4. **Copy**: Click "Copy to Clipboard" to copy the ASCII art

## Files

- `index.html` - Main HTML structure
- `script.js` - JavaScript logic for image processing and ASCII conversion
- `style.css` - Styling for the interface

## How It Works

The tool uses the standard luminosity formula for brightness calculation:
```
brightness = (0.2126 * r) + (0.7152 * g) + (0.0722 * b)
```

Characters are mapped from dark to light: `@%#*+=-:. `
