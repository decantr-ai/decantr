import { AuthForm } from '../../components/patterns/AuthForm';
import { useAuth } from '../../hooks/useAuth';

export function Login() {
  const { login } = useAuth();
  return <AuthForm variant="login" onSubmit={login} />;
}
