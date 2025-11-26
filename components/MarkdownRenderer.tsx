import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const processInlineMarkdown = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Split content into blocks based on one or more empty lines
  const blocks = content.split(/\n\s*\n/);

  const elements = blocks.map((block, blockIndex) => {
    const lines = block.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      return null;
    }

    // A block is a list if all its lines start with * or -
    const isList = lines.every(line => /^\s*[\*\-]\s/.test(line));

    if (isList) {
      return (
        <ul key={blockIndex} className="list-disc list-inside space-y-1 my-2 pl-2">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{processInlineMarkdown(line.replace(/^\s*[\*\-]\s/, ''))}</li>
          ))}
        </ul>
      );
    } else {
      // Otherwise, it's a paragraph. Join lines with <br />
      return (
        <p key={blockIndex}>
          {lines.map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {processInlineMarkdown(line)}
              {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    }
  }).filter(Boolean);


  return <div className="prose prose-sm max-w-none">{elements}</div>;
};

export default MarkdownRenderer;
