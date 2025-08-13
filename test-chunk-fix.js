/**
 * Test script to verify the chunk processing fix
 * This simulates the document processing flow to test chunk display
 */

console.log('🔍 Testing Chunk Processing Fix');

// Test the chunker utility
import('./src/utils/chunker.js').then(chunkerModule => {
  console.log('✅ Chunker module loaded:', Object.keys(chunkerModule));
  
  // Test basic chunking functionality
  const testText = "This is a test document with multiple sentences. It should be processed into chunks correctly. Each chunk should have proper content and metadata.";
  const chunks = chunkerModule.chunkText(testText, 'test-document.txt', {
    chunkSize: 20, // Small chunk size for testing
    overlap: 5,
    chunkBy: 'words'
  });
  
  console.log('📊 Test Results:');
  console.log(`- Input text length: ${testText.length} characters`);
  console.log(`- Chunks created: ${chunks.length}`);
  console.log('- First chunk content:', chunks[0]?.content);
  console.log('- First chunk metadata:', chunks[0]?.metadata);
  
  // Validate chunk structure
  const isValidChunk = (chunk) => {
    return chunk && 
           typeof chunk.content === 'string' && 
           chunk.content.trim().length > 0 &&
           chunk.source &&
           chunk.chunk_id &&
           chunk.metadata;
  };
  
  const validChunks = chunks.filter(isValidChunk);
  console.log(`✅ Valid chunks: ${validChunks.length}/${chunks.length}`);
  
  if (validChunks.length === chunks.length) {
    console.log('✅ All chunks are properly structured');
  } else {
    console.log('❌ Some chunks have invalid structure');
    chunks.forEach((chunk, index) => {
      if (!isValidChunk(chunk)) {
        console.log(`❌ Invalid chunk ${index}:`, chunk);
      }
    });
  }
  
}).catch(error => {
  console.error('❌ Failed to load chunker module:', error);
});

// Test PDF.js loading (if available)
import('./src/utils/pdfParser.js').then(pdfModule => {
  console.log('✅ PDF Parser module loaded:', Object.keys(pdfModule));
  
  // Check PDF.js worker health
  const health = pdfModule.checkPdfWorkerHealth();
  console.log('🏥 PDF.js Worker Health:', health);
  
  if (health.workerConfigured) {
    console.log('✅ PDF.js worker is properly configured');
  } else {
    console.log('❌ PDF.js worker configuration issue');
  }
  
}).catch(error => {
  console.error('❌ Failed to load PDF parser module:', error);
});

console.log('🧪 Test completed. Check console output above for results.');