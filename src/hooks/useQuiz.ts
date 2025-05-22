
import { useState, useEffect } from 'react';
import { MCQuestion, CodingQuestion, TestResult } from '@/types/quiz';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { runCodeTests } from '@/utils/quizUtils';

export function useQuiz(mcqQuestions: MCQuestion[], codingQuestions: CodingQuestion[]) {
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

  const handleRunTests = async (code: string, question: CodingQuestion) => {
    setIsExecutingCode(true);
    
    try {
      // Get the current attempt count or initialize to 1
      const currentAttempts = codeSubmissionAttempts[question.id] || 0;
      
      // Update the attempt counter
      setCodeSubmissionAttempts({
        ...codeSubmissionAttempts,
        [question.id]: currentAttempts + 1
      });
      
      // Run the tests using the utility function
      const results = await runCodeTests(code, question, setSandboxMode, sandboxMode);
      setTestResults(results);
      
      // Show appropriate toast message
      if (results.passed) {
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
    } catch (error) {
      console.error('Error in handleRunTests:', error);
      setTestResults({
        passed: false,
        message: "An error occurred while testing your code.",
        details: ["Please try again or contact support if the issue persists."]
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while testing your code.",
      });
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

  return {
    currentQuestionIndex,
    quizType,
    selectedAnswers,
    codingAnswers,
    testResults,
    isExecutingCode,
    showHints,
    progress,
    selectedLanguage,
    selectedLanguageName,
    studentName,
    handleMCQSelection,
    handleCodingInput,
    handleNextQuestion,
    handleRunTests,
    toggleHints
  };
}
