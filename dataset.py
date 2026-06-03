def generate_dataset(n_samples=2000, save=True):
    np.random.seed(42)

    age = np.random.randint(18, 80, n_samples)
    bmi = np.round(np.random.uniform(15, 45, n_samples), 1)
    blood_pressure = np.random.randint(60, 180, n_samples)
    cholesterol = np.random.randint(100, 300, n_samples)
    blood_sugar = np.random.randint(70, 300, n_samples)
    smoking = np.random.randint(0, 2, n_samples)
    exercise_hours = np.round(np.random.uniform(0, 10, n_samples), 1)
    family_history = np.random.randint(0, 2, n_samples)
    alcohol = np.random.randint(0, 2, n_samples)
    sleep_hours = np.round(np.random.uniform(3, 10, n_samples), 1)

    risk_score = (
        (age > 50).astype(int) * 2 +
        (age > 65).astype(int) * 1 +
        (bmi > 25).astype(int) * 1 +
        (bmi > 30).astype(int) * 2 +
        (blood_pressure > 120).astype(int) * 1 +
        (blood_pressure > 140).astype(int) * 2 +
        (cholesterol > 180).astype(int) * 1 +
        (cholesterol > 220).astype(int) * 1 +
        (blood_sugar > 100).astype(int) * 1 +
        (blood_sugar > 140).astype(int) * 2 +
        smoking * 3 +
        (exercise_hours < 3).astype(int) * 1 +
        (exercise_hours < 1).astype(int) * 1 +
        family_history * 2 +
        alcohol * 1 +
        (sleep_hours < 6).astype(int) * 1
    )

    # Wider boundaries so Low and High are clearly separated
    risk_label = np.where(risk_score <= 3, 0, np.where(risk_score <= 9, 1, 2))

    df = pd.DataFrame({
        'age': age, 'bmi': bmi, 'blood_pressure': blood_pressure,
        'cholesterol': cholesterol, 'blood_sugar': blood_sugar,
        'smoking': smoking, 'exercise_hours': exercise_hours,
        'family_history': family_history, 'alcohol': alcohol,
        'sleep_hours': sleep_hours, 'risk_label': risk_label
    })

    if save:
        df.to_csv('health_data.csv', index=False)
        print("✅ Dataset saved")
        print(df['risk_label'].value_counts())

    return df