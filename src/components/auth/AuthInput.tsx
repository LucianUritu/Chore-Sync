
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl } from '@/components/ui/form';

interface AuthInputProps {
  placeholder: string;
  type?: string;
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  field: any;
}

const AuthInput = ({ placeholder, type = "text", icon, rightIcon, disabled, field }: AuthInputProps) => {
  return (
    <FormControl>
      <div className="flex items-center border rounded-md border-input focus-within:ring-2 focus-within:ring-ring">
        <div className="flex items-center justify-center w-10 h-10 text-gray-500">
          {icon}
        </div>
        <Input
          placeholder={placeholder}
          type={type}
          className="border-0 focus-visible:ring-0"
          disabled={disabled}
          {...field}
        />
        {rightIcon && (
          <div className="flex items-center justify-center w-10 h-10 text-gray-500 cursor-pointer">
            {rightIcon}
          </div>
        )}
      </div>
    </FormControl>
  );
};

export default AuthInput;
