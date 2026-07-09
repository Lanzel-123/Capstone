import os
import joblib
import numpy as np


from sklearn.linear_model import LogisticRegression


MODEL_PATH = os.path.join(os.path.dirname(__file__), "tamper_model.joblib")


def _make_synthetic_training_data():
    """Fallback training set.

    NOTE: This is placeholder data to bootstrap Chapter 1 functionality.
    Replace with real labeled examples later.
    """
    # Feature order must match extract_features() in forensicdoc.py integration.
    # [incremental_updates, js_detected, internal_modified_before_created, tracked_changes, sha_changed_flag]
    X = []
    y = []

    def add(sample, label):
        X.append(sample)
        y.append(label)

    # Mostly benign
    add([0, 0, 0, 0, 0], 0)
    add([0, 0, 0, 0, 0], 0)
    add([1, 0, 0, 0, 0], 0)  # single EOF can happen naturally

    # Metadata/timestomping-like
    add([0, 0, 1, 0, 0], 1)
    add([0, 0, 1, 0, 0], 1)

    # Incremental updates / revision history
    add([2, 0, 0, 0, 0], 1)
    add([3, 0, 0, 0, 0], 1)

    # JS injection
    add([0, 1, 0, 0, 0], 1)
    add([0, 1, 0, 0, 0], 1)

    # Tracked changes
    add([0, 0, 0, 1, 0], 1)
    add([0, 0, 0, 1, 0], 1)

    # Multi-signal
    add([2, 1, 1, 1, 0], 1)
    add([3, 1, 0, 1, 0], 1)

    return np.array(X, dtype=float), np.array(y, dtype=int)


def train_and_save_model(model_path: str = MODEL_PATH):
    X, y = _make_synthetic_training_data()

    clf = LogisticRegression(max_iter=1000)
    clf.fit(X, y)

    # Ensure target directory exists
    model_dir = os.path.dirname(model_path)
    if model_dir:
        os.makedirs(model_dir, exist_ok=True)

    # Ensure target file path directory exists (Windows safe)
    model_dir = os.path.dirname(os.path.abspath(model_path))
    if model_dir and not os.path.exists(model_dir):
        os.makedirs(model_dir, exist_ok=True)

    # Persist model
    model_path = os.path.abspath(model_path)
    model_dir = os.path.dirname(model_path)

    # Create parent directory explicitly (and fail fast if it still cannot be created)
    if model_dir:
        os.makedirs(model_dir, exist_ok=True)
        if not os.path.isdir(model_dir):
            raise FileNotFoundError(f"Model directory does not exist: {model_dir}")

    # Use joblib directly to avoid file-handle/path quirks
    joblib.dump(clf, model_path)
    return clf








def load_model(model_path: str = MODEL_PATH):
    if not os.path.exists(model_path):
        return train_and_save_model(model_path=model_path)
    return joblib.load(model_path)


def predict_risk(features: np.ndarray):
    """features shape: (n_features,)"""
    clf = load_model()
    proba = clf.predict_proba(features.reshape(1, -1))[0]
    # proba[1] => tampered
    return float(proba[1])
