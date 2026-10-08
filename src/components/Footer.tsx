import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="foot panel" role="contentinfo">
      <p className="foot__big" aria-hidden="true"><span>V</span>annam</p>
      <div className="foot__cols">
        <div className="foot__col foot__brand">
          <p className="hand">all things cute &amp; functional</p>
          <p>Handcrafted with love in Coimbatore.</p>
        </div>
        <div className="foot__col">
          <h3>Shop</h3>
          <ul>
            <li><Link to="/shop">All pouches</Link></li>
            <li><Link to="/shop/hair-tool-pouches">Hair tool pouches</Link></li>
            <li><Link to="/shop/makeup-pouches">Makeup pouches</Link></li>
            <li><Link to="/shop/napkin-small-pouches">Napkin pouches</Link></li>
          </ul>
        </div>
        <div className="foot__col">
          <h3>Brand</h3>
          <ul>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/story">Our story</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="foot__col">
          <h3>Say hi</h3>
          <ul>
            <li><a href="https://www.instagram.com/vannam.ig" target="_blank" rel="noopener noreferrer">@vannam.ig ↗</a></li>
          </ul>
        </div>
      </div>
      <p className="foot__legal">&copy; {new Date().getFullYear()} Vannam. All rights reserved.</p>
    </footer>
  );
}
