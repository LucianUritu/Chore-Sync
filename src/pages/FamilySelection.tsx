import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integration/supabase/clients";
import { addMemberToFamily } from "@/services/familyMemberService";

const FamilySelection = () => {
  const { user, families, createFamily, isLoading } = useAuth();
  const [familyName, setFamilyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if user already has families
  useEffect(() => {
    if (!isLoading && families && families.length > 0) {
      console.log("FamilySelection: User already has families, redirecting to home");
      navigate("/home", { replace: true });
    }
  }, [isLoading, families, navigate]);

  // Redirect if no user
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("FamilySelection: No user found, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [isLoading, user, navigate]);

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
      console.log("FamilySelection: Creating family", { name: familyName });
      const newFamily = await createFamily(familyName.trim());
      
      toast({
        title: "Family created!",
        description: "Your family has been created successfully.",
      });
      
      if (newFamily) {
        console.log("FamilySelection: Family created successfully, navigating to home");
        navigate("/home", { replace: true });
      }
    } catch (error: any) {
      console.error("FamilySelection: Error creating family", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create family.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !user) {
      toast({
        title: "Join code required",
        description: "Please enter a valid join code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsJoining(true);
      console.log("FamilySelection: Joining family with code", { code: joinCode });

      // Find family by join code
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('join_code', joinCode.trim())
        .single();

      if (familyError || !family) {
        toast({
          title: "Invalid join code",
          description: "No family found with this join code.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already in the family using the family_members table
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', family.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already part of this family.",
          variant: "destructive",
        });
        return;
      }

      // Calculate user initials
      const userInitials = user.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);

      console.log("FamilySelection: Adding new member to family", { 
        familyId: family.id,
        familyName: family.name,
        userId: user.id,
        userName: user.name,
        userInitials
      });

      // Add member using the service (family_members table is now the source of truth)
      await addMemberToFamily(family.id, user.id, user.name, userInitials);

      console.log("FamilySelection: Successfully added member to family_members table");

      // Update user profile with the new family in the families array AND set as current
      try {
        const updatedFamilies = [...(user.families || []), family.id];
        
        const { error: updateUserError } = await supabase
          .from('profiles')
          .update({ 
            families: updatedFamilies,
            current_family_id: family.id
          })
          .eq('id', user.id);

        if (updateUserError) {
          console.log('🟡 Could not update user profile families array (RLS), but member was added to family:', updateUserError.message);
        } else {
          console.log("FamilySelection: Successfully updated user profile with families array and current family");
        }
      } catch (profileError: any) {
        console.log('🟡 Profile families array update failed, but member was added to family:', profileError.message);
      }

      toast({
        title: "Successfully joined family!",
        description: `Welcome to ${family.name}. Redirecting to home...`,
      });

      console.log("FamilySelection: Family join complete, navigating to home");
      
      // Add a longer delay to ensure database changes propagate and auth state updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate directly to home page
      navigate("/home", { replace: true });

    } catch (error: any) {
      console.error("FamilySelection: Error joining family", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join family.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
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
            Create a new family or join an existing one to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Family</TabsTrigger>
              <TabsTrigger value="join">Join Family</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateFamily} className="space-y-4">
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating Family..." : "Create Family"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="join">
              <form onSubmit={handleJoinFamily} className="space-y-4">
                <div>
                  <label htmlFor="join-code" className="block text-sm font-medium text-gray-700 mb-1">
                    Join Code
                  </label>
                  <Input
                    id="join-code"
                    placeholder="Enter family join code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    disabled={isJoining}
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isJoining}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isJoining ? "Joining Family..." : "Join Family"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilySelection;
