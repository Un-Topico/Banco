import { Profile } from "../pages/Profile";
import { CreateAccount } from '../pages/CreateAccount';
import AdminUsers from "../components/AdminUsers";
import { NotificationDetail } from "../components/NotificationDetail";
export const privateRoutes = [
    { path: "/perfil", element: <Profile />, protected:true },
    { path: "/notificacion/:id", element: <NotificationDetail />, protected:true },
    { path: "/configurar-cuenta", element: <CreateAccount />, protected:true },
    { path: "/admin/users", element: <AdminUsers />, protected:true },


];
