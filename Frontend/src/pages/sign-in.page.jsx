import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <main className="px-4 min-h-screen flex items-center justify-center">
      <SignIn/>
    </main>
  );
};

export default SignInPage;
