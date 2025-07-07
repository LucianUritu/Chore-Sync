
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integration/supabase/clients';

const InviteUser = () => {
  const { currentFamily } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInviteUser = async () => {
    if (!email.trim() || !currentFamily) return;

    try {
      setIsInviting(true);

      // Check if user exists
      const { data: invitedUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          toast({
            title: "User not found",
            description: "No user found with this email address. They need to create an account first.",
            variant: "destructive",
          });
        } else {
          throw userError;
        }
        return;
      }

      // Check if user is already in the family
      const isAlreadyMember = currentFamily.members.some(
        member => member.userId === invitedUser.id
      );

      if (isAlreadyMember) {
        toast({
          title: "Already a member",
          description: "This user is already part of your family.",
          variant: "destructive",
        });
        return;
      }

      // Add user to family
      const updatedMembers = [
        ...currentFamily.members,
        {
          userId: invitedUser.id,
          name: invitedUser.name,
          initials: invitedUser.initials
        }
      ];

      const { error: updateFamilyError } = await supabase
        .from('families')
        .update({ members: updatedMembers })
        .eq('id', currentFamily.id);

      if (updateFamilyError) throw updateFamilyError;

      // Update invited user's families list
      const updatedUserFamilies = [...(invitedUser.families || []), currentFamily.id];
      
      const { error: updateUserError } = await supabase
        .from('profiles')
        .update({ 
          families: updatedUserFamilies,
          current_family_id: invitedUser.current_family_id || currentFamily.id
        })
        .eq('id', invitedUser.id);

      if (updateUserError) throw updateUserError;

      toast({
        title: "User invited successfully",
        description: `${invitedUser.name} has been added to your family.`,
      });

      setEmail('');
      setIsDialogOpen(false);

    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error inviting user",
        description: error.message || "Failed to invite user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus size={16} className="mr-2" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User to Family</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you want to invite to {currentFamily?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isInviting}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInviteUser} disabled={isInviting || !email.trim()}>
            {isInviting ? "Inviting..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUser;
