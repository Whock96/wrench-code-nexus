
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/forms/FormField";
import { FormActions } from "@/components/forms/FormActions";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you will receive a password reset link.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Failed to send reset link",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your email to receive a password reset link
        </p>
      </div>
      
      {isSubmitted ? (
        <div className="text-center space-y-4">
          <div className="rounded-full bg-green-100 mx-auto h-16 w-16 flex items-center justify-center text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <p>
            If an account exists with the email <strong>{email}</strong>, 
            you will receive a password reset link shortly.
          </p>
          
          <FormActions
            primaryAction={{
              label: "Return to Login",
              onClick: () => {/* handled by the Link below */},
              type: "button",
            }}
            align="center"
          />
          
          <Link to="/login" className="block text-primary hover:underline">
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            required
          />
          
          <FormActions
            primaryAction={{
              label: "Send Reset Link",
              type: "submit",
              loading: isLoading,
            }}
            secondaryAction={{
              label: "Cancel",
              onClick: () => {/* handled by the Link below */},
              type: "button",
              variant: "ghost",
            }}
            align="center"
          />
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-primary hover:underline">
              Return to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
