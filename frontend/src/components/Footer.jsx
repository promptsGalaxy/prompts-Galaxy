import { FaInstagram, FaTwitter, FaTelegram } from "react-icons/fa";

import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>
            MVR <span>PROMPTS</span>
          </h2>

          <p>
            Discover high-quality AI image editing prompts for Men, Women,
            Couples, Kids and more. Copy, create and inspire.
          </p>

          <div className="socials">
            <a href="#">
              <FaInstagram />
            </a>
            <a href="#">
              <FaTelegram />
            </a>
            <a href="#">
              <FaTwitter />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>

          <a href="/">Home</a>
          <a href="/images">Images</a>
          <a href="/videos">Videos</a>
          <a href="/search">Search</a>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} MVR PROMPTS • All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
