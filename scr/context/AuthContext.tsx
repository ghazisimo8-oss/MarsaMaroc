import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '../data/demo/usersData';
import { User, UserRole } from '../types';
import { auditService } from '../services/auditService';

interface AuthContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('sme_marsa_user_role');
    if (saved) {
      const found = DEMO_USERS.find((u) => u.role === saved);
      if (found) return found;
    }
    // Par défaut : Administrateur technique pour la démo complète
    return DEMO_USERS[0];
  });

  const switchRole = (newRole: UserRole) => {
    const targetUser = DEMO_USERS.find((u) => u.role === newRole);
    if (!targetUser) return;

    const prevRole = currentUser.role;
    setCurrentUser(targetUser);
    localStorage.setItem('sme_marsa_user_role', newRole);

    auditService.logEvent({
      userId: targetUser.id,
      userName: targetUser.fullName,
      userRole: targetUser.role,
      action: 'COMMUTATION_PROFIL_DEMO',
      targetObject: 'Session Utilisateur Démo',
      objectId: targetUser.id,
      previousValue: `Rôle précédent : ${prevRole}`,
      newValue: `Nouveau rôle actif : ${newRole}`,
      ipAddress: '10.20.4.10',
      result: 'SUCCESS',
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (currentUser.role === 'ADMIN') return true;
    return currentUser.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchRole, hasPermission, allUsers: DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
