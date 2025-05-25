
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/common/Navbar';
import { Users, Bell } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [hoverAdmin, setHoverAdmin] = useState(false);
  const [hoverStudent, setHoverStudent] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="none" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full mx-auto animate-fade-in text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Student Assessment Selection Portal
          </h1>
          <p className="text-xl text-gray-600">
            Interactive learning platform for students and administrators
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mt-8 w-full max-w-4xl">
          <Card 
            className={`transition-all duration-300 ${hoverAdmin ? 'shadow-xl transform -translate-y-1' : 'shadow'}`}
            onMouseEnter={() => setHoverAdmin(true)}
            onMouseLeave={() => setHoverAdmin(false)}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-purple-600">Administrator</CardTitle>
              <CardDescription>Manage students and monitor performance</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-16 w-16 text-purple-600" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </CardFooter>
          </Card>
          
          <Card 
            className={`transition-all duration-300 ${hoverStudent ? 'shadow-xl transform -translate-y-1' : 'shadow'}`}
            onMouseEnter={() => setHoverStudent(true)}
            onMouseLeave={() => setHoverStudent(false)}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-purple-600">Student</CardTitle>
              <CardDescription>Take quizzes and earn certificates</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
                <Bell className="h-16 w-16 text-purple-600" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Quiz Performance SASP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
