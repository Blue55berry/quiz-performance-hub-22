
// Language IDs for Judge0
export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  'javascript': 63,
  'python': 71,
  'java': 62,
  'csharp': 51,
  'cpp': 54,
  'c': 50,
  'typescript': 74,
};

// All questions organized by language
export const ALL_MCQ_QUESTIONS = [
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
export const ALL_CODING_QUESTIONS = [
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
