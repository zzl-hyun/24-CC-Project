import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import HomeMain from './components/home/main/home-main';


const App = () => {
  return (
    // <Router basename={process.env.PUBLIC_URL}>
    <Router> 
      <Routes>
        {/* Main Home Route */}
          <Route path="/" element= { <Home /> } >
            <Route index element={ <HomeMain /> } />
          </Route>
      </Routes>
    </Router>
  );
};

export default App;
