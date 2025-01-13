const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/usernames/users', async (req, res) => {
    try {
        const response = await axios.post('https://users.roblox.com/v1/usernames/users', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/avatar', async (req, res) => {
    try {
        const { userIds, size, format } = req.query;
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userIds}&size=${size}&format=${format}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/items', async (req, res) => {
    try {
        const { userIds } = req.query;
        const response = await axios.get(`https://avatar.roblox.com/v1/users/${userIds}/avatar`);
        res.json(response.data.assets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/items/thumbnails', async (req, res) => {
    try {
        const { assetIds, size, format } = req.query;
        const response = await axios.get(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds}&size=${size}&format=${format}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/items/details', async (req, res) => {
    try {
        const { assetIds } = req.body;
        const response = await axios.post('https://catalog.roblox.com/v1/catalog/items/details', {
            items: assetIds.split(',').map(id => ({ itemType: 'Asset', id: parseInt(id) }))
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/profile', async (req, res) => {
    try {
        const { userId } = req.query;
        const response = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/friends', async (req, res) => {
    try {
        const { userId } = req.query;
        const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/friends/count`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/followers', async (req, res) => {
    try {
        const { userId } = req.query;
        const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/following', async (req, res) => {
    try {
        const { userId } = req.query;
        const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/friends/list', async (req, res) => {
    try {
        const { userId } = req.query;
        const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/friends`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/followers/list', async (req, res) => {
    try {
        const { userId } = req.query;
        const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followers`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/following/list', async (req, res) => {
    try {
        const { userId } = req.query;
        const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followings`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/headshots', async (req, res) => {
    try {
        const { userIds } = req.query;
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=150x150&format=Png`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/assetId/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://assetdelivery.roblox.com/v1/assetId/${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/asset', async (req, res) => {
    try {
        const { location } = req.query;
        const response = await axios.get(location, { responseType: 'arraybuffer' });
        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/assetInfo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://economy.roblox.com/v2/developer-products/${id}/info`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});