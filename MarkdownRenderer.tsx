import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isUser: boolean;
}

// A simple parser to handle bold, code blocks, and line breaks without heavy libraries
const parseMarkdown = (text: string) => {
  // Escape HTML first to prevent XSS (basic)
  let safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Bold (**text**)
  safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400 font-bold">$1</strong>');
  
  // Italic (*text*)
  safeText = safeText.replace(/\*(.*?)\*/g, '<em class="italic text-zinc-300">$1</em>');

  // Inline code (`text`)
  safeText = safeText.replace(/`(.*?)`/g, '<code class="bg-zinc-800 text-yellow-500 px-1 rounded font-mono text-sm">$1</code>');

  // Headers (### text)
  safeText = safeText.replace(/### (.*)/g, '<h3 class="text-lg font-bold text-teal-400 mt-2 mb-1">$1</h3>');
  
  // Bullet points
  safeText = safeText.replace(/^\s*-\s+(.*)/gm, '<li class="ml-4 list-disc marker:text-cyan-500">$1</li>');

  // Code Blocks (``` ... ```)
  // This is a simple implementation. For production, use a library like react-markdown.
  // We'll just wrap it in a pre tag.
  safeText = safeText.replace(/```([\s\S]*?)```/g, '<pre class="bg-zinc-900 border border-zinc-700 p-3 rounded my-2 overflow-x-auto text-sm font-mono text-zinc-300">$1</pre>');

  // Line breaks
  safeText = safeText.replace(/\n/g, '<br />');

  return safeText;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isUser }) => {
  const htmlContent = parseMarkdown(content);

  return (
    <div 
      className={`leading-relaxed ${isUser ? 'text-white' : 'text-zinc-300'}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};
