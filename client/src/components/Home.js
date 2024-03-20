import './Home.css';

const Home = () => {
    return (
      <div className="container">
        <div className="content">
          <h1 className="title">Code Snippet Management</h1>
          <div className="button-group">
            <button className="glassmorphic-button" onClick={() => { window.location.href = '/submit' }}>
              Submit Data
            </button>
            <button className="glassmorphic-button" onClick={() => { window.location.href = '/view' }}>
              View Data
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default Home;
  