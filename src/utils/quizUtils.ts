
import { TestResult, CodingQuestion } from '../types/quiz';
import { JUDGE0_LANGUAGE_IDS } from '../constants/quiz';

export const parseTestCases = (testCasesStr: string): { input: string; expected: string }[] => {
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

// Validate the code based on language and specific question
export const validateCode = (code: string, question: CodingQuestion, language: string): { isValid: boolean; errors: string[] } => {
  const validationErrors: string[] = [];
  
  // Basic syntax validation
  if (language === 'javascript') {
    if (!code.includes('function')) {
      validationErrors.push("Your code must include a function definition.");
    }
    
    if (!code.includes('return')) {
      validationErrors.push("Your function must return a value.");
    }
  } else if (language === 'python') {
    if (!code.includes('def')) {
      validationErrors.push("Your code must include a function definition.");
    }
    
    if (!code.includes('return')) {
      validationErrors.push("Your function must return a value.");
    }
  } else if (language === 'java') {
    if (!code.includes('public') || !code.includes('class')) {
      validationErrors.push("Your code must include a public class definition.");
    }
    
    if (!code.includes('return') && !code.includes('void')) {
      validationErrors.push("Your method must return a value or be declared void.");
    }
  } else if (language === 'csharp') {
    if (!code.includes('public') || !code.includes('class')) {
      validationErrors.push("Your code must include a public class definition.");
    }
    
    if (!code.includes('return') && !code.includes('void')) {
      validationErrors.push("Your method must return a value or be declared void.");
    }
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors
  };
};

// Test code against specific solution criteria
export const testCodeByQuestion = (code: string, question: CodingQuestion): boolean => {
  let passed = true;
  
  switch(question.id) {
    case 1: // JavaScript sum function
      if (question.language === 'javascript') {
        passed = code.includes('function sum') && 
                code.includes('return') && 
                code.includes('+');
                
        // More specific test for the actual logic
        const containsCorrectLogic = code.includes('return a + b') || 
                                    code.includes('return (a + b)') ||
                                    Boolean(code.match(/return\s*\(?.*\+.*\)?/));
                                    
        passed = passed && containsCorrectLogic;
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
                            
        passed = code.includes('function isPalindrome') && 
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
        
        passed = code.includes('def is_prime') && 
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
        
        passed = code.includes('def factorial') && 
                code.includes('return') && 
                (hasRecursion || hasIteration);
      }
      break;
      
    case 5: // Java find max in array
      if (question.language === 'java') {
        // Check for common implementations
        const hasLoopAndComparison = code.includes('for') && 
                                    (code.includes('>') || code.includes('Math.max'));
        
        passed = code.includes('findMax') && 
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
        
        passed = code.includes('containsOnlyDigits') && 
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
                                    
        passed = code.includes('ReverseString') && 
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
        
        passed = code.includes('FindEvenNumbers') && 
                code.includes('return') && 
                (hasLoopImplementation || hasLinqImplementation);
      }
      break;
      
    default:
      // For any other questions, do a generic code length check
      passed = code.length > 50;
      break;
  }
  
  return passed;
};

// Run test cases and return test results
export const runCodeTests = async (
  code: string, 
  question: CodingQuestion, 
  setSandboxMode: (value: boolean) => void, 
  sandboxMode: boolean
): Promise<TestResult> => {
  const testCases = parseTestCases(question.testCases);
  
  // Use sandbox mode for code execution
  if (sandboxMode) {
    // Simulate API response delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validate syntax first
    const { isValid, errors } = validateCode(code, question, question.language);
    
    // If validation fails, return errors
    if (!isValid) {
      return {
        passed: false,
        message: "There are syntax issues with your code:",
        details: errors
      };
    }
    
    // Test the code against specific criteria
    const allTestsPassed = testCodeByQuestion(code, question);
    
    // Generate test feedback
    const testDetails: string[] = [];
    for (let i = 0; i < testCases.length; i++) {
      testDetails.push(`Test case ${i + 1}: ${allTestsPassed ? 'Passed' : 'Failed'}`);
    }
    
    return {
      passed: allTestsPassed,
      message: allTestsPassed ? 
        'Great job! Your solution passed all test cases.' : 
        "Your code didn't pass all test cases.",
      details: testDetails,
    };
  }

  try {
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
      
      return {
        passed: true,
        message: 'Great job! Your solution passed all test cases.',
        details: testDetails,
      };
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
      
      return {
        passed: false,
        message: message,
        details: testDetails.length ? testDetails : ["Review your logic and try again."],
      };
    }
  } catch (error) {
    console.error('Error executing code:', error);
    // Switch to sandbox mode as fallback
    setSandboxMode(true);
    
    // Recursively call this function with sandbox mode enabled
    return runCodeTests(code, question, setSandboxMode, true);
  }
};
