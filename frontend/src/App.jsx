import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ImagesPage from "./pages/ImagesPage";
import VideosPage from "./pages/VideosPage";
import "./App.css";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import PromptDetails from "./pages/PromptDetails";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/images" element={<ImagesPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/prompt/:slug" element={<PromptDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
