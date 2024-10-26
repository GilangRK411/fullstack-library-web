const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const pool = require('../database/database.js'); 

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const user = users[0];
        const token = crypto.randomBytes(32).toString('hex'); 
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

        await pool.query('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, token, expiresAt]);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,      
                pass: process.env.EMAIL_APP_PASSWORD   
            }
        });

        const resetLink = `http://localhost:5000/reset-password?token=${token}`;
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset',
            text: `Please reset your password using the following link: ${resetLink}`,
            html: `<p>Please reset your password using the following link: <a href="${resetLink}">Reset Password</a></p>`
        });

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.resetPassword = async (req, res) => {
    const { newPassword } = req.body;
    const { reset_token } = req.params; // Get token from route parameter

    if (!reset_token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const [tokens] = await pool.query('SELECT * FROM password_resets WHERE token = ?', [reset_token]);
        if (tokens.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const resetToken = tokens[0];
        if (new Date() > resetToken.expires_at) {
            return res.status(400).json({ message: 'Token has expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetToken.user_id]);

        await pool.query('DELETE FROM password_resets WHERE token = ?', [reset_token]);

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

