import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
    return (
        <div>
            <nav className='navbar bg-dark'>
                <h1>
                    <Link to='/'><i className='fas fa-code'></i> A L S</Link>
                </h1>
                <ul>
                    <li><Link to='/'>Team Members</Link></li>
                    <li><Link to='/' >Posts</Link></li>
                    <li><Link to='/' title='Dashboard'><i className='fas fa-user'></i><span className='hide-sm'>Dashboard</span></Link></li >
                    <li><Link to='/register' title='Register'><i className='fas fa-user'></i><span className='hide-sm'>Dashboard</span></Link></li >
                    <li><Link to='/login' title='Logout'><i className='fas fa-sign-out-alt'></i><span className='hide-sm'>Logout</span></Link></li >
                </ul >
            </nav >
        </div >
    )
}
