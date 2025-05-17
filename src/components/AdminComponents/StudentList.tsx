
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  quizzesTaken: number;
  lastActive: string;
}

const StudentList = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '' });
  
  // Sample student data
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      quizzesTaken: 3,
      lastActive: '2025-05-16'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      quizzesTaken: 2,
      lastActive: '2025-05-15'
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert@example.com',
      quizzesTaken: 1,
      lastActive: '2025-05-10'
    }
  ]);
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name and email are required.",
      });
      return;
    }
    
    const newId = (Math.max(...students.map(s => parseInt(s.id))) + 1).toString();
    
    const student: Student = {
      id: newId,
      name: newStudent.name,
      email: newStudent.email,
      quizzesTaken: 0,
      lastActive: new Date().toISOString().split('T')[0]
    };
    
    setStudents([...students, student]);
    setNewStudent({ name: '', email: '' });
    setIsAddingStudent(false);
    
    toast({
      title: "Student added",
      description: `${student.name} has been successfully added.`,
    });
  };
  
  const handleDeleteStudent = (id: string) => {
    const studentToDelete = students.find(s => s.id === id);
    setStudents(students.filter(s => s.id !== id));
    
    toast({
      title: "Student deleted",
      description: `${studentToDelete?.name} has been removed.`,
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsAddingStudent(true)}>Add Student</Button>
      </div>
      
      {isAddingStudent && (
        <div className="bg-muted p-4 rounded-md mb-4 animate-fade-in">
          <h3 className="text-lg font-semibold mb-3">Add New Student</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Student Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
              />
              <Input
                placeholder="Email Address"
                value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddStudent}>Save</Button>
              <Button variant="outline" onClick={() => setIsAddingStudent(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-md shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Quizzes Taken</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Last Active</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{student.name}</td>
                    <td className="px-4 py-3 text-sm">{student.email}</td>
                    <td className="px-4 py-3 text-sm">{student.quizzesTaken}</td>
                    <td className="px-4 py-3 text-sm">{student.lastActive}</td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing {filteredStudents.length} of {students.length} students
      </div>
    </div>
  );
};

export default StudentList;
