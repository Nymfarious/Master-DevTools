import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { PasswordValidator } from '@/components/auth/PasswordValidator';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        err.errors.forEach((e) => {
          if (e.path[0] === 'email') fieldErrors.email = e.message;
          if (e.path[0] === 'password') fieldErrors.password = e.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back',
            description: 'Successfully logged in',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Try logging in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Signup Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account created',
            description: 'You can now access the demo features.',
          });
          navigate('/');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-signal-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md terminal-glass border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-signal-green/10 border border-signal-green/30 flex items-center justify-center mb-4">
            <Terminal className="h-6 w-6 text-signal-green" />
          </div>
          <CardTitle className="font-display text-2xl text-foreground">
            Master Devtools
          </CardTitle>
          <CardDescription className="font-mono text-xs text-muted-foreground">
            {isLogin ? '// AUTHENTICATE TO CONTINUE' : '// CREATE YOUR ACCOUNT'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs text-muted-foreground">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="terminal-input"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-signal-red font-mono">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-xs text-muted-foreground">
                PASSWORD
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="terminal-input pr-10"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-signal-red font-mono">{errors.password}</p>
              )}
              <PasswordValidator password={password} mode={isLogin ? 'login' : 'signup'} />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-signal-green hover:bg-signal-green/90 text-background font-mono"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
            </Button>
            
            {/* DEV BYPASS - Remove in production */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-signal-amber/50 text-signal-amber hover:bg-signal-amber/10 font-mono text-xs"
              onClick={() => navigate('/dashboard')}
            >
              🔧 DEV BYPASS (Skip Auth)
            </Button>
            
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
