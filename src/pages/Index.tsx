
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/common/Navbar';

const Index = () => {
  const navigate = useNavigate();
  const [hoverAdmin, setHoverAdmin] = useState(false);
  const [hoverStudent, setHoverStudent] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="none" />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full mx-auto animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Quiz Performance Hub
            </h1>
            <p className="text-xl text-gray-600">
              Interactive learning platform for students and administrators
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card 
              className={`transition-all duration-300 ${hoverAdmin ? 'shadow-xl transform -translate-y-1' : 'shadow'}`}
              onMouseEnter={() => setHoverAdmin(true)}
              onMouseLeave={() => setHoverAdmin(false)}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary">Administrator</CardTitle>
                <CardDescription>Manage students and monitor performance</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button className="w-full" onClick={() => navigate('/admin/login')}>Admin Login</Button>
              </CardFooter>
            </Card>
            
            <Card 
              className={`transition-all duration-300 ${hoverStudent ? 'shadow-xl transform -translate-y-1' : 'shadow'}`}
              onMouseEnter={() => setHoverStudent(true)}
              onMouseLeave={() => setHoverStudent(false)}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary">Student</CardTitle>
                <CardDescription>Take quizzes and earn certificates</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button className="w-full" onClick={() => navigate('/student/login')}>Student Login</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Quiz Performance Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
