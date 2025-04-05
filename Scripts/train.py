from transformers import BertTokenizer, BertForSequenceClassification

model_name = "charangan/MedBERT"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForSequenceClassification.from_pretrained(model_name, num_labels=2)

# Save to disk
model.save_pretrained("Model/classifier")
tokenizer.save_pretrained("Model/tokenizer")
