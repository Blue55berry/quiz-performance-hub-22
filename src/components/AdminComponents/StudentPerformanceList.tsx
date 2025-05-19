
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

interface StudentPerformance {
  id: string;
  studentName: string;
  roll_number: string;
  avgScore: number;
  completedQuizzes: number;
}

const StudentPerformanceList = () => {
  const { toast } = useToast();
  const [performanceData, setPerformanceData] = useState<StudentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
          avgScore: 0
        });
      });
      
      // Add quiz data to each student
      quizData.forEach(quiz => {
        if (studentMap.has(quiz.student_id)) {
          const student = studentMap.get(quiz.student_id);
          student.scores.push(quiz.score);
          student.completedQuizzes += 1;
        }
      });
      
      // Calculate average scores and format data
      const performanceList = Array.from(studentMap.values()).map(student => {
        const totalScore = student.scores.reduce((sum: number, score: number) => sum + score, 0);
        const avgScore = student.scores.length > 0 ? Math.round(totalScore / student.scores.length) : 0;
        
        return {
          id: student.id,
          studentName: student.studentName,
          roll_number: student.roll_number,
          avgScore: avgScore,
          completedQuizzes: student.completedQuizzes
        };
      });
      
      // Filter to only show students with 80% or higher average scores
      const highPerformers = performanceList.filter(student => student.avgScore >= 80);
      
      // Sort by average score in descending order
      highPerformers.sort((a, b) => b.avgScore - a.avgScore);
      
      setPerformanceData(highPerformers);
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
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Top Performing Students (80%+ Average)</h3>
      
      {isLoading ? (
        <div className="text-center py-4">Loading performance data...</div>
      ) : (
        <Table>
          <TableCaption>Student performance ranked by average score (80% and above)</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Average Score</TableHead>
              <TableHead>Quizzes Completed</TableHead>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.avgScore >= 90 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {student.avgScore}%
                    </span>
                  </TableCell>
                  <TableCell>{student.completedQuizzes}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Certificate Eligible
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No students have achieved 80% or higher average scores yet
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
