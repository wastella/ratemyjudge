import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, getDocs, doc, updateDoc } from 'firebase/firestore';

function JudgePage() {
  const [reviews, setReviews] = useState([]);
  const [judge, setJudge] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [judgeNotFound, setJudgeNotFound] = useState(false);
  const [newCircuit, setNewCircuit] = useState('');
  const [showAddCircuit, setShowAddCircuit] = useState(false);

  const { judgeSlug } = useParams();
  
  // Convert slug back to readable name (capitalize first letter of each word)
  const judgeName = judgeSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useEffect(() => {
    const fetchJudgeAndReviews = async () => {
      try {
        // First, check if the judge exists in the judges collection
        const judgesRef = collection(db, "judges");
        const judgeQuery = query(judgesRef, where("slug", "==", judgeSlug));
        const judgeSnapshot = await getDocs(judgeQuery);
        
        if (judgeSnapshot.empty) {
          setJudgeNotFound(true);
          setLoading(false);
          return;
        }

        // Get judge data
        const judgeDoc = judgeSnapshot.docs[0];
        const judgeData = {
          id: judgeDoc.id,
          ...judgeDoc.data()
        };
        setJudge(judgeData);

        // Then fetch reviews for this judge
        const reviewsQuery = query(collection(db, "reviews"), where("judgeId", "==", judgeSlug));
        const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setReviews(data);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching judge data:", error);
        setJudgeNotFound(true);
        setLoading(false);
      }
    };

    fetchJudgeAndReviews();
  }, [judgeSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || rating === 0) return;

    await addDoc(collection(db, "reviews"), {
      judgeId: judgeSlug,
      comment,
      rating: Number(rating),
    });

    setComment('');
    setRating(0);
  };

  const addCircuit = async () => {
    if (!newCircuit.trim()) return;
    
    // Check if the circuit is valid (case-insensitive)
    const validCircuits = ['NatCirc', 'Ohio'];
    const isValidCircuit = validCircuits.some(circuit => 
      circuit.toLowerCase() === newCircuit.trim().toLowerCase()
    );
    
    if (!isValidCircuit) {
      alert('Please enter a valid circuit');
      return;
    }
    
    // Get the correct case version
    const correctCircuit = validCircuits.find(circuit => 
      circuit.toLowerCase() === newCircuit.trim().toLowerCase()
    );
    
    try {
      const judgeRef = doc(db, "judges", judge.id);
      const updatedCircuits = [...(judge.circuits || []), correctCircuit];
      await updateDoc(judgeRef, { circuits: updatedCircuits });
      
      // Update local state
      setJudge({
        ...judge,
        circuits: updatedCircuits
      });
      
      setNewCircuit('');
      setShowAddCircuit(false);
    } catch (error) {
      console.error("Error adding circuit:", error);
    }
  };

  const removeCircuit = async (circuitToRemove) => {
    try {
      const judgeRef = doc(db, "judges", judge.id);
      const updatedCircuits = judge.circuits.filter(c => c !== circuitToRemove);
      await updateDoc(judgeRef, { circuits: updatedCircuits });
      
      // Update local state
      setJudge({
        ...judge,
        circuits: updatedCircuits
      });
    } catch (error) {
      console.error("Error removing circuit:", error);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: '#cccccc' }}>Loading...</p>
      </div>
    );
  }

  if (judgeNotFound) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '1rem',
          color: '#ffffff',
          fontWeight: '300'
        }}>
          Judge Not Found
        </h1>
        <p style={{ color: '#cccccc', marginBottom: '2rem' }}>
          The judge "{judgeName}" doesn't exist yet.
        </p>
        <a 
          href="/add-judge" 
          style={{
            color: '#ffffff',
            textDecoration: 'none',
            border: '1px solid #ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            display: 'inline-block'
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
          Add This Judge
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: '0.5rem',
        color: '#ffffff',
        fontWeight: '300'
      }}>
        {judge?.name || judgeName}
      </h1>
      
      {judge?.circuits && judge.circuits.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {judge.circuits.map((circuit, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#333333',
                  color: '#ffffff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {circuit}
                <button
                  onClick={() => removeCircuit(circuit)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cccccc',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    padding: '0',
                    marginLeft: '0.25rem'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => setShowAddCircuit(true)}
              style={{
                background: 'none',
                border: '1px dashed #666666',
                color: '#666666',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              + Add Circuit
            </button>
          </div>
        </div>
      )}
      
      {!judge?.circuits || judge.circuits.length === 0 ? (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowAddCircuit(true)}
            style={{
              background: 'none',
              border: '1px dashed #666666',
              color: '#666666',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            + Add Circuit Tag
          </button>
        </div>
      ) : null}
      
      {showAddCircuit && (
        <div style={{ 
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ 
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Enter the Circuit"
              value={newCircuit}
              onChange={(e) => setNewCircuit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCircuit()}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.8rem',
                border: '1px solid #333333',
                borderRadius: '20px',
                backgroundColor: '#000000',
                color: '#ffffff',
                outline: 'none',
                width: '150px'
              }}
            />
            <button
              onClick={addCircuit}
              disabled={!newCircuit}
              style={{
                background: 'none',
                border: '1px solid #ffffff',
                color: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                cursor: newCircuit ? 'pointer' : 'not-allowed',
                opacity: newCircuit ? 1 : 0.5
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddCircuit(false);
                setNewCircuit('');
              }}
              style={{
                background: 'none',
                border: '1px solid #666666',
                color: '#666666',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
          
          {newCircuit && (
            <div style={{
              backgroundColor: '#000000',
              border: '1px solid #333333',
              borderRadius: '4px',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {['NatCirc', 'Ohio'].filter(option => 
                option.toLowerCase().includes(newCircuit.toLowerCase())
              ).map((option, index) => (
                <div
                  key={option}
                  onClick={() => setNewCircuit(option)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    borderBottom: index < 1 ? '1px solid #333333' : 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem'
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
      )}
      
      <p style={{ 
        color: '#cccccc', 
        marginBottom: '2rem',
        fontSize: '1rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>★</span> {averageRating}/5 ({reviews.length} reviews)
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: '#ffffff',
            fontSize: '1.1rem'
          }}>
            Rating:
          </label>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  padding: '0.25rem',
                  filter: (hoverRating >= star || rating >= star) ? 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' : 'none'
                }}
              >
                {(hoverRating >= star || rating >= star) ? '★' : '☆'}
              </button>
            ))}
            <span style={{
              color: '#ffffff',
              marginLeft: '0.5rem',
              fontSize: '0.9rem'
            }}>
              {hoverRating > 0 ? `${hoverRating} ${hoverRating === 1 ? 'star' : 'stars'}` : 
               rating === 0 ? 'No rating' : `${rating} ${rating === 1 ? 'star' : 'stars'}`}
            </span>
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: '#ffffff',
            fontSize: '1.1rem'
          }}>
            Comment:
          </label>
          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.9rem',
              border: '1px solid #333333',
              borderRadius: '4px',
              resize: 'vertical',
              backgroundColor: '#000000',
              color: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '0.9rem',
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
          Submit Review
        </button>
      </form>

      <h2 style={{ 
        marginBottom: '1rem', 
        color: '#ffffff',
        fontSize: '1.25rem',
        fontWeight: '400'
      }}>
        Reviews
      </h2>
      {reviews.length === 0 ? (
        <p style={{ color: '#cccccc', textAlign: 'center' }}>
          No reviews yet for {judge?.name || judgeName}
        </p>
      ) : (
        <div>
          {reviews.map((review) => (
            <div 
              key={review.id} 
              style={{ 
                borderBottom: '1px solid #333333', 
                padding: '1rem 0',
                marginBottom: '1rem'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#ffffff', fontSize: '1.2rem' }}>
                  {'★'.repeat(review.rating)}
                </span>
              </div>
              <p style={{ 
                margin: 0, 
                lineHeight: '1.5',
                color: '#ffffff',
                fontSize: '0.9rem'
              }}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JudgePage; 