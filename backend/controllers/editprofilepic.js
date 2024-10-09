const pool = require('../database/database.js');

exports.editProfilePic = async (req, res) => {
    const uniqueId = req.params.unique_id;
    const { new_email, new_username, profile_photo } = req.body;

    console.log('Request received with:', req.params, req.body);
    if (!uniqueId) {
        return res.status(400).send('unique_id is required.');
    }

    const connection = await pool.getConnection();  
    try {
        await connection.beginTransaction(); 
        console.log('Transaction started');

        let changesMade = false; 

        const editColumns = [];
        const editValues = [];

        if (new_email) {
            editColumns.push('new_email');
            editValues.push(new_email);
        }
        if (new_username) {
            editColumns.push('new_username');
            editValues.push(new_username);
        }
        if (profile_photo) {
            editColumns.push('profile_photo');
            editValues.push(profile_photo); 
        }

        if (editColumns.length > 0) {
            const insertQuery = `
                INSERT INTO user_edit (unique_id, ${editColumns.join(', ')}) 
                VALUES (?, ${editColumns.map(() => '?').join(', ')})
            `;
            console.log('Insert query:', insertQuery);

            await connection.query(insertQuery, [uniqueId, ...editValues]); 
            console.log('Insert into user_edit successful');
            changesMade = true;  
        }

        const updateColumns = [];
        const updateValues = [];

        if (new_email) {
            updateColumns.push('email = ?');
            updateValues.push(new_email);
        }
        if (new_username) {
            updateColumns.push('username = ?');
            updateValues.push(new_username);
        }
        if (profile_photo) { 
            updateColumns.push('profile_photo = ?');
            updateValues.push(profile_photo);
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
            changesMade = true;  
        }

        if (changesMade) {
            await connection.commit();
            console.log('Transaction committed successfully');
            res.status(200).send('User data updated successfully.');
        } else {
            await connection.rollback();
            console.log('No changes made, transaction rolled back');
            res.status(400).send('No changes were made to user data.');
        }
    } catch (error) {
        console.error('Transaction error:', error);
        await connection.rollback();  
        res.status(500).send('Error updating user data');
    } finally {
        connection.release(); 
        console.log('Connection released');
    }
};
