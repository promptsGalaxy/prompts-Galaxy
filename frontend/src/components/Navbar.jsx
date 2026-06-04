import { useState } from "react";
import { NavLink } from "react-router-dom";
import { House, Images, Clapperboard, Search } from "lucide-react";

import SearchOverlay from "./SearchOverlay";
import MediaModal from "./MediaModal";
import "../styles/Navbar.css";

function Navbar() {
  const [showSearch, setShowSearch] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState(null);

  return (
    <>
      <nav className="navbar">
        <ul className="nav-links">
          <li>
            <NavLink to="/" end>
              <House size={22} />
              <span>Home</span>
            </NavLink>
          </li>

          <li>
            <button className="search-btn" onClick={() => setShowSearch(true)}>
              <Search size={22} />
              <span>Search</span>
            </button>
          </li>

          <li>
            <NavLink to="/images">
              <Images size={22} />
              <span>Images</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/videos">
              <Clapperboard size={22} />
              <span>Videos</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {showSearch && (
        <SearchOverlay
          close={() => setShowSearch(false)}
          openMedia={setSelectedMedia}
        />
      )}

      {selectedMedia && (
        <MediaModal
          item={selectedMedia}
          closeModal={() => setSelectedMedia(null)}
        />
      )}
    </>
  );
}

export default Navbar;
