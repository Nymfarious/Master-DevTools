import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface PasswordValidatorProps {
  password: string;
  mode: 'login' | 'signup';
  onValidationChange?: (isValid: boolean) => void;
}

export function PasswordValidator({ password, mode, onValidationChange }: PasswordValidatorProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Debounced validation (500ms delay)
  const validatePassword = useDebouncedCallback(async (pwd: string) => {
    if (!pwd || pwd.length < 1) {
      setStatus('idle');
      onValidationChange?.(false);
      return;
    }

    setStatus('checking');

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (mode === 'signup') {
      // Signup: Check strength requirements
      const checks = {
        length: pwd.length >= 8,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        number: /[0-9]/.test(pwd),
      };
      
      const passed = Object.values(checks).filter(Boolean).length;
      
      if (passed === 4) {
        setStatus('success');
        setMessage('');
        onValidationChange?.(true);
      } else {
        setStatus('error');
        setMessage(`${passed}/4 requirements met`);
        onValidationChange?.(false);
      }
    } else {
      // Login: Just check it's not empty and meets minimum
      if (pwd.length >= 6) {
        setStatus('success');
        setMessage('');
        onValidationChange?.(true);
      } else {
        setStatus('error');
        setMessage('Password too short');
        onValidationChange?.(false);
      }
    }
  }, 500);

  useEffect(() => {
    validatePassword(password);
  }, [password, validatePassword]);

  if (status === 'idle') return null;

  return (
    <div className={`
      flex items-center gap-2 p-3 rounded-lg border transition-all text-sm
      ${status === 'checking' ? 'border-border bg-secondary/50' : ''}
      ${status === 'success' ? 'border-signal-green bg-signal-green/10' : ''}
      ${status === 'error' ? 'border-signal-red bg-signal-red/10' : ''}
    `}>
      {status === 'checking' && (
        <>
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          <span className="text-muted-foreground">Checking...</span>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="w-4 h-4 text-signal-green" />
          <span className="text-signal-green font-medium">Success!</span>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="w-4 h-4 text-signal-red" />
          <span className="text-signal-red">{message}</span>
        </>
      )}
    </div>
  );
}
