import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Ongeldig e-mailadres");
const passwordSchema = z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten");

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithMagicLink } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"password" | "magic-link">("password");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateForm = (isSignUp: boolean = false) => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    if (authMethod === "password") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    if (authMethod === "magic-link") {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        toast({
          variant: "destructive",
          title: "Fout bij verzenden",
          description: error.message,
        });
      } else {
        toast({
          title: "Magic link verzonden!",
          description: "Controleer je e-mail en klik op de link om in te loggen.",
        });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          variant: "destructive",
          title: "Inloggen mislukt",
          description: error.message === "Invalid login credentials" 
            ? "Ongeldige inloggegevens. Controleer je e-mail en wachtwoord."
            : error.message,
        });
      }
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    setIsLoading(true);
    
    const { error } = await signUp(email, password, fullName);
    if (error) {
      let errorMessage = error.message;
      if (error.message.includes("already registered")) {
        errorMessage = "Dit e-mailadres is al geregistreerd. Probeer in te loggen.";
      }
      toast({
        variant: "destructive",
        title: "Registratie mislukt",
        description: errorMessage,
      });
    } else {
      toast({
        title: "Account aangemaakt!",
        description: "Controleer je e-mail om je account te bevestigen.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar home
        </Link>

        {/* Logo */}
        <div className="flex items-center mb-8">
          <span className="text-2xl font-bold text-foreground">BivaroX</span>
        </div>

        <Card className="border-border/50 shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Inloggen</TabsTrigger>
                <TabsTrigger value="register">Registreren</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <CardTitle className="text-xl mb-2">Welkom terug</CardTitle>
                <CardDescription className="mb-6">
                  Log in op je BivaroX account
                </CardDescription>

                {/* Auth method toggle */}
                <div className="flex gap-2 mb-6">
                  <Button
                    type="button"
                    variant={authMethod === "password" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAuthMethod("password")}
                    className="flex-1"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Wachtwoord
                  </Button>
                  <Button
                    type="button"
                    variant={authMethod === "magic-link" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAuthMethod("magic-link")}
                    className="flex-1"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Magic Link
                  </Button>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mailadres</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="naam@bedrijf.nl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {authMethod === "password" && (
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Wachtwoord</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {authMethod === "magic-link" ? "Verstuur Magic Link" : "Inloggen"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="mt-0">
                <CardTitle className="text-xl mb-2">Account aanmaken</CardTitle>
                <CardDescription className="mb-6">
                  Start gratis met BivaroX contractbeheer
                </CardDescription>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Volledige naam</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Jean Janssens"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mailadres</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="naam@bedrijf.nl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Wachtwoord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Minimaal 6 tekens"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Account aanmaken
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Door te registreren ga je akkoord met onze{" "}
                    <a href="#" className="text-primary hover:underline">voorwaarden</a>
                    {" "}en{" "}
                    <a href="#" className="text-primary hover:underline">privacybeleid</a>.
                  </p>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
