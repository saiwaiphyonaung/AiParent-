import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const langMap: { [key: string]: string } = {
  en: 'English',
  my: 'Burmese',
  zh: 'Chinese (Simplified)',
};

export const getAdvice = async (ageGroup: string, topic: string, language: string): Promise<string> => {
  const languageName = langMap[language] || 'English';
  
  const prompt = `
    Act as a compassionate, knowledgeable, and experienced pediatrician and child development expert. 
    Your audience is new parents seeking clear, supportive guidance.

    Your task is to provide a concise, actionable, and easy-to-understand list for parents of a child in the "${ageGroup}" age range. The topic is "${topic}".
    **IMPORTANT**: The entire response must be in ${languageName}.

    Please structure your response with these guidelines:
    1.  **Tone**: Warm, encouraging, and reassuring.
    2.  **Introduction**: Start with a brief, encouraging introductory sentence. Prefix this line with the tag "[INTRODUCTION]".
    3.  **Content**: Provide a short list of 3-4 very concise, practical tips. For each tip, prefix it with a category tag from the following list: [SLEEP], [HYGIENE], [PLAY], [FOOD], [LEARNING], [COMMUNICATION], [EMOTION], [SAFETY], [ROUTINE], [GENERAL]. Choose the most relevant tag for each tip.
    4.  **Closing**: End with a short, positive closing statement. Prefix this line with the tag "[CLOSING]".
    5.  **Language**: The entire response must be in ${languageName}.

    Example Response Structure for Topic "Health & Daily Care":
    [INTRODUCTION] Creating a nurturing routine for your little one is a wonderful way to help them thrive.
    [ROUTINE] A consistent bedtime routine (like a bath, story, and cuddle) can signal that it's time to sleep.
    [HYGIENE] Gently clean your baby's gums with a soft, damp cloth after feedings.
    [SAFETY] Always place your baby on their back to sleep to reduce the risk of SIDS.
    [CLOSING] You're doing a great job providing a safe and loving environment!

    Now, please generate the advice for:
    - Age Group: ${ageGroup}
    - Topic: ${topic}
    - Language: ${languageName}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to fetch advice from AI. Please check your connection and try again.");
  }
};

export const getBmiAdvice = async (ageGroup: string, weight: number, height: number, bmi: number, language: string): Promise<string> => {
  const languageName = langMap[language] || 'English';
  
  const prompt = `
    Act as a compassionate and knowledgeable pediatrician providing a growth assessment in ${languageName}.
    A parent is tracking their child's growth. The child is in the "${ageGroup}" age range.
    Their latest measurement is: Weight: ${weight} kg, Height: ${height} cm, resulting in a BMI of ${bmi}.
    
    Please provide a brief, reassuring, and helpful assessment. Structure your response according to these exact rules:
    1.  **Tone**: Gentle, supportive, and non-alarming.
    2.  **Assessment**: Start with a single, easy-to-understand sentence commenting on the BMI result. Prefix this line with the tag "[ASSESSMENT]".
    3.  **Tips**: Provide 2-3 concise, actionable tips. If the BMI is healthy, give general wellness tips. If it's outside the typical range, suggest gentle adjustments. Frame them as positive actions, not restrictions. Prefix each tip with a category tag: "[DIET]", "[ACTIVITY]", or "[GENERAL]".
    4.  **Disclaimer**: End with a clear but gentle disclaimer advising the parent to consult their pediatrician for personalized medical advice. Prefix this line with the tag "[DISCLAIMER]".
    5.  **Language**: The entire response must be in ${languageName}.

    Example Response Structure:
    [ASSESSMENT] Based on these numbers, your child's BMI is in a healthy range for their age.
    [DIET] Continue offering a variety of colorful fruits and vegetables.
    [ACTIVITY] Encourage at least 60 minutes of active play each day.
    [DISCLAIMER] Remember, this is a general guide. Always consult your pediatrician for personalized medical advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini BMI advice call failed:", error);
    throw new Error("Failed to fetch BMI advice from AI.");
  }
};

export const getQuickTip = async (ageGroup: string, language: string): Promise<{ question: string; answer: string; }> => {
  const languageName = langMap[language] || 'English';

  const prompt = `
    Generate a common parenting question and a concise, helpful answer for parents of a child in the "${ageGroup}" age range.
    The response must be in ${languageName}.
    The question should be something a parent frequently worries about or asks.
    The answer should be reassuring, practical, and no more than 2-3 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: `A common parenting question in ${languageName}.`
            },
            answer: {
              type: Type.STRING,
              description: `A concise, helpful answer to the question in ${languageName}.`
            }
          },
          required: ['question', 'answer']
        }
      }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Gemini quick tip call failed:", error);
    throw new Error("Failed to fetch quick tip from AI.");
  }
};

const fileToGenerativePart = (base64Data: string) => {
  const match = base64Data.match(/^data:(image\/.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 string');
  const mimeType = match[1];
  const data = match[2];
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
};

export const getAssistantResponse = async (prompt: string, images: string[], language: string): Promise<string> => {
  const languageName = langMap[language] || 'English';
  
  const model = 'gemini-2.5-flash';

  const parts = [
    { text: prompt },
    ...images.map(fileToGenerativePart)
  ];
  
  const systemInstruction = `
    You are a helpful, wise, and compassionate parenting assistant. 
    Your audience is new or concerned parents looking for guidance.
    Your tone should be empathetic, reassuring, and practical.
    Analyze the user's text prompt and any provided images carefully.
    Provide a well-structured, clear, and actionable response.
    Use markdown for formatting (e.g., **bold** for emphasis, bullet points with *).
    IMPORTANT: The entire response must be in ${languageName}.
    CRITICAL: Never provide a medical diagnosis. If the query or image seems to concern a serious medical issue, strongly advise the user to consult a healthcare professional immediately. Start such responses with a clear disclaimer.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Assistant call failed:", error);
    throw new Error("Failed to get a response from the AI assistant.");
  }
};
