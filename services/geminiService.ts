
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // Quick chat for basic tasks using the flash model
  async quickChat(prompt: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No response";
  },

  // Lite chat for high-volume reasoning (Opal)
  async flashLiteChat(prompt: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text || "No response";
  },

  // Chat with thinking mode (for complex reasoning)
  async chatWithThinking(prompt: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
    return response.text || "No response";
  },

  // Chat with a custom system prompt (for Lab personas)
  async chatWithSystemPrompt(systemPrompt: string, userInput: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userInput,
      config: {
        systemInstruction: systemPrompt,
      },
    });
    return response.text || "No response";
  },

  // Search grounding for up-to-date info
  async searchGrounding(prompt: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources };
  },

  // Maps grounding for local queries
  async mapsGrounding(prompt: string) {
    const ai = getAI();
    let latLng = undefined;

    try {
      const pos: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {
      console.warn("Geolocation failed, proceeding without location data.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: latLng ? {
          retrievalConfig: { latLng }
        } : undefined
      },
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources };
  },

  // Image Generation (Pro)
  async generateImage(prompt: string, aspectRatio: string = "1:1", imageSize: string = "1K"): Promise<string | undefined> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        }
      },
    });

    const imagePart = response.candidates?.[0].content.parts.find(p => p.inlineData);
    return imagePart?.inlineData ? `data:image/png;base64,${imagePart.inlineData.data}` : undefined;
  },

  // Image Editing (Flash Image)
  async editImage(base64Image: string, prompt: string): Promise<string | undefined> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image,
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
    });
    const imagePart = response.candidates?.[0].content.parts.find(p => p.inlineData);
    return imagePart?.inlineData ? `data:image/png;base64,${imagePart.inlineData.data}` : undefined;
  },

  // Transcribe Audio
  async transcribeAudio(base64Audio: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Audio.split(',')[1], mimeType: 'audio/wav' } },
          { text: "Transcribe this audio exactly." }
        ]
      }
    });
    return response.text || "Transcription failed.";
  },

  // Analyze Image or Video
  async analyzeMedia(base64Data: string, prompt: string, mimeType: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data.split(',')[1], mimeType } },
          { text: prompt }
        ]
      }
    });
    return response.text || "Analysis failed.";
  },

  // Video Generation (Veo)
  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16', startImage?: string, endImage?: string) {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: startImage ? {
        imageBytes: startImage.split(',')[1],
        mimeType: 'image/png'
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio,
        lastFrame: endImage ? {
          imageBytes: endImage.split(',')[1],
          mimeType: 'image/png'
        } : undefined,
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return {
      url: URL.createObjectURL(blob),
      operation: operation // Return operation for potential extension
    };
  },

  async extendVideo(previousOperation: any, prompt: string) {
    const ai = getAI();
    const video = previousOperation.response?.generatedVideos?.[0]?.video;
    if (!video) throw new Error("No video found to extend.");

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      video: video,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9' // Extensions currently favor standard 16:9 720p in Veo preview
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return {
      url: URL.createObjectURL(blob),
      operation: operation
    };
  }
};
