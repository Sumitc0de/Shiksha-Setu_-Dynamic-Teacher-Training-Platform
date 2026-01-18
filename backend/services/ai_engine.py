from groq import Groq
from core.config import settings
from typing import Dict, Optional
from services.translation_service import get_translation_service
import logging

logger = logging.getLogger(__name__)

class AIAdaptationEngine:
    # Supported languages with native names
    SUPPORTED_LANGUAGES = {
        "english": "English",
        "hindi": "हिंदी (Hindi)",
        "marathi": "मराठी (Marathi)",
        "bengali": "বাংলা (Bengali)",
        "tamil": "தமிழ் (Tamil)",
        "telugu": "తెలుగు (Telugu)",
        "gujarati": "ગુજરાતી (Gujarati)",
        "kannada": "ಕನ್ನಡ (Kannada)",
        "malayalam": "മലയാളം (Malayalam)",
        "punjabi": "ਪੰਜਾਬੀ (Punjabi)",
        "odia": "ଓଡ଼ିଆ (Odia)",
        "urdu": "اردو (Urdu)"
    }
    
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = "llama-3.3-70b-versatile"  # Fast and capable model
        self.translation_service = get_translation_service()
        
        # System prompt for grounded, policy-safe pedagogy
        self.system_prompt = """You are an expert teacher educator working within the Indian public education system.

CRITICAL RULES - FOLLOW STRICTLY:
1. **GROUND IN SOURCE MATERIAL**: Use ONLY the concepts, topics, and information from the provided source material. Do NOT invent new topics or content.
2. **PRESERVE CORE CONTENT**: The adapted module MUST be about the SAME topic as the source material. Do not change the subject.
3. **CONTEXTUALIZE, DON'T REPLACE**: Adapt HOW the content is taught (examples, activities, language), not WHAT is taught.
4. **IF THE SOURCE IS ABOUT X, YOUR OUTPUT MUST BE ABOUT X**: Do not substitute with generic lessons.
5. Use simple, practical language suitable for government school teachers.
6. Adapt pedagogy to the given classroom constraints.
7. Ensure all suggestions are safe, low-cost, and policy-aligned.
8. If a resource is unavailable, redesign the activity using local resources - but stay on the same topic.
9. Do NOT evaluate or judge teachers.

EXAMPLE:
- Source: "OCR and text extraction from images"
- Correct: Adapt lesson on OCR/text extraction for the cluster context
- WRONG: Create a generic classroom management lesson

Your task is to adapt THE EXACT TOPIC from the source material to the specific cluster context."""
    
    def _build_context_prompt(
        self, 
        source_content: str, 
        cluster_profile: Dict,
        topic: str
    ) -> str:
        """Build the complete context prompt for adaptation"""
        
        prompt = f"""==== ORIGINAL TRAINING MANUAL CONTENT ====
Topic: {topic}

{source_content}

==== END OF ORIGINAL CONTENT ====

CLUSTER CHARACTERISTICS:
- Region Type: {cluster_profile.get('region_type', 'Not specified')}
- Primary Language: {cluster_profile.get('language', 'Not specified')}
- Infrastructure: {cluster_profile.get('infrastructure_constraints', 'Not specified')}
- Key Issues: {cluster_profile.get('key_issues', 'Not specified')}
- Grade Range: {cluster_profile.get('grade_range', 'Not specified')}

YOUR TASK:
Adapt the ABOVE manual content about "{topic}" for teachers in this specific cluster.

CRITICAL REQUIREMENTS:
1. Your adapted module MUST cover the SAME topic as the source material above
2. Extract and use the KEY CONCEPTS from the source content
3. Adapt the TEACHING APPROACH to fit the cluster's constraints
4. Use examples familiar to the cluster's context
5. If the source mentions specific techniques/concepts, INCLUDE them in adapted form

STRUCTURE YOUR OUTPUT:
**Title:** [Same topic as source]
**Learning Objective:** [What the source material teaches]
**Cluster Context:** [Brief summary of constraints]
**Adapted Teaching Module:**

1. Core Concept (from source material):
   [Explain the main concept from the source]

2. Why It Matters for This Cluster:
   [Connect to their specific needs]

3. Practical Application:
   [How to teach this with available resources]

4. Low-Resource Activity:
   [Hands-on activity using local resources]

5. Expected Outcomes:
   [What teachers should understand/be able to do]

Remember: Stay true to the SOURCE MATERIAL'S topic and concepts. Only adapt the delivery method."""
        
        return prompt
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Return list of supported languages with native names"""
        return self.SUPPORTED_LANGUAGES.copy()
    
    async def adapt_content(
        self,
        source_content: str,
        cluster_profile: Dict,
        topic: str,
        target_language: str = "english",
        temperature: float = 0.7
    ) -> Dict[str, str]:
        """
        Generate adapted pedagogical content and translate to target language
        
        Args:
            source_content: Original manual content
            cluster_profile: Cluster characteristics
            topic: Specific topic to adapt
            target_language: Target language for the output (hindi, marathi, etc.)
            temperature: Model creativity (0-1)
        
        Returns:
            Dict with adapted content and metadata
        """
        try:
            # Build prompt
            user_prompt = self._build_context_prompt(source_content, cluster_profile, topic)
            
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                max_tokens=2000,
                top_p=1,
                stream=False
            )
            
            adapted_content = response.choices[0].message.content
            
            # Translate content to target language if not English
            target_lang = target_language.lower() if target_language else "english"
            final_content = adapted_content
            was_translated = False
            
            if target_lang != "english" and target_lang in self.SUPPORTED_LANGUAGES:
                logger.info(f"Translating adapted content to {target_lang}")
                # Split content into smaller chunks for better translation
                final_content = self._translate_long_content(adapted_content, target_lang)
                was_translated = True
                logger.info(f"Successfully translated content to {target_lang}")
            
            result = {
                "adapted_content": final_content,
                "original_english_content": adapted_content if was_translated else None,
                "output_language": target_lang,
                "was_translated": was_translated,
                "model": self.model,
                "tokens_used": response.usage.total_tokens if response.usage else 0,
                "finish_reason": response.choices[0].finish_reason
            }
            
            logger.info(f"Successfully adapted content for topic: {topic}")
            return result
            
        except Exception as e:
            logger.error(f"Error adapting content: {str(e)}")
            raise Exception(f"AI adaptation failed: {str(e)}")
    
    def _translate_long_content(self, content: str, target_language: str) -> str:
        """
        Translate long content by splitting into paragraphs and translating each.
        Preserves formatting like headings and bullet points.
        
        Args:
            content: The content to translate
            target_language: Target language code (hindi, marathi, etc.)
            
        Returns:
            Translated content with preserved formatting
        """
        if not content:
            return content
            
        # Split by double newlines (paragraphs) to preserve structure
        paragraphs = content.split('\n\n')
        translated_paragraphs = []
        
        for paragraph in paragraphs:
            if not paragraph.strip():
                translated_paragraphs.append(paragraph)
                continue
                
            # Handle single-line vs multi-line paragraphs
            lines = paragraph.split('\n')
            translated_lines = []
            
            for line in lines:
                if not line.strip():
                    translated_lines.append(line)
                    continue
                    
                # Preserve markdown-like formatting (headings, bullets)
                prefix = ""
                text_to_translate = line
                
                # Check for heading markers
                if line.startswith('#'):
                    hash_count = len(line) - len(line.lstrip('#'))
                    prefix = '#' * hash_count + ' '
                    text_to_translate = line.lstrip('#').strip()
                # Check for bullet points
                elif line.strip().startswith(('- ', '* ', '• ')):
                    indent = len(line) - len(line.lstrip())
                    prefix = ' ' * indent + line.strip()[:2]
                    text_to_translate = line.strip()[2:]
                # Check for numbered lists
                elif len(line.strip()) > 2 and line.strip()[0].isdigit() and line.strip()[1] in '.):':
                    indent = len(line) - len(line.lstrip())
                    prefix = ' ' * indent + line.strip()[:3]
                    text_to_translate = line.strip()[3:]
                
                # Translate the text portion
                if text_to_translate.strip():
                    translated_text = self.translation_service.translate(
                        text_to_translate.strip(),
                        target_language=target_language,
                        source_language="english"
                    )
                    translated_lines.append(prefix + translated_text)
                else:
                    translated_lines.append(line)
            
            translated_paragraphs.append('\n'.join(translated_lines))
        
        return '\n\n'.join(translated_paragraphs)
    
    async def validate_safety(self, content: str) -> Dict[str, any]:
        """
        Optional safety validation pass
        
        Args:
            content: Generated content to validate
        
        Returns:
            Dict with validation result and any concerns
        """
        safety_prompt = f"""Review the following teacher training module and ensure:
- No unsafe or unapproved experiments are suggested
- No policy violations are present
- No assumptions of unavailable resources
- Tone is respectful and supportive toward teachers

MODULE CONTENT:
\"\"\"
{content}
\"\"\"

Respond with:
1. SAFE or UNSAFE
2. If UNSAFE, list specific concerns
3. If concerns found, provide revised content"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a safety validator for educational content."},
                    {"role": "user", "content": safety_prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            validation_result = response.choices[0].message.content
            
            return {
                "is_safe": "SAFE" in validation_result.upper()[:20],
                "validation_details": validation_result
            }
            
        except Exception as e:
            logger.error(f"Error in safety validation: {str(e)}")
            # Default to requiring review if validation fails
            return {
                "is_safe": False,
                "validation_details": f"Validation failed: {str(e)}"
            }
    
    async def tag_competencies(self, content: str) -> list:
        """
        Tag content with relevant teacher competency areas
        
        Args:
            content: Module content to analyze
        
        Returns:
            List of competency tags
        """
        competency_prompt = f"""Based on the module content below, tag this module under up to two teacher competency areas:
- Classroom Management
- Language Pedagogy
- Conceptual Teaching
- Inclusive Education
- Assessment & Feedback

Return only the tags, comma-separated.

MODULE CONTENT:
\"\"\"
{content}
\"\"\"

TAGS:"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": competency_prompt}
                ],
                temperature=0.2,
                max_tokens=50
            )
            
            tags_text = response.choices[0].message.content.strip()
            tags = [tag.strip() for tag in tags_text.split(',')]
            
            return tags[:2]  # Return max 2 tags
            
        except Exception as e:
            logger.error(f"Error tagging competencies: {str(e)}")
            return []
