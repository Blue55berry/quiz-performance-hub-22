
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface NavbarProps {
  userType: 'admin' | 'student' | 'none';
  username?: string;
}

const Navbar = ({ userType, username }: NavbarProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<number>(3);
  
  const handleLogout = () => {
    // For a real app, we'd clear authentication state here
    navigate('/');
  };

  return (
    <header className="bg-white border-b shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Quiz Hub
        </Link>
        
        {userType !== 'none' && (
          <div className="flex items-center gap-4">
            {userType === 'admin' && (
              <div className="relative">
                <Button variant="outline" className="relative" onClick={() => setNotifications(0)}>
                  Notifications
                  {notifications > 0 && (
                    <span className="notification-badge">{notifications}</span>
                  )}
                </Button>
              </div>
            )}
            
            <div className="text-sm font-medium">
              Welcome, {username || (userType === 'admin' ? 'Admin' : 'Student')}!
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
