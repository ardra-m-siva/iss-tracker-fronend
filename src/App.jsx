import { useEffect, useState, } from 'react'
import './App.css'
import { AxiosCall } from './services/AxiosCall'
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

function App() {
  const [currentPos, setCurrentPos] = useState(null)
  const [distance, setDistance] = useState(null)
  const [closest, setClosest] = useState(null)
  const [currentPath, setCurrentPath] = useState(null)
  const [inputData, setInputData] = useState({
    latitude: '',
    longitude: '',
  })
  const [speed, setSpeed] = useState(0)
  const lat = Number(currentPos?.latitude);
  const lng = Number(currentPos?.longitude);

  useEffect(() => {
    const fetchISSData = async () => {
      await Promise.all([
        fetchCurrentPosition(),
        fetchCurrentPath(), fetchSpeed()
      ]);
    };

    fetchISSData();

    // const intervalId = setInterval(fetchISSData, 10000);

    // return () => clearInterval(intervalId);
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setInputData(prev => ({ ...prev, [name]: value }))
  }

  const fetchCurrentPosition = async () => {
    try {
      const result = await AxiosCall('GET', 'current')
      if (result?.status == 200) {
        setCurrentPos(result.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchCurrentPath = async () => {
    try {
      const result = await AxiosCall('GET', 'path')
      if (result?.status == 200) {
        const response = result.data.data.map(item => [item.latitude, item.longitude])
        setCurrentPath(response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchSpeed = async () => {
    try {
      const result = await AxiosCall('GET', 'speed')
      if (result?.status == 200) {
        setSpeed(result.data.data.speed)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmitOfForm = async (e) => {
    e.preventDefault()
    try {
      const result1 = await AxiosCall('GET', `distance?lat=${inputData.latitude}&lng=${inputData.longitude}`)
      const result2 = await AxiosCall('GET', `closest?lat=${inputData.latitude}&lng=${inputData.longitude}`)
      console.log(result1, result2);

      if (result1?.status == 200) {
        setDistance(result1.data.data.distance)
      }
      if (result2?.status == 200) {
        setClosest(result2.data.data.distance)
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='p-1'>
      <div className='grid grid-cols-2'>
        <div className='p-5'>
          <h2 className='font-medium text-3xl mb-5'>International Space Station</h2>
          <h4 className='text-xl font-semibold'>Current postion</h4>
          <div className='grid grid-cols-2'>
            <p>Latitude: {currentPos?.latitude}</p>
            <p>Speed: {speed?.toFixed(2)} km/h</p>
            <p>Longitude: {currentPos?.longitude}</p>
            <p>
              Last updated:{" "}
              {new Date(currentPos?.timestamp).toLocaleString()}
            </p>
          </div>
          <div className='my-4 bg-blue-100 rounded-4xl p-5'>
            <h6 className='mb-5 font-medium'>Find the distance and closest distance recorded to ISS</h6>
            <form onSubmit={handleSubmitOfForm} className='space-y-6'>
              <div className='flex items-center'>
                <label className='font-semibold' htmlFor="latitude">Latitude </label>
                <input id='latitude' className='rounded-lg ring-1 ms-2 p-1' onChange={(e) => handleInputChange(e)} type="text" name='latitude' />
              </div>
              <div className='flex items-center'>
                <label className='font-semibold' htmlFor="longitude">Longitude</label>
                <input id='longitude' className='rounded-lg ring-1 ms-2 p-1' onChange={(e) => handleInputChange(e)} type="text" name='longitude' />
              </div>
              <div className='flex justify-center' >
                <button className='py-2  px-5 bg-blue-500 font-medium  rounded-4xl ' type='submit'>Submit</button>
              </div>
            </form>
            <div className='mt-5'>
              {distance && <p>Distace from ISS: {distance?.toFixed(2) ?? 'N/A'} kilometers</p>}
              {closest && <p>Closest from ISS: {closest?.toFixed(2) ?? 'N/A'} kilometers</p>}
              {distance != null && closest != null && (
                <p>
                  {distance < closest
                    ? "ISS is getting closer"
                    : distance > closest
                      ? "ISS is moving farther away"
                      : "ISS is at its closest recorded distance"}
                </p>
              )}
            </div>
          </div>

        </div>
        <div>
          {currentPos && <MapContainer style={{ height: "500px", width: "100%" }} center={[lat, lng]} zoom={3} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={currentPath ?? []} />
            <Marker
              position={[
                lat, lng
              ]}
            >
              <Popup>
                ISS current position
              </Popup>
            </Marker>
          </MapContainer>}
        </div>
      </div>
    </div>
  )
}

export default App
