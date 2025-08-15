import { marked } from 'marked';

export function parseMarkdown(markdownString) {
  try {
    // Parse markdown to HTML
    const html = marked.parse(markdownString);
    
    // Create a temporary DOM element in the browser to extract text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up extra whitespace and normalize line breaks
    return textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return markdownString; // Fallback to original content
  }
}

export function extractMetadata(markdownString) {
  const lines = markdownString.split('\n');
  const metadata = {
    title: '',
    headings: [],
    estimatedReadTime: 0
  };
  
  // Extract title (first # heading)
  const titleMatch = lines.find(line => line.match(/^#\s+(.+)/));
  if (titleMatch) {
    metadata.title = titleMatch.replace(/^#\s+/, '').trim();
  }
  
  // Extract all headings
  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      metadata.headings.push({
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
        lineNumber: index + 1
      });
    }
  });
  
  // Estimate reading time (assuming 200 words per minute)
  const wordCount = markdownString.split(/\s+/).length;
  metadata.estimatedReadTime = Math.ceil(wordCount / 200);
  
  return metadata;
}