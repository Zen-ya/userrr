// Fonction pour rafraîchir le token
export async function refreshAccessToken(refreshToken) {
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }
    });
    return response.data.access_token; // Retournez le nouveau access token
  }

