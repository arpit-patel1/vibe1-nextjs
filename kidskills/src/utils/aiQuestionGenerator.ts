// AI-powered question generator utility
import { AIQuestionParams, AIGeneratedQuestion } from '@/types/ai';

/**
 * Utility to generate questions using AI based on provided parameters
 * This simulates an API call to generate questions for different subjects
 * It can be used as a fallback when the OpenRouter API is not available
 */

export async function generateAIQuestion(params: AIQuestionParams): Promise<AIGeneratedQuestion> {
  console.log('Generating AI question with params:', params);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate question based on subject and question type
  if (params.subject.toLowerCase() === 'math' && params.questionType === 'addition') {
    return generateAIAdditionQuestion(params);
  }
  
  // Generate question based on subject
  switch (params.subject.toLowerCase()) {
    case 'math':
      return generateMathQuestion(params);
    case 'english':
      return generateEnglishQuestion(params);
    case 'leadership':
      return generateLeadershipQuestion(params);
    default:
      return generateMathQuestion(params); // Default to math
  }
}

/**
 * Generate an AI-powered addition question with appropriate difficulty and personalization
 */
function generateAIAdditionQuestion(params: AIQuestionParams): AIGeneratedQuestion {
  const { difficulty, previousPerformance, interests, gradeLevel } = params;
  
  // Determine grade level (default to 3 if not provided)
  const grade = gradeLevel || 3;
  
  // Adjust difficulty based on previous performance
  let adjustedDifficulty = difficulty;
  if (previousPerformance) {
    const performanceNum = typeof previousPerformance === 'string' 
      ? parseInt(previousPerformance, 10) 
      : previousPerformance;
    
    if (performanceNum > 80 && difficulty === 'easy') {
      adjustedDifficulty = 'medium';
    } else if (performanceNum < 50 && difficulty === 'medium') {
      adjustedDifficulty = 'easy';
    }
  }
  
  // Generate question based on difficulty and grade level
  let question = '';
  let correctAnswer = 0;
  let explanation = '';
  let hint = '';
  
  // Get user interests or default to general topics
  const userInterests = interests || ['animals', 'toys', 'food', 'sports'];
  
  // Select a random interest for personalization
  const randomInterest = userInterests[Math.floor(Math.random() * userInterests.length)];
  
  // Question types
  const questionTypes = [
    'basic', // Basic addition
    'word-problem', // Word problem
    'multi-number', // Adding multiple numbers
    'missing-number', // Find the missing number
    'visual' // Visual addition (described in text)
  ];
  
  // Select question type with weighted probability based on difficulty
  let selectedType = '';
  if (adjustedDifficulty === 'easy') {
    // For easy, favor basic and visual questions
    const easyTypes = ['basic', 'basic', 'visual', 'word-problem'];
    selectedType = easyTypes[Math.floor(Math.random() * easyTypes.length)];
  } else if (adjustedDifficulty === 'medium') {
    // For medium, favor word problems and multi-number
    const mediumTypes = ['word-problem', 'multi-number', 'missing-number', 'basic'];
    selectedType = mediumTypes[Math.floor(Math.random() * mediumTypes.length)];
  } else {
    // For hard, favor complex types
    const hardTypes = ['word-problem', 'multi-number', 'missing-number', 'missing-number'];
    selectedType = hardTypes[Math.floor(Math.random() * hardTypes.length)];
  }
  
  // Number ranges based on grade level and difficulty
  let minNum1 = 1, maxNum1 = 10;
  let minNum2 = 1, maxNum2 = 10;
  
  if (grade >= 2) {
    if (adjustedDifficulty === 'easy') {
      maxNum1 = 20;
      maxNum2 = 10;
    } else if (adjustedDifficulty === 'medium') {
      minNum1 = 10;
      maxNum1 = 50;
      minNum2 = 10;
      maxNum2 = 30;
    } else {
      minNum1 = 20;
      maxNum1 = 100;
      minNum2 = 20;
      maxNum2 = 50;
    }
  }
  
  // Generate random numbers within the appropriate range
  const num1 = Math.floor(Math.random() * (maxNum1 - minNum1 + 1)) + minNum1;
  const num2 = Math.floor(Math.random() * (maxNum2 - minNum2 + 1)) + minNum2;
  const num3 = Math.floor(Math.random() * 10) + 1; // For multi-number questions
  
  // Generate the question based on the selected type
  switch (selectedType) {
    case 'basic':
      question = `What is ${num1} + ${num2}?`;
      correctAnswer = num1 + num2;
      explanation = `To add ${num1} and ${num2}, you can count up from ${num1} by adding ${num2} more, which gives you ${correctAnswer}.`;
      hint = `Try counting up from ${num1} by adding one at a time, ${num2} times.`;
      break;
      
    case 'word-problem':
      // Items related to the user's interest
      const interestItems: Record<string, string[]> = {
        'animals': ['dogs', 'cats', 'birds', 'fish', 'rabbits'],
        'toys': ['blocks', 'cars', 'dolls', 'action figures', 'stuffed animals'],
        'food': ['apples', 'cookies', 'candies', 'sandwiches', 'pizzas'],
        'sports': ['balls', 'bats', 'goals', 'points', 'players'],
        'music': ['songs', 'instruments', 'notes', 'beats', 'melodies'],
        'books': ['books', 'pages', 'stories', 'chapters', 'characters'],
        'art': ['crayons', 'markers', 'paintings', 'drawings', 'colors']
      };
      
      // Default to toys if interest not found
      const items = interestItems[randomInterest] || interestItems['toys'];
      const item = items[Math.floor(Math.random() * items.length)];
      
      // Character names
      const names = ['Sam', 'Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan'];
      const name = names[Math.floor(Math.random() * names.length)];
      
      question = `${name} has ${num1} ${item} and gets ${num2} more. How many ${item} does ${name} have now?`;
      correctAnswer = num1 + num2;
      explanation = `${name} started with ${num1} ${item} and got ${num2} more. To find the total, we add: ${num1} + ${num2} = ${correctAnswer}.`;
      hint = `Add the number ${name} started with to the number ${name} got.`;
      break;
      
    case 'multi-number':
      question = `What is ${num1} + ${num2} + ${num3}?`;
      correctAnswer = num1 + num2 + num3;
      explanation = `To add multiple numbers, you can add them in any order. First, add ${num1} + ${num2} = ${num1 + num2}, then add ${num3} to get ${correctAnswer}.`;
      hint = `Try adding the first two numbers, then add the third number to that sum.`;
      break;
      
    case 'missing-number':
      correctAnswer = num2;
      question = `What number plus ${num1} equals ${num1 + num2}?`;
      explanation = `We need to find what number plus ${num1} equals ${num1 + num2}. The answer is ${num2} because ${num1} + ${num2} = ${num1 + num2}.`;
      hint = `Think about what number you need to add to ${num1} to get ${num1 + num2}.`;
      break;
      
    case 'visual':
      const visualItems = ['stars', 'circles', 'squares', 'triangles', 'hearts'];
      const visualItem = visualItems[Math.floor(Math.random() * visualItems.length)];
      
      question = `Imagine ${num1} ${visualItem} on the left side and ${num2} ${visualItem} on the right side. How many ${visualItem} are there in total?`;
      correctAnswer = num1 + num2;
      explanation = `To find the total number of ${visualItem}, add the number on the left (${num1}) to the number on the right (${num2}): ${num1} + ${num2} = ${correctAnswer}.`;
      hint = `Picture the ${visualItem} in your mind and count them all together.`;
      break;
  }
  
  // Generate options for multiple choice
  const options = generateOptions(correctAnswer);
  
  return {
    question,
    options,
    correctAnswer: correctAnswer.toString(),
    explanation,
    hint,
    tags: ['math', 'addition', selectedType, randomInterest]
  };
}

/**
 * Generate a math question with appropriate difficulty
 */
function generateMathQuestion(params: AIQuestionParams): AIGeneratedQuestion {
  const { difficulty, previousPerformance, interests } = params;
  
  // Adjust difficulty based on previous performance
  let adjustedDifficulty = difficulty;
  if (previousPerformance) {
    const performanceNum = typeof previousPerformance === 'string' 
      ? parseInt(previousPerformance, 10) 
      : previousPerformance;
    
    if (performanceNum > 80 && difficulty === 'easy') {
      adjustedDifficulty = 'medium';
    } else if (performanceNum < 50 && difficulty === 'medium') {
      adjustedDifficulty = 'easy';
    }
  }
  
  // Generate question based on difficulty
  let question = '';
  let correctAnswer = 0;
  let explanation = '';
  let hint = '';
  
  if (adjustedDifficulty === 'easy') {
    // Simple addition or subtraction
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const isAddition = Math.random() > 0.5;
    
    if (isAddition) {
      question = `What is ${num1} + ${num2}?`;
      correctAnswer = num1 + num2;
      explanation = `To add ${num1} and ${num2}, you count ${num2} more after ${num1}, which gives you ${correctAnswer}.`;
      hint = `Try counting up from ${num1} by adding one at a time, ${num2} times.`;
    } else {
      // Ensure subtraction result is positive
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      question = `What is ${larger} - ${smaller}?`;
      correctAnswer = larger - smaller;
      explanation = `To subtract ${smaller} from ${larger}, you count ${smaller} less from ${larger}, which gives you ${correctAnswer}.`;
      hint = `Try counting down from ${larger} by subtracting one at a time, ${smaller} times.`;
    }
  } else if (adjustedDifficulty === 'medium') {
    // Multiplication or division
    const num1 = Math.floor(Math.random() * 10) + 2;
    const num2 = Math.floor(Math.random() * 10) + 2;
    const isMultiplication = Math.random() > 0.5;
    
    if (isMultiplication) {
      question = `What is ${num1} × ${num2}?`;
      correctAnswer = num1 * num2;
      explanation = `To multiply ${num1} by ${num2}, you can add ${num1} to itself ${num2} times, or vice versa. ${num1} × ${num2} = ${correctAnswer}.`;
      hint = `Think of it as ${num2} groups of ${num1}.`;
    } else {
      // Ensure division results in a whole number
      const product = num1 * num2;
      question = `What is ${product} ÷ ${num1}?`;
      correctAnswer = num2;
      explanation = `To divide ${product} by ${num1}, you find how many groups of ${num1} make ${product}. The answer is ${correctAnswer}.`;
      hint = `Think of how many times ${num1} goes into ${product}.`;
    }
  } else {
    // Hard: word problems or multi-step
    const num1 = Math.floor(Math.random() * 15) + 5;
    const num2 = Math.floor(Math.random() * 10) + 5;
    const num3 = Math.floor(Math.random() * 5) + 2;
    
    question = `If you have ${num1} apples and buy ${num2} more, then give ${num3} to your friend, how many apples do you have left?`;
    correctAnswer = num1 + num2 - num3;
    explanation = `First, add the apples you had (${num1}) to the ones you bought (${num2}), which gives you ${num1 + num2}. Then, subtract the ${num3} apples you gave away, leaving you with ${correctAnswer} apples.`;
    hint = `Break this into steps: first add, then subtract.`;
  }
  
  // Personalize the question with interests if available
  question = personalizeQuestionWithInterests(question, interests);
  
  // Generate options for multiple choice
  const options = generateOptions(correctAnswer);
  
  return {
    question,
    options,
    correctAnswer: correctAnswer.toString(),
    explanation,
    hint
  };
}

/**
 * Generate an English question with appropriate difficulty
 */
export function generateEnglishQuestion(params: AIQuestionParams): AIGeneratedQuestion {
  const { difficulty, gradeLevel, questionType, interests, additionalParams } = params;
  
  // Extract additional parameters
  const grammarType = additionalParams?.grammarType || 'general';
  const keepSentencesShort = additionalParams?.keepSentencesShort || false;
  const readingTopic = additionalParams?.readingTopic || 'general';
  
  // Handle different question types
  if (questionType === 'grammar') {
    return generateGrammarQuestion(params);
  } else if (questionType === 'vocabulary') {
    // Generate vocabulary question
    return generateVocabularyQuestion(params);
  } else if (questionType === 'reading') {
    return generateReadingComprehensionQuestion(params);
  } else if (questionType === 'creative-writing') {
    // Generate creative writing prompt
    // ... existing code ...
  }
  
  // Default fallback
  // ... existing code ...
}

/**
 * Generate a reading comprehension question with a passage and questions
 */
function generateReadingComprehensionQuestion(params: AIQuestionParams): AIGeneratedQuestion {
  const { difficulty, gradeLevel, interests, additionalParams } = params;
  
  // Extract reading topic from additional params
  const readingTopic = additionalParams?.readingTopic || 'general';
  
  // Sample reading passages with questions for different topics
  const readingPassages = {
    animals: [
      {
        passage: `Elephants are the largest land animals on Earth. They have long trunks that they use like hands. With their trunks, elephants can pick up food, spray water, and even greet other elephants. Elephants live in herds led by the oldest female, called the matriarch. They have excellent memories and can remember routes to water sources from many years ago. Baby elephants are called calves and can weigh around 200 pounds at birth!`,
        questions: [
          {
            question: "What do elephants use their trunks for?",
            options: [
              { id: "a", text: "To fly", isCorrect: false },
              { id: "b", text: "To pick up food and spray water", isCorrect: true },
              { id: "c", text: "To dig underground tunnels", isCorrect: false },
              { id: "d", text: "To make loud noises", isCorrect: false }
            ],
            explanation: "The passage states that elephants use their trunks like hands to pick up food, spray water, and greet other elephants.",
            hint: "Look at the second sentence of the passage."
          },
          {
            question: "Who leads an elephant herd?",
            options: [
              { id: "a", text: "The largest male", isCorrect: false },
              { id: "b", text: "The youngest female", isCorrect: false },
              { id: "c", text: "The oldest female", isCorrect: true },
              { id: "d", text: "The fastest runner", isCorrect: false }
            ],
            explanation: "According to the passage, elephant herds are led by the oldest female, called the matriarch.",
            hint: "The leader has a special name mentioned in the passage."
          }
        ]
      }
    ],
    space: [
      {
        passage: `Our solar system has eight planets that orbit around the Sun. The four inner planets are Mercury, Venus, Earth, and Mars. They are called rocky planets because they have solid surfaces. The four outer planets are Jupiter, Saturn, Uranus, and Neptune. These are called gas giants because they are made mostly of gas. Earth is the only planet we know that has life. It has water, air, and the right temperature for plants and animals to live. Scientists are always looking for other planets that might have life too.`,
        questions: [
          {
            question: "Why are the four outer planets called gas giants?",
            options: [
              { id: "a", text: "Because they are very hot", isCorrect: false },
              { id: "b", text: "Because they have rings", isCorrect: false },
              { id: "c", text: "Because they are made mostly of gas", isCorrect: true },
              { id: "d", text: "Because they are far from Earth", isCorrect: false }
            ],
            explanation: "The passage explains that Jupiter, Saturn, Uranus, and Neptune are called gas giants because they are made mostly of gas.",
            hint: "Look at the description of the outer planets in the passage."
          },
          {
            question: "Which planet is known to have life?",
            options: [
              { id: "a", text: "Mars", isCorrect: false },
              { id: "b", text: "Venus", isCorrect: false },
              { id: "c", text: "Jupiter", isCorrect: false },
              { id: "d", text: "Earth", isCorrect: true }
            ],
            explanation: "According to the passage, Earth is the only planet we know that has life because it has water, air, and the right temperature.",
            hint: "The passage mentions which planet has the right conditions for life."
          }
        ]
      }
    ],
    adventure: [
      {
        passage: `Maya was exploring the old forest behind her grandparents' house. She had heard stories about a hidden treasure somewhere deep in the woods. With her backpack full of supplies, she followed a narrow path that twisted between tall trees. Suddenly, she spotted something shiny near a large rock. It was an old key with strange markings! Maya wondered what the key might open. Could it be a treasure chest? Or maybe a secret door? As the sun began to set, Maya decided to return home, but she would come back tomorrow to continue her adventure.`,
        questions: [
          {
            question: "What did Maya find near the large rock?",
            options: [
              { id: "a", text: "A map", isCorrect: false },
              { id: "b", text: "An old key", isCorrect: true },
              { id: "c", text: "A treasure chest", isCorrect: false },
              { id: "d", text: "A secret door", isCorrect: false }
            ],
            explanation: "The passage states that Maya spotted something shiny near a large rock, which turned out to be an old key with strange markings.",
            hint: "Look for what Maya discovered that was shiny."
          },
          {
            question: "Why did Maya decide to go home?",
            options: [
              { id: "a", text: "She was scared", isCorrect: false },
              { id: "b", text: "She found the treasure", isCorrect: false },
              { id: "c", text: "It started to rain", isCorrect: false },
              { id: "d", text: "The sun was setting", isCorrect: true }
            ],
            explanation: "According to the passage, Maya decided to return home as the sun began to set, but planned to continue her adventure the next day.",
            hint: "The passage mentions a change in the time of day."
          }
        ]
      }
    ],
    general: [
      {
        passage: `Libraries are amazing places where you can find books on almost any topic. They have fiction books with exciting stories and non-fiction books full of facts and information. Many libraries also have computers, movies, and music that people can borrow. Librarians help visitors find what they're looking for and recommend new books to read. Libraries often have special programs for children, like story time and summer reading clubs. Best of all, most libraries are free to use with a library card!`,
        questions: [
          {
            question: "What do librarians do according to the passage?",
            options: [
              { id: "a", text: "Write books", isCorrect: false },
              { id: "b", text: "Clean the library", isCorrect: false },
              { id: "c", text: "Help visitors find books and make recommendations", isCorrect: true },
              { id: "d", text: "Fix computers", isCorrect: false }
            ],
            explanation: "The passage states that librarians help visitors find what they're looking for and recommend new books to read.",
            hint: "Look at the sentence that mentions librarians specifically."
          },
          {
            question: "What does the passage say about the cost of using libraries?",
            options: [
              { id: "a", text: "They are expensive", isCorrect: false },
              { id: "b", text: "They are free with a library card", isCorrect: true },
              { id: "c", text: "They cost money only for children", isCorrect: false },
              { id: "d", text: "The passage doesn't mention cost", isCorrect: false }
            ],
            explanation: "According to the passage, most libraries are free to use with a library card.",
            hint: "Check the last sentence of the passage."
          }
        ]
      }
    ]
  };
  
  // Select a passage based on the topic or randomly if not available
  let selectedTopic = readingTopic;
  if (!readingPassages[selectedTopic]) {
    // If the specified topic doesn't exist, choose a random one
    const availableTopics = Object.keys(readingPassages);
    selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
  }
  
  // Get passages for the selected topic
  const topicPassages = readingPassages[selectedTopic];
  
  // Select a random passage from the topic
  const selectedPassageIndex = Math.floor(Math.random() * topicPassages.length);
  const selectedPassage = topicPassages[selectedPassageIndex];
  
  // Select a random question from the passage
  const selectedQuestionIndex = Math.floor(Math.random() * selectedPassage.questions.length);
  const selectedQuestion = selectedPassage.questions[selectedQuestionIndex];
  
  // Personalize the passage if it's an adventure and we have interests
  let personalizedPassage = selectedPassage.passage;
  if (selectedTopic === 'adventure' && interests && interests.length > 0) {
    // Incorporate one of the user's interests into the adventure passage
    const randomInterest = interests[Math.floor(Math.random() * interests.length)];
    personalizedPassage = personalizedPassage.replace(
      'something shiny', 
      `something related to ${randomInterest}`
    );
  }
  
  return {
    question: selectedQuestion.question,
    options: selectedQuestion.options,
    explanation: selectedQuestion.explanation,
    hint: selectedQuestion.hint,
    readingPassage: personalizedPassage,
    tags: [selectedTopic, 'reading', 'comprehension']
  };
}

/**
 * Generate an alternative incorrect sentence for grammar questions
 */
function generateAlternativeIncorrect(sentence: string, type: string, useCorrectBase: boolean = false): string {
  // Create a different error based on the grammar type
  switch (type) {
    case 'punctuation':
      if (useCorrectBase) {
        // Remove or change punctuation
        return sentence.replace(/[.,?!;:]/, '');
      } else {
        // Add wrong punctuation
        return sentence.replace(/\.$/, '!');
      }
    
    case 'verb-tense':
      if (sentence.includes('went')) {
        return sentence.replace('went', 'goed');
      } else if (sentence.includes('saw')) {
        return sentence.replace('saw', 'seed');
      } else if (sentence.includes('ate')) {
        return sentence.replace('ate', 'eated');
      } else {
        // Default case - try to change a verb
        return sentence.replace(/ed\b/, 'ing');
      }
    
    case 'subject-verb-agreement':
      if (sentence.includes('dogs bark')) {
        return sentence.replace('dogs bark', 'dogs barks');
      } else if (sentence.includes('she walks')) {
        return sentence.replace('she walks', 'she walk');
      } else {
        // Try to flip the agreement
        return sentence.includes('s ') 
          ? sentence.replace(/(\w+)s /, '$1 ')
          : sentence.replace(/(\w+) /, '$1s ');
      }
    
    case 'pronouns':
      if (sentence.includes('I')) {
        return sentence.replace(/\bI\b/, 'me');
      } else if (sentence.includes('her')) {
        return sentence.replace(/\bher\b/, 'she');
      } else {
        // Swap a common pronoun
        return sentence.includes('they') 
          ? sentence.replace(/\bthey\b/, 'them')
          : sentence.replace(/\bwe\b/, 'us');
      }
    
    default:
      // For other types, just change a word
      const words = sentence.split(' ');
      if (words.length > 2) {
        const randomIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
        words[randomIndex] = words[randomIndex].toUpperCase();
        return words.join(' ');
      }
      return sentence + ' VERY MUCH';
  }
}

/**
 * Generate a leadership question with appropriate difficulty
 */
function generateLeadershipQuestion(params: AIQuestionParams): AIGeneratedQuestion {
  const { difficulty, interests } = params;
  
  // Leadership scenarios
  const scenarios = [
    {
      scenario: 'Your friend is being left out of a game at recess. What would be the best thing to do?',
      options: [
        { id: 'A', text: 'Ignore it because it\'s not your problem.', isCorrect: false },
        { id: 'B', text: 'Tell the teacher immediately without trying to help.', isCorrect: false },
        { id: 'C', text: 'Invite your friend to join your own game or activity.', isCorrect: true },
        { id: 'D', text: 'Tell the other kids they are being mean.', isCorrect: false }
      ],
      explanation: 'Being a good leader means including others and making them feel welcome. Inviting your friend to join your activity shows kindness and leadership.',
      hint: 'Think about what would make your friend feel included and valued.'
    },
    {
      scenario: 'You see someone in your class struggling with a math problem that you know how to solve. What should you do?',
      options: [
        { id: 'A', text: 'Tell them they should study more.', isCorrect: false },
        { id: 'B', text: 'Offer to explain how to solve the problem.', isCorrect: true },
        { id: 'C', text: 'Solve it for them without explaining.', isCorrect: false },
        { id: 'D', text: 'Ignore it because they need to learn on their own.', isCorrect: false }
      ],
      explanation: 'Good leaders help others learn and grow. By offering to explain the solution, you\'re helping your classmate understand and develop their own skills.',
      hint: 'What would help them both now and in the future?'
    },
    {
      scenario: 'Your team is working on a project, but two members keep arguing about how to do it. What would a good leader do?',
      options: [
        { id: 'A', text: 'Pick the idea you like best and tell everyone to do it that way.', isCorrect: false },
        { id: 'B', text: 'Let them argue until someone gives up.', isCorrect: false },
        { id: 'C', text: 'Suggest combining ideas from both sides to create a better solution.', isCorrect: true },
        { id: 'D', text: 'Tell the teacher that your team can\'t work together.', isCorrect: false }
      ],
      explanation: 'Good leaders look for compromise and try to include everyone\'s ideas. Finding a way to combine different perspectives often leads to better solutions.',
      hint: 'Is there a way to make both people feel their ideas are valued?'
    }
  ];
  
  // Select a random scenario
  const randomIndex = Math.floor(Math.random() * scenarios.length);
  const selectedScenario = scenarios[randomIndex];
  
  // Personalize the scenario if interests are available
  let question = selectedScenario.scenario;
  if (interests && interests.length > 0) {
    // Modify the scenario to include an interest
    const interest = interests[Math.floor(Math.random() * interests.length)];
    if (question.includes('recess')) {
      question = question.replace('a game at recess', `a ${interest} activity at recess`);
    } else if (question.includes('project')) {
      question = question.replace('a project', `a ${interest} project`);
    }
  }
  
  return {
    question,
    options: selectedScenario.options,
    correctAnswer: selectedScenario.options.find(opt => opt.isCorrect)?.text || '',
    explanation: selectedScenario.explanation,
    hint: selectedScenario.hint
  };
}

/**
 * Generate multiple choice options for a math question
 */
function generateOptions(correctAnswer: number): Array<{ id: string; text: string; isCorrect: boolean }> {
  const options: Array<{ id: string; text: string; isCorrect: boolean }> = [];
  
  // Add the correct answer
  options.push({
    id: 'A',
    text: correctAnswer.toString(),
    isCorrect: true
  });
  
  // Generate wrong answers that are close to the correct answer
  const wrongAnswers = new Set<number>();
  
  // Off by one
  wrongAnswers.add(correctAnswer + 1);
  wrongAnswers.add(correctAnswer - 1);
  
  // Off by a small amount
  wrongAnswers.add(correctAnswer + Math.floor(Math.random() * 3) + 2);
  wrongAnswers.add(correctAnswer - Math.floor(Math.random() * 3) - 2);
  
  // Common mistake: reversed digits if number is > 9
  if (correctAnswer > 9) {
    const digits = correctAnswer.toString().split('');
    const reversed = parseInt(digits.reverse().join(''), 10);
    if (reversed !== correctAnswer) {
      wrongAnswers.add(reversed);
    }
  }
  
  // Convert to array and shuffle
  const wrongAnswersArray = Array.from(wrongAnswers);
  const shuffledWrongs = wrongAnswersArray.sort(() => Math.random() - 0.5);
  
  // Take 3 wrong answers
  for (let i = 0; i < 3 && i < shuffledWrongs.length; i++) {
    options.push({
      id: String.fromCharCode(66 + i), // B, C, D
      text: shuffledWrongs[i].toString(),
      isCorrect: false
    });
  }
  
  // If we don't have enough wrong answers, add some more
  while (options.length < 4) {
    const randomWrong = correctAnswer + Math.floor(Math.random() * 10) - 5;
    if (randomWrong !== correctAnswer && !wrongAnswers.has(randomWrong)) {
      options.push({
        id: String.fromCharCode(65 + options.length), // Next available letter
        text: randomWrong.toString(),
        isCorrect: false
      });
    }
  }
  
  // Shuffle the options
  return options.sort(() => Math.random() - 0.5);
}

/**
 * Personalize a question with the user's interests
 */
function personalizeQuestionWithInterests(question: string, interests?: string[]): string {
  if (!interests || interests.length === 0) {
    return question;
  }
  
  const interest = interests[Math.floor(Math.random() * interests.length)];
  
  // Replace generic objects with interest-related ones
  if (question.includes('apples')) {
    if (interest === 'sports') {
      return question.replace(/apples/g, 'basketballs');
    } else if (interest === 'animals') {
      return question.replace(/apples/g, 'pet toys');
    } else if (interest === 'space') {
      return question.replace(/apples/g, 'toy rockets');
    } else if (interest === 'food') {
      return question.replace(/apples/g, 'cookies');
    }
  }
  
  return question;
}

// Function to generate grammar questions
function generateGrammarQuestion(params: AIQuestionParams): AIGeneratedQuestion {
  const { difficulty, gradeLevel, interests, additionalParams } = params;
  
  // Extract grammar type and sentence length preference
  const grammarType = additionalParams?.grammarType || 'general';
  const keepSentencesShort = additionalParams?.keepSentencesShort || false;
  
  // Define different types of grammar questions
  const grammarQuestions = {
    punctuation: [
      {
        question: "Which sentence uses punctuation correctly?",
        options: [
          { id: "a", text: "We went to the park we had a picnic.", isCorrect: false },
          { id: "b", text: "We went to the park, we had a picnic.", isCorrect: false },
          { id: "c", text: "We went to the park; we had a picnic.", isCorrect: true },
          { id: "d", text: "We went to the park we had a picnic", isCorrect: false }
        ],
        explanation: "Option C correctly uses a semicolon to join two related independent clauses.",
        hint: "Look for the option that correctly separates two complete thoughts."
      },
      // ... more punctuation questions
    ],
    "verb-tense": [
      {
        question: "Which sentence uses the correct verb tense?",
        options: [
          { id: "a", text: "Yesterday, I am going to the store.", isCorrect: false },
          { id: "b", text: "Yesterday, I went to the store.", isCorrect: true },
          { id: "c", text: "Yesterday, I will go to the store.", isCorrect: false },
          { id: "d", text: "Yesterday, I go to the store.", isCorrect: false }
        ],
        explanation: "Option B correctly uses the past tense 'went' to describe an action that happened in the past (yesterday).",
        hint: "The word 'yesterday' tells you what tense to use."
      },
      // ... more verb tense questions
    ],
    "subject-verb-agreement": [
      {
        question: "Which sentence shows correct subject-verb agreement?",
        options: [
          { id: "a", text: "The team are playing well.", isCorrect: false },
          { id: "b", text: "The team is playing well.", isCorrect: true },
          { id: "c", text: "The team were playing well.", isCorrect: false },
          { id: "d", text: "The team be playing well.", isCorrect: false }
        ],
        explanation: "Option B correctly uses the singular verb 'is' with the singular collective noun 'team'.",
        hint: "In American English, collective nouns like 'team' are usually treated as singular."
      },
      // ... more subject-verb agreement questions
    ],
    pronouns: [
      {
        question: "Which sentence uses pronouns correctly?",
        options: [
          { id: "a", text: "Me and my friend went to the movie.", isCorrect: false },
          { id: "b", text: "My friend and me went to the movie.", isCorrect: false },
          { id: "c", text: "My friend and I went to the movie.", isCorrect: true },
          { id: "d", text: "My friend and myself went to the movie.", isCorrect: false }
        ],
        explanation: "Option C correctly uses the subject pronoun 'I' in a compound subject.",
        hint: "Think about which pronoun you would use if you were alone: 'I went to the movie.'"
      },
      // ... more pronoun questions
    ],
    articles: [
      {
        question: "Which sentence uses articles correctly?",
        options: [
          { id: "a", text: "I saw a elephant at the zoo.", isCorrect: false },
          { id: "b", text: "I saw an elephant at the zoo.", isCorrect: true },
          { id: "c", text: "I saw the elephant at a zoo.", isCorrect: false },
          { id: "d", text: "I saw elephant at the zoo.", isCorrect: false }
        ],
        explanation: "Option B correctly uses 'an' before 'elephant' because 'elephant' begins with a vowel sound.",
        hint: "The article 'an' is used before words that begin with vowel sounds."
      },
      // ... more article questions
    ],
    prepositions: [
      {
        question: "Which sentence uses prepositions correctly?",
        options: [
          { id: "a", text: "The book is on the table.", isCorrect: true },
          { id: "b", text: "The book is at the table.", isCorrect: false },
          { id: "c", text: "The book is by the table.", isCorrect: false },
          { id: "d", text: "The book is in the table.", isCorrect: false }
        ],
        explanation: "Option A correctly uses the preposition 'on' to indicate that the book is positioned on the surface of the table.",
        hint: "Think about the relationship between the book and the table."
      },
      // ... more preposition questions
    ],
    "sentence-structure": [
      {
        question: "Which is a complete sentence?",
        options: [
          { id: "a", text: "Running to the store.", isCorrect: false },
          { id: "b", text: "When we arrived at the party.", isCorrect: false },
          { id: "c", text: "The dog barked loudly.", isCorrect: true },
          { id: "d", text: "Because it was raining.", isCorrect: false }
        ],
        explanation: "Option C is a complete sentence with a subject (the dog) and a verb (barked).",
        hint: "A complete sentence needs a subject and a verb."
      },
      // ... more sentence structure questions
    ],
    general: [
      {
        question: "Which sentence is grammatically correct?",
        options: [
          { id: "a", text: "She don't like ice cream.", isCorrect: false },
          { id: "b", text: "She doesn't like ice cream.", isCorrect: true },
          { id: "c", text: "She not like ice cream.", isCorrect: false },
          { id: "d", text: "She do not likes ice cream.", isCorrect: false }
        ],
        explanation: "Option B correctly uses the third-person singular form 'doesn't' with the subject 'she'.",
        hint: "For third-person singular subjects (he, she, it), use 'doesn't' in the negative form."
      },
      // ... more general grammar questions
    ]
  };
  
  // Select questions based on grammar type
  let relevantQuestions = grammarQuestions[grammarType];
  
  // If the specified grammar type doesn't exist, use general questions
  if (!relevantQuestions) {
    relevantQuestions = grammarQuestions.general;
  }
  
  // Select a random question from the relevant category
  const randomIndex = Math.floor(Math.random() * relevantQuestions.length);
  const selectedQuestion = relevantQuestions[randomIndex];
  
  // Generate options
  const options = selectedQuestion.options;
  
  // Shuffle options for randomness
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
  
  return {
    question: selectedQuestion.question,
    options: shuffledOptions,
    explanation: selectedQuestion.explanation,
    hint: selectedQuestion.hint,
    tags: [grammarType, 'grammar', 'english']
  };
}

/**
 * Generate vocabulary questions with appropriate difficulty
 */
function generateVocabularyQuestion(params: AIQuestionParams): AIGeneratedQuestion {
  const { difficulty, gradeLevel, interests } = params;
  
  // Define vocabulary questions for different grade levels
  const vocabularyQuestions = {
    easy: [
      {
        question: "Which word means 'very big'?",
        options: [
          { id: "a", text: "Tiny", isCorrect: false },
          { id: "b", text: "Huge", isCorrect: true },
          { id: "c", text: "Small", isCorrect: false },
          { id: "d", text: "Fast", isCorrect: false }
        ],
        explanation: "The word 'huge' means very big or large in size.",
        hint: "Think of something that is the opposite of small."
      },
      {
        question: "What is the meaning of 'happy'?",
        options: [
          { id: "a", text: "Feeling joy", isCorrect: true },
          { id: "b", text: "Feeling sad", isCorrect: false },
          { id: "c", text: "Feeling tired", isCorrect: false },
          { id: "d", text: "Feeling angry", isCorrect: false }
        ],
        explanation: "Happy means feeling or showing pleasure or contentment.",
        hint: "Think of how you feel when something good happens."
      }
    ],
    medium: [
      {
        question: "Which word is a synonym for 'brave'?",
        options: [
          { id: "a", text: "Scared", isCorrect: false },
          { id: "b", text: "Timid", isCorrect: false },
          { id: "c", text: "Courageous", isCorrect: true },
          { id: "d", text: "Weak", isCorrect: false }
        ],
        explanation: "Courageous means brave or showing courage, which is the ability to do something that frightens one.",
        hint: "Look for a word that describes someone who isn't afraid."
      },
      {
        question: "What does the word 'ancient' mean?",
        options: [
          { id: "a", text: "Very new", isCorrect: false },
          { id: "b", text: "Very old", isCorrect: true },
          { id: "c", text: "Very big", isCorrect: false },
          { id: "d", text: "Very small", isCorrect: false }
        ],
        explanation: "Ancient means belonging to the very distant past and no longer in existence.",
        hint: "Think about things like dinosaurs or pyramids."
      }
    ],
    hard: [
      {
        question: "What is the definition of 'perseverance'?",
        options: [
          { id: "a", text: "Giving up easily", isCorrect: false },
          { id: "b", text: "Being very tall", isCorrect: false },
          { id: "c", text: "Continuing despite difficulties", isCorrect: true },
          { id: "d", text: "Running very fast", isCorrect: false }
        ],
        explanation: "Perseverance means persistence in doing something despite difficulty or delay in achieving success.",
        hint: "Think about continuing to try even when things are hard."
      },
      {
        question: "Which word means 'to make something better'?",
        options: [
          { id: "a", text: "Worsen", isCorrect: false },
          { id: "b", text: "Improve", isCorrect: true },
          { id: "c", text: "Maintain", isCorrect: false },
          { id: "d", text: "Ignore", isCorrect: false }
        ],
        explanation: "Improve means to make or become better.",
        hint: "Think of what happens when you practice a skill over time."
      }
    ]
  };
  
  // Select questions based on difficulty
  let relevantQuestions = vocabularyQuestions[difficulty as keyof typeof vocabularyQuestions];
  
  // If the specified difficulty doesn't exist, use medium difficulty
  if (!relevantQuestions) {
    relevantQuestions = vocabularyQuestions.medium;
  }
  
  // Select a random question from the relevant category
  const randomIndex = Math.floor(Math.random() * relevantQuestions.length);
  const selectedQuestion = relevantQuestions[randomIndex];
  
  // Shuffle options for randomness
  const shuffledOptions = [...selectedQuestion.options].sort(() => Math.random() - 0.5);
  
  return {
    question: selectedQuestion.question,
    options: shuffledOptions,
    explanation: selectedQuestion.explanation,
    hint: selectedQuestion.hint,
    tags: ['vocabulary', 'english']
  };
} 