export function chunkText(cleanText, filename, options = {}) {
  const {
    chunkSize = 500,
    overlap = 50,
    chunkBy = 'words', // 'words' or 'characters'
    preserveParagraphs = true
  } = options;

  const chunks = [];
  let chunkId = 1;
  
  if (chunkBy === 'words') {
    return chunkByWords(cleanText, filename, chunkSize, overlap, chunkId);
  } else {
    return chunkByCharacters(cleanText, filename, chunkSize, overlap, chunkId);
  }
}

function chunkByWords(text, filename, chunkSize, overlap, startChunkId) {
  const chunks = [];
  const words = text.split(/\s+/).filter(word => word.length > 0);
  let i = 0;
  let chunkId = startChunkId;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    const content = chunkWords.join(' ');
    
    chunks.push(createChunk(content, filename, chunkId, i, chunkWords.length));
    
    i += chunkSize - overlap;
    chunkId++;
  }

  return chunks;
}

function chunkByCharacters(text, filename, chunkSize, overlap, startChunkId) {
  const chunks = [];
  let i = 0;
  let chunkId = startChunkId;

  while (i < text.length) {
    let end = Math.min(i + chunkSize, text.length);
    
    // Try to break at word boundaries for better readability
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > i + chunkSize * 0.8) {
        end = lastSpace;
      }
    }
    
    const content = text.slice(i, end).trim();
    
    chunks.push(createChunk(content, filename, chunkId, i, content.length));
    
    i = end - overlap;
    chunkId++;
  }

  return chunks;
}

function createChunk(content, filename, chunkId, startPosition, length) {
  const baseFilename = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  
  return {
    content: content.trim(),
    source: filename,
    chunk_id: `${baseFilename}_${String(chunkId).padStart(3, '0')}`,
    metadata: {
      position: startPosition,
      length: length,
      wordCount: content.split(/\s+/).length,
      createdAt: new Date().toISOString()
    },
    tags: [],
    tagsString: '' // For UI binding
  };
}

export function chunkBySections(markdownText, filename) {
  const chunks = [];
  const lines = markdownText.split('\n');
  let currentSection = {
    heading: '',
    content: [],
    level: 0
  };
  let chunkId = 1;
  
  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    
    if (headingMatch) {
      // Save previous section if it has content
      if (currentSection.content.length > 0) {
        const content = currentSection.content.join('\n').trim();
        if (content) {
          chunks.push(createSectionChunk(content, filename, chunkId, currentSection.heading));
          chunkId++;
        }
      }
      
      // Start new section
      currentSection = {
        heading: headingMatch[2].trim(),
        content: [],
        level: headingMatch[1].length
      };
    } else {
      currentSection.content.push(line);
    }
  }
  
  // Don't forget the last section
  if (currentSection.content.length > 0) {
    const content = currentSection.content.join('\n').trim();
    if (content) {
      chunks.push(createSectionChunk(content, filename, chunkId, currentSection.heading));
    }
  }
  
  return chunks;
}

function createSectionChunk(content, filename, chunkId, heading) {
  const baseFilename = filename.replace(/\.[^/.]+$/, '');
  
  return {
    content: content,
    source: filename,
    chunk_id: `${baseFilename}_section_${String(chunkId).padStart(3, '0')}`,
    metadata: {
      section: heading,
      wordCount: content.split(/\s+/).length,
      createdAt: new Date().toISOString(),
      type: 'section'
    },
    tags: heading ? [heading.toLowerCase().replace(/\s+/g, '-')] : [],
    tagsString: heading ? heading.toLowerCase().replace(/\s+/g, '-') : ''
  };
}

export function suggestTags(content) {
  const suggestions = [];
  
  // Extract potential keywords (words > 4 characters, appearing multiple times)
  const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const wordFreq = {};
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Get words that appear more than once
  Object.entries(wordFreq)
    .filter(([word, freq]) => freq > 1)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([word]) => suggestions.push(word));
  
  return suggestions;
}