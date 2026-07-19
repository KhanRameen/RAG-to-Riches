interface naiveReranksInterface {
  question: string;
  chunks: string;
}
export function naiveRerank({ question, chunks }: naiveReranksInterface) {}
