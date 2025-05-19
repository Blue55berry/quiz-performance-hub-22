
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Award, FileCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CertificateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateData, setCertificateData] = useState({
    name: "",
    course: "",
    score: "",
    date: "",
    id: id || ""
  });
  
  useEffect(() => {
    // Check if we have certificate data passed via location state
    if (location.state) {
      const { studentName, language, score, date } = location.state as any;
      
      setCertificateData({
        name: studentName || "Student",
        course: `${language} Quiz Mastery`,
        score: `${score}%`,
        date: date || new Date().toLocaleDateString(),
        id: id || Date.now().toString()
      });
      
      setIsLoading(false);
    } else {
      // If no data passed through state, try to fetch it
      const fetchCertificateData = async () => {
        try {
          setIsLoading(true);
          // Get current user info
          const studentName = localStorage.getItem('studentName');
          const studentId = localStorage.getItem('studentId');
          
          if (!studentName || !studentId) {
            toast({
              variant: "destructive",
              title: "Authentication required",
              description: "Please login to view certificates.",
            });
            navigate('/login');
            return;
          }
          
          // Try to fetch quiz completion data
          const { data, error } = await supabase
            .from('quiz_completions')
            .select('*')
            .eq('student_id', studentId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();
          
          if (error) {
            console.error('Error fetching certificate data:', error);
            // Use placeholder data if we can't fetch the real data
            setCertificateData({
              name: studentName,
              course: "Quiz Completion",
              score: "N/A",
              date: new Date().toLocaleDateString(),
              id: id || "N/A"
            });
          } else if (data) {
            setCertificateData({
              name: studentName,
              course: data.quiz_name,
              score: `${data.score}%`,
              date: new Date(data.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              id: id || data.id
            });
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCertificateData();
    }
  }, [id, navigate, location.state, toast]);
  
  const handleDownload = () => {
    // In a real app, this would generate a PDF
    toast({
      title: "Certificate download started",
      description: "Your certificate is being prepared for download."
    });
  };

  const handleSaveCertificate = async () => {
    try {
      setIsGenerating(true);
      const studentId = localStorage.getItem('studentId');
      
      if (!studentId) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please login to save certificates.",
        });
        navigate('/login');
        return;
      }
      
      // In a real app, we'd generate a PDF and save its URL
      // For now, we'll just save the certificate metadata
      const { error } = await supabase
        .from('certificates')
        .insert({
          student_id: studentId,
          title: certificateData.course,
          file_url: null, // In a real app, this would be the URL to the generated PDF
          verified: false
        });
      
      if (error) throw error;
      
      toast({
        title: "Certificate saved",
        description: "Your certificate has been saved to your account.",
      });
      
      // Redirect to student dashboard after a short delay
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save certificate. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleBack = () => {
    navigate('/student/dashboard');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar userType="student" username={certificateData.name} />
        <main className="flex-1 container mx-auto p-4 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Loading your certificate...</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="student" username={certificateData.name} />
      
      <main className="flex-1 container mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Certificate</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleBack}>Back to Dashboard</Button>
            <Button onClick={handleDownload}>Download PDF</Button>
            <Button onClick={handleSaveCertificate} disabled={isGenerating}>
              {isGenerating ? "Saving..." : "Save to My Certificates"}
            </Button>
          </div>
        </div>
        
        <div className="bg-white border-8 border-primary/20 rounded-lg p-8 mx-auto max-w-3xl shadow-lg">
          <div className="text-center relative">
            {/* Decorative element */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary opacity-30"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary opacity-30"></div>
            
            <div className="mb-6">
              <div className="flex justify-center mb-2">
                <Award className="h-12 w-12 text-primary"/>
              </div>
              <h2 className="text-3xl font-bold text-primary mb-1">Certificate of Completion</h2>
              <p className="text-gray-500">Quiz Performance Hub</p>
            </div>
            
            <p className="mb-6 text-lg">This certifies that</p>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{certificateData.name}</h2>
            <p className="mb-8 text-lg">has successfully completed</p>
            <h3 className="text-2xl font-bold mb-2 text-primary">{certificateData.course}</h3>
            <p className="mb-8">with a score of <span className="font-bold">{certificateData.score}</span></p>
            
            <div className="mt-12 flex justify-between items-center">
              <div className="text-left">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">{certificateData.date}</p>
              </div>
              
              <div className="text-center">
                <div className="h-px w-40 bg-gray-300 mx-auto mb-2"></div>
                <p className="text-sm">Quiz Performance Hub</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Certificate ID</p>
                <p className="font-semibold">{certificateData.id}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CertificateView;
