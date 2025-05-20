
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student-login");
  
  // Student login state
  const [studentRollNumber, setStudentRollNumber] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Handle student login
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate student credentials
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('roll_number', studentRollNumber)
        .eq('password', studentPassword);
      
      if (error) throw error;
      
      if (!students || students.length === 0) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid roll number or password.",
        });
        setIsLoading(false);
        return;
      }
      
      const student = students[0];
      
      // Store student info in localStorage
      localStorage.setItem('studentId', student.id);
      localStorage.setItem('studentName', student.name);
      localStorage.setItem('studentRollNumber', student.roll_number);
      localStorage.setItem('currentUserType', 'student');
      
      // Set app setting
      try {
        // Use explicit typing to resolve the TypeScript error
        const settingParams: {
          key: string;
          value: string;
        } = { 
          key: 'app.current_student_roll',
          value: student.roll_number
        };
        
        await supabase.rpc('set_app_setting', settingParams);
      } catch (rpcError) {
        console.error('Error setting app setting:', rpcError);
        // Continue with login flow even if this fails
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${student.name}!`,
      });
      
      // Redirect to student dashboard
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Student login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simplified admin authentication
      if (adminEmail === 'admin@example.com' && adminPassword === 'admin123') {
        localStorage.setItem('adminName', 'Administrator');
        localStorage.setItem('currentUserType', 'admin');
        
        toast({
          title: "Admin login successful",
          description: "Welcome to the admin dashboard!",
        });
        
        navigate('/admin/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid admin credentials.",
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-primary text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quiz Performance Hub</h1>
      </div>
      
      <main className="flex-1 container mx-auto p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Access your account
              </CardDescription>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 mx-6">
                <TabsTrigger value="student-login">Student</TabsTrigger>
                <TabsTrigger value="admin-login">Administrator</TabsTrigger>
              </TabsList>
              
              {/* Student Login Tab */}
              <TabsContent value="student-login">
                <CardContent>
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="roll-number">Roll Number</Label>
                      <Input
                        id="roll-number"
                        placeholder="Enter your roll number"
                        value={studentRollNumber}
                        onChange={(e) => setStudentRollNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password</Label>
                      <Input
                        id="student-password"
                        type="password"
                        placeholder="Enter your password"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Student Login"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
              
              {/* Admin Login Tab */}
              <TabsContent value="admin-login">
                <CardContent>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
            
            <CardFooter className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;
