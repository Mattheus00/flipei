import * as pdfjsLib from 'pdfjs-dist'

// Configurar o worker do PDF.js para rodar no browser
// Using a CDN worker to avoid bundling issues with Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

export async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const typedArray = new Uint8Array(arrayBuffer)

    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise

    const totalPages = pdf.numPages
    const textPages: string[] = []

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()

        // Concatenar todos os itens de texto da página
        const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()

        if (pageText) {
            textPages.push(`[Página ${pageNum}]\n${pageText}`)
        }
    }

    const fullText = textPages.join('\n\n')

    if (!fullText.trim()) {
        throw new Error('O PDF não contém texto extraível. Pode ser um PDF escaneado (imagem). Tente copiar o texto manualmente.')
    }

    // Limitar a 15.000 caracteres para não exceder o contexto do Llama 3
    if (fullText.length > 15000) {
        return fullText.substring(0, 15000) + '\n\n[Texto truncado para processamento...]'
    }

    return fullText
}
