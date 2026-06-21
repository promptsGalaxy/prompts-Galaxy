import { Link } from "react-router-dom";
import "../styles/Logo.css";

const Title = () => {
  return (
    <Link to="/" className="logo">
      <div className="logo-text">
        <h1>MVR</h1>
        <p>PROMPTS</p>
      </div>
    </Link>
  );
};

export default Title;
