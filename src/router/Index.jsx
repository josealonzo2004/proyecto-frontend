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
                        element: <div>Celulares2222</div>
                    },
                    {
                        path: 'Nosotros',
                        element: <div>Nosotros2222</div>
                    }
            ]
       }
    ]
);
