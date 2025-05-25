
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Award, CheckCircle, XCircle, Loader2, RefreshCw, Clock, Upload, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UploadedCertificate {
  id: string;
  student_id: string;
  title: string | null;
  file_url: string | null;
  file_path: string | null;
  verified: boolean;
  created_at: string;
  studentName?: string;
  studentRollNumber?: string;
}

const UploadedCertificates = () => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<UploadedCertificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<UploadedCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCert, setEditingCert] = useState<UploadedCertificate | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Certificate updated",
              description: "A certificate has been updated"
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Certificate deleted",
              description: "A certificate has been removed"
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
      
      // Only fetch uploaded certificates (not quiz-generated ones)
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
              .select('name, roll_number')
              .eq('id', cert.student_id)
              .single();
              
            return {
              ...cert,
              studentName: studentData?.name || 'Unknown Student',
              studentRollNumber: studentData?.roll_number || 'N/A'
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
        (cert.title?.toLowerCase().includes(query)) ||
        (cert.studentRollNumber?.toLowerCase().includes(query))
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

  const handleDeleteCertificate = async (certId: string) => {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certId);
        
      if (error) throw error;
      
      setCertificates(prev => prev.filter(cert => cert.id !== certId));
      setFilteredCertificates(prev => prev.filter(cert => cert.id !== certId));
      
      toast({
        title: "Certificate deleted",
        description: "Certificate has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete certificate."
      });
    }
  };

  const handleEditCertificate = (cert: UploadedCertificate) => {
    setEditingCert(cert);
    setEditTitle(cert.title || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateTitle = async () => {
    if (!editingCert) return;

    try {
      const { error } = await supabase
        .from('certificates')
        .update({ title: editTitle })
        .eq('id', editingCert.id);
        
      if (error) throw error;
      
      setCertificates(prev => prev.map(cert => 
        cert.id === editingCert.id ? { ...cert, title: editTitle } : cert
      ));
      
      setFilteredCertificates(prev => prev.map(cert => 
        cert.id === editingCert.id ? { ...cert, title: editTitle } : cert
      ));
      
      setIsEditDialogOpen(false);
      setEditingCert(null);
      setEditTitle('');
      
      toast({
        title: "Certificate updated",
        description: "Certificate title has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating certificate:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update certificate title."
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
          placeholder="Search by student name, certificate title, or roll number..."
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
                <p className="text-xs text-gray-500">Roll: {cert.studentRollNumber}</p>
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
                    variant="outline"
                    onClick={() => handleEditCertificate(cert)}
                    className="w-full"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Title
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
                  
                  <Button 
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCertificate(cert.id)}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Certificate Title</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Certificate Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter certificate title"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTitle}>
                Update Title
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadedCertificates;
