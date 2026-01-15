from typing import List, Dict, Optional
from core.config import settings
from core.vector_store import ChromaVectorStore
import logging

logger = logging.getLogger(__name__)

class RAGEngine:
    def __init__(self):
        # Use ChromaDB for efficient vector storage and retrieval
        self.vector_store = ChromaVectorStore(
            persist_directory=settings.chroma_persist_directory
        )
        
        logger.info("RAG Engine initialized with ChromaDB")
    
    def index_manual(self, manual_id: int, chunks: List[Dict]) -> bool:
        """
        Index manual chunks into vector store
        
        Args:
            manual_id: ID of the manual
            chunks: List of text chunks with metadata
        
        Returns:
            bool: Success status
        """
        try:
            documents = []
            ids = []
            metadatas = []
            
            for chunk in chunks:
                chunk_text = chunk['text']
                chunk_id = f"manual_{manual_id}_chunk_{chunk['id']}"
                
                documents.append(chunk_text)
                ids.append(chunk_id)
                metadatas.append({
                    "manual_id": str(manual_id),
                    "chunk_id": chunk['id'],
                    "char_count": chunk['char_count']
                })
            
            # Add to vector store
            self.vector_store.add_documents(
                texts=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Indexed {len(chunks)} chunks for manual {manual_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error indexing manual: {str(e)}")
            return False
    
    def search(
        self, 
        query: str, 
        manual_id: Optional[int] = None, 
        top_k: int = 5
    ) -> List[Dict]:
        """
        Search for relevant chunks using semantic similarity
        
        Args:
            query: Search query
            manual_id: Optional manual ID to filter results
            top_k: Number of top results to return
        
        Returns:
            List of search results with content and metadata
        """
        try:
            # Prepare filter
            where_filter = {"manual_id": str(manual_id)} if manual_id else None
            
            results = self.vector_store.search(
                query=query,
                n_results=top_k,
                filter_metadata=where_filter
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and len(results['documents']) > 0:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        "content": doc,
                        "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                        "distance": results['distances'][0][i] if results['distances'] else None
                    })
            
            logger.info(f"Search returned {len(formatted_results)} results for query: {query[:50]}...")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching: {str(e)}")
            return []
    
    def get_context_for_topic(
        self, 
        topic: str, 
        manual_id: int, 
        max_chunks: int = 3
    ) -> str:
        """
        Get relevant context for a specific topic from manual
        
        Args:
            topic: Topic to search for
            manual_id: Manual ID to search in
            max_chunks: Maximum number of chunks to retrieve
        
        Returns:
            Combined context text
        """
        results = self.search(topic, manual_id=manual_id, top_k=max_chunks)
        
        if not results:
            return ""
        
        # Combine relevant chunks
        context = "\n\n".join([result['content'] for result in results])
        return context
    
    def delete_manual(self, manual_id: int) -> bool:
        """Delete all chunks for a specific manual"""
        try:
            self.vector_store.delete_collection(str(manual_id))
            logger.info(f"Deleted chunks for manual {manual_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting manual: {str(e)}")
            return False
    
    def reset_collection(self) -> bool:
        """Reset the entire collection (use with caution)"""
        try:
            # Recreate the vector store
            self.vector_store = SimpleVectorStore(
                persist_directory=settings.chroma_persist_directory
            )
            logger.info("Vector store reset successfully")
            return True
        except Exception as e:
            logger.error(f"Error resetting collection: {str(e)}")
            return False
    
    def get_stats(self) -> Dict:
        """Get statistics about the indexed content"""
        return {
            "total_documents": self.vector_store.get_collection_size(),
            "embedding_model": "all-MiniLM-L6-v2"
        }
