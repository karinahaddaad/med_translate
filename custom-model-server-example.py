"""
Example Python server for custom model integration with MedTranslate

This shows how to integrate your own Whisper/translation models.

Requirements:
    pip install flask flask-cors openai-whisper transformers torch

Usage:
    python custom-model-server-example.py

Then update your .env file:
    VITE_CUSTOM_API_ENDPOINT=http://localhost:8000/transcribe
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os
import tempfile

app = Flask(__name__)
CORS(app)  # Allow requests from your React app

# Load Whisper model (this takes a minute on first run)
print("Loading Whisper model...")
model = whisper.load_model("large-v3")  # Options: tiny, base, small, medium, large, large-v3
print("Model loaded!")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    """
    Receives audio file and optional patient context, transcribes Arabic,
    translates to English, and extracts clinical keywords and summary.
    """
    try:
        # Get audio file from request
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']

        # Get patient context if provided
        patient_context = None
        if 'patient_context' in request.form:
            import json
            patient_context = json.loads(request.form['patient_context'])
            print(f"Patient context: {patient_context}")

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name

        print(f"Processing audio file: {temp_path}")

        # Step 1: Transcribe Arabic audio
        print("Transcribing Arabic...")
        result = model.transcribe(
            temp_path,
            language='ar',  # Arabic
            task='transcribe'
        )
        arabic_text = result['text']
        print(f"Arabic transcription: {arabic_text[:100]}...")

        # Step 2: Translate to English
        # Option A: Use Whisper's built-in translation
        print("Translating to English...")
        translation_result = model.transcribe(
            temp_path,
            language='ar',
            task='translate'  # This translates to English
        )
        english_text = translation_result['text']
        print(f"English translation: {english_text[:100]}...")

        # Step 3: Extract clinical keywords (simple example)
        keywords = extract_clinical_keywords(arabic_text, english_text)

        # Step 4: Generate summary (with patient context if available)
        summary = generate_clinical_summary(english_text, patient_context)

        # Clean up temp file
        os.unlink(temp_path)

        # Return results
        return jsonify({
            'arabicText': arabic_text,
            'englishText': english_text,
            'keywords': keywords,
            'summary': summary
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


def extract_clinical_keywords(arabic_text, english_text):
    """
    Extract clinical keywords from the text.

    This is a simple example. For production, you could:
    - Use a medical NER model
    - Use keyword extraction algorithms
    - Use GPT/LLM for extraction
    """
    keywords = []

    # Simple keyword extraction based on common medical terms
    medical_terms = {
        'headache': 'Chief complaint: Headache',
        'pain': 'Chief complaint: Pain',
        'fever': 'Symptom: Fever',
        'days': 'Duration mentioned',
        'diabetes': 'PMH: Diabetes',
        'hypertension': 'PMH: Hypertension',
        'blood pressure': 'PMH: HTN',
    }

    text_lower = english_text.lower()
    for term, tag in medical_terms.items():
        if term in text_lower:
            keywords.append(tag)

    # Limit to 5 keywords
    return keywords[:5] if keywords else ['Clinical information extracted']


def generate_clinical_summary(english_text, patient_context=None):
    """
    Generate a clinical summary.

    This is a simple example. For production, you could:
    - Use a summarization model
    - Use GPT/LLM for summarization
    - Use template-based summary generation
    """
    # Add patient context to summary if available
    context_prefix = ""
    if patient_context:
        age_gender = []
        if patient_context.get('age'):
            age_gender.append(f"{patient_context['age']}-year-old")
        if patient_context.get('gender'):
            age_gender.append(patient_context['gender'])

        if age_gender:
            context_prefix = f"{' '.join(age_gender).capitalize()} patient "

    # Simple summary: just return first 200 characters + "..."
    if len(english_text) > 200:
        summary = english_text[:200] + "..."
    else:
        summary = english_text

    return f"{context_prefix}presents with: {summary}"


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'model': 'whisper-large-v3'})


if __name__ == '__main__':
    print("\n" + "="*60)
    print("MedTranslate Custom Model Server")
    print("="*60)
    print("\nServer running on: http://localhost:8000")
    print("Endpoint: http://localhost:8000/transcribe")
    print("\nUpdate your .env file with:")
    print("VITE_CUSTOM_API_ENDPOINT=http://localhost:8000/transcribe")
    print("\n" + "="*60 + "\n")

    app.run(host='0.0.0.0', port=8000, debug=True)


# ============================================================================
# ADVANCED: Using your own translation model instead of Whisper's translate
# ============================================================================

"""
If you want to use a different translation model (like Helsinki-NLP):

from transformers import pipeline

# Load at startup
translator = pipeline("translation", model="Helsinki-NLP/opus-mt-ar-en")

# In transcribe() function, replace Step 2 with:
english_text = translator(arabic_text, max_length=512)[0]['translation_text']
"""

# ============================================================================
# ADVANCED: Using GPT for keyword extraction and summary
# ============================================================================

"""
If you want to use OpenAI GPT for better clinical extraction:

from openai import OpenAI
client = OpenAI(api_key="your-key")

def extract_with_gpt(english_text):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Extract clinical keywords and summary from medical text. Return JSON."},
            {"role": "user", "content": english_text}
        ]
    )
    return response.choices[0].message.content
"""
