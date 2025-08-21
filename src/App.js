import './assets/css/styles.module.css';
import { Route, Routes } from 'react-router-dom';

<<<<<<< Updated upstream
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import MapList from './pages/MapList/MapList';
import CommunityPage from './pages/Community/CommunityPage/CommunityPage';
import CommunityListPage from './pages/Community/CommunityListPage/CommunityListPage';
import DetailPage from './pages/DetailPage/DetailPage';
import MyRoom from './pages/MyRoom/MyRoom';
=======
import Home from './pages/Home/Home';
>>>>>>> Stashed changes

function App() {
    return (
        <>
<<<<<<< Updated upstream
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/join" element={<SignUp />} />
                <Route path="/map" element={<MapList />} />
                <Route path="/community_list" element={<CommunityListPage />} />
                <Route path="/community_news" element={<CommunityPage />} />
                <Route path="/property/:id" element={<DetailPage />} />
                <Route path="/myroom" element={<MyRoom />} />
            </Routes>
            <Footer />
=======
            <Routes>
                <Route path="/" element={<Home/>} />
            </Routes>
>>>>>>> Stashed changes
        </>
    );
}

export default App;