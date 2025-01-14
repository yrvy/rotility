document.getElementById('viewAssetButton').addEventListener('click', async () => {
    const assetId = document.getElementById('assetId').value;
    if (!assetId) {
        document.getElementById('assetResult').textContent = 'Please enter an asset ID.';
        return;
    }
    document.getElementById('assetResult').textContent = 'Loading...';
    await loadAsset(assetId);
});

async function loadAsset(assetId) {
    try {
        const locationResponse = await fetch(`/api/assetId/${assetId}`);
        const locationData = await locationResponse.json();
        const location = locationData.location;

        const assetResponse = await fetch(`/api/asset?location=${encodeURIComponent(location)}`);
        const assetText = await assetResponse.text();
        const templateId = parseTemplateId(assetText);

        const templateResponse = await fetch(`/api/assetId/${templateId}`);
        const templateData = await templateResponse.json();
        const templateLocation = templateData.location;

        const assetContentResponse = await fetch(`/api/asset?location=${encodeURIComponent(templateLocation)}`);
        const assetContent = await assetContentResponse.blob();

        const assetInfoResponse = await fetch(`/api/assetInfo/${assetId}`);
        const assetInfo = await assetInfoResponse.json();

        const description = assetInfo.Description.length > 130 ? "Description too long, not displaying." : assetInfo.Description;

        const assetImageUrl = URL.createObjectURL(assetContent);

        document.getElementById('assetResult').innerHTML = `
            <h2>${assetInfo.Name}</h2>
            <p>${description}</p>
            <img src="${assetImageUrl}" alt="${assetInfo.Name}">
            <p>Created by: ${assetInfo.Creator.Name}</p>
            <a href="${assetImageUrl}" download="${assetInfo.Name}.png" class="download-button">Download</a>
        `;
    } catch (error) {
        document.getElementById('assetResult').textContent = `Failed to retrieve the asset: ${error.message}`;
    }
}

function parseTemplateId(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const urlElement = Array.from(xmlDoc.getElementsByTagName('url')).find(url => url.textContent.includes('http://www.roblox.com/asset/'));
    if (urlElement) {
        return urlElement.textContent.split('id=')[1].split('</url>')[0];
    }
    throw new Error('Template ID not found');
}
