
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingDown, TrendingUp } from "lucide-react";

interface StudentPerformance {
  id: string;
  studentName: string;
  roll_number: string;
  avgScore: number;
  completedQuizzes: number;
  languages: string[];
  highestScore: number;
  lowestScore: number;
}

const StudentPerformanceList = () => {
  const { toast } = useToast();
  const [performanceData, setPerformanceData] = useState<StudentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'highToLow' | 'lowToHigh'>('highToLow');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  
  useEffect(() => {
    fetchStudentPerformance();
  }, []);
  
  const fetchStudentPerformance = async () => {
    setIsLoading(true);
    try {
      // Fetch quiz completions data
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_completions')
        .select('*');
        
      if (quizError) throw quizError;
      
      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, name, roll_number');
        
      if (studentError) throw studentError;
      
      // Process and combine the data
      const studentMap = new Map();
      
      // Initialize student map with all students
      studentData.forEach(student => {
        studentMap.set(student.id, {
          id: student.id,
          studentName: student.name,
          roll_number: student.roll_number,
          scores: [],
          completedQuizzes: 0,
          languages: [],
          avgScore: 0,
          highestScore: 0,
          lowestScore: 100
        });
      });
      
      // Add quiz data to each student
      quizData.forEach(quiz => {
        if (studentMap.has(quiz.student_id)) {
          const student = studentMap.get(quiz.student_id);
          student.scores.push(quiz.score);
          student.completedQuizzes += 1;
          
          // Extract language from quiz name (e.g., "JavaScript Quiz" -> "JavaScript")
          const language = quiz.quiz_name.split(' ')[0];
          if (!student.languages.includes(language)) {
            student.languages.push(language);
          }
          
          // Track highest and lowest scores
          if (quiz.score > student.highestScore) {
            student.highestScore = quiz.score;
          }
          if (quiz.score < student.lowestScore) {
            student.lowestScore = quiz.score;
          }
        }
      });
      
      // Calculate average scores and format data
      const performanceList = Array.from(studentMap.values())
        .filter(student => student.scores.length > 0) // Only include students with quiz attempts
        .map(student => {
          const totalScore = student.scores.reduce((sum: number, score: number) => sum + score, 0);
          const avgScore = student.scores.length > 0 ? Math.round(totalScore / student.scores.length) : 0;
          
          return {
            id: student.id,
            studentName: student.studentName,
            roll_number: student.roll_number,
            avgScore: avgScore,
            completedQuizzes: student.completedQuizzes,
            languages: student.languages,
            highestScore: student.highestScore,
            lowestScore: student.lowestScore === 100 && student.scores.length > 0 ? Math.min(...student.scores) : student.lowestScore
          };
        });
      
      // Sort by average score (default: high to low)
      performanceList.sort((a, b) => b.avgScore - a.avgScore);
      
      setPerformanceData(performanceList);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student performance data."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSortChange = (sortDirection: 'highToLow' | 'lowToHigh') => {
    setSortBy(sortDirection);
    const sortedData = [...performanceData];
    
    if (sortDirection === 'highToLow') {
      sortedData.sort((a, b) => b.avgScore - a.avgScore);
    } else {
      sortedData.sort((a, b) => a.avgScore - b.avgScore);
    }
    
    setPerformanceData(sortedData);
  };

  const handleLanguageFilter = (language: string) => {
    setFilterLanguage(language);
    fetchStudentPerformance().then(() => {
      if (language !== 'all') {
        const filteredData = performanceData.filter(student => 
          student.languages.includes(language)
        );
        setPerformanceData(filteredData);
      }
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Award className="inline-block w-4 h-4 mr-1 text-yellow-600" />;
    if (score >= 80) return <TrendingUp className="inline-block w-4 h-4 mr-1 text-blue-600" />;
    if (score >= 70) return null;
    return <TrendingDown className="inline-block w-4 h-4 mr-1 text-red-600" />;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Student Performance Rankings</h3>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Button 
            size="sm" 
            variant={sortBy === 'highToLow' ? 'default' : 'outline'}
            onClick={() => handleSortChange('highToLow')}
          >
            Highest First
          </Button>
          <Button 
            size="sm" 
            variant={sortBy === 'lowToHigh' ? 'default' : 'outline'}
            onClick={() => handleSortChange('lowToHigh')}
          >
            Lowest First
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading performance data...</div>
      ) : (
        <Table>
          <TableCaption>Student performance ranked by average score</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Highest</TableHead>
              <TableHead>Quizzes Completed</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performanceData.length > 0 ? (
              performanceData.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell>{student.studentName}</TableCell>
                  <TableCell>{student.roll_number}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(student.avgScore)}`}>
                      {getScoreBadge(student.avgScore)}{student.avgScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(student.highestScore)}`}>
                      {student.highestScore}%
                    </span>
                  </TableCell>
                  <TableCell>{student.completedQuizzes}</TableCell>
                  <TableCell>
                    {student.languages.map(lang => (
                      <Badge key={lang} variant="outline" className="mr-1 mb-1">
                        {lang}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    {student.avgScore >= 80 ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Certificate Eligible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        In Progress
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No student performance data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default StudentPerformanceList;
