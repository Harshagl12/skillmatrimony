import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import mammoth from 'mammoth';

// Configure PDF.js worker
// We need to set the worker source for pdf.js to function correctly
// In a Vite environment, we can point to the file in node_modules or use a CDN as fallback.
// Using a slightly older standard import pattern for compatibility
try {
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`;
} catch (e) {
    console.warn('Failed to set PDF worker source', e);
}

export async function parseDocument(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            return await parsePDF(file);
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.endsWith('.docx')
        ) {
            return await parseDOCX(file);
        } else if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
            return await file.text();
        } else {
            // Fallback for other text-like files
            try {
                const text = await file.text();
                if (text && text.length > 50 && !text.includes('\0')) {
                    return text;
                }
            } catch (e) { }

            return `[File Name: ${file.name}] (Content not directly readable, analysis based on metadata)`;
        }
    } catch (error) {
        console.error('Error parsing document:', error);
        throw new Error('Failed to read document content');
    }
}

async function parsePDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText.trim();
}

async function parseDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
}
