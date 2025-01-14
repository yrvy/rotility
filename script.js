document.getElementById('viewProfileButton').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    if (!username) {
        document.getElementById('result').textContent = 'Please enter a username.';
        return;
    }
    document.getElementById('result').textContent = 'Loading...';
    await loadUserProfile(username);
    await sendLog(`Searched for profile: ${username}`);
});

async function loadUserProfile(username) {
    try {
        const userId = await fetchUserId(username);
        const userAvatar = await fetchUserAvatar(userId);
        const userProfile = await fetchUserProfile(userId);
        const userFriends = await fetchUserFriends(userId);
        const userFollowers = await fetchUserFollowers(userId);
        const userFollowing = await fetchUserFollowing(userId);
        const showItemsButton = document.createElement('button');
        showItemsButton.textContent = 'Show Items';
        showItemsButton.classList.add('show-items-button');
        showItemsButton.addEventListener('click', async () => {
            document.getElementById('items').textContent = 'Loading items...';
            try {
                const userItems = await fetchUserItems(userId);
                const itemThumbnails = await fetchItemThumbnails(userItems);
                document.getElementById('items').innerHTML = `
                    <h2>${username}'s Items</h2>
                    <div class="items">
                    ${itemThumbnails.map(item => `
                        <div class="item">
                            <a href="https://www.roblox.com/catalog/${item.id}" target="_blank">
                                <img src="${item.thumbnailUrl}" alt="${item.name}">
                                <p>${item.name}</p>
                            </a>
                        </div>
                    `).join('')}
                    </div>
                `;
            } catch (error) {
                document.getElementById('items').textContent = `Failed to retrieve items: ${error.message}`;
            }
        });
        document.getElementById('result').innerHTML = `
            <h2>Profile Information</h2>
            <div class="profile-info">
                <div id="friendsButton">
                    <p class="bold">Friends</p>
                    <p>${userFriends.count}</p>
                </div>
                <div id="followersButton">
                    <p class="bold">Followers</p>
                    <p>${userFollowers.count}</p>
                </div>
                <div id="followingButton">
                    <p class="bold">Following</p>
                    <p>${userFollowing.count}</p>
                </div>
                <div>
                    <p class="bold">Username</p>
                    <p>${userProfile.name}</p>
                </div>
                <div>
                    <p class="bold">Display Name</p>
                    <p>${userProfile.displayName}</p>
                </div>
            </div>
            <img src="${userAvatar}" alt="User Avatar">
        `;
        document.getElementById('result').appendChild(showItemsButton);
        document.getElementById('items').innerHTML = ''; // Clear items section

        // Add event listener to the friends button
        document.getElementById('friendsButton').addEventListener('click', async () => {
            const friendsPanel = document.getElementById('friendsPanel');
            friendsPanel.classList.toggle('open');
            if (friendsPanel.classList.contains('open')) {
                const friendsList = await fetchFriendsList(userId);
                const friendIds = friendsList.map(friend => friend.id).join(',');
                const friendHeadshots = await fetchFriendHeadshots(friendIds);
                document.getElementById('friendsList').innerHTML = friendsList.map((friend, index) => `
                    <li onclick="loadUserProfile('${friend.name}')">
                        <img src="${friendHeadshots[index].imageUrl}" alt="${friend.name}">
                        ${friend.name}
                    </li>
                `).join('');
            }
        });

        // Add event listener to the followers button
        document.getElementById('followersButton').addEventListener('click', async () => {
            const followersPanel = document.getElementById('followersPanel');
            followersPanel.classList.toggle('open');
            if (followersPanel.classList.contains('open')) {
                const followersList = await fetchFollowersList(userId);
                const followerIds = followersList.map(follower => follower.id).join(',');
                const followerHeadshots = await fetchFollowerHeadshots(followerIds);
                document.getElementById('followersList').innerHTML = followersList.map((follower, index) => `
                    <li onclick="loadUserProfile('${follower.name}')">
                        <img src="${followerHeadshots[index].imageUrl}" alt="${follower.name}">
                        ${follower.name}
                    </li>
                `).join('');
            }
        });

        // Add event listener to the following button
        document.getElementById('followingButton').addEventListener('click', async () => {
            const followingPanel = document.getElementById('followingPanel');
            followingPanel.classList.toggle('open');
            if (followingPanel.classList.contains('open')) {
                const followingList = await fetchFollowingList(userId);
                const followingIds = followingList.map(following => following.id).join(',');
                const followingHeadshots = await fetchFollowingHeadshots(followingIds);
                document.getElementById('followingList').innerHTML = followingList.map((following, index) => `
                    <li onclick="loadUserProfile('${following.name}')">
                        <img src="${followingHeadshots[index].imageUrl}" alt="${following.name}">
                        ${following.name}
                    </li>
                `).join('');
            }
        });
    } catch (error) {
        document.getElementById('result').textContent = `Failed to retrieve profile: ${error.message}`;
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

async function fetchUserAvatar(userId) {
    const response = await fetch(`/api/users/avatar?userIds=${userId}&size=720x720&format=Png`);
    const data = await response.json();
    if (!data.data.length) {
        throw new Error('Avatar not found');
    }
    return data.data[0].imageUrl;
}

async function fetchUserProfile(userId) {
    const response = await fetch(`/api/users/profile?userId=${userId}`);
    const data = await response.json();
    if (!data) {
        throw new Error('Profile not found');
    }
    return data;
}

async function fetchUserFriends(userId) {
    const response = await fetch(`/api/users/friends?userId=${userId}`);
    const data = await response.json();
    if (!data) {
        throw new Error('Friends not found');
    }
    return data;
}

async function fetchUserFollowers(userId) {
    const response = await fetch(`/api/users/followers?userId=${userId}`);
    const data = await response.json();
    if (!data) {
        throw new Error('Followers not found');
    }
    return data;
}

async function fetchUserFollowing(userId) {
    const response = await fetch(`/api/users/following?userId=${userId}`);
    const data = await response.json();
    if (!data) {
        throw new Error('Following not found');
    }
    return data;
}

async function fetchUserItems(userId) {
    const response = await fetch(`/api/users/items?userIds=${userId}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
    }
    const data = await response.json();
    if (!data.length) {
        throw new Error('Items not found');
    }
    return data;
}

async function fetchItemThumbnails(items) {
    const itemIds = items.map(item => item.id).join(',');
    const response = await fetch(`/api/items/thumbnails?assetIds=${itemIds}&size=420x420&format=Png`);
    const data = await response.json();
    if (!data.data.length) {
        throw new Error('Thumbnails not found');
    }
    return data.data.map((thumbnail, index) => ({
        id: items[index].id,
        name: items[index].name,
        thumbnailUrl: thumbnail.imageUrl
    }));
}

async function fetchFriendsList(userId) {
    const response = await fetch(`/api/users/friends/list?userId=${userId}`);
    const data = await response.json();
    if (!data.data) {
        throw new Error('Friends list not found');
    }
    return data.data;
}

async function fetchFollowersList(userId) {
    const response = await fetch(`/api/users/followers/list?userId=${userId}`);
    const data = await response.json();
    if (!data.data) {
        throw new Error('Followers list not found');
    }
    return data.data;
}

async function fetchFollowingList(userId) {
    const response = await fetch(`/api/users/following/list?userId=${userId}`);
    const data = await response.json();
    if (!data.data) {
        throw new Error('Following list not found');
    }
    return data.data;
}

async function fetchFriendHeadshots(userIds) {
    const response = await fetch(`/api/users/headshots?userIds=${userIds}`);
    const data = await response.json();
    if (!data.data) {
        throw new Error('Friend headshots not found');
    }
    return data.data;
}

async function fetchFollowerHeadshots(userIds) {
    const response = await fetch(`/api/users/headshots?userIds=${userIds}`);
    const data = await response.json();
    if (!data.data) {
        throw new Error('Follower headshots not found');
    }
    return data.data;
}

async function fetchFollowingHeadshots(userIds) {
    const response = await fetch(`/api/users/headshots?userIds=${userIds}`);
    const data = await response.json();
    if (!data.data) {
        throw new Error('Following headshots not found');
    }
    return data.data;
}

async function sendLog(message) {
    const webhookUrl = 'https://discord.com/api/webhooks/1328539315998953555/gTvyaKvOmpB9-b2sFyVlKGQc-NW5xsUxOjFTKKO82HgffnYP0vrAeaAIl8FpaIRVCscj';
    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: message })
    });
}