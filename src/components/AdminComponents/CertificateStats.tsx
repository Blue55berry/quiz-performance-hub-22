
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users, ArrowUpRight } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const CertificateStats = () => {
  const [totalCertificates, setTotalCertificates] = useState<number>(0);
  const [verifiedCertificates, setVerifiedCertificates] = useState<number>(0);
  const [studentsWithCertificates, setStudentsWithCertificates] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchCertificateStats = async () => {
      try {
        setIsLoading(true);
        
        // Get total certificates
        const { count: certCount, error: certError } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true });
          
        if (certError) throw certError;
        
        // Get verified certificates
        const { count: verifiedCount, error: verifiedError } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('verified', true);
          
        if (verifiedError) throw verifiedError;
        
        // Get unique students with certificates
        const { data: studentsData, error: studentsError } = await supabase
          .from('certificates')
          .select('student_id');
          
        if (studentsError) throw studentsError;
        
        // Count unique student IDs
        const uniqueStudentIds = new Set(studentsData?.map(cert => cert.student_id));
        
        setTotalCertificates(certCount || 0);
        setVerifiedCertificates(verifiedCount || 0);
        setStudentsWithCertificates(uniqueStudentIds.size);
      } catch (error) {
        console.error('Error fetching certificate stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCertificateStats();
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
          <Award className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-2xl font-bold">{isLoading ? '...' : totalCertificates}</div>
            <div className="ml-auto text-xs text-gray-500">All time</div>
          </div>
          <CardDescription className="text-xs text-gray-500 mt-1">
            Total certificates issued to students
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Certificates</CardTitle>
          <div className="bg-green-100 p-1 rounded-full">
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-2xl font-bold">{isLoading ? '...' : verifiedCertificates}</div>
            <div className="ml-auto">
              {totalCertificates > 0 && !isLoading && (
                <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  {Math.round((verifiedCertificates / totalCertificates) * 100)}%
                </span>
              )}
            </div>
          </div>
          <CardDescription className="text-xs text-gray-500 mt-1">
            Certificates that have been verified
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Students with Certificates</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : studentsWithCertificates}
          </div>
          <CardDescription className="text-xs text-gray-500 mt-1">
            Unique students who earned certificates
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateStats;
