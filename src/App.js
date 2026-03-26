import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Register from "./components/pages/auth/Register";
import Login from './components/pages/auth/Login';
import ChatPage from "./components/pages/ChatPage";
import AddFriend from './components/pages/auth/AddFriend';

function App() {
  return (
    <>
      <Router basename="/real-chat">
        <Header />
        <div className="overflow-hidden">
          <Routes>
            <Route path='/' element={<ChatPage />} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/add-friend' element={<AddFriend />} />
          </Routes>
        </div >
      </Router>
    </>
  );
};

export default App;
