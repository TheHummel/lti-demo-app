import '../app/globals.css';

import React, {useEffect, useState} from 'react';

import ky from 'ky'
    

const HomePage = () => {
  const [info, setInfo] = useState()

  const ngrokUrl = 'https://2eb4-89-206-81-34.ngrok-free.app';

  const getLtik = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const ltik = searchParams.get('ltik')
    console.log('ltik on client: ', ltik)
    if (!ltik) throw new Error('Missing lti key.')
    return ltik
  }
  
  const sendGrade = async () => {
    const ltik = getLtik();
    const grade = 0.42;
    try {
      const body = {
        grade: grade
      }

      await ky.post(`${ngrokUrl}/grade`, { credentials: 'include', json: body, headers: { Authorization: 'Bearer ' + ltik } })
      console.log('Grade sent successfully!')
    } catch (err) {
      console.log(err)
    }
  };

  const getGrade = async () => {
    try {
      const ltik = getLtik();
      const membersInfo = await ky.get(`${ngrokUrl}/grade`, { credentials: 'include', headers: { Authorization: 'Bearer ' + ltik} }).json();
      console.log('membersInfo:', membersInfo);
    } catch (err) {
      console.error('Error getting grade: ', err);
    }
  };

  const createLineItem = async () => {
    const ltik = getLtik();
    const result = await ky.post(`${ngrokUrl}/lineitem`, { credentials: 'include', headers: { Authorization: 'Bearer ' + ltik} })
    console.log('createLineItem: ', result)
  }


  const getLineItem = async () => {
    const ltik = getLtik();
    const result = await ky.get(`${ngrokUrl}/lineitem`, { credentials: 'include', headers: { Authorization: 'Bearer ' + ltik} })
    console.log('getLineItem: ', result)
  }

  const getInfo = async () => {
    const ltik = getLtik()
    const launchInfo = await ky.get(ngrokUrl + '/info', { credentials: 'include', headers: { Authorization: 'Bearer ' + ltik} }).json()
    console.log('launchInfo: ', launchInfo)
    setInfo(launchInfo)
  }

  useEffect(() => {
    const getInfo = async () => {
      try {
        getInfo()
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
        {/* <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Login</button> */}
      </div>
      <div className="flex justify-center">
        <button onClick={getInfo} className="bg-white text-white px-4 py-2 rounded-lg hover:bg-white">Get Info</button>
        <button onClick={sendGrade} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Send Grade</button>
        <button onClick={getGrade} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-4">Get Grade</button>
        <button onClick={createLineItem} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 ml-4">Create Line Item</button>
        <button onClick={getLineItem} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 ml-4">Get Line Item</button>
      </div>
    </div>
  );
};

export default HomePage;