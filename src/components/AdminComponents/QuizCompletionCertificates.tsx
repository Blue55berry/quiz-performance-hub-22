
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Award, Loader2, RefreshCw, Clock, Trophy, FileCheck } from "lucide-react";

interface QuizCompletion {
  id: string;
  student_id: string;
  quiz_name: string;
  score: number;
  completed_at: string;
  studentName?: string;
  studentRollNumber?: string;
}

const QuizCompletionCertificates = () => {
  const { toast } = useToast();
  const [quizCompletions, setQuizCompletions] = useState<QuizCompletion[]>([]);
  const [filteredCompletions, setFilteredCompletions] = useState<QuizCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchQuizCompletions();
    
    const subscription = supabase
      .channel('quiz-completion-certificate-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quiz_completions' 
        }, 
        (payload) => {
          console.log('Quiz completion changes detected, refreshing data...', payload);
          fetchQuizCompletions();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Quiz Completed",
              description: "A student has completed a quiz and earned a certificate"
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchQuizCompletions = async () => {
    try {
      setIsLoading(true);
      
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_completions')
        .select('*')
        .gte('score', 70) // Only show completions with passing score
        .order('completed_at', { ascending: false });
        
      if (quizError) throw quizError;
      
      if (quizData) {
        const completionsWithStudentNames = await Promise.all(
          quizData.map(async (quiz) => {
            const { data: studentData } = await supabase
              .from('students')
              .select('name, roll_number')
              .eq('id', quiz.student_id)
              .single();
              
            return {
              ...quiz,
              studentName: studentData?.name || 'Unknown Student',
              studentRollNumber: studentData?.roll_number || 'N/A'
            };
          })
        );
        
        setQuizCompletions(completionsWithStudentNames);
        setFilteredCompletions(completionsWithStudentNames);
      }
    } catch (error) {
      console.error('Error fetching quiz completions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load quiz completion certificates."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCompletions(quizCompletions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = quizCompletions.filter(completion => 
        (completion.studentName?.toLowerCase().includes(query)) || 
        (completion.quiz_name?.toLowerCase().includes(query)) ||
        (completion.studentRollNumber?.toLowerCase().includes(query))
      );
      setFilteredCompletions(filtered);
    }
  }, [searchQuery, quizCompletions]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };
  
  const generateCertificate = (completion: QuizCompletion) => {
    toast({
      title: "Certificate Generated",
      description: `Certificate generated for ${completion.studentName}'s ${completion.quiz_name} completion.`
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Quiz Completion Certificates</h3>
        </div>
        <Button onClick={fetchQuizCompletions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by student name, quiz name, or roll number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading quiz completion certificates...</span>
        </div>
      ) : filteredCompletions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompletions.map((completion) => (
            <Card key={completion.id} className="overflow-hidden">
              <CardHeader className="bg-green-50 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{completion.quiz_name}</CardTitle>
                  <Badge className={`${getScoreColor(completion.score)}`}>
                    {completion.score}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Student: {completion.studentName}</p>
                <p className="text-xs text-gray-500">Roll: {completion.studentRollNumber}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-600 mb-3">
                  <div className="flex items-center mb-2">
                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                    <p>Completed on: {formatDate(completion.completed_at)}</p>
                  </div>
                  <div className="flex items-center mb-2">
                    <FileCheck className="mr-2 h-4 w-4 text-gray-400" />
                    <p>Score: {completion.score}% (Certificate Eligible)</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => generateCertificate(completion)}
                    className="w-full"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Generate Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No quiz completion certificates found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery 
              ? "No quiz completions match your search criteria" 
              : "No students have completed quizzes with passing scores yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizCompletionCertificates;
