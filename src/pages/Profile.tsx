
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Edit2, Save } from "lucide-react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import FamilySelector from "@/components/profile/FamilySelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
});

const Profile = () => {
  const { user, currentFamily, updateUserName } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateUserName(values.name);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit2 size={16} className="mr-1" />
          Edit Profile
        </Button>
      </div>
      
      <ProfileHeader />
      
      <FamilySelector />
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {currentFamily ? `${currentFamily.name} Settings` : 'Account Settings'}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Notifications</span>
            <span className="text-green-500">On</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Dark Mode</span>
            <span className="text-red-500">Off</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Language</span>
            <span>English</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">App Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Terms of Service</span>
            <span className="text-choresync-blue">View</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Privacy Policy</span>
            <span className="text-choresync-blue">View</span>
          </div>
        </div>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save size={16} className="mr-1" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;