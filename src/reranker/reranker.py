from sentence_transformers import CrossEncoder

model = CrossEncoder(
    "cross-encoder/ms-marco-MiniLM-L-6-v2"
)

question = "How long do refunds take?"

chunks = [
    "Refund requests are reviewed manually.",
    "Refunds take 5-7 business days.",
    "Employees receive annual leave."
]

pairs = [
    [question, chunk]
    for chunk in chunks
]

scores = model.predict(pairs)

for chunk, score in zip(chunks, scores):
    print(score, chunk)