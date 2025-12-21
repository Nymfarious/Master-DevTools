// Role Switcher - Developer role simulation
import { User, Shield, Code, TestTube, type LucideIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore, type UserRole } from '../stores/settingsStore';

const ROLES: { id: UserRole; label: string; icon: LucideIcon }[] = [
  { id: 'user', label: 'User', icon: User },
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'developer', label: 'Developer', icon: Code },
  { id: 'tester', label: 'Tester', icon: TestTube },
];

interface RoleSwitcherProps {
  className?: string;
}

export function RoleSwitcher({ className }: RoleSwitcherProps) {
  const { settings, setRole } = useSettingsStore();
  const currentRole = ROLES.find((r) => r.id === settings.currentRole);
  const CurrentIcon = currentRole?.icon || User;

  return (
    <div className={className}>
      <Select value={settings.currentRole} onValueChange={(v) => setRole(v as UserRole)}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-3 h-3" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              <div className="flex items-center gap-2">
                <role.icon className="w-4 h-4" />
                {role.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
