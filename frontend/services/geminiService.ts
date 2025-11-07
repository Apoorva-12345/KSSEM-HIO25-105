
import { GoogleGenAI, Chat, Type, Content } from "@google/genai";
import { Difficulty, QuizQuestion, Flashcard, ChatMessage } from '../types';

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}


const getSystemInstruction = (difficulty: Difficulty): string => {
    switch (difficulty) {
        case Difficulty.BEGINNER:
            return "You are a friendly and encouraging AI tutor named Sparky. Explain concepts in very simple terms, using analogies a 12-year-old would understand. Keep your answers concise and check for understanding frequently. Your goal is to build confidence and foundational knowledge.";
        case Difficulty.INTERMEDIATE:
            return "You are a knowledgeable AI tutor. Provide clear, structured explanations with practical examples. Assume the user has some foundational knowledge. Use technical terms but explain them briefly. Offer to provide code examples or step-by-step guides where applicable.";
        case Difficulty.EXPERT:
            return "You are an expert-level AI academic assistant. Engage with the user as a peer. Provide deep, nuanced explanations and cite sources if possible. Use precise technical terminology without defining it unless asked. Challenge the user with thought-provoking questions and complex scenarios.";
        default:
            return "You are a helpful AI tutor.";
    }
}

export const createChatSession = (difficulty: Difficulty, history: ChatMessage[] = []): Chat => {
    const ai = getAiClient();
    const geminiHistory: Content[] = history.map(msg => ({
        role: msg.role,
        parts: msg.parts
    }));
    
    const model = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: geminiHistory,
        config: {
            systemInstruction: getSystemInstruction(difficulty),
        },
    });
    return model;
};

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "An array of quiz questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The quiz question." },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of possible answers.",
                        items: { type: Type.STRING }
                    },
                    correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the 'options' array." },
                    explanation: { type: Type.STRING, description: "A brief explanation of why the correct answer is right." }
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"]
            }
        }
    },
    required: ["questions"]
};

const flashcardSchema = {
    type: Type.OBJECT,
    properties: {
        flashcards: {
            type: Type.ARRAY,
            description: "An array of flashcards.",
            items: {
                type: Type.OBJECT,
                properties: {
                    front: { type: Type.STRING, description: "The front side of the flashcard (e.g., a term or question)." },
                    back: { type: Type.STRING, description: "The back side of the flashcard (e.g., a definition or answer)." },
                },
                required: ["front", "back"]
            }
        }
    },
    required: ["flashcards"]
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[] | null> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, 3-question multiple-choice quiz about the following topic: "${topic}". The questions should be at an intermediate level.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });
        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);
        return quizData.questions || null;
    } catch (error) {
        console.error("Error generating quiz:", error);
        return null;
    }
};

export const generateFlashcards = async (topic: string): Promise<Flashcard[] | null> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a set of 5 flashcards for the following topic: "${topic}". Each flashcard should have a 'front' (a term or concept) and a 'back' (a concise definition or explanation).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: flashcardSchema,
            },
        });
        const jsonText = response.text.trim();
        const flashcardData = JSON.parse(jsonText);
        return flashcardData.flashcards || null;
    } catch (error) {
        console.error("Error generating flashcards:", error);
        return null;
    }
};
