import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Register from "./components/pages/auth/Register";
import Login from './components/pages/auth/Login';
import ChatPage from "./components/pages/ChatPage";
import AddFriend from './components/pages/auth/AddFriend';
import FAQPage from './components/pages/FAQPage';
import AboutUs from './components/pages/AboutUs';
import MyProfile from './components/pages/MyProfile';

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
            <Route path='/faq' element={<FAQPage />} />
            <Route path='/about-us' element={<AboutUs />} />
            <Route path='/my-profile' element={<MyProfile />} />
          </Routes>
        </div >
      </Router>
    </>
  );
};

export default App;
