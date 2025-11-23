
export const contextService = {
  getCurrentTime: (): string => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getUserLocation: (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('Location access not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // We won't do reverse geocoding here to avoid external API dependencies for the demo,
          // but we can provide coordinates which the AI can theoretically understand or just flag availability.
          // For privacy/simplicity in this demo, we just confirm access.
          // In a real app, you'd use Google Maps Geocoding API here.
          const { latitude, longitude } = position.coords;
          resolve(`Lat: ${latitude.toFixed(2)}, Long: ${longitude.toFixed(2)}`);
        },
        (error) => {
          let errorMsg = 'Unknown';
          switch (error.code) {
            case error.PERMISSION_DENIED: errorMsg = 'Permission Denied'; break;
            case error.POSITION_UNAVAILABLE: errorMsg = 'Unavailable'; break;
            case error.TIMEOUT: errorMsg = 'Timeout'; break;
          }
          resolve(`Location unavailable: ${errorMsg}`);
        },
        { timeout: 5000 }
      );
    });
  }
};
