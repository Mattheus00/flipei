import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // necessário para uso no browser (Vite)
})

export interface FlashCard {
    pergunta: string
    resposta: string
}

export async function generateCards(texto: string, quantidade: number, idioma: string = 'PT-BR'): Promise<FlashCard[]> {
    const idiomaInstrucao = idioma === 'EN-US'
        ? 'Generate the flashcards in English.'
        : 'Gere os flashcards em português brasileiro.'

    const prompt = `Você é um gerador de flashcards para estudantes brasileiros.
${idiomaInstrucao}
Gere exatamente ${quantidade} flashcards com base no texto abaixo.
Responda SOMENTE com JSON válido neste formato, sem nenhum texto adicional, sem markdown, sem backticks:
{"cards": [{"pergunta": "...", "resposta": "..."}]}
Regras:
- Perguntas claras e objetivas
- Respostas concisas de 1 a 3 frases
- Foque nos conceitos mais importantes do texto
Texto: ${texto}`

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.5,
            max_tokens: 4096,
        })

        const content = chatCompletion.choices[0]?.message?.content || ''

        // Tentar extrair JSON mesmo que tenha algum texto extra
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('A IA não retornou um JSON válido.')
        }

        const parsed = JSON.parse(jsonMatch[0])

        if (!parsed.cards || !Array.isArray(parsed.cards)) {
            throw new Error('Formato de resposta inesperado da IA.')
        }

        return parsed.cards as FlashCard[]
    } catch (err: any) {
        console.error('Erro ao gerar cards com Groq:', err)
        throw new Error(err?.message || 'Falha ao conectar com a IA. Verifique sua chave de API.')
    }
}
