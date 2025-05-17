
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import LanguageSelector from '@/components/StudentComponents/LanguageSelector';
import CertificateUploader from '@/components/StudentComponents/CertificateUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    // Check if student is logged in
    const studentName = localStorage.getItem('studentName');
    const studentId = localStorage.getItem('studentId');
    
    if (!studentId || !studentName) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to access the student dashboard.",
      });
      navigate('/student/login');
      return;
    }
    
    setUsername(studentName);
  }, [navigate, toast]);
  
  const handleSelectLanguage = (language: string) => {
    localStorage.setItem('selectedLanguage', language);
    navigate('/student/quiz');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="student" username={username} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
        
        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quiz">Take Quiz</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quiz" className="p-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <LanguageSelector onSelectLanguage={handleSelectLanguage} />
            </div>
          </TabsContent>
          
          <TabsContent value="certificates" className="p-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Your Certificates</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Upload New Certificate</h3>
                <CertificateUploader />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Earned Certificates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="certificate-container text-center">
                    <h4 className="text-xl font-bold">JavaScript Mastery</h4>
                    <p className="text-gray-600 mb-2">Awarded on May 15, 2025</p>
                    <div className="flex justify-center mt-4">
                      <button className="text-primary underline">View Certificate</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
