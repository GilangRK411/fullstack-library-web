const pool = require('../database/database.js');

exports.editProfilePic = async (req, res) => {
    const uniqueId = req.params.unique_id;
    const { new_email, new_username, new_profile_picture } = req.body;

    console.log('Request received with:', req.params, req.body);
    if (!uniqueId) {
        return res.status(400).send('unique_id is required.');
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        console.log('Transaction started');

        const changes = {
            profile_picture: null,
            email: null,
            username: null,
            image_type: null, 
        };

        if (new_profile_picture) {
            if (typeof new_profile_picture !== 'string') {
                return res.status(400).send('new_profile_picture must be a string.');
            }
            const matches = new_profile_picture.match(/^data:([a-zA-Z]+\/[a-zA-Z]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                return res.status(400).send('Invalid base64 image string format. Expected format: data:[mimetype];base64,[data]');
            }
            const mimeType = matches[1];
            const base64Data = matches[2];
            const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validMimeTypes.includes(mimeType)) {
                return res.status(400).send('Unsupported image format. Allowed formats: JPEG, PNG, GIF.');
            }

            changes.profile_picture = Buffer.from(base64Data, 'base64');
            changes.image_type = mimeType;
        }

        if (new_email) {
            changes.email = new_email;
        }
        if (new_username) {
            changes.username = new_username;
        }

        const editColumns = [];
        const editValues = [];

        if (changes.profile_picture || changes.email || changes.username || changes.image_type) {
            if (changes.profile_picture) {
                editColumns.push('new_profile_picture');
                editValues.push(changes.profile_picture);
            }
            if (changes.email) {
                editColumns.push('new_email');
                editValues.push(changes.email);
            }
            if (changes.username) {
                editColumns.push('new_username');
                editValues.push(changes.username);
            }
            if (changes.image_type) {
                editColumns.push('new_image_type');
                editValues.push(changes.image_type); 
            }

            const insertQuery = `
                INSERT INTO user_edit (unique_id, ${editColumns.join(', ')}) 
                VALUES (?, ${editColumns.map(() => '?').join(', ')})
            `;
            console.log('Insert query:', insertQuery);
            await connection.query(insertQuery, [uniqueId, ...editValues]);
            console.log('Insert into user_edit successful');
        }

        const updateColumns = [];
        const updateValues = [];

        if (changes.email) {
            updateColumns.push('email = ?');
            updateValues.push(changes.email);
        }
        if (changes.username) {
            updateColumns.push('username = ?');
            updateValues.push(changes.username);
        }
        if (changes.profile_picture) {
            updateColumns.push('profile_picture = ?');
            updateValues.push(changes.profile_picture);
        }
        if (changes.image_type) {
            updateColumns.push('image_type = ?'); 
            updateValues.push(changes.image_type); 
        }

        if (updateColumns.length > 0) {
            const updateQuery = `
                UPDATE users 
                SET ${updateColumns.join(', ')} 
                WHERE unique_id = ?
            `;
            console.log('Update query:', updateQuery);
            await connection.query(updateQuery, [...updateValues, uniqueId]);
            console.log('Update in users successful');
        } else {
            console.log('No changes made to user data');
        }

        await connection.commit();
        console.log('Transaction committed successfully');
        res.status(200).send('User data updated successfully.');

    } catch (error) {
        console.error('Transaction error:', error);
        await connection.rollback();
        res.status(500).send('Error updating user data');
    } finally {
        connection.release();
        console.log('Connection released');
    }
};
