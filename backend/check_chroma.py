from core.config import settings
from core.vector_store import ChromaVectorStore

if __name__ == '__main__':
    print('Using chroma_persist_directory =', settings.chroma_persist_directory)
    vs = ChromaVectorStore(persist_directory=settings.chroma_persist_directory)
    print('Collection size:', vs.get_collection_size())
    docs = vs.get_all_documents(limit=3)
    print('Sample ids:', docs.get('ids', [])[:3])
