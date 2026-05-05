import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();

  function handleSubmit() {
    onLogin();
    navigate('/dashboard');
  }

  return <AuthForm mode="login" onSubmit={handleSubmit} />;
}
