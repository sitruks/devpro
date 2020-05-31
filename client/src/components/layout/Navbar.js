import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';


const Navbar = ({ auth: { isAuthenticated, loading }, logout }) => {
    const authLinks = (
        <ul>
            <li>
                <a onClick={logout} href='!#'>
                    <i className='fas fa-sign-out-alt'/>{' '}
                    <span className='hide-sm'>Logout</span>
                </a>
            </li>
        </ul>
    );

    const guestLinks = (
        <ul>
            <li><Link to='!#' title='Developers'><i className='fas fa-user'></i><span className='hide-sm'>Developers</span></Link></li >
            <li><Link to='/register' title='Register'><i className='fas fa-user'></i><span className='hide-sm'>Register</span></Link></li >
            <li><Link to='/login' title='Logout'><i className='fas fa-sign-out-alt'></i><span className='hide-sm'>Logout</span></Link></li >
        </ul>
    );

    return (
        <nav className='navbar bg-dark'>
            <h1>
                <Link to='/'><i className='fas fa-code'></i> DevCon</Link>
            </h1>
            {!loading && (<Fragment> {isAuthenticated ? authLinks : guestLinks} </Fragment>)}
        </nav>
    );
};

Navbar.propTypes = {
    logout: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { logout }
)(Navbar);