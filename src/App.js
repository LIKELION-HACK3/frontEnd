import Header from './components/Header/Header'; // Corrected path
import './assets/css/styles.module.css';

function App() {
    return (
        <div className="App">
            <Header /> {/* Header component rendered here */}
            {/* Other page content goes here */}
        </div>
    );
}

export default App;
