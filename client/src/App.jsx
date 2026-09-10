import {Routes , Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App(){
  return (
    <>
      <Navbar />  
      <Routes>
        {/* 2. Use the 'element' prop to show the component */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  )
}
export default App;