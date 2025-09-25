import React from 'react'
import { Link } from 'react-router-dom'

export const Logo = () => {
    return (
        <Link
            to='/'
            className={'text-2xl font-bold tracking-tighter transition-all'}>
            <img src="./public/images/logo1.png" className='h-8 w-auto md:h-10' alt="Descripción de la imagen"></img>
        </Link>
    )
}