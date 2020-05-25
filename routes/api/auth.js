const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Authentication route
// @access  Public

// bring in middleware above, then add in as a second parameter to use
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Sever Error');
    }
});

// @route   POST api/auth
// @desc    Authenticate User & Get Token
// @access  Public
router.post('/',
    [
        check('email',
            'Please include a valid email').isEmail(),
        check('password',
            'Password is required').exists()
    ],
    // using async/await instead of the findOne().then() type of notation for general legibility of code
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // See if user exists, send back uniform error that is invalid for security purposes
            let user = await User.findOne({ email });
            if (!user) {
                res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }
            
            // See if password exists, send back uniform error that is invalid for security purposes
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // Return jsonwebtoken, ensures validated user is logged in on the front end immediately
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.log(err.message);
            res.status(500).send('... Server is @#(burp)$%ed');
        }

    }
);

module.exports = router;