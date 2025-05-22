
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileCheck, Loader2, TestTube } from "lucide-react";
import { CodingQuestion as CodingQuestionType, TestResult } from '@/types/quiz';

interface CodingQuestionProps {
  question: CodingQuestionType;
  currentIndex: number;
  code: string;
  onCodeChange: (questionId: number, code: string) => void;
  onRunTests: (code: string, question: CodingQuestionType) => void;
  onNextQuestion: () => void;
  isExecuting: boolean;
  testResults: TestResult | null;
  isLastQuestion: boolean;
  showHints: boolean;
  onToggleHints: () => void;
  languageName: string;
}

const CodingQuestion: React.FC<CodingQuestionProps> = ({
  question,
  currentIndex,
  code,
  onCodeChange,
  onRunTests,
  onNextQuestion,
  isExecuting,
  testResults,
  isLastQuestion,
  showHints,
  onToggleHints,
  languageName
}) => {
  // Helper function for language-specific hints
  const getLanguageSpecificHints = (): JSX.Element => {
    switch(question.language) {
      case 'java':
        if (question.id === 5) {
          return (
            <ul className="list-disc pl-5 text-sm">
              <li>Initialize max with the first element of the array</li>
              <li>Loop through the array starting from index 1</li>
              <li>Compare each element with max and update if necessary</li>
              <li>Remember to check for edge cases like empty arrays</li>
            </ul>
          );
        } else if (question.id === 6) {
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
        if (question.id === 7) {
          return (
            <ul className="list-disc pl-5 text-sm">
              <li>Convert the string to a character array using ToCharArray()</li>
              <li>Use a two-pointer approach (one at the start, one at the end)</li>
              <li>Swap characters as the pointers move toward each other</li>
              <li>Create a new string from the final char array</li>
            </ul>
          );
        } else if (question.id === 8) {
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

  return (
    <div className="quiz-card bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Coding Challenge {currentIndex + 1}</h3>
        <div className="text-sm font-medium text-gray-500">
          Language: {languageName}
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
          value={code || question.starterCode}
          onChange={(e) => onCodeChange(question.id, e.target.value)}
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
        <Button variant="outline" onClick={onToggleHints} className="text-sm">
          {showHints ? "Hide Hints" : "Show Hints"}
        </Button>
        
        {showHints && (
          <div className="mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
            <h4 className="text-sm font-semibold mb-1">Problem Approach:</h4>
            {getLanguageSpecificHints()}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={() => onRunTests(code || question.starterCode, question)}
          disabled={isExecuting || !code}
          className="flex items-center"
        >
          {isExecuting ? (
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
          onClick={onNextQuestion}
          disabled={!testResults?.passed}
        >
          {!isLastQuestion ? "Next Question" : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
};

export default CodingQuestion;
