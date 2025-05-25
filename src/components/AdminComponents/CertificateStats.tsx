
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users, CheckCircle, TrendingUp } from "lucide-react";

interface CertificateStats {
  totalCertificates: number;
  verifiedCertificates: number;
  studentsWithCertificates: number;
  recentUploads: number;
}

const CertificateStats = () => {
  const [stats, setStats] = useState<CertificateStats>({
    totalCertificates: 0,
    verifiedCertificates: 0,
    studentsWithCertificates: 0,
    recentUploads: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertificateStats();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('certificate-stats-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'certificates' 
        }, 
        () => {
          console.log('Certificate changes detected, updating stats...');
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
      
      // Fetch all uploaded certificates
      const { data: certificates, error } = await supabase
        .from('certificates')
        .select('student_id, verified, created_at');
        
      if (error) throw error;
      
      if (certificates) {
        const totalCertificates = certificates.length;
        const verifiedCertificates = certificates.filter(cert => cert.verified).length;
        const uniqueStudents = new Set(certificates.map(cert => cert.student_id)).size;
        
        // Count recent uploads (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUploads = certificates.filter(cert => 
          new Date(cert.created_at) > sevenDaysAgo
        ).length;
        
        setStats({
          totalCertificates,
          verifiedCertificates,
          studentsWithCertificates: uniqueStudents,
          recentUploads
        });
      }
    } catch (error) {
      console.error('Error fetching certificate stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verificationRate = stats.totalCertificates > 0 
    ? Math.round((stats.verifiedCertificates / stats.totalCertificates) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCertificates}</div>
          <p className="text-xs text-muted-foreground">
            All time
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Certificates</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.verifiedCertificates}</div>
          <p className="text-xs text-muted-foreground">
            {verificationRate}%
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Students with Certificates</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.studentsWithCertificates}</div>
          <p className="text-xs text-muted-foreground">
            Unique students who uploaded certificates
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentUploads}</div>
          <p className="text-xs text-muted-foreground">
            Certificates uploaded in the last 7 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateStats;
