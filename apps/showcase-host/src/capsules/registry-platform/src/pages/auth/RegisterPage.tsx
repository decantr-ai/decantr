import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

interface RegisterPageProps {
  onLogin: () => void;
}

export default function RegisterPage({ onLogin }: RegisterPageProps) {
  const navigate = useNavigate();

  function handleSubmit() {
    onLogin();
    navigate('/dashboard');
  }

  return <AuthForm mode="register" onSubmit={handleSubmit} />;
}
