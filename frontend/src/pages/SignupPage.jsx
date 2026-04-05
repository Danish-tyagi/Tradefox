import AuthLayout from '../layouts/AuthLayout';
import SignupForm from '../features/auth/SignupForm';

const SignupPage = () => (
  <AuthLayout>
    <div className="mb-8">
      <h2 className="text-2xl font-black text-white mb-1">Create account</h2>
      <p className="text-sm text-surface-400">
        Get ₹1,00,000 virtual balance to start trading
      </p>
    </div>
    <SignupForm />
  </AuthLayout>
);

export default SignupPage;
