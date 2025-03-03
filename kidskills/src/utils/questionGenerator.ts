// Utility functions to generate random math questions

export type QuestionType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface GeneratedQuestion {
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  type: QuestionType;
}

// Generate a random integer between min and max (inclusive)
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random addition question
const generateAdditionQuestion = (): GeneratedQuestion => {
  // Create different types of addition questions with varying difficulty
  const questionTypes = [
    // Basic single-digit addition
    () => {
      const num1 = getRandomInt(1, 9);
      const num2 = getRandomInt(1, 9);
      return { num1, num2, question: `What is ${num1} + ${num2}?` };
    },
    // Double-digit addition
    () => {
      const num1 = getRandomInt(10, 30);
      const num2 = getRandomInt(10, 30);
      return { num1, num2, question: `What is ${num1} + ${num2}?` };
    },
    // Adding three numbers
    () => {
      const num1 = getRandomInt(1, 9);
      const num2 = getRandomInt(1, 9);
      const num3 = getRandomInt(1, 9);
      return { 
        num1, 
        num2, 
        num3, 
        question: `What is ${num1} + ${num2} + ${num3}?`,
        answer: num1 + num2 + num3,
        explanation: `When we add ${num1}, ${num2}, and ${num3}, we get ${num1 + num2 + num3}.`
      };
    },
    // Word problem
    () => {
      const num1 = getRandomInt(3, 12);
      const num2 = getRandomInt(3, 12);
      const items = ['apples', 'books', 'toys', 'stickers', 'pencils', 'cookies', 'marbles'][getRandomInt(0, 6)];
      return { 
        num1, 
        num2, 
        question: `Sam has ${num1} ${items} and gets ${num2} more. How many ${items} does Sam have now?`,
        answer: num1 + num2,
        explanation: `Sam started with ${num1} ${items} and got ${num2} more. ${num1} + ${num2} = ${num1 + num2}.`
      };
    }
  ];
  
  // Randomly select a question type
  const selectedType = questionTypes[getRandomInt(0, questionTypes.length - 1)];
  const questionData = selectedType();
  
  // Calculate the answer if not already provided
  const answer = questionData.answer || 
    (questionData.num3 ? questionData.num1 + questionData.num2 + questionData.num3 : questionData.num1 + questionData.num2);
  
  // Generate explanation if not already provided
  const explanation = questionData.explanation || 
    `When we add ${questionData.num1} and ${questionData.num2}${questionData.num3 ? ` and ${questionData.num3}` : ''}, we get ${answer}.`;
  
  // Generate 3 wrong answers that are close to the correct answer
  const wrongAnswers = new Set<number>();
  while (wrongAnswers.size < 3) {
    const offset = getRandomInt(-5, 5);
    const wrongAnswer = answer + offset;
    if (wrongAnswer !== answer && wrongAnswer > 0) {
      wrongAnswers.add(wrongAnswer);
    }
  }
  
  const options = [
    { id: 'a', text: answer.toString(), isCorrect: true },
    ...Array.from(wrongAnswers).map((val, index) => ({
      id: String.fromCharCode(98 + index), // b, c, d
      text: val.toString(),
      isCorrect: false,
    })),
  ];
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  return {
    question: questionData.question,
    options,
    explanation,
    type: 'addition',
  };
};

// Generate a random subtraction question
const generateSubtractionQuestion = (): GeneratedQuestion => {
  // Ensure the answer is positive
  const num1 = getRandomInt(5, 20);
  const num2 = getRandomInt(1, num1);
  const answer = num1 - num2;
  
  // Generate 3 wrong answers that are close to the correct answer
  const wrongAnswers = new Set<number>();
  while (wrongAnswers.size < 3) {
    const offset = getRandomInt(-5, 5);
    const wrongAnswer = answer + offset;
    if (wrongAnswer !== answer && wrongAnswer >= 0) {
      wrongAnswers.add(wrongAnswer);
    }
  }
  
  const options = [
    { id: 'a', text: answer.toString(), isCorrect: true },
    ...Array.from(wrongAnswers).map((val, index) => ({
      id: String.fromCharCode(98 + index), // b, c, d
      text: val.toString(),
      isCorrect: false,
    })),
  ];
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  return {
    question: `What is ${num1} - ${num2}?`,
    options,
    explanation: `When we subtract ${num2} from ${num1}, we get ${answer}.`,
    type: 'subtraction',
  };
};

// Generate a random multiplication question
const generateMultiplicationQuestion = (): GeneratedQuestion => {
  const num1 = getRandomInt(1, 10);
  const num2 = getRandomInt(1, 10);
  const answer = num1 * num2;
  
  // Generate 3 wrong answers that are close to the correct answer
  const wrongAnswers = new Set<number>();
  while (wrongAnswers.size < 3) {
    const offset = getRandomInt(-5, 5);
    const wrongAnswer = answer + offset;
    if (wrongAnswer !== answer && wrongAnswer > 0) {
      wrongAnswers.add(wrongAnswer);
    }
  }
  
  const options = [
    { id: 'a', text: answer.toString(), isCorrect: true },
    ...Array.from(wrongAnswers).map((val, index) => ({
      id: String.fromCharCode(98 + index), // b, c, d
      text: val.toString(),
      isCorrect: false,
    })),
  ];
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  return {
    question: `What is ${num1} × ${num2}?`,
    options,
    explanation: `When we multiply ${num1} and ${num2}, we get ${answer}.`,
    type: 'multiplication',
  };
};

// Generate a random question based on the activity type
export const generateRandomQuestion = (type: QuestionType): GeneratedQuestion => {
  switch (type) {
    case 'addition':
      return generateAdditionQuestion();
    case 'subtraction':
      return generateSubtractionQuestion();
    case 'multiplication':
      return generateMultiplicationQuestion();
    case 'division':
      // For simplicity, we'll just use multiplication for now
      return generateMultiplicationQuestion();
    default:
      return generateAdditionQuestion();
  }
};

// Map activity IDs to question types
export const getQuestionTypeFromActivityId = (activityId: string): QuestionType => {
  if (activityId.includes('math-1')) return 'addition';
  if (activityId.includes('math-2')) return 'subtraction';
  if (activityId.includes('math-3')) return 'multiplication';
  if (activityId.includes('math-4')) return 'division';
  return 'addition'; // Default
}; 