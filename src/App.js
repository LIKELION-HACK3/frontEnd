import './assets/css/styles.module.css';
import { Route, Routes } from 'react-router-dom';

import Header from './components/header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import CommunityListPage from './components/CommunityListPage/CommunityListPage';
import PropertyDetail from './components/PropertyDetail/PropertyDetail';

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/join" element={<SignUp />} />
                <Route path="/community" element={<CommunityListPage />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
