
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Student {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  created_at: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  roll_number: z.string().min(1, "Roll number is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const StudentList = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      roll_number: '',
      password: ''
    }
  });

  useEffect(() => {
    fetchStudents();
  }, []);
  
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, roll_number, created_at');
      
      if (error) {
        throw error;
      }
      
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddStudent = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from('students')
        .insert([{ 
          name: values.name, 
          email: values.email, 
          roll_number: values.roll_number,
          password: values.password
        }]);
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          if (error.message.includes('email')) {
            form.setError('email', { message: 'Email already exists' });
          } else if (error.message.includes('roll_number')) {
            form.setError('roll_number', { message: 'Roll number already exists' });
          }
          throw new Error('This student already exists');
        }
        throw error;
      }
      
      form.reset();
      setIsAddingStudent(false);
      toast({
        title: "Student added",
        description: `${values.name} has been successfully added.`,
      });
      
      // Refresh student list
      fetchStudents();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add student. Please try again.",
      });
    }
  };
  
  const handleDeleteStudent = async (id: string) => {
    try {
      const studentToDelete = students.find(s => s.id === id);
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setStudents(students.filter(s => s.id !== id));
      
      toast({
        title: "Student deleted",
        description: `${studentToDelete?.name} has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete student. Please try again.",
      });
    }
  };
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddStudent)} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="roll_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="A12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Save</Button>
                <Button variant="outline" type="button" onClick={() => setIsAddingStudent(false)}>Cancel</Button>
              </div>
            </form>
          </Form>
        </div>
      )}
      
      <div className="bg-white rounded-md shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Roll Number</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{student.name}</td>
                    <td className="px-4 py-3 text-sm">{student.email}</td>
                    <td className="px-4 py-3 text-sm">{student.roll_number}</td>
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
                  <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500">
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
