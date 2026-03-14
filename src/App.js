import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Register from "./components/pages/auth/Register";
import Login from './components/pages/auth/Login';
import ChatPage from "./components/pages/ChatPage";

function App() {
  return (
    <>
      <Router basename="/real-chat">
        <Header />
        <Routes>
          <Route path='/' element={<ChatPage />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
