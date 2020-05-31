const express = require('express');
const axios = require('axios');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const checkObjectId = require('../../middleware/checkObjectId');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',
            ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('... Server is @#(burp)$%ed');
    }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
// need to use both auth and express-validator middleware, so using brackets
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        // bring in normalize to give us a proper url, regardless of what user entered
        const profileFields = {
            user: req.user.id,
            company,
            location,
            website: website === '' ? '' : normalize(website, { forceHttps: true }),
            bio,
            skills: Array.isArray(skills)
                ? skills
                : skills.split(',').map((skill) => ' ' + skill.trim()),
            status,
            githubusername
        };

        // Build social object and add to profileFields
        const socialfields = { youtube, twitter, instagram, linkedin, facebook };

        for (const [key, value] of Object.entries(socialfields)) {
            if (value && value.length > 0)
                socialfields[key] = normalize(value, { forceHttps: true });
        }
        profileFields.social = socialfields;

        try {
            // Using upsert option (creates new doc if no match is found). It is a more efficient method than what previously was in place, a findOne-ifstatement
            let profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true, upsert: true }
            );
            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('... Server is @#(burp)$%ed')
        }
    });

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        // from Profile model use find method, then add the name and avatar which are part of the User model. populate from the user collection and you want the array of fields name and avatar
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('... Server is @#(burp)$%ed')
    }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
// adding in checkObjectId middleware to simplify/clean-up the error checking progress for userId
router.get('/user/:user_id', checkObjectId('user_id'),
    async ({ params: { user_id } }, res) => {
        try {
            const profile = await Profile.findOne({ user: user_id }).
                populate('user', ['name', 'avatar']);
            if (!profile) return res.status(400).json({ msg: 'Profile not found' });
            return res.json(profile);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('... Server is @#(burp)$%ed');
        }
    }
);


// @route   DELETE api/profile
// @desc    Delete profile, user, and posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // Remove user posts
        await Post.deleteMany({ user: req.user.id });
        // Remove Profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove User
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('... Server is @#(burp)$%ed');
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience',
    [auth, [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'Start/From date is required and needs to be from the past').not().isEmpty().custom((value, { req }) => (req.body.to ? value < req.body.to : true))
    ]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;
        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile(save);
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('... Server is @#(burp)$%ed');
        }
    });

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const foundProfile = await Profile.findOne({ user: req.user.id });
        
        foundProfile.experience = foundProfile.experience.filter(
            (exp) => exp._id.toString() !== req.params.exp_id
        );

        await foundProfile.save();
        return res.status(200).json(foundProfile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: '... Server is @#(burp)$%ed' });
    }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'Start/From date is required and needs to be from the past').not().isEmpty().custom((value, { req }) => (req.body.to ? value < req.body.to : true))
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile(save);
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('... Server is @#(burp)$%ed');
    }
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const foundProfile = await Profile.findOne({ user: req.user.id });
        foundProfile.education = foundProfile.education.filter(
            (edu) => edu._id.toString() !== req.params.edu_id
        );
        await foundProfile.save();
        return res.status(200).json(foundProfile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: '... Server is @#(burp)$%ed' });
    }
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from github
// @access  Public
router.get('/github/:username', async (req, res) => {
    try {
        const uri = encodeURI(
            `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
        );
        const headers = {
            'user-agent': 'node.js',
            Authorization: `token ${config.get('githubSecretToken')}`
        };

        const gitHubResponse = await axios.get(uri, { headers });
        return res.json(gitHubResponse.data);
    } catch (err) {
        console.error(err.message);
        return res.status(404).json({ msg: 'No Github profile found' });
    }
});


module.exports = router;