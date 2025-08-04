import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, getDocs } from 'firebase/firestore';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Fetch all judges from the database
  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const judgesRef = collection(db, "judges");
        const snapshot = await getDocs(judgesRef);
        const judgeSlugs = snapshot.docs.map(doc => doc.data().slug);
        
        // Add "John Smith" as a test entry if no judges exist
        if (judgeSlugs.length === 0) {
          judgeSlugs.push('john-smith');
        }
        
        setSuggestions(judgeSlugs);
      } catch (error) {
        console.error("Error fetching judges:", error);
        // Add "John Smith" as fallback test entry
        setSuggestions(['john-smith']);
      }
    };

    fetchJudges();
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const judgeSlug = searchTerm.toLowerCase().replace(/\s+/g, '-');
      
      // Check if the judge exists in our suggestions
      const judgeExists = suggestions.includes(judgeSlug);
      
      if (judgeExists) {
        navigate(`/judge/${judgeSlug}`);
      } else {
        // Show no results message
        setShowSuggestions(true);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const judgeName = suggestion
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    setSearchTerm(judgeName);
    setShowSuggestions(false);
    navigate(`/judge/${suggestion}`);
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    const judgeName = suggestion
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return judgeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ 
      padding: '4rem 2rem', 
      maxWidth: '500px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{  
        marginBottom: '1rem',
        color: '#ffffff',
        fontWeight: '300'
      }}>
        ratemyjudge
      </h1>
      
      <h2 style={{  
        marginBottom: '1rem',
        color: '#ffffff',
        fontWeight: '300'
      }}>
        Crowdsourced judge info for debaters
      </h2>

      <div ref={searchRef} style={{ position: 'relative' }}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter judge name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              border: '1px solid #333333',
              borderRadius: '4px',
              outline: 'none',
              backgroundColor: '#000000',
              color: '#ffffff',
              boxSizing: 'border-box',
              marginBottom: '1rem'
            }}
          />
          
          {showSuggestions && filteredSuggestions.length > 0 && searchTerm.trim() && (
            <div style={{
              backgroundColor: '#000000',
              border: '1px solid #333333',
              borderRadius: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: '1rem'
            }}>
              {filteredSuggestions.slice(0, 5).map((suggestion, index) => {
                const judgeName = suggestion
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                
                return (
                  <div
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #333333' : 'none',
                      color: '#ffffff'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                  >
                    {judgeName}
                  </div>
                );
              })}
            </div>
          )}
          
          {showSuggestions && searchTerm && filteredSuggestions.length === 0 && (
            <div style={{
              backgroundColor: '#000000',
              border: '1px solid #333333',
              borderRadius: '4px',
              padding: '0.75rem 1rem',
              color: '#cccccc',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              No judges found matching "{searchTerm}". 
              <Link 
                to="/add-judge" 
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  marginLeft: '0.5rem'
                }}
              >
                Add One
              </Link>
            </div>
          )}
          
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid #ffffff',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#ffffff';
            }}
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home; 