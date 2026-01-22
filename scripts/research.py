#!/usr/bin/env python3
"""
CLI wrapper for Personal Library partitioned storage.
Called by VS Code extension - returns JSON results.
"""
import sys
import json
import argparse
import pickle
from pathlib import Path
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import os

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
BOOKS_DIR = PROJECT_DIR / "books"
MODELS_DIR = PROJECT_DIR / "models"
METADATA_FILE = BOOKS_DIR / "metadata.json"

# Set model cache to local models/ directory
os.environ['SENTENCE_TRANSFORMERS_HOME'] = str(MODELS_DIR)

# Load local embedding model (384-dim)
EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')

def load_metadata():
    with open(METADATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_topic(topic_id):
    """Load FAISS index + chunks for a topic."""
    # Get folder path from metadata
    metadata = load_metadata()
    folder_path = None
    for topic in metadata['topics']:
        if topic['id'] == topic_id:
            folder_path = topic.get('folder_path', topic['label'])
            break
    if not folder_path:
        return None

    topic_dir = BOOKS_DIR / folder_path

    faiss_file = topic_dir / "faiss.index"
    chunks_file_json = topic_dir / "chunks.json"

    if not faiss_file.exists() or not chunks_file_json.exists():
        return None

    index = faiss.read_index(str(faiss_file))
    with open(chunks_file_json, 'r', encoding='utf-8') as f:
        chunks = json.load(f)

    return {'index': index, 'chunks': chunks}

def get_embedding(text):
    """Get local embedding for text."""
    return EMBEDDING_MODEL.encode(text, convert_to_numpy=True).astype(np.float32)

def query_library(query, topic=None, k=5):
    """Query the library."""
    metadata = load_metadata()

    # Find topic
    topic_id = None
    if topic:
        for t in metadata['topics']:
            if t['id'] == topic or topic.lower() in t['label'].lower():
                topic_id = t['id']
                break

    if not topic_id:
        # Default to first topic with data
        for t in metadata['topics']:
            topic_dir = BOOKS_DIR / t['id']
            if (topic_dir / "faiss.index").exists():
                topic_id = t['id']
                break

    if not topic_id:
        return []

    # Load topic data
    topic_data = load_topic(topic_id)
    if not topic_data:
        return []

    # Get embedding and search
    query_embedding = get_embedding(query)
    distances, indices = topic_data['index'].search(
        query_embedding.reshape(1, -1),
        k
    )

    # Build book_id → (filename, folder_path) map for this topic
    topic_meta = None
    for t in metadata['topics']:
        if t['id'] == topic_id:
            topic_meta = t
            break
    book_id_to_file = {}
    if topic_meta:
        for b in topic_meta.get('books', []):
            book_id_to_file[b['id']] = {
                'filename': b['filename'],
                'folder_path': topic_meta.get('folder_path', topic_meta['label'])
            }

    # Format results with filename and relative path
    results = []
    for idx, dist in zip(indices[0], distances[0]):
        if idx < len(topic_data['chunks']):
            chunk = topic_data['chunks'][idx]
            book_id = chunk.get('book_id')
            file_info = book_id_to_file.get(book_id, {})
            filename = file_info.get('filename', '')
            folder_path = file_info.get('folder_path', '')
            # Compute relative path from workspace root to book file
            # (Assume cwd is workspace root)
            rel_path = os.path.join('books', folder_path, filename) if filename and folder_path else ''
            results.append({
                'text': chunk.get('chunk_full', ''),
                'book_title': chunk.get('book_title', ''),
                'topic': topic_id,
                'similarity': float(1 - dist),  # Convert distance to similarity
                'filename': filename,
                'folder_path': folder_path,
                'relative_path': rel_path
            })

    return results

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('query', help='Search query')
    parser.add_argument('--topic', help='Topic filter')
    parser.add_argument('--top-k', type=int, default=5, help='Number of results')

    args = parser.parse_args()

    try:
        results = query_library(
            query=args.query,
            topic=args.topic,
            k=args.top_k
        )
        print(json.dumps({'results': results}, ensure_ascii=False, indent=2))
    except Exception as e:
        print(json.dumps({'error': str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
