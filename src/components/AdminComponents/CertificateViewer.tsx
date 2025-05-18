
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Certificate {
  id: string;
  student_id: string;
  title: string | null;
  file_url: string | null;
  verified: boolean;
  created_at: string;
  studentName?: string;
}

const CertificateViewer = () => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchCertificates();
  }, []);
  
  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      // Fetch certificates
      const { data: certificateData, error } = await supabase
        .from('certificates')
        .select('*') as { data: Certificate[] | null, error: any };
      
      if (error) throw error;
      
      // For each certificate, we need to get the student name
      const certificatesWithStudentNames = await Promise.all((certificateData || []).map(async (cert) => {
        const { data: studentData } = await supabase
          .from('students')
          .select('name')
          .eq('id', cert.student_id)
          .single();
          
        return {
          ...cert,
          studentName: studentData?.name || 'Unknown Student'
        };
      }));
      
      setCertificates(certificatesWithStudentNames);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load certificates. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewCertificate = (certId: string) => {
    setSelectedCertificate(selectedCertificate === certId ? null : certId);
  };
  
  const handleVerifyCertificate = async (certId: string) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ verified: true } as any)
        .eq('id', certId);
        
      if (error) throw error;
      
      // Update local state
      setCertificates(certificates.map(cert => 
        cert.id === certId ? { ...cert, verified: true } : cert
      ));
      
      toast({
        title: "Certificate Verified",
        description: "The certificate has been successfully verified.",
      });
    } catch (error) {
      console.error('Error verifying certificate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify certificate. Please try again.",
      });
    }
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading certificates...</div>;
  }
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Student Certificates</h3>
      
      {certificates.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No certificates found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h4 className="font-medium">{cert.studentName}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{new Date(cert.created_at).toLocaleDateString()}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      <span>{cert.title || 'Uploaded Certificate'}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        cert.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cert.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!cert.verified && (
                      <Button size="sm" onClick={() => handleVerifyCertificate(cert.id)}>
                        Verify
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewCertificate(cert.id)}
                    >
                      {selectedCertificate === cert.id ? 'Hide' : 'View'}
                    </Button>
                  </div>
                </div>
                
                {selectedCertificate === cert.id && (
                  <div className="p-4 bg-muted/50 animate-fade-in">
                    <div className="bg-white p-4 rounded-md mb-3">
                      {cert.file_url ? (
                        <div className="flex flex-col items-center">
                          {cert.file_url.endsWith('.pdf') ? (
                            <p className="text-center mb-3">PDF Certificate</p>
                          ) : (
                            <img 
                              src={cert.file_url} 
                              alt="Certificate" 
                              className="max-h-60 object-contain mb-3"
                            />
                          )}
                          <a 
                            href={cert.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary underline text-sm"
                          >
                            Open in new tab
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center">No preview available</p>
                      )}
                    </div>
                    <div className="flex space-x-2 justify-end">
                      {!cert.verified && (
                        <Button size="sm" onClick={() => handleVerifyCertificate(cert.id)}>
                          Verify Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateViewer;
