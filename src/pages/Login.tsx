
import { useState, useEffect } from 'react';
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
  const [studentId, setStudentId] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState<string>('');
  
  // Admin login states
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  
  // Login loading states
  const [isStudentLoggingIn, setIsStudentLoggingIn] = useState<boolean>(false);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // If admin is logged in, redirect to admin dashboard
        navigate('/admin/dashboard');
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStudentLoggingIn(true);
    
    try {
      if (!studentId.trim() || !studentPassword.trim()) {
        throw new Error('Please fill in all fields');
      }
      
      // Check if student exists in database
      const { data: existingStudent, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('roll_number', studentId)
        .maybeSingle();
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // If student doesn't exist or password doesn't match
      if (!existingStudent) {
        throw new Error('Student ID not found');
      }
      
      // Check if password matches
      if (existingStudent.password !== studentPassword) {
        throw new Error('Invalid password');
      }
      
      // Store student info in localStorage
      localStorage.setItem('studentName', existingStudent.name);
      localStorage.setItem('studentId', existingStudent.id);
      localStorage.setItem('studentRollNumber', existingStudent.roll_number);
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${existingStudent.name}!`
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
      
      // For testing purposes - hardcoded admin credentials
      // In a production environment, you would use proper authentication
      if (adminEmail === 'admin@example.com' && adminPassword === 'admin123') {
        // Set admin info in localStorage
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminName', 'Admin');
        
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the Admin Dashboard!"
        });
        
        navigate('/admin/dashboard');
        return;
      }
      
      // If hardcoded credentials don't match, try Supabase auth
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
                  Enter your credentials to access your quizzes and certificates.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleStudentLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Roll Number</Label>
                    <Input 
                      id="studentId" 
                      placeholder="Enter your roll number"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="studentPassword">Password</Label>
                    <Input 
                      id="studentPassword" 
                      type="password"
                      placeholder="Enter your password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
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
                    {isStudentLoggingIn ? "Logging in..." : "Login"}
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
                      placeholder="admin@example.com"
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
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* <div className="text-sm text-muted-foreground">
                    <p>Demo credentials:</p>
                    <p>Email: admin@example.com</p>
                    <p>Password: admin123</p>
                  </div> */}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isAdminLoggingIn}
                  >
                    {isAdminLoggingIn ? "Logging in..." : "Login"}
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
