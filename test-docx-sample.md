# Sample DOCX Content for Testing

## Test Content Structure

This is a test document that simulates the structure of a typical DOCX file:

### Chapter 1: Introduction
This is the introduction section with some regular paragraph content. This section should be parsed correctly by our DOCX parser using mammoth.js.

**Bold text example** and *italic text example* should be preserved in the output.

### Chapter 2: Features
- Bullet point one
- Bullet point two  
- Bullet point three

### Chapter 3: Technical Details
1. Numbered list item one
2. Numbered list item two
3. Numbered list item three

> This is a blockquote that should be preserved in the conversion process.

### Chapter 4: Conclusion
This is the final section with concluding remarks. The parser should handle this content appropriately and create meaningful chunks for AI processing.

---

**Test Results Expected:**
- File should be accepted for upload
- Content should be extracted properly
- Sections should be detected for section-based chunking
- Text formatting should be converted to markdown-like format