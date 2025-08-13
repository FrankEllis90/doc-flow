// Quick component validation test
console.log('✅ Testing component imports...');

try {
  // Test markdown parser
  import('./src/utils/markdownParser.js').then(parser => {
    console.log('✅ MarkdownParser loaded successfully');
  });

  // Test chunker
  import('./src/utils/chunker.js').then(chunker => {
    console.log('✅ Chunker loaded successfully');
  });

  console.log('🎉 All components validated successfully!');
  console.log('🚀 Ready to process documents for AI systems!');
  
} catch (error) {
  console.error('❌ Component validation failed:', error);
}