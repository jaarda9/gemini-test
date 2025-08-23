// Centralized syncToDatabase function for all JavaScript files
async function syncToDatabase() {
  try {
    const localStorageData = JSON.parse(localStorage.getItem("gameData"));
    
    if (!localStorageData || Object.keys(localStorageData).length === 0) {
      console.log('No localStorage data to sync');
      return { success: true, message: 'No data to sync' };
    }

    // Generate a unique user ID based on browser fingerprint or use existing one
    let userId = localStorage.getItem('userId');
    if (!userId) {
      // Create a simple fingerprint based on user agent and screen info
      const fingerprint = navigator.userAgent + screen.width + screen.height + screen.colorDepth;
      userId = 'user_' + btoa(fingerprint).substring(0, 16).replace(/[^a-zA-Z0-9]/g, '');
      localStorage.setItem('userId', userId);
    }

    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        localStorageData: localStorageData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Sync successful:', result);
    return result;

  } catch (error) {
    console.error('Error syncing to database:', error);
    throw error;
  }
}
