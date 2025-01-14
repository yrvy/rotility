document.getElementById('viewOutfitsButton').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    if (!username) {
        document.getElementById('result').textContent = 'Please enter a username.';
        return;
    }
    document.getElementById('result').textContent = 'Loading...';
    await loadUserOutfits(username);
});

async function loadUserOutfits(username) {
    try {
        const userId = await fetchUserId(username);
        const outfits = await fetchUserOutfits(userId);
        const currentOutfit = await fetchCurrentOutfit(userId);
        const currentOutfitThumbnail = await fetchCurrentOutfitThumbnail(userId);

        let resultHtml = `
            <h2>${username}'s Outfits</h2>
            <div class="outfit">
                <h3>Current Outfit</h3>
                <img src="${currentOutfitThumbnail}" alt="Current Outfit" style="max-width: 50%;">
                <div class="scales">
                    <p><strong>Head:</strong> ${currentOutfit.scales.head}</p>
                    <p><strong>Height:</strong> ${currentOutfit.scales.height}</p>
                    <p><strong>Width:</strong> ${currentOutfit.scales.width}</p>
                    <p><strong>Depth:</strong> ${currentOutfit.scales.depth}</p>
                    <p><strong>Proportion:</strong> ${currentOutfit.scales.proportion}</p>
                    <p><strong>Body Type:</strong> ${currentOutfit.scales.bodyType}</p>
                </div>
            </div>
        `;

        document.getElementById('result').innerHTML = resultHtml;

        const outfitsGrid = document.getElementById('outfitsGrid');
        outfitsGrid.innerHTML = '';

        outfits.forEach(async (outfit, index) => {
            const outfitThumbnail = await fetchOutfitThumbnail(outfit.id);
            const outfitDiv = document.createElement('div');
            outfitDiv.classList.add('outfit');
            outfitDiv.innerHTML = `
                <h3>${outfit.name}</h3>
                <img src="${outfitThumbnail}" alt="${outfit.name}">
                <p>${index + 1}/${outfits.length}</p>
            `;
            outfitDiv.addEventListener('click', async () => {
                try {
                    const outfitItems = await fetchOutfitItems(outfit.id);
                    const itemsHtml = outfitItems.map(item => `<a href="https://www.roblox.com/catalog/${item.id}" target="_blank"><img src="${item.thumbnailUrl}" alt="${item.name}"></a>`).join('');
                    const modalContent = document.getElementById('modalContent');
                    modalContent.innerHTML = `
                        <span class="modal-close" id="modalClose">&times;</span>
                        <h4>Items Worn</h4>
                        <div class="items-grid">${itemsHtml}</div>
                    `;
                    document.getElementById('modal').style.display = 'block';

                    document.getElementById('modalClose').addEventListener('click', () => {
                        document.getElementById('modal').style.display = 'none';
                    });
                } catch (error) {
                    console.error(`Failed to retrieve outfit items: ${error.message}`);
                }
            });
            outfitsGrid.appendChild(outfitDiv);
        });
    } catch (error) {
        document.getElementById('result').textContent = `Failed to retrieve outfits: ${error.message}`;
    }
}

async function fetchUserId(username) {
    const response = await fetch('/api/usernames/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usernames: [username] })
    });
    const data = await response.json();
    if (!data.data.length) {
        throw new Error('User not found');
    }
    return data.data[0].id;
}

async function fetchUserOutfits(userId) {
    const response = await fetch(`/api/users/${userId}/outfits`);
    const data = await response.json();
    if (!data.data || !data.data.length) {
        throw new Error('No outfits found');
    }
    return data.data.map(outfit => ({
        id: outfit.id,
        name: outfit.name,
        items: [] // Placeholder, you can update this with actual items if available
    }));
}

async function fetchCurrentOutfit(userId) {
    const response = await fetch(`/api/users/${userId}/avatar`);
    const data = await response.json();
    if (!data) {
        throw new Error('Current outfit not found');
    }
    return data;
}

async function fetchCurrentOutfitThumbnail(userId) {
    const response = await fetch(`/api/users/avatar?userIds=${userId}&size=720x720&format=Png`);
    const data = await response.json();
    if (!data.data.length) {
        throw new Error('Current outfit thumbnail not found');
    }
    return data.data[0].imageUrl;
}

async function fetchOutfitThumbnail(outfitId) {
    const response = await fetch(`/api/users/outfits/thumbnail?userOutfitIds=${outfitId}&size=420x420&format=Png`);
    const data = await response.json();
    if (!data.data.length) {
        throw new Error('Outfit thumbnail not found');
    }
    return data.data[0].imageUrl;
}

async function fetchOutfitItems(outfitId) {
    const response = await fetchWithRetry(`/api/users/outfits/${outfitId}/items`);
    const data = await response.json();
    if (!data.assets || !data.assets.length) {
        throw new Error('Outfit items not found');
    }
    const itemIds = data.assets.map(item => item.id).join(',');
    const thumbnailsResponse = await fetch(`/api/items/thumbnails?assetIds=${itemIds}&size=420x420&format=Png`);
    const thumbnailsData = await thumbnailsResponse.json();
    return thumbnailsData.data.map((thumbnail, index) => ({
        id: data.assets[index].id,
        name: data.assets[index].name,
        thumbnailUrl: thumbnail.imageUrl
    }));
}

async function fetchWithRetry(url, options = {}, retries = 5, backoff = 300) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (retries > 0 && error.message.includes('429')) {
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        } else {
            throw error;
        }
    }
}
