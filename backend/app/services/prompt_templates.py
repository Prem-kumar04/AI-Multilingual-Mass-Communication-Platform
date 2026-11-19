"""Reusable Prompt Templates & Prompt Engineering for Multilingual Campaign Content Generation."""

from typing import Dict, Any, List, Optional

SUPPORTED_CONTENT_TYPES = {
    "EMAIL": {
        "name": "Email Campaign",
        "description": "Full email with compelling subject line, preheader, body paragraphs, and clear call-to-action.",
        "default_length": "MEDIUM",
    },
    "SOCIAL_MEDIA": {
        "name": "Social Media Caption",
        "description": "Engaging social media post with hook, emojis, value proposition, CTA, and 4-6 targeted hashtags.",
        "default_length": "SHORT",
    },
    "MARKETING_HEADLINE": {
        "name": "Marketing Headlines",
        "description": "High-impact, curiosity-driven headlines and hooks tailored to audience pain points.",
        "default_length": "SHORT",
    },
    "SMS": {
        "name": "SMS / Promotional Text",
        "description": "Concise, high-urgency message under 160 characters with direct action and link placeholder.",
        "default_length": "SHORT",
    },
    "WHATSAPP": {
        "name": "WhatsApp Broadcast",
        "description": "Formatted broadcast notice using bolding, bullet points, emoji accents, and conversational clarity.",
        "default_length": "MEDIUM",
    },
    "PRODUCT_DESCRIPTION": {
        "name": "Product or Service Description",
        "description": "Structured breakdown of features, civic benefits, eligibility, and actionable enrollment steps.",
        "default_length": "DETAILED",
    },
    "ADVERTISEMENT_COPY": {
        "name": "Advertisement Copy (AIDA)",
        "description": "Persuasive ad copy structured around Attention, Interest, Desire, and Action.",
        "default_length": "MEDIUM",
    },
    "CALL_TO_ACTION": {
        "name": "Call-to-Action Messages",
        "description": "Varied high-converting CTA phrases tailored for urgent, informative, or community engagement.",
        "default_length": "SHORT",
    },
}

SUPPORTED_TONES = [
    "Professional & Authoritative",
    "Urgent / Emergency Advisory",
    "Inspiring & Uplifting",
    "Friendly & Conversational",
    "Formal & Administrative",
    "Persuasive & Marketing",
    "Educational & Informative",
]

SUPPORTED_CAMPAIGN_TYPES = [
    "PUBLIC_AWARENESS",
    "EMERGENCY_ALERT",
    "MARKETING_PROMOTION",
    "CIVIC_GOVERNANCE",
    "HEALTHCARE_WELLNESS",
    "EDUCATION_TRAINING",
    "ENVIRONMENT_CLEANLINESS",
]


def get_system_instruction() -> str:
    """System instruction guiding the AI to output structured, high-grade campaign content."""
    return """You are an elite Campaign Content Strategist, Copywriter, and Public Communications Specialist.
Your objective is to generate world-class, engaging, accurate, and culturally resonant campaign content tailored to specific audiences and channels.

Always output your response in strict, valid JSON format matching this exact schema:
{
  "headline": "A captivating, high-impact headline or subject line",
  "content": "The full formatted content body tailored to the requested channel/type",
  "call_to_action": "A direct, punchy call-to-action string",
  "suggested_hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
  "variations": [
    {
      "variation_id": 1,
      "headline": "Alternative headline 1",
      "content": "Alternative body copy 1",
      "call_to_action": "Alternative CTA 1",
      "hashtags": ["#tag1", "#tag2"]
    }
  ],
  "reasoning_notes": "Brief explanation of tone choices and audience hooks used"
}

Important Guidelines:
1. Adhere strictly to the requested content type formatting:
   - For EMAIL: Include Subject Line as headline, and structured body with greeting, key benefits, and sign-off.
   - For WHATSAPP: Use bold (*text*), bullet points, and clean spacing.
   - For SMS: Keep concise, punchy, and action-oriented.
   - For SOCIAL_MEDIA: Include compelling hook, emojis, and relevant hashtags.
2. If a specific target language (e.g. Telugu, Hindi, Tamil, Kannada) is requested, produce the primary headline, content, and CTA in that native language with high linguistic authenticity.
3. Match the specified tone strictly.
4. Output ONLY the JSON block. Do not wrap with conversational filler."""


def build_content_generation_prompt(
    campaign_name: str,
    campaign_objective: str,
    target_audience: str,
    campaign_type: str,
    content_type: str,
    preferred_tone: str,
    product_or_service_details: Optional[str] = None,
    additional_instructions: Optional[str] = None,
    content_length: str = "MEDIUM",
    target_language: str = "English",
    variations_count: int = 1,
) -> str:
    """Build a detailed, context-rich prompt for content generation."""
    details_clause = f"\n- Product/Service/Scheme Details: {product_or_service_details}" if product_or_service_details else ""
    instructions_clause = f"\n- Additional Custom Instructions: {additional_instructions}" if additional_instructions else ""

    length_guidance = {
        "SHORT": "Concise (under 100 words), direct and punchy.",
        "MEDIUM": "Balanced length (150-250 words) with clear context and points.",
        "DETAILED": "Comprehensive and in-depth (300-450 words) covering full steps and context.",
    }.get(content_length.upper(), "Standard balanced length.")

    type_info = SUPPORTED_CONTENT_TYPES.get(content_type.upper(), {"name": content_type, "description": ""})

    prompt = f"""Generate {type_info['name']} content for the following campaign:

Campaign Details:
- Campaign Title: {campaign_name}
- Primary Objective: {campaign_objective}
- Target Audience: {target_audience}
- Campaign Classification: {campaign_type}
- Content Format/Type: {content_type} ({type_info['description']})
- Preferred Tone: {preferred_tone}
- Desired Length: {content_length} ({length_guidance})
- Target Language: {target_language}{details_clause}{instructions_clause}
- Number of Alternative Variations to include in 'variations' list: {max(1, min(variations_count, 4))}

Please craft high-performing copy following the system JSON schema."""
    return prompt


def build_regeneration_prompt(
    campaign_name: str,
    campaign_objective: str,
    target_audience: str,
    content_type: str,
    previous_content: str,
    new_tone: Optional[str] = None,
    new_length: Optional[str] = None,
    additional_instructions: Optional[str] = None,
    target_language: str = "English",
    variations_count: int = 1,
) -> str:
    """Build prompt to regenerate, revise, or refine existing campaign content."""
    prompt = f"""You are revising and regenerating existing campaign content to enhance its performance.

Original Campaign Context:
- Campaign Title: {campaign_name}
- Objective: {campaign_objective}
- Target Audience: {target_audience}
- Content Type: {content_type}
- Language: {target_language}

Previous Draft to Improve/Revise:
\"\"\"
{previous_content}
\"\"\"

Requested Modifications:"""

    if new_tone:
        prompt += f"\n- Change Tone to: {new_tone}"
    if new_length:
        prompt += f"\n- Adjust Length to: {new_length}"
    if additional_instructions:
        prompt += f"\n- Specific Revision Instructions: {additional_instructions}"

    prompt += f"\n- Provide {max(1, min(variations_count, 4))} alternative revised variation(s)."
    prompt += "\n\nReturn the revised output strictly in the specified JSON schema."
    return prompt
