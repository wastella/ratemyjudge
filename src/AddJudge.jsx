import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function AddJudge() {
  const [judgeName, setJudgeName] = useState('');
  const [circuit, setCircuit] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to capitalize first letter of each word
  const capitalizeName = (name) => {
    return name.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judgeName.trim()) return;

    setLoading(true);
    
    try {
      const formattedJudgeName = capitalizeName(judgeName);
      const judgeSlug = formattedJudgeName.toLowerCase().replace(/\s+/g, '-');
      
      // Process circuit tags
      const circuitTags = circuit.trim()
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Add the judge to the database
      await addDoc(collection(db, "judges"), {
        name: formattedJudgeName,
        slug: judgeSlug,
        circuits: circuitTags,
        timestamp: serverTimestamp()
      });

      // Navigate to the new judge's page
      navigate(`/judge/${judgeSlug}`);
    } catch (error) {
      console.error("Error adding judge:", error);
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: '2rem',
        color: '#ffffff',
        fontWeight: '300'
      }}>
        Add New Judge
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: '#ffffff',
            fontSize: '0.9rem'
          }}>
            Judge Name:
          </label>
          <input
            type="text"
            placeholder="Enter judge name..."
            value={judgeName}
            onChange={(e) => setJudgeName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.9rem',
              border: '1px solid #333333',
              borderRadius: '4px',
              backgroundColor: '#000000',
              color: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: '#ffffff',
            fontSize: '0.9rem'
          }}>
            Circuit Tags (optional):
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Enter NatCirc or Ohio..."
              value={circuit}
              onChange={(e) => setCircuit(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                border: '1px solid #333333',
                borderRadius: '4px',
                backgroundColor: '#000000',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            
            {circuit && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#000000',
                border: '1px solid #333333',
                borderRadius: '4px',
                maxHeight: '100px',
                overflowY: 'auto',
                zIndex: 10
              }}>
                {['NatCirc', 'Ohio'].filter(option => 
                  option.toLowerCase().includes(circuit.toLowerCase())
                ).map((option, index) => (
                  <div
                    key={option}
                    onClick={() => setCircuit(option)}
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      borderBottom: index < 1 ? '1px solid #333333' : 'none',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '0.9rem',
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: '1px solid #ffffff',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#000000';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#ffffff';
            }
          }}
        >
          {loading ? 'Adding...' : 'Add Judge'}
        </button>
      </form>
    </div>
  );
}

export default AddJudge; 