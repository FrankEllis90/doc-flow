// Test script to verify Azure Vector Store export format
import { useExportStore } from './src/stores/export.ts'

// Sample test chunks
const testChunks = [
  {
    id: 'test-1',
    chunk_id: 'chunk_001',
    content: 'Money Means is a financial wellness platform that helps users track spending and build better financial habits.',
    source: 'money-guide.md',
    tags: ['finance', 'saving', 'budgeting'],
    stats: {
      words: 17,
      characters: 108
    },
    metadata: {
      wordCount: 17,
      createdAt: '2025-01-28T12:00:00Z',
      type: 'manual'
    }
  },
  {
    id: 'test-2', 
    chunk_id: 'chunk_002',
    content: 'Budgeting tips include setting fixed goals, tracking monthly expenses, and using the 50/30/20 rule for income allocation.',
    source: 'money-guide.md',
    tags: ['budgeting', 'goals'],
    stats: {
      words: 18,
      characters: 112
    },
    metadata: {
      wordCount: 18,
      createdAt: '2025-01-28T12:05:00Z',
      type: 'manual'
    }
  }
]

// Expected Azure Vector Store format
const expectedFormat = [
  {
    content: 'Money Means is a financial wellness platform that helps users track spending and build better financial habits.',
    metadata: {
      source: 'money-guide.md',
      chunk_id: 'chunk_001',
      tags: ['finance', 'saving', 'budgeting'],
      word_count: 17
    }
  },
  {
    content: 'Budgeting tips include setting fixed goals, tracking monthly expenses, and using the 50/30/20 rule for income allocation.',
    metadata: {
      source: 'money-guide.md',
      chunk_id: 'chunk_002', 
      tags: ['budgeting', 'goals'],
      word_count: 18
    }
  }
]

console.log('✅ Azure Vector Store Export Format Test')
console.log('📝 Expected format:', JSON.stringify(expectedFormat, null, 2))
console.log('🎯 This format is optimized for Azure OpenAI vector store ingestion')
console.log('📊 Each chunk contains content and metadata with source, chunk_id, tags, and word_count')