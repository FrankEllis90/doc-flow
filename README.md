# 🚀 Doc Flow - AI Document Processing Platform

A professional web application for creating, processing, and managing AI-ready knowledge bases with advanced document processing capabilities and comprehensive version control.

![Doc Flow](public/logo.svg)

## 🌐 Overview

Doc Flow is a powerful client-side web application that transforms documents into AI-ready knowledge bases. Process PDFs, Markdown files, and raw text into optimized chunks for vector databases and AI training, all within your browser with complete privacy.

### **Key Features**
- **100% Client-Side Processing**: All data processing happens in your browser - no server uploads
- **Privacy-First**: Your documents never leave your device
- **Multi-Format Support**: Process PDFs, Markdown, and plain text
- **AI-Optimized Output**: Export to Azure, OpenAI, Pinecone, and other vector stores
- **Version Control**: Built-in versioning with IndexedDB storage
- **Professional UI**: Clean, modern interface with responsive design
- **No Installation Required**: Access via any modern web browser

## 🚀 Quick Start

### **Installation**
```bash
# Clone the repository
git clone https://github.com/FrankEllis90/doc-flow.git
cd doc-flow

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Deployment**
Deploy the built application to any static hosting service:
```bash
# Build the application
npm run build

# Deploy the /dist folder to your hosting service
```
Compatible with:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Azure Static Web Apps
- Any static file server

## 📱 Application Features

Doc Flow features three main tabs, each designed for specific content processing workflows:

### 🏗️ **Tab 1: Manual Content Builder**
Transform raw text into AI-ready knowledge chunks through a guided 3-step process:
- **Manual Content Input**: Create content chunks from scratch using a source/title and content form
- **Intelligent Chunking**: Multiple chunking strategies (word-based, character-based, section-based)
- **Real-time Statistics**: Live word counts, character counts, and estimated chunk metrics  
- **Chunking Configuration**: Customizable chunk size, overlap settings, and auto-tagging options
- **Content Processing**: Transform raw content into optimized AI-ready chunks
- **Chunk Review & Editing**: Review, edit, and refine generated chunks before export
- **Auto-save System**: Automatic backup with IndexedDB persistence

### 📄 **Tab 2: Document Processing** 
Batch process multiple documents with advanced file handling:
- **Multi-Document Upload**: Process up to 20 files simultaneously (.md, .pdf)
- **Enhanced File Queue**: Individual file status tracking with real-time progress
- **Intelligent Processing**: AI-optimized content extraction and chunking
- **Error Recovery**: Retry failed files with detailed error reporting
- **Memory Management**: Handles large file batches without browser crashes
- **Batch Processing**: Upload → Configure → Process → Review → Export
- **Smart Chunking**: Automatic content optimization for AI ingestion

### 🗄️ **Tab 3: Version Control**
Comprehensive history and backup management:
- **Version History**: Complete timeline of all saved content states
- **Auto-save on Export**: Automatic version creation during export operations
- **Manual Snapshots**: User-initiated version creation with custom names
- **Data Restoration**: Restore any previous state with full data integrity
- **Export Tracking**: Download previous exports or create new ones from any version
- **Storage Analytics**: Monitor usage, performance, and storage statistics

## ✨ Advanced Features

### 🎨 **Professional Design**
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation, screen reader support, ARIA compliance
- **Brand Colors**: Professional sage green (#A8B79D) and gold (#D4AF37) accents
- **Dark Mode Support**: Easy on the eyes during extended use
- **Component Library**: Consistent, reusable UI components

### 🚀 **Export Capabilities**
- **Azure Vector Store**: Optimized JSON format for Azure OpenAI vector store ingestion
- **Multiple AI Formats**: OpenAI, LangChain, Pinecone, ChromaDB, Hugging Face compatibility
- **Traditional Formats**: JSON, CSV, TXT, XML, Markdown export options
- **Upload Scripts**: Auto-generated upload scripts for each platform
- **Structured Metadata**: Content + metadata with source, chunk_id, tags, and word_count
- **Batch Export**: Export entire knowledge bases or selected chunks

## 🛠️ Technical Details

### **Tech Stack**
- **Framework**: Vue.js 3.4 with Composition API
- **State Management**: Pinia
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Language**: TypeScript
- **Storage**: IndexedDB for local persistence

### **Browser Requirements**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Performance**
- Handles documents up to 50MB
- Processes 20 files concurrently
- Virtual scrolling for 1000+ chunks
- Optimized for large datasets

## 📋 Usage Guide

### 🏗️ Builder Tab - Manual Content Creation

#### Creating Content
1. **Enter Source/Title**: Provide a descriptive source or title for your content
2. **Input Content**: Paste or type your complete content into the textarea
3. **Configure Chunking**: Choose chunk size (200-1000 words), overlap percentage, and auto-tagging
4. **Process Content**: Transform your content into AI-ready chunks automatically
5. **Review & Edit**: Examine generated chunks, edit content, and refine as needed
6. **Export**: Download your processed chunks in various formats (JSON, CSV, TXT, XML, Markdown)

#### Step-by-Step Workflow
- **Step 1 - Create**: Input your content and configure chunking settings
- **Step 2 - Review**: Examine generated chunks, search/filter, and make edits
- **Step 3 - Export**: Download your processed content in your preferred format

#### Advanced Features
- **Real-time Statistics**: See word count, character count, and estimated chunks as you type
- **Multiple Chunking Strategies**: Word-based (recommended), character-based, or section-based
- **Auto-tagging**: AI generates relevant tags for better content organization
- **Search & Filter**: Find specific chunks quickly with built-in search functionality

### 📄 Documents Tab - AI Document Processing

#### File Upload & Processing
1. **Multi-File Upload**: Drag & drop up to 20 documents
   - Supported formats: `.md`, `.markdown`, `.pdf`
   - File size limits: 50MB per PDF, 10MB per markdown
   - Total batch limit: 200MB

2. **Configure Processing**:
   - **Chunk Size**: 200-1000 words (recommended: 300-800)
   - **Overlap**: 0-30% of chunk size (prevents information loss)
   - **Auto-tags**: Enable AI-powered tag generation

3. **Monitor Progress**:
   - **File Queue**: Individual status for each file
   - **Real-time Updates**: Processing progress with time estimates
   - **Error Handling**: Detailed error messages with retry options

#### Enhanced Queue Management
- **Visual Status Indicators**: Queued → Processing → Completed/Failed
- **Individual Progress Bars**: Per-file processing percentage
- **Retry Mechanism**: One-click retry for failed files
- **Remove Options**: Clean up queue by removing problematic files
- **Processing Statistics**: Time estimates, rates, and completion metrics

### 🗄️ Versions Tab - Version Control

#### Version Management
- **Auto-save System**: Versions created automatically during exports
- **Manual Saves**: Create snapshots with custom names at any time
- **Complete History**: Browse all versions with metadata
- **Quick Restore**: Load any previous state instantly
- **Export Tracking**: Download previous exports or create new ones

#### Storage Features
- **IndexedDB Persistence**: Reliable browser-based storage
- **Data Migration**: Automatic migration between storage systems
- **Cleanup Tools**: Remove old versions to manage space
- **Backup Integration**: Export versions for external backup

## 🔧 Configuration Options

### Chunking Strategies

#### Word-based Chunking (Recommended)
```javascript
{
  chunkBy: 'words',
  chunkSize: 500,    // 300-800 words optimal
  overlap: 50,       // 10-20% recommended
  autoTag: true
}
```

#### Character-based Chunking
```javascript
{
  chunkBy: 'characters',
  chunkSize: 2000,   // 1500-3000 characters
  overlap: 200,      // 10-15% recommended
  autoTag: true
}
```

#### Section-based Chunking
```javascript
{
  chunkBy: 'sections', // Uses markdown headers
  autoTag: true        // Size determined by content structure
}
```

### Export Formats

- **JSON**: Structured data for AI training
- **CSV**: Spreadsheet-compatible format
- **TXT**: Plain text with optional separators
- **XML**: Structured markup format
- **Markdown**: Formatted text with metadata

## 🔧 Configuration

### Chunking Best Practices

#### Word-based Chunking (Recommended)
```javascript
{
  chunkBy: 'words',
  chunkSize: 500,    // 300-800 words optimal
  overlap: 50,       // 10-20% recommended
  autoTag: true
}
```

#### Character-based Chunking
```javascript
{
  chunkBy: 'characters',
  chunkSize: 2000,   // 1500-3000 characters
  overlap: 200,      // 10-15% recommended
  autoTag: true
}
```

#### Section-based Chunking
```javascript
{
  chunkBy: 'sections', // Uses markdown headers
  autoTag: true        // Size determined by content structure
}
```

### Export Format Examples

#### Azure Vector Store Format
```json
[{
  "content": "Your processed text content here...",
  "metadata": {
    "source": "document.pdf",
    "chunk_id": "chunk_001",
    "tags": ["ai", "machine-learning"],
    "word_count": 342
  }
}]
```

#### OpenAI Format
```json
{
  "prompt": "Your processed text content here...",
  "completion": "Expected response or continuation"
}
```
    
## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Vue.js and the amazing Vue ecosystem
- PDF processing powered by Mozilla's PDF.js
- Markdown parsing by Marked.js
- Icons from FontAwesome
- UI components styled with TailwindCSS

## 📞 Support

For support, please open an issue in the [GitHub repository](https://github.com/FrankEllis90/doc-flow/issues).

---

**Doc Flow** - Transform your documents into AI-ready knowledge bases with ease! 🚀
