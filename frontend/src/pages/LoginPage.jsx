import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../features/auth/LoginForm';

const LoginPage = () => (
  <AuthLayout>
    <div className="mb-8">
      <h2 className="text-2xl font-black text-white mb-1">Welcome back</h2>
      <p className="text-sm text-surface-400">Sign in to your TradeFox account</p>
    </div>
    <LoginForm />
  </AuthLayout>
);

export default LoginPage;
