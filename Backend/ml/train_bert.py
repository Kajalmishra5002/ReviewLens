import pandas as pd
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import torch

# 1. Load Custom Dataset
data = {
    "text": [
        "this product is great",
        "very bad quality",
        "excellent performance",
        "worst experience",
        "good phone",
        "not worth money"
    ],
    "label": [1, 0, 1, 0, 1, 0] # 1: Positive, 0: Negative
}
df = pd.DataFrame(data)
dataset = Dataset.from_pandas(df)

# 2. Load Tokenizer & Model
model_name = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

# 3. Tokenize Data
def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

tokenized_datasets = dataset.map(tokenize_function, batched=True)

# 4. Define Training Arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
)

# 5. Initialize Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets,
    eval_dataset=tokenized_datasets, # For demo purposes using train as eval
)

# 6. Train & Save Model
print("Starting training...")
trainer.train()

model.save_pretrained("./fine_tuned_model")
tokenizer.save_pretrained("./fine_tuned_model")
print("✅ Model trained & saved to ./fine_tuned_model")
