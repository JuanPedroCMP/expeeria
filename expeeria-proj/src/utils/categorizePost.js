import { categoriasPadrao } from "./categoriasPadrao";

export async function categorizePost(content, candidate_labels = []) {
    const HF_TOKEN = "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";
    const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
  
    if (!candidate_labels.length) {
        if (!candidate_labels.length) {
            candidate_labels = categoriasPadrao;
          }
    }
  
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sequence: content,
        candidate_labels: candidate_labels,
      }),
    });
  
    const result = await response.json();
    console.log(result);
    if (result && result.labels && result.labels.length > 0) {
      return result.labels[0];
    }
    return "Outro";
  } 