import './assets/css/styles.module.css';
import { Route, Routes } from 'react-router-dom';

// 대문자/소문자 경로 모두 허용: 소문자 우선, 브릿지 파일이 있을 경우에도 안전
import Header from './components/header/Header.jsx';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import MapList from './pages/MapList/MapList';
import CommunityPage from './pages/Community/CommunityPage/CommunityPage';
import CommunityListPage from './pages/Community/CommunityListPage/CommunityListPage';
import CommunityPostPage from './pages/Community/CommunityPostPage/CommunityPostPage';
import DetailPage from './pages/DetailPage/DetailPage';
import MyRoom from './pages/MyRoom/MyRoom';
import AiReportPage from './pages/AiReport/AiReportPage';
import AiHistoryPage from './pages/AiReport/AiHistoryPage';

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
                <Route path="/community/posts/:id" element={<CommunityPostPage />} />
                <Route path="/community_news" element={<CommunityPage />} />
                <Route path="/property/:id" element={<DetailPage />} />
                <Route path="/myroom" element={<MyRoom />} />
                <Route path="/report/history" element={<AiHistoryPage />} />
                <Route path="/report/:id" element={<AiReportPage />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
