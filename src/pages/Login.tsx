import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Type definitions
interface Student {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  password: string;
  created_at?: string;
  updated_at?: string;
  verified_email?: boolean;
  verification_token?: string | null;
}

// Student login schema
const studentLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Admin login schema
const adminLoginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Student registration schema
const studentRegistrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  roll_number: z.string().min(1, { message: "Roll number is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirm_password: z.string().min(6, { message: "Confirm password is required" }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

// Types for form data
type StudentLoginFormData = z.infer<typeof studentLoginSchema>;
type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
type StudentRegistrationFormData = z.infer<typeof studentRegistrationSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student-login");
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  
  // Student login form
  const studentLoginForm = useForm<StudentLoginFormData>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Admin login form
  const adminLoginForm = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Student registration form
  const studentRegistrationForm = useForm<StudentRegistrationFormData>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      roll_number: "",
      password: "",
      confirm_password: "",
    },
  });
  
  // Handle student login
  const handleStudentLogin = async (values: StudentLoginFormData) => {
    setIsLoading(true);
    try {
      // Validate student credentials
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', values.email)
        .eq('password', values.password); // Note: In production, use proper password hashing
      
      if (error) throw error;
      
      if (!students || students.length === 0) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password.",
        });
        return;
      }
      
      const student = students[0] as Student;
      
      // Check if email is verified
      if (student.verified_email === false) {
        setVerificationEmail(student.email);
        setActiveTab("verification");
        toast({
          variant: "destructive",
          title: "Email verification required",
          description: "Please verify your email before logging in.",
        });
        return;
      }
      
      // Store student info in localStorage
      localStorage.setItem('studentId', student.id);
      localStorage.setItem('studentName', student.name);
      localStorage.setItem('studentRollNumber', student.roll_number);
      localStorage.setItem('currentUserType', 'student');
      
      // Set app setting using type assertion to avoid TypeScript errors
      try {
        // Fix: Use type assertion to handle type conflict
        await supabase.rpc('set_app_setting', { 
          key: 'app.current_student_roll',
          value: student.roll_number
        } as any);
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
  const handleAdminLogin = async (values: AdminLoginFormData) => {
    setIsLoading(true);
    try {
      // Simplified admin authentication - in a real app, this would be more secure
      if (values.username === 'admin' && values.password === 'admin123') {
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
  
  // Handle student registration
  const handleStudentRegistration = async (values: StudentRegistrationFormData) => {
    setIsLoading(true);
    try {
      // Check if email or roll number already exists
      const { data: existingStudents, error: checkError } = await supabase
        .from('students')
        .select('email, roll_number')
        .or(`email.eq.${values.email},roll_number.eq.${values.roll_number}`);
      
      if (checkError) throw checkError;
      
      if (existingStudents && existingStudents.length > 0) {
        const emailExists = existingStudents.some(s => s.email === values.email);
        const rollExists = existingStudents.some(s => s.roll_number === values.roll_number);
        
        if (emailExists) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Email is already registered.",
          });
          return;
        }
        
        if (rollExists) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Roll number is already registered.",
          });
          return;
        }
      }
      
      // Generate a verification token
      const verificationToken = Math.random().toString(36).substring(2, 15) + 
                               Math.random().toString(36).substring(2, 15);
      
      // Create student data object with verification fields
      const studentData = {
        name: values.name,
        email: values.email,
        roll_number: values.roll_number,
        password: values.password,
        verified_email: false,
        verification_token: verificationToken
      };
      
      // Insert new student - use type assertion to bypass strict typing issues
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert([studentData as any])
        .select();
        
      if (insertError) {
        throw new Error(insertError.message);
      }
      
      // Set verification email and switch to verification tab
      setVerificationEmail(values.email);
      setActiveTab("verification");
      
      toast({
        title: "Registration successful",
        description: "Please check your email for verification instructions.",
      });
      
      // In a real app, you would send an email with the verification link
      console.log('Verification Link (for testing):', 
        `${window.location.origin}/login?token=${verificationToken}`);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verify email with token
  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    try {
      // Find student with the verification token
      const { data: students, error: findError } = await supabase
        .from('students')
        .select('*')
        .eq('verification_token', token);
        
      if (findError) throw findError;
      
      if (!students || students.length === 0) {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: "Invalid or expired verification token.",
        });
        return;
      }
      
      const student = students[0] as Student;
      
      // Update student to verified - use type assertion for update data
      const updateData = { 
        verified_email: true,
        verification_token: null // Clear the token after use
      };
      
      const { error: updateError } = await supabase
        .from('students')
        .update(updateData as any)
        .eq('id', student.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Switch to login tab
      setActiveTab("student-login");
      
      toast({
        title: "Email verified",
        description: "Your email has been verified. You can now log in.",
      });
      
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "An error occurred during email verification.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for verification token in URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-primary text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quiz Performance Hub</h1>
      </div>
      
      <main className="flex-1 container mx-auto p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="student-login">Student Login</TabsTrigger>
              <TabsTrigger value="admin-login">Admin Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Student Login Tab */}
            <TabsContent value="student-login">
              <Card>
                <CardHeader>
                  <CardTitle>Student Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your student dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={studentLoginForm.handleSubmit(handleStudentLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@example.com"
                        {...studentLoginForm.register("email")}
                      />
                      {studentLoginForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">{studentLoginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...studentLoginForm.register("password")}
                      />
                      {studentLoginForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">{studentLoginForm.formState.errors.password.message}</p>
                      )}
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
                <CardFooter className="flex justify-center">
                  <Button
                    variant="link"
                    onClick={() => setActiveTab("register")}
                  >
                    Don't have an account? Register
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Admin Login Tab */}
            <TabsContent value="admin-login">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Login</CardTitle>
                  <CardDescription>
                    Enter your administrator credentials.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={adminLoginForm.handleSubmit(handleAdminLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="admin"
                        {...adminLoginForm.register("username")}
                      />
                      {adminLoginForm.formState.errors.username && (
                        <p className="text-red-500 text-sm">{adminLoginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        {...adminLoginForm.register("password")}
                      />
                      {adminLoginForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">{adminLoginForm.formState.errors.password.message}</p>
                      )}
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
              </Card>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Student Registration</CardTitle>
                  <CardDescription>
                    Create a new student account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={studentRegistrationForm.handleSubmit(handleStudentRegistration)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        {...studentRegistrationForm.register("name")}
                      />
                      {studentRegistrationForm.formState.errors.name && (
                        <p className="text-red-500 text-sm">{studentRegistrationForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="student@example.com"
                        {...studentRegistrationForm.register("email")}
                      />
                      {studentRegistrationForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">{studentRegistrationForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roll-number">Roll Number</Label>
                      <Input
                        id="roll-number"
                        placeholder="STU001"
                        {...studentRegistrationForm.register("roll_number")}
                      />
                      {studentRegistrationForm.formState.errors.roll_number && (
                        <p className="text-red-500 text-sm">{studentRegistrationForm.formState.errors.roll_number.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        {...studentRegistrationForm.register("password")}
                      />
                      {studentRegistrationForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">{studentRegistrationForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        {...studentRegistrationForm.register("confirm_password")}
                      />
                      {studentRegistrationForm.formState.errors.confirm_password && (
                        <p className="text-red-500 text-sm">{studentRegistrationForm.formState.errors.confirm_password.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Registering..." : "Register"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button
                    variant="link"
                    onClick={() => setActiveTab("student-login")}
                  >
                    Already have an account? Login
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Verification Tab */}
            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <CardTitle>Email Verification</CardTitle>
                  <CardDescription>
                    Please check your email for verification instructions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Verification Required</AlertTitle>
                    <AlertDescription>
                      {verificationEmail ? (
                        <>
                          A verification email has been sent to <strong>{verificationEmail}</strong>.
                          Please check your inbox and click the verification link.
                        </>
                      ) : (
                        "Please verify your email address before logging in."
                      )}
                    </AlertDescription>
                  </Alert>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    For demonstration purposes, the verification link is output to the console:
                  </p>
                  
                  <Button
                    className="w-full"
                    onClick={() => setActiveTab("student-login")}
                  >
                    Return to Login
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Login;
