import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './Home';
import JudgePage from './JudgePage';
import AddJudge from './AddJudge';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav style={{
      backgroundColor: '#000000',
      padding: '1rem 2rem',
      borderBottom: '1px solid #333333'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link 
          to="/" 
          style={{
            fontSize: '1.25rem',
            color: '#ffffff',
            textDecoration: 'none'
          }}
        >
          ratemyjudge
        </Link>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {location.pathname !== '/' && (
            <Link 
              to="/" 
              style={{
                color: '#cccccc',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              ← Back
            </Link>
          )}
          <span style={{
            color: '#666666',
            fontSize: '1rem',
            fontStyle: 'italic'
          }}>
            by wastella
          </span>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/judge/:judgeSlug" element={<JudgePage />} />
        <Route path="/add-judge" element={<AddJudge />} />
      </Routes>
    </Router>
  );
}

export default App;