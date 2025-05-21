
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Student login states
  const [studentName, setStudentName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  
  // Admin login states
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  
  // Login loading states
  const [isStudentLoggingIn, setIsStudentLoggingIn] = useState<boolean>(false);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState<boolean>(false);
  
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStudentLoggingIn(true);
    
    try {
      if (!studentName.trim() || !studentId.trim()) {
        throw new Error('Please fill in all fields');
      }
      
      // Store student info in localStorage
      localStorage.setItem('studentName', studentName);
      localStorage.setItem('studentId', studentId);
      
      // Check if student exists in database, if not, create a new entry
      const { data: existingStudent, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // If student doesn't exist, create a new entry
      if (!existingStudent) {
        const { error: insertError } = await supabase
          .from('students')
          .insert([{ student_id: studentId, name: studentName }]);
          
        if (insertError) {
          throw new Error(insertError.message);
        }
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${studentName}!`
      });
      
      navigate('/student/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsStudentLoggingIn(false);
    }
  };
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminLoggingIn(true);
    
    try {
      if (!adminEmail.trim() || !adminPassword.trim()) {
        throw new Error('Please fill in all fields');
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome to the Admin Dashboard!"
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsAdminLoggingIn(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Login</CardTitle>
                <CardDescription>
                  Enter your information to access your quizzes and certificates.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleStudentLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Full Name</Label>
                    <Input 
                      id="studentName" 
                      placeholder="Enter your full name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input 
                      id="studentId" 
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isStudentLoggingIn}
                  >
                    {isStudentLoggingIn ? "Logging in..." : "Continue as Student"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access the admin dashboard.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleAdminLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input 
                      id="adminEmail" 
                      type="email" 
                      placeholder="Enter your email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input 
                      id="adminPassword" 
                      type="password" 
                      placeholder="Enter your password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isAdminLoggingIn}
                  >
                    {isAdminLoggingIn ? "Logging in..." : "Login as Admin"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
