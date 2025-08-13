/**
 * Doc Layer - Multi-Platform Vector Store Export Profiles
 * Pre-configured export formats for Pinecone, Weaviate, Milvus, Vespa, OpenAI, and more
 */

/**
 * Vector store configuration profiles
 */
export const VECTOR_STORE_PROFILES = {
  // OpenAI Embeddings & Fine-tuning
  openai: {
    embeddings: {
      name: 'OpenAI Embeddings',
      description: 'OpenAI text-embedding-3-small/large compatible format',
      format: 'jsonl',
      maxChunkSize: 8191, // tokens
      fileExtension: '.jsonl',
      schema: {
        text: 'string', // Main content field
        metadata: 'object' // Optional metadata
      },
      example: {
        text: "Your document content goes here...",
        metadata: {
          source: "document.pdf",
          chunk_id: "chunk_001",
          page: 1
        }
      },
      uploadScript: `
# OpenAI Embeddings Upload Script
import openai
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key-here")

# Read the exported JSONL file
with open('doc_layer_export.jsonl', 'r') as f:
    for line in f:
        data = json.loads(line)
        
        # Generate embeddings
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=data["text"]
        )
        
        embedding = response.data[0].embedding
        
        # Store embedding with metadata
        # Your vector database storage logic here
        print(f"Processed chunk: {data.get('metadata', {}).get('chunk_id', 'unknown')}")
`
    },
    
    finetuning: {
      name: 'OpenAI Fine-tuning',
      description: 'OpenAI GPT fine-tuning JSONL format',
      format: 'jsonl',
      fileExtension: '.jsonl',
      schema: {
        messages: 'array' // Array of message objects
      },
      example: {
        messages: [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "What is the main topic of this document?"},
          {"role": "assistant", "content": "Based on the document content..."}
        ]
      }
    }
  },

  // Pinecone Vector Database
  pinecone: {
    name: 'Pinecone',
    description: 'Pinecone vector database with metadata filtering',
    format: 'json',
    maxChunkSize: 40960, // characters (flexible)
    fileExtension: '.json',
    schema: {
      vectors: 'array', // Array of vector objects
      namespace: 'string' // Optional namespace
    },
    vectorSchema: {
      id: 'string',
      values: 'array', // Dense vector values
      sparseValues: 'object', // Optional sparse values
      metadata: 'object'
    },
    example: {
      vectors: [
        {
          id: "chunk_001",
          values: [0.1, 0.2, 0.3], // 1536 dimensions for OpenAI embeddings
          metadata: {
            text: "Your document content...",
            source: "document.pdf",
            chunk_id: "chunk_001",
            page: 1,
            word_count: 150
          }
        }
      ],
      namespace: "doc-layer-knowledge-base"
    },
    uploadScript: `
# Pinecone Upload Script
import pinecone
import json
from openai import OpenAI

# Initialize Pinecone
pinecone.init(api_key="your-pinecone-api-key", environment="your-environment")
index = pinecone.Index("your-index-name")

# Initialize OpenAI for embeddings
openai_client = OpenAI(api_key="your-openai-api-key")

# Load exported data
with open('doc_layer_export.json', 'r') as f:
    data = json.load(f)

# Process and upsert vectors
vectors_to_upsert = []
for item in data['vectors']:
    # Generate embedding if not provided
    if 'values' not in item or not item['values']:
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=item['metadata']['text']
        )
        item['values'] = response.data[0].embedding
    
    vectors_to_upsert.append(item)
    
    # Batch upsert every 100 vectors
    if len(vectors_to_upsert) >= 100:
        index.upsert(vectors=vectors_to_upsert, namespace=data.get('namespace', ''))
        vectors_to_upsert = []

# Upsert remaining vectors
if vectors_to_upsert:
    index.upsert(vectors=vectors_to_upsert, namespace=data.get('namespace', ''))

print("Upload complete!")
`
  },

  // Weaviate Vector Database
  weaviate: {
    name: 'Weaviate',
    description: 'Weaviate vector database with GraphQL schema',
    format: 'json',
    maxChunkSize: 65536, // characters
    fileExtension: '.json',
    schema: {
      objects: 'array', // Array of objects to import
      className: 'string' // Weaviate class name
    },
    objectSchema: {
      class: 'string',
      properties: 'object',
      vector: 'array' // Optional pre-computed vector
    },
    example: {
      className: "Document",
      objects: [
        {
          class: "Document",
          properties: {
            text: "Your document content goes here...",
            source: "document.pdf",
            chunk_id: "chunk_001",
            page: 1,
            word_count: 150,
            created_at: "2025-01-01T00:00:00Z"
          },
          vector: [0.1, 0.2, 0.3] // Optional
        }
      ]
    },
    uploadScript: `
# Weaviate Upload Script
import weaviate
import json

# Initialize Weaviate client
client = weaviate.Client(
    url="http://localhost:8080",  # Replace with your Weaviate URL
    auth_client_secret=weaviate.auth.AuthApiKey(api_key="your-api-key"),  # If auth enabled
    additional_headers={
        "X-OpenAI-Api-Key": "your-openai-api-key"  # If using OpenAI vectorizer
    }
)

# Load exported data
with open('doc_layer_export.json', 'r') as f:
    data = json.load(f)

# Configure batch
with client.batch as batch:
    batch.batch_size = 100
    batch.dynamic = True
    
    for obj in data['objects']:
        # Add object to batch
        batch.add_data_object(
            data_object=obj['properties'],
            class_name=obj['class'],
            vector=obj.get('vector')  # Optional pre-computed vector
        )

print("Upload complete!")
`
  },

  // Milvus Vector Database
  milvus: {
    name: 'Milvus',
    description: 'Milvus open-source vector database',
    format: 'json',
    maxChunkSize: 65536,
    fileExtension: '.json',
    schema: {
      collection_name: 'string',
      data: 'array' // Array of data objects
    },
    dataSchema: {
      id: 'integer',
      vector: 'array',
      text: 'string',
      metadata: 'object'
    },
    example: {
      collection_name: "doc_layer_collection",
      data: [
        {
          id: 1,
          vector: [0.1, 0.2, 0.3],
          text: "Your document content goes here...",
          source: "document.pdf",
          chunk_id: "chunk_001",
          page: 1
        }
      ]
    },
    uploadScript: `
# Milvus Upload Script
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType
import json

# Connect to Milvus
connections.connect("default", host="localhost", port="19530")

# Load exported data
with open('doc_layer_export.json', 'r') as f:
    data = json.load(f)

collection_name = data['collection_name']

# Define schema (adjust dimensions as needed)
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=1536),  # Adjust dimension
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
    FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=255),
    FieldSchema(name="chunk_id", dtype=DataType.VARCHAR, max_length=50)
]

schema = CollectionSchema(fields, f"Doc Layer collection: {collection_name}")
collection = Collection(collection_name, schema)

# Prepare data for insertion
ids = [item['id'] for item in data['data']]
vectors = [item['vector'] for item in data['data']]
texts = [item['text'] for item in data['data']]
sources = [item['source'] for item in data['data']]
chunk_ids = [item['chunk_id'] for item in data['data']]

# Insert data
mr = collection.insert([ids, vectors, texts, sources, chunk_ids])

# Create index
index_params = {
    "metric_type": "IP",
    "index_type": "IVF_FLAT",
    "params": {"nlist": 128}
}
collection.create_index("vector", index_params)

print("Upload complete!")
`
  },

  // Vespa Search Engine
  vespa: {
    name: 'Vespa',
    description: 'Vespa search engine with vector similarity',
    format: 'jsonl',
    maxChunkSize: 1000000, // Very flexible
    fileExtension: '.jsonl',
    schema: {
      put: 'string', // Document ID
      fields: 'object' // Document fields
    },
    example: {
      put: "id:doc_layer:document::chunk_001",
      fields: {
        text: "Your document content goes here...",
        embedding: [0.1, 0.2, 0.3],
        source: "document.pdf",
        chunk_id: "chunk_001",
        page: 1,
        timestamp: 1640995200
      }
    },
    uploadScript: `
# Vespa Upload Script
import requests
import json

vespa_endpoint = "http://localhost:8080"  # Replace with your Vespa endpoint

# Load exported data
with open('doc_layer_export.jsonl', 'r') as f:
    for line in f:
        doc = json.loads(line)
        
        # Upload document to Vespa
        response = requests.post(
            f"{vespa_endpoint}/document/v1/{doc['put']}",
            json={"fields": doc["fields"]},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print(f"Uploaded: {doc['put']}")
        else:
            print(f"Failed to upload {doc['put']}: {response.text}")

print("Upload complete!")
`
  },

  // Chroma DB
  chroma: {
    name: 'ChromaDB',
    description: 'ChromaDB open-source embedding database',
    format: 'json',
    maxChunkSize: 1000000,
    fileExtension: '.json',
    schema: {
      collection_name: 'string',
      documents: 'array',
      metadatas: 'array',
      ids: 'array',
      embeddings: 'array'
    },
    example: {
      collection_name: "doc_layer_collection",
      documents: ["Your document content goes here..."],
      metadatas: [{"source": "document.pdf", "chunk_id": "chunk_001", "page": 1}],
      ids: ["chunk_001"],
      embeddings: [[0.1, 0.2, 0.3]]
    },
    uploadScript: `
# ChromaDB Upload Script
import chromadb
import json

# Initialize ChromaDB client
client = chromadb.Client()

# Load exported data
with open('doc_layer_export.json', 'r') as f:
    data = json.load(f)

# Get or create collection
collection = client.get_or_create_collection(
    name=data['collection_name'],
    metadata={"description": "Doc Layer exported collection"}
)

# Add documents to collection
collection.add(
    documents=data['documents'],
    metadatas=data['metadatas'],
    ids=data['ids'],
    embeddings=data.get('embeddings')  # Optional if using auto-embedding
)

print(f"Added {len(data['documents'])} documents to ChromaDB collection")
`
  },

  // Qdrant Vector Database
  qdrant: {
    name: 'Qdrant',
    description: 'Qdrant vector similarity search engine',
    format: 'json',
    maxChunkSize: 1000000,
    fileExtension: '.json',
    schema: {
      collection_name: 'string',
      vectors: 'array'
    },
    vectorSchema: {
      id: 'integer',
      vector: 'array',
      payload: 'object'
    },
    example: {
      collection_name: "doc_layer_collection",
      vectors: [
        {
          id: 1,
          vector: [0.1, 0.2, 0.3],
          payload: {
            text: "Your document content goes here...",
            source: "document.pdf",
            chunk_id: "chunk_001",
            page: 1
          }
        }
      ]
    },
    uploadScript: `
# Qdrant Upload Script
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import json

# Initialize Qdrant client
client = QdrantClient("localhost", port=6333)

# Load exported data
with open('doc_layer_export.json', 'r') as f:
    data = json.load(f)

collection_name = data['collection_name']

# Create collection if it doesn't exist
client.recreate_collection(
    collection_name=collection_name,
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)  # Adjust size
)

# Prepare points
points = [
    PointStruct(
        id=vector_data['id'],
        vector=vector_data['vector'],
        payload=vector_data['payload']
    )
    for vector_data in data['vectors']
]

# Upload points
operation_info = client.upsert(
    collection_name=collection_name,
    wait=True,
    points=points
)

print(f"Uploaded {len(points)} points to Qdrant collection")
`
  },

  // LangChain Document Format
  langchain: {
    name: 'LangChain Documents',
    description: 'LangChain Document format for RAG applications',
    format: 'json',
    maxChunkSize: 1000000,
    fileExtension: '.json',
    schema: {
      documents: 'array'
    },
    documentSchema: {
      page_content: 'string',
      metadata: 'object'
    },
    example: {
      documents: [
        {
          page_content: "Your document content goes here...",
          metadata: {
            source: "document.pdf",
            chunk_id: "chunk_001",
            page: 1,
            word_count: 150
          }
        }
      ]
    },
    uploadScript: `
# LangChain Upload Script
from langchain.docstore.document import Document
from langchain.vectorstores import Chroma  # or any other vector store
from langchain.embeddings import OpenAIEmbeddings
import json

# Load exported data
with open('doc_layer_export.json', 'r') as f:
    data = json.load(f)

# Convert to LangChain Documents
documents = [
    Document(
        page_content=doc['page_content'],
        metadata=doc['metadata']
    )
    for doc in data['documents']
]

# Initialize embeddings and vector store
embeddings = OpenAIEmbeddings()
vector_store = Chroma.from_documents(
    documents=documents,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

print(f"Created vector store with {len(documents)} documents")
`
  }
}

/**
 * Export format generator
 */
export class VectorStoreExporter {
  constructor(chunks, profile) {
    this.chunks = chunks
    this.profile = VECTOR_STORE_PROFILES[profile] || VECTOR_STORE_PROFILES.openai.embeddings
  }

  /**
   * Generate export data based on selected profile
   */
  generateExport() {
    const profileName = this.getProfileName()
    
    switch (profileName) {
      case 'openai_embeddings':
        return this.generateOpenAIEmbeddings()
      case 'openai_finetuning':
        return this.generateOpenAIFinetuning()
      case 'pinecone':
        return this.generatePinecone()
      case 'weaviate':
        return this.generateWeaviate()
      case 'milvus':
        return this.generateMilvus()
      case 'vespa':
        return this.generateVespa()
      case 'chroma':
        return this.generateChroma()
      case 'qdrant':
        return this.generateQdrant()
      case 'langchain':
        return this.generateLangChain()
      default:
        throw new Error(`Unknown profile: ${profileName}`)
    }
  }

  getProfileName() {
    // Determine profile name from profile object
    if (this.profile === VECTOR_STORE_PROFILES.openai.embeddings) return 'openai_embeddings'
    if (this.profile === VECTOR_STORE_PROFILES.openai.finetuning) return 'openai_finetuning'
    if (this.profile === VECTOR_STORE_PROFILES.pinecone) return 'pinecone'
    if (this.profile === VECTOR_STORE_PROFILES.weaviate) return 'weaviate'
    if (this.profile === VECTOR_STORE_PROFILES.milvus) return 'milvus'
    if (this.profile === VECTOR_STORE_PROFILES.vespa) return 'vespa'
    if (this.profile === VECTOR_STORE_PROFILES.chroma) return 'chroma'
    if (this.profile === VECTOR_STORE_PROFILES.qdrant) return 'qdrant'
    if (this.profile === VECTOR_STORE_PROFILES.langchain) return 'langchain'
    return 'openai_embeddings'
  }

  generateOpenAIEmbeddings() {
    return this.chunks.map(chunk => ({
      text: chunk.content,
      metadata: {
        ...chunk.metadata,
        chunk_id: chunk.id
      }
    }))
  }

  generateOpenAIFinetuning() {
    return this.chunks.map(chunk => ({
      messages: [
        { role: "system", content: "You are a helpful assistant that answers questions based on document content." },
        { role: "user", content: `What is the main topic of this content: ${chunk.content.substring(0, 200)}...?` },
        { role: "assistant", content: `Based on the document content, the main topic is: ${chunk.metadata.tags?.[0] || 'general information'}.` }
      ]
    }))
  }

  generatePinecone() {
    return {
      vectors: this.chunks.map((chunk, index) => ({
        id: chunk.id || `chunk_${index + 1}`,
        values: [], // Placeholder - embeddings would be generated client-side
        metadata: {
          text: chunk.content,
          ...chunk.metadata
        }
      })),
      namespace: "doc-layer-export"
    }
  }

  generateWeaviate() {
    return {
      className: "Document",
      objects: this.chunks.map(chunk => ({
        class: "Document",
        properties: {
          text: chunk.content,
          chunk_id: chunk.id,
          ...chunk.metadata,
          created_at: new Date().toISOString()
        }
      }))
    }
  }

  generateMilvus() {
    return {
      collection_name: "doc_layer_collection",
      data: this.chunks.map((chunk, index) => ({
        id: index + 1,
        vector: [], // Placeholder - embeddings would be generated client-side
        text: chunk.content,
        chunk_id: chunk.id,
        source: chunk.metadata.source || 'unknown',
        ...chunk.metadata
      }))
    }
  }

  generateVespa() {
    return this.chunks.map((chunk, index) => ({
      put: `id:doc_layer:document::${chunk.id || `chunk_${index + 1}`}`,
      fields: {
        text: chunk.content,
        embedding: [], // Placeholder
        chunk_id: chunk.id,
        timestamp: Date.now(),
        ...chunk.metadata
      }
    }))
  }

  generateChroma() {
    return {
      collection_name: "doc_layer_collection",
      documents: this.chunks.map(chunk => chunk.content),
      metadatas: this.chunks.map(chunk => ({
        chunk_id: chunk.id,
        ...chunk.metadata
      })),
      ids: this.chunks.map((chunk, index) => chunk.id || `chunk_${index + 1}`),
      embeddings: [] // Optional - ChromaDB can auto-generate
    }
  }

  generateQdrant() {
    return {
      collection_name: "doc_layer_collection",
      vectors: this.chunks.map((chunk, index) => ({
        id: index + 1,
        vector: [], // Placeholder
        payload: {
          text: chunk.content,
          chunk_id: chunk.id,
          ...chunk.metadata
        }
      }))
    }
  }

  generateLangChain() {
    return {
      documents: this.chunks.map(chunk => ({
        page_content: chunk.content,
        metadata: {
          chunk_id: chunk.id,
          ...chunk.metadata
        }
      }))
    }
  }

  /**
   * Generate upload script for the selected profile
   */
  generateUploadScript() {
    return this.profile.uploadScript || '# No upload script available for this profile'
  }

  /**
   * Get recommended filename
   */
  getFilename() {
    const timestamp = new Date().toISOString().split('T')[0]
    const profileName = this.getProfileName()
    return `doc_layer_${profileName}_${timestamp}${this.profile.fileExtension}`
  }
}

/**
 * Utility functions
 */
export function getSupportedVectorStores() {
  return Object.keys(VECTOR_STORE_PROFILES)
}

export function getVectorStoreProfile(storeName) {
  return VECTOR_STORE_PROFILES[storeName]
}

export function exportToVectorStore(chunks, storeName, subProfile = null) {
  let profile = VECTOR_STORE_PROFILES[storeName]
  
  // Handle sub-profiles (like openai.embeddings vs openai.finetuning)
  if (subProfile && profile[subProfile]) {
    profile = profile[subProfile]
  }
  
  if (!profile) {
    throw new Error(`Unknown vector store: ${storeName}`)
  }
  
  const exporter = new VectorStoreExporter(chunks, profile)
  return {
    data: exporter.generateExport(),
    filename: exporter.getFilename(),
    uploadScript: exporter.generateUploadScript(),
    profile: profile
  }
}

export { VectorStoreExporter }