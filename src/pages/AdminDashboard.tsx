import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import StudentList from '@/components/AdminComponents/StudentList';
import StudentPerformanceList from '@/components/AdminComponents/StudentPerformanceList';
import PerformanceChart from '@/components/AdminComponents/PerformanceChart';
import CertificateViewer from '@/components/AdminComponents/CertificateViewer';
import { supabase } from '@/integrations/supabase/client';
import { File, FileCheck, User } from 'lucide-react';

interface QuizCompletion {
  id: string;
  student_id: string;
  quiz_name: string;
  score: number;
  completed_at: string;
  studentName?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Admin');
  const [totalStudents, setTotalStudents] = useState(0);
  const [recentCompletions, setRecentCompletions] = useState<QuizCompletion[]>([]);
  const [quizCompletionCount, setQuizCompletionCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if admin is logged in
    const checkAdminLogin = async () => {
      const { data } = await supabase.auth.getSession();
      const adminLoggedIn = localStorage.getItem('adminLoggedIn');
      
      if (!data.session && adminLoggedIn !== 'true') {
        navigate('/login');
      } else {
        // Set admin name if available
        const adminName = localStorage.getItem('adminName');
        if (adminName) {
          setUsername(adminName);
        }
      }
    };
    
    checkAdminLogin();
    fetchDashboardData();
  }, [navigate]);
  
  // Fetch data from database
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch student count
      const { count: studentCount, error: studentError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (studentError) throw studentError;
      setTotalStudents(studentCount || 0);
      
      // Fetch quiz completion count and average score
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_completions')
        .select('*');
      
      if (quizError) throw quizError;
      
      if (quizData) {
        setQuizCompletionCount(quizData.length);
        
        // Calculate average score
        if (quizData.length > 0) {
          const totalScore = quizData.reduce((sum, quiz) => sum + quiz.score, 0);
          setAverageScore(Math.round(totalScore / quizData.length));
        }
        
        // Get recent completions with student names
        const recentQuizzes = await Promise.all(
          quizData
            .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
            .slice(0, 5)
            .map(async (quiz) => {
              const { data: studentData } = await supabase
                .from('students')
                .select('name')
                .eq('id', quiz.student_id)
                .single();
              
              return {
                ...quiz,
                studentName: studentData?.name || 'Unknown Student'
              };
            })
        );
        
        setRecentCompletions(recentQuizzes);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prepare chart data based on database values
  const getCompletionData = () => {
    // In a real app, you would calculate these values from actual data
    // For now, let's use example values with the real quiz count
    const total = totalStudents;
    const completed = quizCompletionCount;
    const inProgress = Math.round(total * 0.2); // Just an example value
    const notStarted = total - completed - inProgress;
    
    return [
      { name: 'Completed', value: completed > 0 ? completed : 1, color: '#4ade80' },
      { name: 'In Progress', value: inProgress > 0 ? inProgress : 1, color: '#facc15' },
      { name: 'Not Started', value: notStarted > 0 ? notStarted : 1, color: '#f87171' }
    ];
  };
  
  const getSuccessData = () => {
    // Let's consider scores >= 70 as passing
    // In a real app, you would calculate these from actual data
    const passing = averageScore >= 70 ? 72 : 28;
    const failing = 100 - passing;
    
    return [
      { name: 'Pass', value: passing, color: '#8b5cf6' },
      { name: 'Fail', value: failing, color: '#f87171' }
    ];
  };
  
  // We'll still use mock language data since we don't track that in the db yet
  const languageData = [
    { name: 'JavaScript', value: 42, color: '#facc15' },
    { name: 'Python', value: 28, color: '#3b82f6' },
    { name: 'Java', value: 18, color: '#f97316' },
    { name: 'C#', value: 12, color: '#8b5cf6' }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="admin" username={username} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center mb-2">
              <FileCheck className="h-6 w-6 text-primary mr-2" />
              <div className="text-2xl font-bold">{quizCompletionCount}</div>
            </div>
            <div className="text-gray-500 text-sm">Quizzes Completed</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center mb-2">
              <File className="h-6 w-6 text-primary mr-2" />
              <div className="text-2xl font-bold">{averageScore}%</div>
            </div>
            <div className="text-gray-500 text-sm">Average Score</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center mb-2">
              <User className="h-6 w-6 text-primary mr-2" />
              <div className="text-2xl font-bold">{totalStudents}</div>
            </div>
            <div className="text-gray-500 text-sm">Registered Students</div>
          </Card>
        </div>

        {/* Recent Completions Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Quiz Completions</h2>
          
          {isLoading ? (
            <p className="text-center py-4">Loading recent completions...</p>
          ) : recentCompletions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 text-sm font-medium">Student</th>
                    <th className="text-left p-3 text-sm font-medium">Quiz</th>
                    <th className="text-left p-3 text-sm font-medium">Score</th>
                    <th className="text-left p-3 text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentCompletions.map((completion) => (
                    <tr key={completion.id} className="hover:bg-gray-50">
                      <td className="p-3">{completion.studentName}</td>
                      <td className="p-3">{completion.quiz_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          completion.score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {completion.score}%
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">
                        {new Date(completion.completed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No quiz completions found.</p>
          )}
        </div>
        
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="performance">Student Performance</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students">
            <StudentList />
          </TabsContent>
          
          <TabsContent value="performance">
            <StudentPerformanceList />
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PerformanceChart 
                title="Quiz Completion Rates" 
                data={getCompletionData()}
              />
              <PerformanceChart 
                title="Success Rates" 
                data={getSuccessData()}
              />
              <PerformanceChart 
                title="Preferred Languages" 
                data={languageData}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="certificates">
            <CertificateViewer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
