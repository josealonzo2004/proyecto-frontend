import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";

export const router = createBrowserRouter(
    [
       { 
        path: '/',
        element: <RootLayout />,
        children: [
                    {
                        index: true,
                        element: <div>Inicio</div>
                    },
                    {
                        path: 'Celulares',
                        element: <div>Celulares</div>
                    },
                    {
                        path: 'Nosotros',
                        element: <div>Nosotros</div>
                    }
            ]
       }
    ]
);
