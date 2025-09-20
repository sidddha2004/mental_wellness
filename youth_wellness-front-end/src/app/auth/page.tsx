import { Header } from "@/components/header";
import { AuthForm } from "@/components/auth/auth-form";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AuthPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
            <AuthForm />
        </main>
      </div>
    </ProtectedRoute>
  );
}
