
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingDown, TrendingUp, Search, RefreshCw } from "lucide-react";

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
  const [filteredData, setFilteredData] = useState<StudentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'highToLow' | 'lowToHigh'>('highToLow');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  
  useEffect(() => {
    fetchStudentPerformance();
    
    // Subscribe to changes on the quiz_completions table
    const subscription = supabase
      .channel('quiz-completion-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quiz_completions' 
        }, 
        () => {
          console.log('Quiz completion changes detected, refreshing performance data...');
          fetchStudentPerformance();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchStudentPerformance = async () => {
    setIsLoading(true);
    try {
      // Fetch quiz completions data
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_completions')
        .select('*')
        .order('completed_at', { ascending: false });
        
      if (quizError) throw quizError;
      
      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, name, roll_number');
        
      if (studentError) throw studentError;
      
      // Process and combine the data
      const studentMap = new Map();
      const allLanguages = new Set<string>();
      
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
          lowestScore: 100,
          quizzes: [] // Track individual quizzes
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
          allLanguages.add(language);
          
          if (!student.languages.includes(language)) {
            student.languages.push(language);
          }
          
          // Track individual quiz details
          student.quizzes.push({
            name: quiz.quiz_name,
            score: quiz.score,
            date: quiz.completed_at
          });
          
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
            lowestScore: student.lowestScore === 100 && student.scores.length > 0 ? Math.min(...student.scores) : student.lowestScore,
            quizzes: student.quizzes
          };
        });
      
      // Sort by average score (default: high to low)
      performanceList.sort((a, b) => b.avgScore - a.avgScore);
      
      setPerformanceData(performanceList);
      setFilteredData(performanceList);
      setAvailableLanguages(Array.from(allLanguages));
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student performance data."
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStudentPerformance();
    toast({
      title: "Refreshing data",
      description: "Loading the latest student performance data."
    });
  };
  
  const handleSortChange = (sortDirection: 'highToLow' | 'lowToHigh') => {
    setSortBy(sortDirection);
    const sortedData = [...filteredData];
    
    if (sortDirection === 'highToLow') {
      sortedData.sort((a, b) => b.avgScore - a.avgScore);
    } else {
      sortedData.sort((a, b) => a.avgScore - b.avgScore);
    }
    
    setFilteredData(sortedData);
  };

  const applyFilters = () => {
    let filtered = [...performanceData];
    
    // Apply language filter
    if (filterLanguage !== 'all') {
      filtered = filtered.filter(student => 
        student.languages.includes(filterLanguage)
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.studentName.toLowerCase().includes(query) ||
        student.roll_number.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === 'highToLow') {
      filtered.sort((a, b) => b.avgScore - a.avgScore);
    } else {
      filtered.sort((a, b) => a.avgScore - b.avgScore);
    }
    
    setFilteredData(filtered);
  };
  
  // Apply filters when search, language or sort changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterLanguage, sortBy]);
  
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <div className="flex items-center">
          <h3 className="text-xl font-semibold mr-2">Student Performance Rankings</h3>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh data</span>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select 
            value={filterLanguage} 
            onValueChange={(value) => setFilterLanguage(value)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {availableLanguages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2">
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
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading performance data...</p>
        </div>
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
            {filteredData.length > 0 ? (
              filteredData.map((student, index) => (
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
                  {searchQuery || filterLanguage !== 'all' 
                    ? "No students match the current filters"
                    : "No student performance data available"}
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
