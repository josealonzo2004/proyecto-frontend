import React from 'react'
import { Link } from 'react-router-dom'

export const Logo = () => {
    return (
        <Link
            to='/'
            className='flex items-center'>
            <img 
                src='/img/COMPLETO NEGRO SIN FONDO.png' 
                alt='INNOVA ARTE' 
                className='h-12 w-auto'
            />
        </Link>
    )
}