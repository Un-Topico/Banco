import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { Profile } from '../pages/Profile';

export const rutas = [
    { path: "/home", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/profile", element: <Profile /> }
];
