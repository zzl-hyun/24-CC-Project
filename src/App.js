import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import HomeMain from './components/home/home-main';
import Trade from './components/trade/trade';
// import Rank
// import Profile

const App = () => {
  return (
    // <Router basename={process.env.PUBLIC_URL}>
    <Router> 
      <Routes>
        {/* Main Home Route */}
          <Route path="/" element= { <Home /> } >
            <Route index element={ <HomeMain /> } />
            <Route path='/trade' element={ <Trade /> } />
          </Route>
      </Routes>
    </Router>
  );
};

export default App;
