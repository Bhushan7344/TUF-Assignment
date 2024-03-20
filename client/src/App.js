import './App.css';
import Forms from './components/Form';
import Home from './components/Home';
import CodeSnippetList from './components/Snippets';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/submit" element={<Forms />} />
        <Route path="/view" element={<CodeSnippetList />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
