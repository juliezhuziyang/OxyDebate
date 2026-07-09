import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Password reset email sent! Check your inbox for instructions.",
          });
          setIsForgotPassword(false);
          setIsLogin(true);
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Check your email for the confirmation link!",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/lovable-uploads/81b3875b-f5ba-4565-873d-48077a07f163.png"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/70 to-primary/80" />
        </div>
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-3 text-primary-foreground">
            <img
              src="/lovable-uploads/38ceb41b-5f98-475f-8a33-19dc45ce9689.png"
              alt="Oxymorona Debate logo"
              className="h-10 w-10 object-contain"
            />
            <span className="font-display text-2xl font-semibold">Oxymorona Debate</span>
          </a>
        </div>
        <div className="relative z-10 space-y-4 text-primary-foreground max-w-md">
          <h2 className="font-display text-3xl xl:text-4xl font-bold leading-tight">
            Oxymorona Debate Community
          </h2>
          <p className="text-primary-foreground/85 text-lg leading-relaxed">
            Where conviction meets curiosity. Train with AI, spar with real opponents, and climb the global rankings.
          </p>
        </div>
        <div className="relative z-10 text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Oxymorona Debate
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col min-h-screen">
        <div className="flex justify-end p-4 lg:p-6">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <Card className="w-full max-w-md border-border shadow-elevated animate-fade-in-up">
            <CardHeader className="space-y-1 text-center pb-2">
              <div className="lg:hidden flex justify-center mb-4">
                <img
                  src="/lovable-uploads/38ceb41b-5f98-475f-8a33-19dc45ce9689.png"
                  alt="Oxymorona Debate logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <CardTitle className="text-2xl font-bold font-display">
                {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Join Oxy Debate'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isForgotPassword 
                  ? 'Enter your email to receive password reset instructions'
                  : isLogin 
                    ? 'Sign in to your account' 
                    : 'Create your account to start debating'
                }
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {!isLogin && !isForgotPassword && (
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="text-sm font-medium">
                      Display Name
                    </label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                {!isForgotPassword && (
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full font-medium" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isForgotPassword 
                    ? 'Send Reset Email' 
                    : isLogin 
                      ? 'Sign In' 
                      : 'Sign Up'
                  }
                </Button>
                
                {!isForgotPassword && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsLogin(!isLogin)}
                      className="w-full text-muted-foreground"
                    >
                      {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </Button>
                    
                    {isLogin && (
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setIsForgotPassword(true)}
                        className="w-full text-sm"
                      >
                        Forgot your password?
                      </Button>
                    )}
                  </>
                )}
                
                {isForgotPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setIsLogin(true);
                    }}
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
