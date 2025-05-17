
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const CertificateUploader = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
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
    
    setIsUploading(true);
    
    // Simulating upload delay
    setTimeout(() => {
      setIsUploading(false);
      setFile(null);
      
      toast({
        title: "Certificate uploaded",
        description: "Your certificate has been successfully uploaded.",
      });
      
      // Reset the file input
      const fileInput = document.getElementById('certificate-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }, 1500);
  };
  
  return (
    <div className="space-y-4">
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
