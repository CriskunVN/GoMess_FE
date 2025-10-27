import { SignupForm } from "@/components/auth/Signup-form";

const SignupPage = () => {
  return (
    <div className="bg-gradient-green flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
