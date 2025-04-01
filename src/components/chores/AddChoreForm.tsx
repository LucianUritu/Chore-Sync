import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { saveChore } from "@/services/database";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const choreSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  assignedUserId: z.string().min(1, "You must assign this chore to someone"),
  dueDate: z.date({
    required_error: "A due date is required",
  }),
  dueTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

interface AddChoreFormProps {
  onComplete: () => void;
}

const AddChoreForm = ({ onComplete }: AddChoreFormProps) => {
  const { currentFamily } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const form = useForm<z.infer<typeof choreSchema>>({
    resolver: zodResolver(choreSchema),
    defaultValues: {
      title: "",
      assignedUserId: "",
      dueTime: "12:00",
    },
  });
  
  const onSubmit = (values: z.infer<typeof choreSchema>) => {
    if (!currentFamily) return;
    
    // Combine date and time
    const dueDate = new Date(values.dueDate);
    const [hours, minutes] = values.dueTime.split(':').map(Number);
    dueDate.setHours(hours, minutes);
    
    // Create new chore
    const newChore = {
      id: `chore-${Date.now()}`,
      title: values.title,
      familyId: currentFamily.id,
      assignedUserId: values.assignedUserId,
      dueDate: dueDate.toISOString(),
      isComplete: false,
      createdAt: new Date().toISOString(),
    };
    
    // Save the chore
    saveChore(newChore);
    
    // Show success toast
    toast({
      title: "Chore Added",
      description: `${values.title} has been assigned.`,
    });
    
    // Reset form and close modal
    form.reset();
    onComplete();
  };
  
  if (!currentFamily) {
    return <div>No family selected</div>;
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chore Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Clean kitchen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="assignedUserId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a family member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currentFamily.members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-choresync-blue text-white flex items-center justify-center text-xs mr-2">
                          {member.initials}
                        </div>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setDate(date);
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dueTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit">Add Chore</Button>
        </div>
      </form>
    </Form>
  );
};

export default AddChoreForm;
