import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import HomeMain from './components/home/home-main';
import Trade from './components/trade/trade';
import Rank from './components/rank/rank';
import Profile from './components/profile/profile';
import ProtectedRoute from './components/guards/ProtectedRoute';
const App = () => {
  return (
    // <Router basename={process.env.PUBLIC_URL}>
    <Router> 
      <Routes>
        {/* Main Home Route */}
          <Route path="/" element= { <Home /> } >
            <Route index element={ <HomeMain /> } />
            <Route path='/trade' element={ <Trade /> } />
            <Route path='/rank' element={ <Rank /> } />
            <Route path='/profile' 
              element={ 
                <ProtectedRoute>
                  <Profile /> 
                </ProtectedRoute>
                } 
              />
          </Route>
      </Routes>
    </Router>
  );
};

export default App;
