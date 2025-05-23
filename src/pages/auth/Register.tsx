
import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/forms/FormField";
import { FormActions } from "@/components/forms/FormActions";
import { useToast } from "@/hooks/use-toast";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Register: React.FC = () => {
  const { signup } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    tradingName: "",
    cnpj: "",
    plan: "professional",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ is required";
    }
    
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    try {
      await signup(formData.email, formData.password, formData.firstName, formData.lastName);
      toast({
        title: "Registration successful!",
        description: "Your account has been created. You can now login.",
      });
      // Redirect to login after successful registration
      return <Navigate to="/login" />;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const renderStep1 = () => (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground mt-2">Step 1: Personal Information</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="firstName"
            label="First Name"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
            required
          />
          <FormField
            id="lastName"
            label="Last Name"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
            required
          />
        </div>
        
        <FormField
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
        />
        
        <FormField
          id="phone"
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          error={errors.phone}
        />
        
        <FormField
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
        />
        
        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          required
        />
        
        <FormActions
          primaryAction={{
            label: "Next",
            onClick: handleStep1Next,
            type: "button",
          }}
          tertiaryAction={{
            label: "Already have an account? Sign in",
            onClick: () => {/* handled by the Link below */},
          }}
          align="center"
        />
        
        <div className="text-center mt-4">
          <Link to="/login" className="text-primary hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </>
  );
  
  const renderStep2 = () => (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Setup your shop</h1>
        <p className="text-muted-foreground mt-2">Step 2: Company Information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="companyName"
          label="Company Name (Legal Name)"
          type="text"
          value={formData.companyName}
          onChange={handleInputChange}
          error={errors.companyName}
          required
        />
        
        <FormField
          id="tradingName"
          label="Trading Name (Business Name)"
          type="text"
          value={formData.tradingName}
          onChange={handleInputChange}
          error={errors.tradingName}
        />
        
        <FormField
          id="cnpj"
          label="CNPJ"
          type="text"
          value={formData.cnpj}
          onChange={handleInputChange}
          error={errors.cnpj}
          required
        />
        
        <FormField
          id="plan"
          label="Subscription Plan"
          type="select"
          value={formData.plan}
          onChange={(value) => setFormData({ ...formData, plan: value })}
          error={errors.plan}
          required
        >
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </FormField>
        
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="termsAccepted" 
            checked={formData.termsAccepted}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, termsAccepted: checked as boolean })
            }
          />
          <Label 
            htmlFor="termsAccepted" 
            className={errors.termsAccepted ? "text-destructive" : ""}
          >
            I accept the terms and conditions
          </Label>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-destructive">{errors.termsAccepted}</p>
        )}
        
        <FormActions
          primaryAction={{
            label: "Create Account",
            type: "submit",
            loading: isLoading,
          }}
          secondaryAction={{
            label: "Back",
            onClick: () => setStep(1),
            type: "button",
          }}
          align="center"
        />
      </form>
    </>
  );

  return (
    <AuthLayout>
      {step === 1 ? renderStep1() : renderStep2()}
    </AuthLayout>
  );
};

export default Register;
