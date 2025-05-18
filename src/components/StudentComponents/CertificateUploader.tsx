
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface CertificateUploaderProps {
  studentId: string | null;
  onUploadComplete?: () => void;
}

const CertificateUploader = ({ studentId, onUploadComplete }: CertificateUploaderProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a certificate file to upload.",
      });
      return;
    }
    
    if (!studentId) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Please login again to upload certificates.",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
      const filePath = `${fileName}.${fileExt}`;
      
      // First check if certificates bucket exists, if not this will fail gracefully
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('certificates')
        .upload(filePath, file);
      
      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: publicURL } = supabase
        .storage
        .from('certificates')
        .getPublicUrl(filePath);
      
      // Save certificate record in database
      const { error: dbError } = await supabase
        .from('certificates')
        .insert([
          {
            student_id: studentId,
            title: title || file.name,
            file_url: publicURL.publicUrl,
            file_path: filePath,
            verified: false
          }
        ] as any);
      
      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      toast({
        title: "Certificate uploaded",
        description: "Your certificate has been successfully uploaded and is pending verification.",
      });
      
      // Reset the form
      setFile(null);
      setTitle('');
      const fileInput = document.getElementById('certificate-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete();
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="certificate-title">Certificate Title (Optional)</Label>
        <Input
          id="certificate-title"
          type="text"
          placeholder="e.g., JavaScript Certification"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="certificate-upload">Upload Certificate</Label>
        <Input
          id="certificate-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-500">
          Accepted formats: PDF, JPG, JPEG, PNG (Max size: 5MB)
        </p>
      </div>
      
      {file && (
        <div className="text-sm">
          Selected file: <span className="font-semibold">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
        </div>
      )}
      
      <Button 
        onClick={handleUpload} 
        disabled={!file || isUploading} 
        className="w-full sm:w-auto"
      >
        {isUploading ? "Uploading..." : "Upload Certificate"}
      </Button>
    </div>
  );
};

export default CertificateUploader;
