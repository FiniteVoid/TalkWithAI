export const splitIntoSentences = (text: string): string[] => {
  return text?.match(/[^.!?]+[.!?]+/g) || [];
};
