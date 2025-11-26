import React, { useState, useCallback, useRef } from 'react';
import { getAssistantResponse } from '../services/geminiService';
import { SparklesIcon, ChatBubbleLeftEllipsisIcon, PaperClipIcon, TrashIcon } from './IconComponents';
import { Spinner } from './Spinner';
import MarkdownRenderer from './MarkdownRenderer';

interface AssistantProps {
  translations: {
    title: string;
    description: string;
    promptPlaceholder: string;
    imageUpload: string;
    imageUploadHelp: string;
    imageLimitError: string;
    getHelp: string;
    gettingHelp: string;
    responseTitle: string;
    disclaimer: string;
    error: string;
  };
  language: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const Assistant: React.FC<AssistantProps> = ({ translations, language }) => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 3) {
      setError(translations.imageLimitError);
      return;
    }
    setError(null);
    
    const newImages = await Promise.all(Array.from(files).map(fileToBase64));
    setImages(prev => [...prev, ...newImages].slice(0, 3));
    
    // Reset file input value to allow re-uploading the same file
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse('');
    setError(null);

    try {
      const result = await getAssistantResponse(prompt, images, language);
      setResponse(result);
    } catch (err) {
      setError(translations.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-200/80 animate-fadeInUp" style={{ animationDelay: '500ms', opacity: 0 }}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-4 p-3 rounded-full bg-teal-100">
          <ChatBubbleLeftEllipsisIcon className="h-7 w-7 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{translations.title}</h3>
          <p className="text-sm text-slate-500">{translations.description}</p>
        </div>
      </div>

      <div className="space-y-4">
         <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={translations.promptPlaceholder}
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
        />

        <div>
            <div className="mt-1 flex justify-center px-6 py-4 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <PaperClipIcon className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-rose-500">
                            <span>{translations.imageUpload}</span>
                            <input id="file-upload" ref={fileInputRef} name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                    <p className="text-xs text-slate-500">{translations.imageUploadHelp}</p>
                </div>
            </div>
            {images.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                    {images.map((img, index) => (
                        <div key={index} className="relative group">
                            <img src={img} alt={`upload-preview-${index}`} className="h-24 w-full object-cover rounded-md border border-slate-200" />
                            <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {error && <p className="text-sm text-center text-red-600">{error}</p>}

        <p className={`text-xs text-center mb-3 px-2 text-slate-500`}>
          {translations.disclaimer}
        </p>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center px-4 py-3 text-base font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-rose-500 transition-all duration-300 bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>{translations.gettingHelp}</>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              {translations.getHelp}
            </>
          )}
        </button>

        {isLoading && <div className="py-4"><Spinner text={translations.gettingHelp}/></div>}

        {response && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                <h4 className="text-md font-semibold text-slate-800 mb-2">{translations.responseTitle}</h4>
                <div className="text-sm text-slate-700 space-y-2">
                    <MarkdownRenderer content={response} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};