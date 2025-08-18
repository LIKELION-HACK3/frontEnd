import './assets/css/styles.module.css';
import { Route, Routes } from 'react-router-dom';

import Header from './components/header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import MapList from './pages/MapList/MapList';
import CommunityPage from './pages/Community/CommunityPage/CommunityPage';
import CommunityListPage from './pages/Community/CommunityListPage/CommunityListPage';
import PropertyDetail from './components/PropertyDetail/PropertyDetail';

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/join" element={<SignUp />} />
                <Route path="/map" element={<MapList />} />
                <Route path="/community_list" element={<CommunityListPage />} />
                <Route path="/community_news" element={<CommunityPage />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
