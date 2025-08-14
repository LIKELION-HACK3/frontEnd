import './assets/css/styles.module.css';
import { Route, Routes } from 'react-router-dom';

import Header from './components/header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/join" element={<SignUp />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;