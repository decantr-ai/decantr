import { AuthForm } from '../../components/patterns/AuthForm';
import { useAuth } from '../../hooks/useAuth';

export function Register() {
  const { login } = useAuth();
  return <AuthForm variant="register" onSubmit={login} />;
}
