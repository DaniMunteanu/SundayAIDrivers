def recommend_tests(text):
    text = text.lower()
    if any(symptom in text for symptom in ["fever", "cough", "breath", "fatigue"]):
        return ["COVID test", "Chest X-ray"]
    if "chest pain" in text:
        return ["ECG", "Troponin test"]
    if "dizzy" in text or "nausea" in text:
        return ["Blood pressure check", "Blood glucose test"]
    return ["General check-up"]
