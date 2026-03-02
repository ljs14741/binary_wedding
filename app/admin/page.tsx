import { isAdminSession } from "@/lib/admin-auth";
import AdminLoginForm from "./AdminLoginForm";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const session = await isAdminSession();
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <AdminLoginForm />
            </div>
        );
    }
    return <AdminDashboard />;
}
