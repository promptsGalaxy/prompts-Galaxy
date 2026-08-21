import { useState } from "react";
import { NavLink } from "react-router-dom";
import { House, Images, Clapperboard, Search } from "lucide-react";

import SearchOverlay from "./SearchOverlay";
import "../styles/Navbar.css";

function Navbar() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <nav className="navbar">
        <ul className="nav-links">
          <li>
            <button className="search-btn" onClick={() => setShowSearch(true)}>
              <Search size={22} />
              <span>Search</span>
            </button>
          </li>

          <li>
            <NavLink to="/">
              <Images size={22} />
              <span>Images</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/categories">
              <House size={22} />
              <span>Categories</span>
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

      {showSearch && <SearchOverlay close={() => setShowSearch(false)} />}
    </>
  );
}

export default Navbar;
