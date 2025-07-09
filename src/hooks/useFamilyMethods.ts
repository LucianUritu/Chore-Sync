
import { User, Family } from '@/types/auth.types';
import { useFamilyCreation } from '@/hooks/family/useFamilyCreation';
import { useFamilyActions } from '@/hooks/family/useFamilyActions';
import { useFamilySync } from '@/hooks/family/useFamilySync';

interface FamilyMethodsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  families: Family[];
  setFamilies: (families: Family[]) => void;
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
}

export const useFamilyMethods = ({
  user,
  setUser,
  families,
  setFamilies,
  currentFamily,
  setCurrentFamily
}: FamilyMethodsProps) => {
  
  const { refreshUserAndFamilies } = useFamilySync({
    user,
    setUser,
    setFamilies,
    setCurrentFamily
  });

  const { createFamily } = useFamilyCreation({
    user,
    refreshUserAndFamilies
  });

  const { switchFamily, updateUserName } = useFamilyActions({
    user,
    setUser,
    families,
    setFamilies,
    currentFamily,
    setCurrentFamily,
    refreshUserAndFamilies
  });

  return {
    createFamily,
    switchFamily,
    updateUserName
  };
};
