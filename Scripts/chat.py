from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
from recommendation import recommend_tests  # Your custom function

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load MedBERT model and tokenizer
model_name = "Charangan/MedBERT"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
model.to(device)
model.eval()


def assess_symptoms(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    inputs = {key: val.to(device) for key, val in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1).cpu().numpy()[0]
        label = int(np.argmax(probs))
        confidence = float(probs[label])

    return label, confidence


# Chat loop
print("🧑‍⚕️ Hello! Describe your symptoms. Type 'exit' to quit.")
while True:
    user_input = input("👤 You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("🧑‍⚕️ Take care!")
        break

    label, confidence = assess_symptoms(user_input)
    if label == 1:
        print(f"🧑‍⚕️ This may indicate an issue (confidence: {confidence:.2f})")
        print("🧑‍⚕️ Recommended tests:", ", ".join(recommend_tests(user_input)))
    else:
        print("🧑‍⚕️ Your symptoms seem non-serious. Stay hydrated and monitor.")
