import numpy as np

class HealthNeuralNetwork:
    """
    Multilayer Perceptron - Syllabus Module 3 & 4
    Architecture: Input(10) -> Hidden1(16) -> Hidden2(8) -> Output(3)
    Uses: Sigmoid activation, Backpropagation, Gradient Descent
    """

    def __init__(self, input_size=10, hidden1=16, hidden2=8, output_size=3, lr=0.01):
        self.lr = lr  # learning rate for gradient descent

        # Initialize weights (Xavier initialization for better convergence)
        self.W1 = np.random.randn(input_size, hidden1) * np.sqrt(2.0 / input_size)
        self.b1 = np.zeros((1, hidden1))

        self.W2 = np.random.randn(hidden1, hidden2) * np.sqrt(2.0 / hidden1)
        self.b2 = np.zeros((1, hidden2))

        self.W3 = np.random.randn(hidden2, output_size) * np.sqrt(2.0 / hidden2)
        self.b3 = np.zeros((1, output_size))

        self.loss_history = []

    

    def sigmoid(self, z):
        return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

    def sigmoid_derivative(self, a):
        return a * (1 - a)

    def softmax(self, z):
        # Softmax for output layer (multiclass)
        exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
        return exp_z / np.sum(exp_z, axis=1, keepdims=True)

    # ---------- Forward Pass ----------

    def forward(self, X):
        self.z1 = X @ self.W1 + self.b1
        self.a1 = self.sigmoid(self.z1)       # Hidden layer 1

        self.z2 = self.a1 @ self.W2 + self.b2
        self.a2 = self.sigmoid(self.z2)       # Hidden layer 2

        self.z3 = self.a2 @ self.W3 + self.b3
        self.a3 = self.softmax(self.z3)       # Output layer

        return self.a3

    # ---------- Loss (Cross Entropy) ----------

    def compute_loss(self, y_pred, y_true):
        m = y_true.shape[0]
        log_likelihood = -np.log(y_pred[range(m), y_true.astype(int)] + 1e-8)
        return np.mean(log_likelihood)

    # ---------- Backward Pass / Backpropagation (Module 4.2) ----------

    def backward(self, X, y_true):
        m = X.shape[0]

        # Output layer delta
        delta3 = self.a3.copy()
        delta3[range(m), y_true.astype(int)] -= 1
        delta3 /= m

        dW3 = self.a2.T @ delta3
        db3 = np.sum(delta3, axis=0, keepdims=True)

        # Hidden layer 2 delta
        delta2 = (delta3 @ self.W3.T) * self.sigmoid_derivative(self.a2)
        dW2 = self.a1.T @ delta2
        db2 = np.sum(delta2, axis=0, keepdims=True)

        # Hidden layer 1 delta
        delta1 = (delta2 @ self.W2.T) * self.sigmoid_derivative(self.a1)
        dW1 = X.T @ delta1
        db1 = np.sum(delta1, axis=0, keepdims=True)

        # Gradient Descent Update (Module 4.1)
        self.W3 -= self.lr * dW3
        self.b3 -= self.lr * db3
        self.W2 -= self.lr * dW2
        self.b2 -= self.lr * db2
        self.W1 -= self.lr * dW1
        self.b1 -= self.lr * db1

    # ---------- Training ----------

    def train(self, X, y, epochs=1000, batch_size=32):
        m = X.shape[0]
        for epoch in range(epochs):
            # Mini-batch gradient descent
            indices = np.random.permutation(m)
            X_shuffled = X[indices]
            y_shuffled = y[indices]

            for start in range(0, m, batch_size):
                X_batch = X_shuffled[start:start+batch_size]
                y_batch = y_shuffled[start:start+batch_size]
                self.forward(X_batch)
                self.backward(X_batch, y_batch)

            # Log loss every 100 epochs
            if epoch % 100 == 0:
                y_pred = self.forward(X)
                loss = self.compute_loss(y_pred, y)
                self.loss_history.append(loss)
                print(f"Epoch {epoch:4d} | Loss: {loss:.4f}")

    # ---------- Predict ----------

    def predict(self, X):
        probs = self.forward(X)
        return np.argmax(probs, axis=1), np.max(probs, axis=1)

    def accuracy(self, X, y):
        preds, _ = self.predict(X)
        return np.mean(preds == y)