import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { Register } from '../pages/Register';
import { ResetPassword } from '../pages/ResetPassword';
export const rutas = [
    { path: "/", element: <Home  />,  protected:false },
    { path: "/login", element: <Login />,  protected:false  },
    { path: "/crear-cuenta", element: <Register />,  protected:false  },
    { path: "/restablecer-contraseña", element: <ResetPassword />,  protected:false  },

];
