import React, { useState, useEffect } from 'react';
import { Spinner } from './Spinner';
import { SparklesIcon, ChatBubbleLeftEllipsisIcon, LightBulbIcon, ExclamationTriangleIcon } from './IconComponents';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  translations: {
    title: string;
    type: string;
    suggestion: string;
    bug: string;
    general: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    error: string;
    close: string;
  };
}

type FeedbackType = 'suggestion' | 'bug' | 'general';

const feedbackIcons: { [key in FeedbackType]: React.ReactElement } = {
  suggestion: <LightBulbIcon className="h-5 w-5 mr-1.5" />,
  bug: <ExclamationTriangleIcon className="h-5 w-5 mr-1.5" />,
  general: <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-1.5" />,
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, translations }) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsSubmitted(false);
        setMessage('');
        setFeedbackType('suggestion');
        setError(null);
      }, 300);
    }
  }, [isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError('Please enter a message of at least 10 characters.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    
    // Simulate sending feedback to a backend service.
    // In a real application, this would be an API call to a backend that would then send an email.
    // As requested, this feedback is conceptually sent to 'williamxiao.mm@gmail.com'
    // without exposing the email in the UI.
    console.log('--- FEEDBACK SUBMITTED (SIMULATION) ---');
    console.log('Type:', feedbackType);
    console.log('Message:', message);
    console.log('Recipient: (Backend would handle sending to williamxiao.mm@gmail.com)');
    console.log('------------------------------------');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-transform duration-300 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <SparklesIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{translations.successTitle}</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">{translations.successMessage}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-rose-500 text-base font-medium text-white hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  {translations.close}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex items-start mb-4">
                 <ChatBubbleLeftEllipsisIcon className="h-8 w-8 text-rose-500 mr-3 flex-shrink-0" />
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">{translations.title}</h3>
                    <p className="text-sm text-slate-500">We'd love to hear your thoughts!</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">{translations.type}</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['suggestion', 'bug', 'general'] as FeedbackType[]).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFeedbackType(type)}
                        className={`flex items-center px-3 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
                          feedbackType === type
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {feedbackIcons[type]}
                        {translations[type]}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="feedback-message" className="block text-sm font-medium text-slate-700">{translations.messageLabel}</label>
                  <textarea
                    id="feedback-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={translations.messagePlaceholder}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                    required
                  />
                </div>
                
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="mt-2 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
                >
                  {translations.close}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-rose-500 text-base font-medium text-white hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:bg-rose-300"
                >
                  {isSubmitting ? translations.submitting : translations.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};