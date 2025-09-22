import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { AboutPage, CellPhonePage, HomePage } from '../pages';

export const router = createBrowserRouter(
    [
       { 
        path: '/',
        element: <RootLayout />,
        children: [
                    {
                        index: true,
                        element: <HomePage />, 
                    },
                    {
                        path: 'Celulares',
                        element: <CellPhonePage />,
                    },
                    {
                        path: 'Nosotros',
                        element: <AboutPage />,
                    }
            ]
       }
    ]
);
