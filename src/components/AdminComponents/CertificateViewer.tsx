
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Certificate {
  id: string;
  studentName: string;
  type: 'automatic' | 'uploaded';
  language?: string;
  score?: string;
  date: string;
}

const CertificateViewer = () => {
  const { toast } = useToast();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  
  const certificates: Certificate[] = [
    {
      id: 'cert-1',
      studentName: 'John Doe',
      type: 'automatic',
      language: 'JavaScript',
      score: '85%',
      date: '2025-05-16'
    },
    {
      id: 'cert-2',
      studentName: 'Jane Smith',
      type: 'automatic',
      language: 'Python',
      score: '92%',
      date: '2025-05-15'
    },
    {
      id: 'cert-3',
      studentName: 'Robert Johnson',
      type: 'uploaded',
      date: '2025-05-14'
    }
  ];
  
  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
  };
  
  const handleVerifyCertificate = (cert: Certificate) => {
    toast({
      title: "Certificate Verified",
      description: `Certificate for ${cert.studentName} has been verified.`,
    });
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Recent Certificates</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {certificates.map((cert) => (
          <Card key={cert.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h4 className="font-medium">{cert.studentName}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{cert.date}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    <span>{cert.type === 'automatic' ? 'Quiz Certificate' : 'Uploaded Certificate'}</span>
                    {cert.language && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        <span>{cert.language}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {cert.type === 'uploaded' && (
                    <Button size="sm" onClick={() => handleVerifyCertificate(cert)}>
                      Verify
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewCertificate(cert)}
                  >
                    View
                  </Button>
                </div>
              </div>
              
              {selectedCertificate?.id === cert.id && (
                <div className="p-4 bg-muted/50 animate-fade-in">
                  {cert.type === 'automatic' ? (
                    <div>
                      <p className="font-medium mb-2">Quiz Certificate Details:</p>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">Language:</span> {cert.language}</li>
                        <li><span className="font-medium">Score:</span> {cert.score}</li>
                        <li><span className="font-medium">Date Issued:</span> {cert.date}</li>
                        <li><span className="font-medium">Certificate ID:</span> {cert.id}</li>
                      </ul>
                      <div className="mt-3">
                        <Button size="sm">Download Certificate</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-2">Uploaded Certificate Details:</p>
                      <div className="bg-gray-100 p-4 rounded-md mb-3 text-center">
                        <p className="text-gray-500 text-sm">Certificate Preview</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Download Original</Button>
                        <Button size="sm" onClick={() => handleVerifyCertificate(cert)}>Verify Certificate</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CertificateViewer;
