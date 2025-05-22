
import React from 'react';
import Navbar from '@/components/common/Navbar';
import { Progress } from "@/components/ui/progress";
import { ALL_MCQ_QUESTIONS, ALL_CODING_QUESTIONS } from '@/constants/quiz';
import MCQQuestion from '@/components/quiz/MCQQuestion';
import CodingQuestion from '@/components/quiz/CodingQuestion';
import { useQuiz } from '@/hooks/useQuiz';

const QuizScreen = () => {
  // Filter questions based on selected language from the hook
  const {
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
  } = useQuiz(
    ALL_MCQ_QUESTIONS.filter(q => q.language === selectedLanguage),
    ALL_CODING_QUESTIONS.filter(q => q.language === selectedLanguage)
  );
  
  // Get filtered questions
  const mcqQuestions = ALL_MCQ_QUESTIONS.filter(q => q.language === selectedLanguage);
  const codingQuestions = ALL_CODING_QUESTIONS.filter(q => q.language === selectedLanguage);
  
  const renderQuestion = () => {
    if (quizType === 'mcq') {
      const question = mcqQuestions[currentQuestionIndex];
      if (!question) return <p>No questions available for this language.</p>;
      
      return (
        <MCQQuestion
          question={question}
          currentIndex={currentQuestionIndex}
          selectedAnswer={selectedAnswers[question.id]}
          onSelectAnswer={handleMCQSelection}
          onNextQuestion={handleNextQuestion}
        />
      );
    } else {
      const question = codingQuestions[currentQuestionIndex];
      if (!question) return <p>No coding questions available for this language.</p>;
      
      return (
        <CodingQuestion
          question={question}
          currentIndex={currentQuestionIndex}
          code={codingAnswers[question.id] || ''}
          onCodeChange={handleCodingInput}
          onRunTests={handleRunTests}
          onNextQuestion={handleNextQuestion}
          isExecuting={isExecutingCode}
          testResults={testResults}
          isLastQuestion={currentQuestionIndex === codingQuestions.length - 1}
          showHints={showHints}
          onToggleHints={toggleHints}
          languageName={selectedLanguageName}
        />
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
