import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ImagesPage from "./pages/ImagesPage";
import VideosPage from "./pages/VideosPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import PromptDetails from "./pages/PromptDetails";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DataDeletion from "./pages/DataDeletion";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<ImagesPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/prompt/:slug" element={<PromptDetails />} />

        {/* Privacy Policy */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
