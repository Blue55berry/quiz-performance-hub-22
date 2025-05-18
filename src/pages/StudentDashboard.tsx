
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import LanguageSelector from '@/components/StudentComponents/LanguageSelector';
import CertificateUploader from '@/components/StudentComponents/CertificateUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Certificate {
  id: string;
  student_id: string;
  title: string | null;
  file_url: string | null;
  file_path: string | null;
  verified: boolean;
  created_at: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if student is logged in
    const studentName = localStorage.getItem('studentName');
    const storedStudentId = localStorage.getItem('studentId');
    
    if (!storedStudentId || !studentName) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to access the student dashboard.",
      });
      navigate('/login');
      return;
    }
    
    setUsername(studentName);
    setStudentId(storedStudentId);
    
    // Fetch student certificates
    const fetchCertificates = async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('student_id', storedStudentId) as { data: Certificate[] | null, error: any };
          
        if (error) throw error;
        
        setCertificates(data || []);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCertificates();
  }, [navigate, toast]);
  
  const handleSelectLanguage = (language: string) => {
    localStorage.setItem('selectedLanguage', language);
    navigate('/student/quiz');
  };

  const handleCertificateUploaded = async () => {
    // Refresh certificates list when a new one is uploaded
    if (studentId) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('student_id', studentId) as { data: Certificate[] | null, error: any };
        
        if (!error && data) {
          setCertificates(data);
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setIsLoading(false);
      }
    }
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
                <CertificateUploader studentId={studentId} onUploadComplete={handleCertificateUploaded} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Certificates</h3>
                {isLoading ? (
                  <p className="text-center py-4">Loading certificates...</p>
                ) : certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <Card key={cert.id} className="certificate-card">
                        <CardHeader>
                          <CardTitle className="text-xl">{cert.title || 'Uploaded Certificate'}</CardTitle>
                          <p className="text-gray-600 text-sm">
                            {cert.verified 
                              ? 'Verified ✓' 
                              : 'Pending Verification'}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-2">
                            Uploaded on {new Date(cert.created_at).toLocaleDateString()}
                          </p>
                          {cert.file_url && (
                            <div className="flex justify-center mt-4">
                              <a 
                                href={cert.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary underline"
                              >
                                View Certificate
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No certificates found. Upload one to get started!</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
