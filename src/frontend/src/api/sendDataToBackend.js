const sendDataToBackend = async ({ root, modifier, fret, tuning}) => {
  try {
      const response = await fetch('http://127.0.0.1:8000/api/fing', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
              root, 
              modifier, 
              fret, 
              tuning // Now properly defined in parameters with default value
          }),
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Backend error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
          });
          return null;
      }

      const data = await response.json();

      if (!data?.fing) {
          console.error('Invalid response format:', data);
          return null;
      }

      console.log("Finger positions:", data.fing);
      return data.fing;
  } catch (error) {
      console.error("Network/request error:", error);
      return null;
  }
};

export default sendDataToBackend;