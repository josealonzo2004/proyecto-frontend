import React from 'react'
import { Link } from 'react-router-dom'

export const Logo = () => {
    return (
        <Link
            to='/'
            className='flex items-center'>
            <img 
                src='./public/images/COMPLETO_NEGRO_SIN_FONDO.png' 
                alt='INNOVA ARTE' 
                className='h-12 w-auto'
            />
        </Link>
    )
}