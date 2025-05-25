
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Award, CheckCircle, XCircle, Loader2, RefreshCw, Clock, Upload } from "lucide-react";

interface UploadedCertificate {
  id: string;
  student_id: string;
  title: string | null;
  file_url: string | null;
  file_path: string | null;
  verified: boolean;
  created_at: string;
  studentName?: string;
}

const UploadedCertificates = () => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<UploadedCertificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<UploadedCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchUploadedCertificates();
    
    const subscription = supabase
      .channel('uploaded-certificate-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'certificates' 
        }, 
        (payload) => {
          console.log('Uploaded certificate changes detected, refreshing data...', payload);
          fetchUploadedCertificates();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New certificate uploaded",
              description: "A student has uploaded a new certificate"
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchUploadedCertificates = async () => {
    try {
      setIsLoading(true);
      
      const { data: certData, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (certError) throw certError;
      
      if (certData) {
        const certificatesWithStudentNames = await Promise.all(
          certData.map(async (cert) => {
            const { data: studentData } = await supabase
              .from('students')
              .select('name')
              .eq('id', cert.student_id)
              .single();
              
            return {
              ...cert,
              studentName: studentData?.name || 'Unknown Student'
            };
          })
        );
        
        setCertificates(certificatesWithStudentNames);
        setFilteredCertificates(certificatesWithStudentNames);
      }
    } catch (error) {
      console.error('Error fetching uploaded certificates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load uploaded certificates."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCertificates(certificates);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = certificates.filter(cert => 
        (cert.studentName?.toLowerCase().includes(query)) || 
        (cert.title?.toLowerCase().includes(query))
      );
      setFilteredCertificates(filtered);
    }
  }, [searchQuery, certificates]);
  
  const handleToggleVerification = async (certId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ verified: !currentStatus })
        .eq('id', certId);
        
      if (error) throw error;
      
      setCertificates(prev => prev.map(cert => 
        cert.id === certId ? { ...cert, verified: !currentStatus } : cert
      ));
      
      setFilteredCertificates(prev => prev.map(cert => 
        cert.id === certId ? { ...cert, verified: !currentStatus } : cert
      ));
      
      toast({
        title: `Certificate ${!currentStatus ? 'verified' : 'unverified'}`,
        description: `Certificate has been ${!currentStatus ? 'verified' : 'unverified'} successfully.`
      });
    } catch (error) {
      console.error('Error updating certificate:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update certificate verification status."
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const viewCertificate = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Certificate file not available"
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Uploaded Certificates</h3>
        </div>
        <Button onClick={fetchUploadedCertificates} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by student name or certificate title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading uploaded certificates...</span>
        </div>
      ) : filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <CardHeader className="bg-blue-50 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{cert.title || 'Untitled Certificate'}</CardTitle>
                  <Badge variant={cert.verified ? "default" : "outline"}>
                    {cert.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Student: {cert.studentName}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-600 mb-3">
                  <div className="flex items-center mb-2">
                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                    <p>Uploaded on: {formatDate(cert.created_at)}</p>
                  </div>
                  <p>Certificate ID: {cert.id.substring(0, 8)}...</p>
                </div>
                
                <div className="flex flex-col space-y-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => viewCertificate(cert.file_url)}
                    className="w-full"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    View Certificate
                  </Button>
                  
                  <Button 
                    size="sm"
                    variant={cert.verified ? "destructive" : "default"}
                    onClick={() => handleToggleVerification(cert.id, cert.verified)}
                    className="w-full"
                  >
                    {cert.verified ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Unverify
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No uploaded certificates found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery 
              ? "No certificates match your search criteria" 
              : "Students haven't uploaded any certificates yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadedCertificates;
