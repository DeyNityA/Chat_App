import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import ProtectRouter from "./ProtectRouter";
import SetAvatar from "./pages/SetAvatar";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectRouter/>}>
          <Route path="/" element={<Chat />} />
          <Route path="/setavatar" element={<SetAvatar/>}/>
        </Route>
        
       
      </Routes>
    </BrowserRouter>
  );
}

export default App;
