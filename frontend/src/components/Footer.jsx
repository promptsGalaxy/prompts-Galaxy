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
            <a
              href="https://www.instagram.com/mvr_prompts?igsh=anBham9nc2h0Nmw3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              href="https://t.me/veerendra90"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <FaTelegram />
            </a>

            <a
              href="https://x.com/MVR_Prompts"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
            >
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
