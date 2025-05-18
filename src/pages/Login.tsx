import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Navbar from '@/components/common/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, User, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Type definition for Student with the new fields
interface Student {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  password: string;
  created_at: string;
  updated_at: string;
  verified_email?: boolean;
  verification_token?: string;
}

// Form schemas
const studentLoginSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required"),
  password: z.string().min(1, "Password is required"),
});

const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const studentRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  rollNumber: z.string().min(3, "Roll number must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student");
  const [showRegister, setShowRegister] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Forms
  const studentLoginForm = useForm({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      rollNumber: "",
      password: "",
    },
  });

  const adminLoginForm = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const studentRegisterForm = useForm({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      rollNumber: "",
      password: "",
    },
  });

  // Handle student login
  const handleStudentLogin = async (values: z.infer<typeof studentLoginSchema>) => {
    setIsLoading(true);
    
    try {
      // Check if the student exists in our students table
      const { data: student, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('roll_number', values.rollNumber)
        .eq('password', values.password)
        .single();
      
      if (fetchError || !student) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid roll number or password. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      // Check if email is verified
      if (student.verified_email === false) {
        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please verify your email before logging in.",
        });
        setIsLoading(false);
        return;
      }
      
      // Store student info in localStorage for the session
      localStorage.setItem('studentId', student.id);
      localStorage.setItem('studentName', student.name);
      localStorage.setItem('studentEmail', student.email);
      localStorage.setItem('studentRollNumber', student.roll_number);
      localStorage.setItem('currentUserType', 'student');
      
      // Set the app.current_student_roll setting for RLS policies
      await supabase.rpc('set_app_setting', { 
        key: 'app.current_student_roll',
        value: student.roll_number
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${student.name}!`,
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

  // Handle admin login
  const handleAdminLogin = async (values: z.infer<typeof adminLoginSchema>) => {
    setIsLoading(true);
    
    // For demo purposes, we'll use a simple check
    // In a real app, this would be an API call
    setTimeout(() => {
      setIsLoading(false);
      
      if (values.email === 'admin@example.com' && values.password === 'admin123') {
        localStorage.setItem('currentUserType', 'admin');
        toast({
          title: "Login successful",
          description: "Welcome back, Administrator!",
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid admin credentials. Please try again.",
        });
      }
    }, 1000);
  };

  // Handle student registration
  const handleStudentRegister = async (values: z.infer<typeof studentRegisterSchema>) => {
    setIsLoading(true);
    
    try {
      // Check if student with this roll number already exists
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('id')
        .eq('roll_number', values.rollNumber)
        .maybeSingle();
        
      if (existingStudent) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "A student with this roll number already exists.",
        });
        setIsLoading(false);
        return;
      }
      
      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2, 15) + 
                               Math.random().toString(36).substring(2, 15);
      
      // Insert new student with the new fields
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert([{
          name: values.name,
          email: values.email,
          roll_number: values.rollNumber,
          password: values.password,
          verified_email: false,
          verification_token: verificationToken
        }])
        .select()
        .single();
        
      if (insertError) {
        throw new Error(insertError.message);
      }
      
      // In a real app, we would send an email with the verification link
      // For this demo, we'll show the verification token on screen
      
      setVerificationSent(true);
      
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      
      // Create a simulated verification link
      // In a real app, this would be sent via email
      console.log(`Verification link: ${window.location.origin}/verify?token=${verificationToken}`);
      
      // Reset the form
      studentRegisterForm.reset();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive", 
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification token
  const verifyEmail = async (token: string) => {
    try {
      // Find student with this token
      const { data: student, error: findError } = await supabase
        .from('students')
        .select('id')
        .eq('verification_token', token)
        .single();
        
      if (findError || !student) {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: "Invalid or expired verification token.",
        });
        return;
      }
      
      // Update student to verified
      const { error: updateError } = await supabase
        .from('students')
        .update({ 
          verified_email: true,
          verification_token: null // Clear the token after use
        })
        .eq('id', student.id);
        
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      toast({
        title: "Email verified",
        description: "Your email has been verified. You can now log in.",
      });
      
      // Switch back to login view
      setShowRegister(false);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };
  
  // Check for verification token in URL
  useState(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="none" />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {showRegister ? "Register as Student" : "Login"}
            </CardTitle>
            <CardDescription>
              {showRegister ? "Create your student account" : "Access your account"}
            </CardDescription>
          </CardHeader>
          
          {!showRegister ? (
            <Tabs 
              defaultValue="student" 
              value={activeTab}
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="admin">Administrator</TabsTrigger>
              </TabsList>
              
              <TabsContent value="student">
                <CardContent>
                  <Form {...studentLoginForm}>
                    <form onSubmit={studentLoginForm.handleSubmit(handleStudentLogin)} className="space-y-4">
                      <FormField
                        control={studentLoginForm.control}
                        name="rollNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Roll Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  {...field} 
                                  placeholder="Enter your roll number" 
                                  className="pl-10"
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={studentLoginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  {...field} 
                                  type="password" 
                                  placeholder="Enter your password"
                                  className="pl-10"
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Student Login"}
                      </Button>
                      <div className="text-center mt-4">
                        <Button 
                          variant="link" 
                          onClick={() => setShowRegister(true)}
                          type="button"
                          disabled={isLoading}
                        >
                          Don't have an account? Register here
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="admin">
                <CardContent>
                  <Form {...adminLoginForm}>
                    <form onSubmit={adminLoginForm.handleSubmit(handleAdminLogin)} className="space-y-4">
                      <FormField
                        control={adminLoginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  {...field} 
                                  type="email" 
                                  placeholder="admin@example.com"
                                  className="pl-10"
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={adminLoginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  {...field} 
                                  type="password"
                                  placeholder="Enter your password"
                                  className="pl-10"
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-purple-600 hover:bg-purple-700" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Admin Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>
            </Tabs>
          ) : (
            <CardContent>
              {verificationSent ? (
                <Alert className="mb-4">
                  <AlertDescription>
                    A verification email has been sent. Please check your email and click the verification link.
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setShowRegister(false);
                        setVerificationSent(false);
                      }}
                      className="block w-full mt-2"
                    >
                      Return to login
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <Form {...studentRegisterForm}>
                  <form onSubmit={studentRegisterForm.handleSubmit(handleStudentRegister)} className="space-y-4">
                    <FormField
                      control={studentRegisterForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                {...field} 
                                placeholder="Enter your full name"
                                className="pl-10"
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={studentRegisterForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                {...field} 
                                type="email" 
                                placeholder="Enter your email address"
                                className="pl-10"
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={studentRegisterForm.control}
                      name="rollNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roll Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your roll number"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={studentRegisterForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                {...field} 
                                type="password"
                                placeholder="Create a password"
                                className="pl-10"
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Registering..." : "Register"}
                    </Button>
                    <div className="text-center mt-4">
                      <Button 
                        variant="link" 
                        onClick={() => setShowRegister(false)}
                        type="button"
                        disabled={isLoading}
                      >
                        Already have an account? Login here
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          )}
          
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

export default Login;
