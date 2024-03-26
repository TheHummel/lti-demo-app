import '../app/globals.css';

import React, {useEffect, useState} from 'react';

import ky from 'ky'
    

const HomePage = () => {
  const [info, setInfo] = useState()

  const ngrokUrl = 'https://0508-89-206-81-172.ngrok-free.app';
  
  const sendGrade = async () => {
    const scorePayload = {
      score: 0.7,
      lineItemId: lineItemUrl,
    };
  
    const res = await fetch(`${ngrokUrl}/grade`, {
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
  };

  const getLtik = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const ltik = searchParams.get('ltik')
    console.log('ltik on client: ', ltik)
    if (!ltik) throw new Error('Missing lti key.')
    return ltik
  }

  const getMembers = async () => {
    try {
      const ltik = getLtik();
      const membersInfo = await ky.get(`${ngrokUrl}/members`, { credentials: 'include', headers: { Authorization: 'Bearer ' + ltik} }).json();
      console.log('membersInfo:', membersInfo);
    } catch (err) {
      console.error('Fehler beim Abrufen der Mitgliederinformationen:', err);
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      try {
        const ltik = getLtik()
        console.log('ltik useEffect: ', ltik)
        const launchInfo = await ky.get(ngrokUrl + '/info', { credentials: 'include', headers: { Authorization: 'Bearer ' + ltik} }).json()
        console.log('launchInfo: ', launchInfo)
        setInfo(launchInfo)
      } catch (err) {
        console.log(err)
      }
    }
    getInfo()
  }, [])


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">LTI Demo App</h1>
      <p className="text-lg mb-4">This demo app demonstrates the integration with OLAT using LTI.</p>
      <div className="absolute top-4 right-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Login</button>
      </div>
      <div className="flex justify-center">
        <button onClick={sendGrade} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Send grade</button>
        <button onClick={getMembers} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-4">Get Members</button>
      </div>
    </div>
  );
};

export default HomePage;