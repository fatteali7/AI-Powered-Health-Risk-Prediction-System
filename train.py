import numpy as np
import pandas as pd
import joblib
import sys

# Ensure stdout uses UTF-8 to prevent UnicodeEncodeError when printing emojis
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from model import HealthNeuralNetwork
from dataset import generate_dataset

def train():
    # Load or generate data
    try:
        df = pd.read_csv('health_data.csv')
        print("✅ Loaded health_data.csv")
    except FileNotFoundError:
        print("Generating dataset...")
        df = generate_dataset()

    # Features and labels
    feature_cols = ['age', 'bmi', 'blood_pressure', 'cholesterol',
                    'blood_sugar', 'smoking', 'exercise_hours',
                    'family_history', 'alcohol', 'sleep_hours']
    X = df[feature_cols].values
    y = df['risk_label'].values

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Feature scaling (StandardScaler — zero mean, unit variance)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Create and train the neural network
    nn = HealthNeuralNetwork(input_size=10, hidden1=16, hidden2=8,
                              output_size=3, lr=0.01)
    print("\n🧠 Training Neural Network...\n")
    nn.train(X_train_scaled, y_train, epochs=1000, batch_size=32)

    # Evaluate
    train_acc = nn.accuracy(X_train_scaled, y_train)
    test_acc = nn.accuracy(X_test_scaled, y_test)
    print(f"\n✅ Train Accuracy: {train_acc*100:.2f}%")
    print(f"✅ Test  Accuracy: {test_acc*100:.2f}%")

    # Save model and scaler
    import os
    os.makedirs('saved_model', exist_ok=True)
    joblib.dump(nn, 'saved_model/health_model.pkl')
    joblib.dump(scaler, 'saved_model/scaler.pkl')
    print("\n💾 Model and scaler saved.")

    # Plot loss curve
    plt.figure(figsize=(8, 4))
    plt.plot(range(0, 1000, 100), nn.loss_history, marker='o', color='steelblue')
    plt.title('Training Loss Curve (Gradient Descent)')
    plt.xlabel('Epoch')
    plt.ylabel('Cross-Entropy Loss')
    plt.grid(True)
    plt.tight_layout()
    plt.savefig('static/loss_curve.png')
    print("📊 Loss curve saved.")

if __name__ == "__main__":
    train()