import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import './App.css'

const socket = io("http://localhost:3000")
function App() {
  const [machine, setMachine] = useState({
    status: "",
    cycle_count: 0,
    timestamp: "",
  });

  useEffect(() => {
    socket.on("machine-status", (data) => {
      setMachine(data)
    })

    return () => socket.off("machine-status")
  }, []);


  return (
    <>
      <div>
        <h1>Machine 1</h1>
        <p>Status: {machine.status}</p>
        <p>Cycle: {machine.cycle_count}</p>
        <p>Time: {machine.timestamp}</p>

      </div>
    </>
  )
}

export default App
