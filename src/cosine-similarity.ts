export function cosineSimilarity(a: number[], b: number[]) {
  return dotProduct(a, b) / (magnitude(a) * magnitude(b));
}

function dotProduct(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i]! * b[i]!;
  }
  return sum;
}

function magnitude(vec: number[]) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i]! * vec[i]!;
  }
  return Math.sqrt(sum);
}
