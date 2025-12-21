import { Link } from 'react-router-dom';
import { Terminal, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-signal-green/10 border border-signal-green/30 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-signal-green" />
          </div>
          <span className="font-display font-bold text-foreground">Master Devtools</span>
        </Link>
        
        {/* Navigation */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/dashboard">
                  <Button variant="ghost" className="font-mono text-xs">
                    DASHBOARD
                  </Button>
                </Link>
              )}
              <Link to="/demo">
                <Button variant="ghost" className="font-mono text-xs">
                  DEMO
                </Button>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground">
                  {user.email?.split('@')[0]}
                </span>
                {isAdmin && (
                  <span className="badge badge--green text-[10px] py-0">ADMIN</span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/demo">
                <Button variant="ghost" className="font-mono text-xs">
                  DEMO
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-signal-green hover:bg-signal-green/90 text-background font-mono text-xs">
                  LOGIN
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
