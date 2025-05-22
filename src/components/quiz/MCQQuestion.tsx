
import React from 'react';
import { Button } from "@/components/ui/button";
import { MCQuestion } from '@/types/quiz';

interface MCQQuestionProps {
  question: MCQuestion;
  currentIndex: number;
  selectedAnswer: string | undefined;
  onSelectAnswer: (questionId: number, optionId: string) => void;
  onNextQuestion: () => void;
}

const MCQQuestion: React.FC<MCQQuestionProps> = ({
  question,
  currentIndex,
  selectedAnswer,
  onSelectAnswer,
  onNextQuestion
}) => {
  return (
    <div className="quiz-card bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Question {currentIndex + 1}</h3>
      <div className="mb-6 text-lg bg-gray-50 p-4 rounded-md border border-gray-100">
        {question.text}
      </div>
      
      <div className="space-y-3">
        {question.options.map((option) => (
          <label 
            key={option.id}
            className={`flex items-center p-3 border rounded-md cursor-pointer transition-all ${
              selectedAnswer === option.id 
                ? 'bg-primary/10 border-primary' 
                : 'hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={selectedAnswer === option.id}
              onChange={() => onSelectAnswer(question.id, option.id)}
              className="mr-2"
            />
            <span className="font-medium">{option.id.toUpperCase()}.</span>
            <span className="ml-2">{option.text}</span>
          </label>
        ))}
      </div>
      
      {/* Only show if an answer was selected but don't reveal the correct answer */}
      {selectedAnswer && (
        <div className="mt-4">
          <Button 
            onClick={onNextQuestion}
            className="w-full"
          >
            Next Question
          </Button>
        </div>
      )}
    </div>
  );
};

export default MCQQuestion;
