import '../app/globals.css';

import React from 'react';

const handleLogin = () => {
  window.location.href = '/login';
};

const [lineItemUrl, setLineItemUrl] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const lineItem = params.get('lineItemUrl');
        if (lineItem) {
            setLineItemUrl(decodeURIComponent(lineItem));
        }
    }, []);

    const sendGrade = async () => {
      const ngrokUrl = 'https://4559-89-206-81-172.ngrok-free.app ';
      const scorePayload = {
        score: 0.7,
        lineItemId: lineItemUrl,
      };
    
      try {
        const res = await fetch(`${ngrokUrl}/api/send-grade`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scorePayload),
        });
    
        if (res.ok) {
          const data = await res.json();
          console.log("Bewertung erfolgreich gesendet: ", data);
        } else {
          console.error('Fehler beim Senden der Bewertung:', res.statusText);
        }
      } catch (error) {
        console.error('Fehler beim Senden der Bewertung:', error);
      }
    };
    

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">LTI Demo App</h1>
      <p className="text-lg mb-4">This demo app demonstrates the integration with OLAT using LTI.</p>
      <div className="absolute top-4 right-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Login</button>
      </div>
      <div className="flex justify-center">
        <button onClick={sendGrade} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Send grade</button>
      </div>
    </div>
  );
};

export default HomePage;