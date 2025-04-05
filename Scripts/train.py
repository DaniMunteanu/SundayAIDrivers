import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments

# Load your CSV data
df = pd.read_csv('Data/symbipredict_2022.csv')

# Assume all columns except the last one (prognosis) are symptom indicators.
symptom_columns = df.columns[:-1]  # symptoms
label_column = df.columns[-1]       # prognosis

# Convert each row’s symptom data into a text description.
def row_to_text(row):
    # List symptoms that are flagged (assuming value==1 indicates presence)
    present_symptoms = [col.replace("_", " ") for col in symptom_columns if row[col] == 1]
    if present_symptoms:
        return "The patient has " + ", ".join(present_symptoms) + "."
    else:
        return "The patient shows no symptoms."

df["text"] = df.apply(row_to_text, axis=1)

# Convert prognosis to numeric labels (if not already numeric).
df["label"], label_names = pd.factorize(df[label_column])

# Split data: 75% training, 25% testing.
train_df, test_df = train_test_split(df, test_size=0.25, random_state=42)

# Load MedBERT model and tokenizer.
model_name = "charangan/MedBERT"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForSequenceClassification.from_pretrained(model_name, num_labels=2)

# Create a PyTorch Dataset for our data.
class SymptomDataset(torch.utils.data.Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=512):
        self.encodings = tokenizer(texts.tolist(), truncation=True, padding="max_length", max_length=max_length)
        self.labels = labels.tolist()

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

# Create train and test datasets.
train_dataset = SymptomDataset(train_df["text"], train_df["label"], tokenizer)
test_dataset = SymptomDataset(test_df["text"], test_df["label"], tokenizer)

# Set up training arguments.
training_args = TrainingArguments(
    output_dir="./results",            # where to save model predictions and checkpoints
    num_train_epochs=3,                # adjust epochs as needed
    per_device_train_batch_size=16,    # adjust batch size based on your GPU/CPU memory
    per_device_eval_batch_size=16,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    logging_dir="./logs",
    logging_steps=10,
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
)

# Initialize the Trainer.
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
)

# Train the model.
trainer.train()

# Evaluate on the test dataset.
eval_results = trainer.evaluate()
print("Evaluation results:", eval_results)

# Save the fine-tuned model and tokenizer.
model.save_pretrained("Model/classifier")
tokenizer.save_pretrained("Model/tokenizer")
