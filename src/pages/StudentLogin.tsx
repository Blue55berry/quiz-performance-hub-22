
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Navbar from '@/components/common/Navbar';
import { supabase } from '@/integrations/supabase/client';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if the student exists in our students table
      const { data: students, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();
      
      if (fetchError || !students) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
        });
        setIsLoading(false);
        return;
      }
      
      // Store student info in localStorage for the session
      localStorage.setItem('studentId', students.id);
      localStorage.setItem('studentName', students.name);
      localStorage.setItem('studentEmail', students.email);
      localStorage.setItem('studentRollNumber', students.roll_number);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${students.name}!`,
      });
      
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="none" />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Student Login</CardTitle>
            <CardDescription>
              Access your student dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email" 
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default StudentLogin;
