
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MCQOption {
  id: string;
  text: string;
}

interface MCQuestion {
  id: number;
  text: string;
  options: MCQOption[];
  correctAnswer: string;
}

interface CodingQuestion {
  id: number;
  text: string;
  starterCode: string;
  testCases: string;
}

const QuizScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [codingAnswers, setCodingAnswers] = useState<Record<number, string>>({});
  const [quizType, setQuizType] = useState<'mcq' | 'coding'>('mcq');
  const [progress, setProgress] = useState(0);
  
  // Sample MCQ questions
  const mcqQuestions: MCQuestion[] = [
    {
      id: 1,
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
      text: "What is the correct way to declare a JavaScript variable?",
      options: [
        { id: "a", text: "variable x;" },
        { id: "b", text: "var x;" },
        { id: "c", text: "v x;" },
        { id: "d", text: "x = var;" }
      ],
      correctAnswer: "b"
    }
  ];
  
  // Sample coding questions
  const codingQuestions: CodingQuestion[] = [
    {
      id: 1,
      text: "Write a function that returns the sum of two numbers.",
      starterCode: "function sum(a, b) {\n  // Your code here\n}",
      testCases: "sum(1, 2) === 3\nsum(-1, 1) === 0"
    },
    {
      id: 2,
      text: "Write a function that checks if a string is a palindrome.",
      starterCode: "function isPalindrome(str) {\n  // Your code here\n}",
      testCases: "isPalindrome('racecar') === true\nisPalindrome('hello') === false"
    },
    {
      id: 3,
      text: "Implement a function that returns the factorial of a number.",
      starterCode: "function factorial(n) {\n  // Your code here\n}",
      testCases: "factorial(5) === 120\nfactorial(0) === 1"
    },
    {
      id: 4,
      text: "Write a function to reverse an array without using the built-in reverse method.",
      starterCode: "function reverseArray(arr) {\n  // Your code here\n}",
      testCases: "reverseArray([1,2,3,4]) deep equals [4,3,2,1]"
    }
  ];
  
  useEffect(() => {
    // Get the selected language from localStorage
    const lang = localStorage.getItem('selectedLanguage');
    if (lang) {
      setSelectedLanguage(lang);
    }
    
    // Calculate progress based on the quiz type and current question
    if (quizType === 'mcq') {
      setProgress(((currentQuestionIndex + 1) / mcqQuestions.length) * 50);
    } else {
      setProgress(50 + ((currentQuestionIndex + 1) / codingQuestions.length) * 50);
    }
  }, [currentQuestionIndex, quizType]);
  
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
  };
  
  const handleNextQuestion = () => {
    const maxIndex = quizType === 'mcq' ? mcqQuestions.length - 1 : codingQuestions.length - 1;
    
    if (currentQuestionIndex < maxIndex) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (quizType === 'mcq') {
      // Transition from MCQs to coding questions
      setQuizType('coding');
      setCurrentQuestionIndex(0);
    } else {
      // Quiz completed
      handleQuizCompletion();
    }
  };
  
  const handleQuizCompletion = () => {
    toast({
      title: "Quiz Completed!",
      description: "Your answers have been submitted and are being processed.",
    });
    
    // Simulate certificate generation
    setTimeout(() => {
      navigate('/certificate/123');
    }, 2000);
  };
  
  const renderQuestion = () => {
    if (quizType === 'mcq') {
      const question = mcqQuestions[currentQuestionIndex];
      return (
        <div className="quiz-card">
          <h3 className="quiz-header">Question {currentQuestionIndex + 1}</h3>
          <p className="mb-6 text-lg">{question.text}</p>
          
          <div className="space-y-3">
            {question.options.map((option) => (
              <label 
                key={option.id}
                className={`quiz-option ${selectedAnswers[question.id] === option.id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedAnswers[question.id] === option.id}
                  onChange={() => handleMCQSelection(question.id, option.id)}
                />
                <span className="font-medium">{option.id.toUpperCase()}.</span>
                <span className="ml-2">{option.text}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleNextQuestion} 
              disabled={!selectedAnswers[question.id]}
            >
              {currentQuestionIndex < mcqQuestions.length - 1 ? "Next Question" : "Start Coding Questions"}
            </Button>
          </div>
        </div>
      );
    } else {
      const question = codingQuestions[currentQuestionIndex];
      return (
        <div className="quiz-card">
          <h3 className="quiz-header">Coding Question {currentQuestionIndex + 1}</h3>
          <p className="mb-6 text-lg">{question.text}</p>
          
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Test Cases:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs font-mono">
              {question.testCases}
            </pre>
          </div>
          
          <div>
            <textarea
              className="code-editor"
              value={codingAnswers[question.id] || question.starterCode}
              onChange={(e) => handleCodingInput(question.id, e.target.value)}
            />
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleNextQuestion}
              disabled={!codingAnswers[question.id]}
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
      <Navbar userType="student" />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Quiz
          </h1>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {quizType === 'mcq' ? 'Multiple Choice' : 'Coding Questions'} ({currentQuestionIndex + 1}/
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
