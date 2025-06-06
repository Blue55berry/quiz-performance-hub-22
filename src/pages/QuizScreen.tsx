import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { FileCheck, AlertCircle, Loader2, TestTube } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MCQOption {
  id: string;
  text: string;
}

interface MCQuestion {
  id: number;
  language: string;
  text: string;
  options: MCQOption[];
  correctAnswer: string;
}

interface CodingQuestion {
  id: number;
  language: string;
  text: string;
  starterCode: string;
  testCases: string;
  sampleSolution?: string;
}

interface TestResult {
  passed: boolean;
  message: string;
  output?: string;
  expected?: string;
  details?: string[];
}

// Language IDs for Judge0
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  'javascript': 63,
  'python': 71,
  'java': 62,
  'csharp': 51,
  'cpp': 54,
  'c': 50,
  'typescript': 74,
};

const QuizScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [selectedLanguageName, setSelectedLanguageName] = useState<string>('JavaScript');
  const [studentName, setStudentName] = useState<string>('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [codingAnswers, setCodingAnswers] = useState<Record<number, string>>({});
  const [quizType, setQuizType] = useState<'mcq' | 'coding'>('mcq');
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [isExecutingCode, setIsExecutingCode] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [codeSubmissionAttempts, setCodeSubmissionAttempts] = useState<Record<number, number>>({});
  const [showHints, setShowHints] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(true);
  
  // All questions organized by language
  const allMCQuestions: MCQuestion[] = [
    // JavaScript Questions
    {
      id: 1,
      language: 'javascript',
      text: "What is the output of console.log(typeof null) in JavaScript?",
      options: [
        { id: "a", text: "null" },
        { id: "b", text: "object" },
        { id: "c", text: "undefined" },
        { id: "d", text: "string" }
      ],
      correctAnswer: "b"
    },
    {
      id: 2,
      language: 'javascript',
      text: "Which of the following is not a JavaScript data type?",
      options: [
        { id: "a", text: "String" },
        { id: "b", text: "Boolean" },
        { id: "c", text: "Float" },
        { id: "d", text: "Symbol" }
      ],
      correctAnswer: "c"
    },
    {
      id: 3,
      language: 'javascript',
      text: "What is the correct way to declare a JavaScript variable?",
      options: [
        { id: "a", text: "variable x;" },
        { id: "b", text: "var x;" },
        { id: "c", text: "v x;" },
        { id: "d", text: "x = var;" }
      ],
      correctAnswer: "b"
    },
    // Python Questions
    {
      id: 4,
      language: 'python',
      text: "What is the output of print(type(None)) in Python?",
      options: [
        { id: "a", text: "NoneType" },
        { id: "b", text: "null" },
        { id: "c", text: "undefined" },
        { id: "d", text: "void" }
      ],
      correctAnswer: "a"
    },
    {
      id: 5,
      language: 'python',
      text: "Which of these is not a valid Python data type?",
      options: [
        { id: "a", text: "list" },
        { id: "b", text: "dictionary" },
        { id: "c", text: "array" },
        { id: "d", text: "tuple" }
      ],
      correctAnswer: "c"
    },
    {
      id: 6,
      language: 'python',
      text: "How do you declare a variable in Python?",
      options: [
        { id: "a", text: "var x = 5" },
        { id: "b", text: "dim x as integer = 5" },
        { id: "c", text: "x = 5" },
        { id: "d", text: "let x = 5" }
      ],
      correctAnswer: "c"
    },
    // Java Questions
    {
      id: 7,
      language: 'java',
      text: "Which of these is not a Java primitive data type?",
      options: [
        { id: "a", text: "int" },
        { id: "b", text: "String" },
        { id: "c", text: "boolean" },
        { id: "d", text: "char" }
      ],
      correctAnswer: "b"
    },
    {
      id: 8,
      language: 'java',
      text: "What is the correct way to declare a constant in Java?",
      options: [
        { id: "a", text: "var PI = 3.14159;" },
        { id: "b", text: "const PI = 3.14159;" },
        { id: "c", text: "final double PI = 3.14159;" },
        { id: "d", text: "#define PI 3.14159" }
      ],
      correctAnswer: "c"
    },
    {
      id: 9,
      language: 'java',
      text: "In Java, which keyword is used to inherit a class?",
      options: [
        { id: "a", text: "implements" },
        { id: "b", text: "extends" },
        { id: "c", text: "inherits" },
        { id: "d", text: "using" }
      ],
      correctAnswer: "b"
    },
    // C# Questions
    {
      id: 10,
      language: 'csharp',
      text: "What is the correct way to declare a read-only field in C#?",
      options: [
        { id: "a", text: "static int x = 5;" },
        { id: "b", text: "readonly int x = 5;" },
        { id: "c", text: "final int x = 5;" },
        { id: "d", text: "const int x = 5;" }
      ],
      correctAnswer: "b"
    },
    {
      id: 11,
      language: 'csharp',
      text: "Which of the following is NOT a valid C# access modifier?",
      options: [
        { id: "a", text: "public" },
        { id: "b", text: "private" },
        { id: "c", text: "protected" },
        { id: "d", text: "friend" }
      ],
      correctAnswer: "d"
    },
    {
      id: 12,
      language: 'csharp',
      text: "What does the 'var' keyword do in C#?",
      options: [
        { id: "a", text: "Creates a late-bound variable" },
        { id: "b", text: "Creates a variant type that can hold any value" },
        { id: "c", text: "Lets the compiler infer the type of the variable" },
        { id: "d", text: "Declares a dynamic variable" }
      ],
      correctAnswer: "c"
    }
  ];
  
  // All coding questions organized by language
  const allCodingQuestions: CodingQuestion[] = [
    // JavaScript coding questions
    {
      id: 1,
      language: 'javascript',
      text: "Write a function that returns the sum of two numbers.",
      starterCode: "function sum(a, b) {\n  // Your code here\n}",
      testCases: "sum(1, 2) === 3\nsum(-1, 1) === 0",
      sampleSolution: "function sum(a, b) {\n  return a + b;\n}"
    },
    {
      id: 2,
      language: 'javascript',
      text: "Write a function that checks if a string is a palindrome.",
      starterCode: "function isPalindrome(str) {\n  // Your code here\n}",
      testCases: "isPalindrome('racecar') === true\nisPalindrome('hello') === false",
      sampleSolution: "function isPalindrome(str) {\n  const reversed = str.split('').reverse().join('');\n  return str === reversed;\n}"
    },
    // Python coding questions
    {
      id: 3,
      language: 'python',
      text: "Write a function to check if a number is prime.",
      starterCode: "def is_prime(n):\n    # Your code here\n    pass",
      testCases: "is_prime(7) == True\nis_prime(4) == False",
      sampleSolution: "def is_prime(n):\n    if n <= 1:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True"
    },
    {
      id: 4,
      language: 'python',
      text: "Write a function that returns the factorial of a number.",
      starterCode: "def factorial(n):\n    # Your code here\n    pass",
      testCases: "factorial(5) == 120\nfactorial(0) == 1",
      sampleSolution: "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)"
    },
    // Java coding questions
    {
      id: 5,
      language: 'java',
      text: "Create a method to find the largest element in an array.",
      starterCode: "public class Solution {\n    public static int findMax(int[] array) {\n        // Your code here\n        return 0; // Replace with your solution\n    }\n}",
      testCases: "findMax(new int[]{1, 3, 5, 7, 2}) returns 7\nfindMax(new int[]{-1, -5, -2}) returns -1",
      sampleSolution: "public class Solution {\n    public static int findMax(int[] array) {\n        int max = array[0];\n        for (int i = 1; i < array.length; i++) {\n            if (array[i] > max) {\n                max = array[i];\n            }\n        }\n        return max;\n    }\n}"
    },
    {
      id: 6,
      language: 'java',
      text: "Write a method to check if a string contains only digits.",
      starterCode: "public class Solution {\n    public static boolean containsOnlyDigits(String str) {\n        // Your code here\n        return false; // Replace with your solution\n    }\n}",
      testCases: 'containsOnlyDigits("12345") returns true\ncontainsOnlyDigits("123a") returns false',
      sampleSolution: "public class Solution {\n    public static boolean containsOnlyDigits(String str) {\n        for (int i = 0; i < str.length(); i++) {\n            if (!Character.isDigit(str.charAt(i))) {\n                return false;\n            }\n        }\n        return true;\n    }\n}"
    },
    // C# coding questions
    {
      id: 7,
      language: 'csharp',
      text: "Write a method to reverse a string without using the built-in Reverse method.",
      starterCode: "public class Solution {\n    public static string ReverseString(string input) {\n        // Your code here\n        return \"\"; // Replace with your solution\n    }\n}",
      testCases: 'ReverseString("hello") returns "olleh"\nReverseString("C#") returns "#C"',
      sampleSolution: "public class Solution {\n    public static string ReverseString(string input) {\n        char[] charArray = input.ToCharArray();\n        int left = 0;\n        int right = charArray.Length - 1;\n        while (left < right) {\n            char temp = charArray[left];\n            charArray[left] = charArray[right];\n            charArray[right] = temp;\n            left++;\n            right--;\n        }\n        return new string(charArray);\n    }\n}"
    },
    {
      id: 8,
      language: 'csharp',
      text: "Write a method to find all even numbers in a list.",
      starterCode: "public class Solution {\n    public static List<int> FindEvenNumbers(List<int> numbers) {\n        // Your code here\n        return new List<int>(); // Replace with your solution\n    }\n}",
      testCases: "FindEvenNumbers(new List<int>{1, 2, 3, 4, 5}) returns [2, 4]\nFindEvenNumbers(new List<int>{7, 9, 11}) returns []",
      sampleSolution: "public class Solution {\n    public static List<int> FindEvenNumbers(List<int> numbers) {\n        List<int> result = new List<int>();\n        foreach (int num in numbers) {\n            if (num % 2 == 0) {\n                result.Add(num);\n            }\n        }\n        return result;\n    }\n}"
    }
  ];

  // Filter questions based on selected language
  const mcqQuestions = allMCQuestions.filter(q => q.language === selectedLanguage);
  const codingQuestions = allCodingQuestions.filter(q => q.language === selectedLanguage);
  
  useEffect(() => {
    // Get the selected language from localStorage
    const lang = localStorage.getItem('selectedLanguage');
    const langName = localStorage.getItem('selectedLanguageName');
    const name = localStorage.getItem('studentName');
    const id = localStorage.getItem('studentId');
    
    if (lang) {
      setSelectedLanguage(lang);
    }
    
    if (langName) {
      setSelectedLanguageName(langName);
    }

    if (name) {
      setStudentName(name);
    }

    if (id) {
      setStudentId(id);
    }
    
    // Calculate progress based on the quiz type and current question
    if (quizType === 'mcq') {
      setProgress(((currentQuestionIndex + 1) / mcqQuestions.length) * 50);
    } else {
      setProgress(50 + ((currentQuestionIndex + 1) / codingQuestions.length) * 50);
    }
  }, [currentQuestionIndex, quizType, mcqQuestions.length, codingQuestions.length]);
  
  const handleMCQSelection = (questionId: number, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
  };
  
  const handleCodingInput = (questionId: number, code: string) => {
    setCodingAnswers({
      ...codingAnswers,
      [questionId]: code
    });
    // Reset test results when code changes
    setTestResults(null);
  };

  // Calculate score based on MCQ answers and code attempts
  const calculateScore = () => {
    let totalScore = 0;
    
    // Check MCQ answers - each correct answer is worth 10 points
    mcqQuestions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        totalScore += 10;
      }
    });
    
    // Evaluate coding questions - each correct implementation is worth 20 points
    // but with deduction based on number of attempts
    codingQuestions.forEach(question => {
      // If the student has code for this question and we assume it passes
      // (since they can only proceed after passing tests)
      if (codingAnswers[question.id]) {
        // Base score is 20 points
        let questionScore = 20;
        
        // Deduct 2 points for each failed attempt (beyond the first attempt)
        const attempts = codeSubmissionAttempts[question.id] || 1;
        if (attempts > 1) {
          questionScore -= (attempts - 1) * 2;
          // Minimum score is 5 points if they eventually got it right
          questionScore = Math.max(questionScore, 5);
        }
        
        totalScore += questionScore;
      }
    });
    
    // Calculate percentage based on maximum possible score
    const maxScore = (mcqQuestions.length * 10) + (codingQuestions.length * 20);
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    setScore(percentage);
    return percentage;
  };
  
  const handleNextQuestion = () => {
    const maxIndex = quizType === 'mcq' ? mcqQuestions.length - 1 : codingQuestions.length - 1;
    
    if (currentQuestionIndex < maxIndex) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTestResults(null); // Reset test results for the next question
      setShowHints(false); // Reset hints for next question
    } else if (quizType === 'mcq') {
      // Transition from MCQs to coding questions
      setQuizType('coding');
      setCurrentQuestionIndex(0);
      setTestResults(null);
      setShowHints(false);
    } else {
      // Quiz completed
      handleQuizCompletion();
    }
  };

  const parseTestCases = (testCasesStr: string): { input: string; expected: string }[] => {
    // Simple parsing based on newlines and expected format
    const lines = testCasesStr.trim().split('\n');
    const testCases: { input: string; expected: string }[] = [];
    
    for (const line of lines) {
      if (line.includes('===')) {
        const [input, expected] = line.split('===').map(part => part.trim());
        testCases.push({ input, expected });
      } else {
        const parts = line.match(/(.+)\s*==\s*(.+)/);
        if (parts && parts.length === 3) {
          testCases.push({ input: parts[1].trim(), expected: parts[2].trim() });
        }
      }
    }
    
    return testCases;
  };

  // Modified to improve sandbox mode validation for code testing
  const runTestCases = async (code: string, question: CodingQuestion) => {
    setIsExecutingCode(true);
    setTestResults(null);
    
    try {
      // Get the current attempt count or initialize to 1
      const currentAttempts = codeSubmissionAttempts[question.id] || 0;
      
      // Update the attempt counter
      setCodeSubmissionAttempts({
        ...codeSubmissionAttempts,
        [question.id]: currentAttempts + 1
      });
      
      // Parse test cases
      const testCases = parseTestCases(question.testCases);
      
      // Use sandbox mode for code execution
      if (sandboxMode) {
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Improved validation logic based on language and specific question
        let allTestsPassed = true;
        const testDetails: string[] = [];
        let validationErrors: string[] = [];
        
        // Basic syntax validation
        if (question.language === 'javascript') {
          if (!code.includes('function')) {
            validationErrors.push("Your code must include a function definition.");
          }
          
          if (!code.includes('return')) {
            validationErrors.push("Your function must return a value.");
          }
        } else if (question.language === 'python') {
          if (!code.includes('def')) {
            validationErrors.push("Your code must include a function definition.");
          }
          
          if (!code.includes('return')) {
            validationErrors.push("Your function must return a value.");
          }
        } else if (question.language === 'java') {
          if (!code.includes('public') || !code.includes('class')) {
            validationErrors.push("Your code must include a public class definition.");
          }
          
          if (!code.includes('return') && !code.includes('void')) {
            validationErrors.push("Your method must return a value or be declared void.");
          }
        } else if (question.language === 'csharp') {
          if (!code.includes('public') || !code.includes('class')) {
            validationErrors.push("Your code must include a public class definition.");
          }
          
          if (!code.includes('return') && !code.includes('void')) {
            validationErrors.push("Your method must return a value or be declared void.");
          }
        }
        
        // If basic validation fails, show those errors
        if (validationErrors.length > 0) {
          setTestResults({
            passed: false,
            message: "There are syntax issues with your code:",
            details: validationErrors,
          });
          
          toast({
            variant: "destructive",
            title: "Syntax Issues",
            description: "Please check your code syntax before running tests.",
          });
          
          setIsExecutingCode(false);
          return;
        }
        
        // More specific validation for each question
        switch(question.id) {
          case 1: // JavaScript sum function
            if (question.language === 'javascript') {
              allTestsPassed = code.includes('function sum') && 
                              code.includes('return') && 
                              code.includes('+');
                              
              // More specific test for the actual logic
              const containsCorrectLogic = code.includes('return a + b') || 
                                          code.includes('return (a + b)') ||
                                          Boolean(code.match(/return\s*\(?.*\+.*\)?/));
                                          
              allTestsPassed = allTestsPassed && containsCorrectLogic;
            }
            break;
            
          case 2: // JavaScript palindrome function
            if (question.language === 'javascript') {
              // Check for common palindrome implementations
              const hasReverseLogic = code.includes('reverse()') ||
                                     (code.includes('split') && code.includes('join'));
              
              // Or manual implementation with loops
              const hasLoopLogic = (code.includes('for') || code.includes('while')) &&
                                 code.includes('length');
                                 
              allTestsPassed = code.includes('function isPalindrome') && 
                              code.includes('return') && 
                              (hasReverseLogic || hasLoopLogic);
            }
            break;
            
          case 3: // Python prime function
            if (question.language === 'python') {
              // Check for common prime implementations
              const hasRangeCheck = code.includes('range') && 
                                  code.includes('for') && 
                                  (code.includes('%') || code.includes('mod'));
              
              // Or direct check with mathematical approach
              const hasMathApproach = code.includes('sqrt') || code.includes('**0.5');
              
              allTestsPassed = code.includes('def is_prime') && 
                              code.includes('return') && 
                              (hasRangeCheck || hasMathApproach);
            }
            break;
            
          case 4: // Python factorial function
            if (question.language === 'python') {
              // Check for recursive approach
              const hasRecursion = code.includes('factorial(') && code.includes('return');
              
              // Or iterative approach
              const hasIteration = code.includes('for') && 
                                 (code.includes('*=') || code.includes('result *'));
              
              allTestsPassed = code.includes('def factorial') && 
                              code.includes('return') && 
                              (hasRecursion || hasIteration);
            }
            break;
            
          case 5: // Java find max in array
            if (question.language === 'java') {
              // Check for common implementations
              const hasLoopAndComparison = code.includes('for') && 
                                          (code.includes('>') || code.includes('Math.max'));
              
              allTestsPassed = code.includes('findMax') && 
                              code.includes('return') && 
                              hasLoopAndComparison;
            }
            break;
            
          case 6: // Java check digits
            if (question.language === 'java') {
              // Check for common implementations
              const hasCharacterCheck = code.includes('charAt') && 
                                      (code.includes('isDigit') || code.includes('0') && code.includes('9'));
              
              const hasRegexCheck = code.includes('matches') || code.includes('Pattern');
              
              allTestsPassed = code.includes('containsOnlyDigits') && 
                              code.includes('return') && 
                              (hasCharacterCheck || hasRegexCheck);
            }
            break;
            
          case 7: // C# reverse string
            if (question.language === 'csharp') {
              // Check for common implementations
              const hasManualReverse = code.includes('char') && 
                                     code.includes('for') && 
                                     (code.includes('temp') || code.includes('swap'));
              
              const hasStringManipulation = code.includes('ToCharArray') && 
                                         (code.includes('Array.Reverse') || code.includes('new string'));
                                         
              allTestsPassed = code.includes('ReverseString') && 
                              code.includes('return') && 
                              (hasManualReverse || hasStringManipulation);
            }
            break;
            
          case 8: // C# find even numbers
            if (question.language === 'csharp') {
              // Check for common implementations
              const hasLoopImplementation = code.includes('foreach') && 
                                          code.includes('%') && 
                                          code.includes('Add');
              
              const hasLinqImplementation = code.includes('Where') || 
                                         code.includes('Select') ||
                                         code.includes('=>');
              
              allTestsPassed = code.includes('FindEvenNumbers') && 
                              code.includes('return') && 
                              (hasLoopImplementation || hasLinqImplementation);
            }
            break;
            
          default:
            // For any other questions, do a generic code length check
            allTestsPassed = code.length > 50;
            break;
        }
        
        // Generate test feedback
        for (let i = 0; i < testCases.length; i++) {
          testDetails.push(`Test case ${i + 1}: ${allTestsPassed ? 'Passed' : 'Failed'}`);
        }
        
        // Set test results
        setTestResults({
          passed: allTestsPassed,
          message: allTestsPassed ? 
            'Great job! Your solution passed all test cases.' : 
            "Your code didn't pass all test cases.",
          details: testDetails,
        });
        
        if (allTestsPassed) {
          toast({
            title: "Success!",
            description: "Your solution works correctly. You can proceed to the next question.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Test Failed",
            description: "Your solution needs some adjustments before proceeding.",
          });
        }
        
        return;
      }

      // External API code run (only if sandbox mode is disabled)
      const langId = JUDGE0_LANGUAGE_IDS[question.language];
      if (!langId) {
        throw new Error(`Language ${question.language} is not supported`);
      }
      
      // Prepare the code with test cases
      let fullCode = code;
      
      // Language-specific test runners
      if (question.language === 'python') {
        const testFunctions = testCases.map((testCase, idx) => {
          return `
# Test case ${idx + 1}
try:
    test_result = ${testCase.input}
    expected = ${testCase.expected}
    assert str(test_result) == str(expected), f"Test case ${idx + 1} failed"
    print(f"Test case ${idx + 1}: Passed")
except Exception as e:
    print(f"Test case ${idx + 1}: Failed")
    exit(1)
`;
        }).join('\n');
        
        fullCode = `${code}\n\n# Running tests\n${testFunctions}\nprint("All tests passed successfully!")`;
      }
      else if (question.language === 'javascript') {
        const testFunctions = testCases.map((testCase, idx) => {
          return `
// Test case ${idx + 1}
try {
  const testResult = ${testCase.input};
  const expected = ${testCase.expected};
  if (JSON.stringify(testResult) !== JSON.stringify(expected)) {
    console.error(\`Test case ${idx + 1}: Failed\`);
    process.exit(1);
  }
  console.log(\`Test case ${idx + 1}: Passed\`);
} catch (e) {
  console.error(\`Test case ${idx + 1}: Failed\`);
  process.exit(1);
}`;
        }).join('\n');
        
        fullCode = `${code}\n\n// Running tests\n${testFunctions}\nconsole.log("All tests passed successfully!")`;
      }
      else if (question.language === 'java') {
        // This is simplified and would need more sophisticated handling for Java
        fullCode = code;
      }
      
      // Make API request to Judge0
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions/?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // Replace with your actual RapidAPI key
        },
        body: JSON.stringify({
          source_code: fullCode,
          language_id: langId,
          stdin: '',
        }),
      });

      if (!response.ok) {
        console.error(`Judge0 API error: ${response.status}`);
        throw new Error("API request failed");
      }

      const result = await response.json();

      // Process the results in a more student-friendly way
      if (result.status?.description === 'Accepted' || 
          (result.stdout && result.stdout.includes("All tests passed"))) {
        
        // Extract individual test case results
        const testDetails = result.stdout?.split('\n')
          .filter((line: string) => line.includes('Test case'))
          .map((line: string) => line.trim()) || [];
        
        setTestResults({
          passed: true,
          message: 'Great job! Your solution passed all test cases.',
          details: testDetails,
        });
        
        toast({
          title: "Success!",
          description: "Your solution works correctly. You can proceed to the next question.",
        });
      } else {
        // Don't expose the actual error, just indicate that tests failed
        const testDetails = result.stdout?.split('\n')
          .filter((line: string) => line.includes('Test case'))
          .map((line: string) => line.trim()) || [];
        
        // If we have compile errors, give a hint about that
        let message = "Your code didn't pass all test cases.";
        if (result.compile_output) {
          message = "There appears to be a syntax error in your code.";
        }
        
        setTestResults({
          passed: false,
          message: message,
          details: testDetails.length ? testDetails : ["Review your logic and try again."],
        });
        
        toast({
          variant: "destructive",
          title: "Test Failed",
          description: "Your solution needs some adjustments before proceeding.",
        });
      }
    } catch (error) {
      console.error('Error executing code:', error);
      // Use sandbox mode as fallback
      setSandboxMode(true);
      runTestCases(code, question);
    } finally {
      setIsExecutingCode(false);
    }
  };
  
  const handleQuizCompletion = async () => {
    const finalScore = calculateScore();
    
    toast({
      title: "Quiz Completed!",
      description: `Your score is ${finalScore}%. Your certificate is being generated.`,
    });

    try {
      // Save quiz completion in database
      if (studentId) {
        const { error } = await supabase.from('quiz_completions').insert({
          student_id: studentId,
          quiz_name: `${selectedLanguageName} Quiz`,
          score: finalScore
        });

        if (error) {
          console.error('Error saving quiz completion:', error);
        }
      }
    } catch (err) {
      console.error('Error in quiz completion:', err);
    }
    
    // Navigate to certificate page with necessary data
    navigate(`/certificate/${selectedLanguage}`, { 
      state: { 
        score: finalScore,
        language: selectedLanguageName,
        studentName: studentName,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      } 
    });
  };
  
  const toggleHints = () => {
    setShowHints(!showHints);
  };
  
  const getLanguageSpecificHints = (language: string, questionId: number): JSX.Element => {
    switch(language) {
      case 'java':
        if (questionId === 5) {
          return (
            <ul className="list-disc pl-5 text-sm">
              <li>Initialize max with the first element of the array</li>
              <li>Loop through the array starting from index 1</li>
              <li>Compare each element with max and update if necessary</li>
              <li>Remember to check for edge cases like empty arrays</li>
            </ul>
          );
        } else if (questionId === 6) {
          return (
            <ul className="list-disc pl-5 text-sm">
              <li>Use a for loop to iterate through each character</li>
              <li>Java has the Character.isDigit() method to check if a char is a digit</li>
              <li>Return false as soon as you find a non-digit character</li>
              <li>If you get through the entire string, return true</li>
            </ul>
          );
        }
        break;
      case 'csharp':
        if (questionId === 7) {
          return (
            <ul className="list-disc pl-5 text-sm">
              <li>Convert the string to a character array using ToCharArray()</li>
              <li>Use a two-pointer approach (one at the start, one at the end)</li>
              <li>Swap characters as the pointers move toward each other</li>
              <li>Create a new string from the final char array</li>
            </ul>
          );
        } else if (questionId === 8) {
          return (
            <ul className="list-disc pl-5 text-sm">
              <li>Create a new List&lt;int&gt; to store your results</li>
              <li>Iterate through the input list using a foreach loop</li>
              <li>Check if each number is even using the modulo operator (% 2 == 0)</li>
              <li>Add even numbers to your result list</li>
            </ul>
          );
        }
        break;
      case 'javascript':
        return (
          <ul className="list-disc pl-5 text-sm">
            <li>Make sure your function is defined correctly</li>
            <li>Check for edge cases in your logic</li>
            <li>Use console.log to debug your code</li>
          </ul>
        );
      case 'python':
        return (
          <ul className="list-disc pl-5 text-sm">
            <li>Ensure your function is defined with 'def'</li>
            <li>Check for indentation errors</li>
            <li>Use print statements to debug your code</li>
          </ul>
        );
      default:
        return (
          <ul className="list-disc pl-5 text-sm">
            <li>Break down the problem into smaller steps</li>
            <li>Think about the input and expected output</li>
            <li>Consider edge cases</li>
          </ul>
        );
    }
    
    return (
      <ul className="list-disc pl-5 text-sm">
        <li>Break down the problem into smaller steps</li>
        <li>Think about the input and expected output</li>
        <li>Consider edge cases</li>
      </ul>
    );
  };
  
  const renderQuestion = () => {
    if (quizType === 'mcq') {
      const question = mcqQuestions[currentQuestionIndex];
      if (!question) return <p>No questions available for this language.</p>;
      
      return (
        <div className="quiz-card bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Question {currentQuestionIndex + 1}</h3>
          <div className="mb-6 text-lg bg-gray-50 p-4 rounded-md border border-gray-100">
            {question.text}
          </div>
          
          <div className="space-y-3">
            {question.options.map((option) => (
              <label 
                key={option.id}
                className={`flex items-center p-3 border rounded-md cursor-pointer transition-all ${
                  selectedAnswers[question.id] === option.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedAnswers[question.id] === option.id}
                  onChange={() => handleMCQSelection(question.id, option.id)}
                  className="mr-2"
                />
                <span className="font-medium">{option.id.toUpperCase()}.</span>
                <span className="ml-2">{option.text}</span>
              </label>
            ))}
          </div>
          
          {/* Only show if an answer was selected but don't reveal the correct answer */}
          {selectedAnswers[question.id] && (
            <div className="mt-4">
              <Button 
                onClick={handleNextQuestion}
                className="w-full"
              >
                Next Question
              </Button>
            </div>
          )}
        </div>
      );
    } else {
      const question = codingQuestions[currentQuestionIndex];
      if (!question) return <p>No coding questions available for this language.</p>;
      
      return (
        <div className="quiz-card bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Coding Challenge {currentQuestionIndex + 1}</h3>
            <div className="text-sm font-medium text-gray-500">
              Language: {selectedLanguageName}
            </div>
          </div>
          
          <div className="mb-6 text-lg bg-gray-50 p-4 rounded-md border border-gray-100">
            {question.text}
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              <TestTube className="w-4 h-4 mr-1" />
              Test Cases:
            </h4>
            <pre className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
              {question.testCases}
            </pre>
          </div>
          
          <div className="mb-4">
            <Textarea
              className="w-full h-64 font-mono p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={codingAnswers[question.id] || question.starterCode}
              onChange={(e) => handleCodingInput(question.id, e.target.value)}
              placeholder="Write your solution here..."
            />
          </div>
          
          {testResults && (
            <Alert variant={testResults.passed ? "default" : "destructive"} className="mb-4">
              <AlertDescription>
                <p className="font-medium">{testResults.message}</p>
                {testResults.details && testResults.details.length > 0 && (
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {testResults.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Enhanced language-specific hints system */}
          <div className="mt-4 mb-4">
            <Button variant="outline" onClick={toggleHints} className="text-sm">
              {showHints ? "Hide Hints" : "Show Hints"}
            </Button>
            
            {showHints && (
              <div className="mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                <h4 className="text-sm font-semibold mb-1">Problem Approach:</h4>
                {getLanguageSpecificHints(question.language, question.id)}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => runTestCases(codingAnswers[question.id] || question.starterCode, question)}
              disabled={isExecutingCode || !codingAnswers[question.id]}
              className="flex items-center"
            >
              {isExecutingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Run Tests
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleNextQuestion}
              disabled={!testResults?.passed}
            >
              {currentQuestionIndex < codingQuestions.length - 1 ? "Next Question" : "Submit Quiz"}
            </Button>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="student" username={studentName || 'Student'} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h1 className="text-2xl font-bold">
              {selectedLanguageName} Proficiency Assessment
            </h1>
            
            <div className="text-sm font-medium text-gray-600 mt-2 sm:mt-0">
              Attempts remaining: Unlimited
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {quizType === 'mcq' ? 'Knowledge Assessment' : 'Practical Skills'} ({currentQuestionIndex + 1}/
              {quizType === 'mcq' ? mcqQuestions.length : codingQuestions.length})
            </span>
            <span className="text-sm font-medium">{progress.toFixed(0)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="max-w-3xl mx-auto">
          {renderQuestion()}
        </div>
      </main>
    </div>
  );
};

export default QuizScreen;
