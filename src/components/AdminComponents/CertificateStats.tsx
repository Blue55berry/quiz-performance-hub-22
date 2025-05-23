
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users, ArrowUpRight, Loader2, TrendingUp } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const CertificateStats = () => {
  const [totalCertificates, setTotalCertificates] = useState<number>(0);
  const [verifiedCertificates, setVerifiedCertificates] = useState<number>(0);
  const [studentsWithCertificates, setStudentsWithCertificates] = useState<number>(0);
  const [recentCertificates, setRecentCertificates] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    fetchCertificateStats();
    
    // Subscribe to changes on the certificates table
    const subscription = supabase
      .channel('certificate-stats-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'certificates' 
        }, 
        (payload) => {
          console.log('Certificate changes detected, refreshing stats...', payload);
          fetchCertificateStats();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
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
      
      // Get recent certificates (last 7 days)
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      
      const { count: recentCount, error: recentError } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastWeekDate.toISOString());
      
      if (recentError) throw recentError;
      
      // Count unique student IDs
      const uniqueStudentIds = new Set(studentsData?.map(cert => cert.student_id));
      
      setTotalCertificates(certCount || 0);
      setVerifiedCertificates(verifiedCount || 0);
      setStudentsWithCertificates(uniqueStudentIds.size);
      setRecentCertificates(recentCount || 0);
    } catch (error) {
      console.error('Error fetching certificate stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
          <Award className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalCertificates}</div>
                <div className="ml-auto text-xs text-gray-500">All time</div>
              </>
            )}
          </div>
          <CardDescription className="text-xs text-gray-500 mt-1">
            Total certificates uploaded by students
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
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{verifiedCertificates}</div>
                <div className="ml-auto">
                  {totalCertificates > 0 && (
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      {Math.round((verifiedCertificates / totalCertificates) * 100)}%
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <CardDescription className="text-xs text-gray-500 mt-1">
            Certificates that have been verified by admins
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Students with Certificates</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="text-2xl font-bold">{studentsWithCertificates}</div>
          )}
          <CardDescription className="text-xs text-gray-500 mt-1">
            Unique students who uploaded certificates
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="text-2xl font-bold">{recentCertificates}</div>
          )}
          <CardDescription className="text-xs text-gray-500 mt-1">
            Certificates uploaded in the last 7 days
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateStats;
