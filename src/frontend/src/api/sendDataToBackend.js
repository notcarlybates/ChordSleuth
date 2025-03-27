const sendDataToBackend = async ({ root, modifier, fret }) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/fing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ root, modifier, fret }),
      });
  
      if (!response.ok) {
        console.error('Backend response not OK:', response.status);
        return null;  // Return null in case of a non-OK response
      }
  
      const data = await response.json();
  
      // Check if data contains 'fing' and return it, otherwise log an error
      if (data && data.fing) {
        console.log("Finger positions:", data.fing);

        return data.fing

      } else {
        console.error('No fing data in response:', data);
        return null;  // Return null if 'fing' is not present
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
      return null;  // Return null in case of an error
    }
  };
  
  export default sendDataToBackend;