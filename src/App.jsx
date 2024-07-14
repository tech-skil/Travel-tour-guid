
import './App.css'
import ChatInterface from "./Components/ChatInterface";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {

  return (
    <>


    <Router>
      <Routes>
        <Route path="/" element={ <ChatInterface/>} />
        {/* <Route path="/about" element={<AboutPage />} /> */}
      </Routes>
    </Router>

    </>
  )
}

export default App
