import { categoriasPadrao } from "./categoriasPadrao";

/**
 * Categoriza um conteúdo textual usando modelo BART-MNLI da Hugging Face
 * @param {string} content - Texto a ser analisado
 * @param {string[]} candidate_labels - Categorias possíveis
 * @returns {Promise<string>} Categoria mais provável ou 'Outro'
 */
export async function categorizePost(content, candidate_labels = []) {
  const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
  const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

  if (!content || typeof content !== 'string') return 'Outro';

  const labels = candidate_labels.length ? candidate_labels : categoriasPadrao;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sequence: content,
        candidate_labels: labels,
      }),
    });

    if (!response.ok) throw new Error(`Erro API: ${response.statusText}`);

    const result = await response.json();

    if (result?.labels?.length) {
      return result.labels[0];
    }

    return "Outro";
  } catch (err) {
    console.error("Erro ao categorizar post:", err);
    return "Outro";
  }
}
