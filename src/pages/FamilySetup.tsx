
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FamilySetup = () => {
  const { user, families, createFamily, isLoading } = useAuth();
  const [familyName, setFamilyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      // If user has families, redirect to home page
      if (families && families.length > 0) {
        navigate("/home", { replace: true });
      }
    }
  }, [isLoading, families, navigate]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) {
      toast({
        title: "Family name required",
        description: "Please enter a name for your family.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await createFamily(familyName.trim());
      toast({
        title: "Family created!",
        description: "Your family has been created successfully.",
      });
      navigate("/home", { replace: true });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create family.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-choresync-gray">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-choresync-blue mb-4">Loading...</h2>
          <div className="w-16 h-16 border-4 border-t-choresync-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-choresync-gray p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-choresync-blue flex items-center justify-center gap-2">
            <Users className="h-6 w-6" />
            Welcome to ChoreSync
          </CardTitle>
          <CardDescription>
            Create a family to get started with managing chores together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateFamily}>
            <div className="space-y-4">
              <div>
                <label htmlFor="family-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Family Name
                </label>
                <Input
                  id="family-name"
                  placeholder="Enter your family name"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  disabled={isCreating}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? "Creating Family..." : "Create Family"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-gray-500">
            You'll be able to invite family members later
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FamilySetup;