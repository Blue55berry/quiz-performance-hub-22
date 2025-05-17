
import { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import StudentList from '@/components/AdminComponents/StudentList';
import PerformanceChart from '@/components/AdminComponents/PerformanceChart';
import CertificateViewer from '@/components/AdminComponents/CertificateViewer';

const AdminDashboard = () => {
  const [username] = useState('Admin');
  
  // Sample data for charts
  const completionData = [
    { name: 'Completed', value: 68, color: '#4ade80' },
    { name: 'In Progress', value: 24, color: '#facc15' },
    { name: 'Not Started', value: 8, color: '#f87171' }
  ];
  
  const successData = [
    { name: 'Pass', value: 72, color: '#8b5cf6' },
    { name: 'Fail', value: 28, color: '#f87171' }
  ];
  
  const languageData = [
    { name: 'JavaScript', value: 42, color: '#facc15' },
    { name: 'Python', value: 28, color: '#3b82f6' },
    { name: 'Java', value: 18, color: '#f97316' },
    { name: 'C#', value: 12, color: '#8b5cf6' }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="admin" username={username} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold">{68}</div>
            <div className="text-gray-500 text-sm">Quizzes Completed</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{72}%</div>
            <div className="text-gray-500 text-sm">Success Rate</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{42}</div>
            <div className="text-gray-500 text-sm">Registered Students</div>
          </Card>
        </div>
        
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students">
            <StudentList />
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PerformanceChart 
                title="Quiz Completion Rates" 
                data={completionData}
              />
              <PerformanceChart 
                title="Success Rates" 
                data={successData}
              />
              <PerformanceChart 
                title="Preferred Languages" 
                data={languageData}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="certificates">
            <CertificateViewer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
