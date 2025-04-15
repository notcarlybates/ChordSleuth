const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const sendProgressionRequest = async ({ starting_chord, temperature = 0.7 }) => {
    try {
      const response = await fetch(`${baseURL}/api/progression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          starting_chord,
          temperature
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Progression generation failed:', response.status, errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Network/request error:", error);
      throw error; // Re-throw to let components handle it
    }
  };
  
  export default sendProgressionRequest;