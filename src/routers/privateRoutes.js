import { Profile } from "../pages/Profile";
import { CreateAccount } from '../pages/CreateAccount';
import AdminUsers from "../components/AdminUsers";

export const privateRoutes = [
    { path: "/perfil", element: <Profile />, protected:true },
    { path: "/crear-cuenta", element: <CreateAccount />, protected:true },
    { path: "/admin/users", element: <AdminUsers />, protected:true }


];
