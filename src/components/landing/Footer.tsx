import { Link } from "react-router-dom";
import { FileText, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-xl font-bold">BivaroX</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-6">
              Contracts in control. Leads in motion.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Prijzen</a></li>
              <li><a href="#suppliers" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Voor Leveranciers</a></li>
              <li><Link to="/dashboard" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Bedrijf */}
          <div>
            <h4 className="font-semibold mb-4">Bedrijf</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Over Ons</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Contact</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Vacatures</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Juridisch</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Algemene Voorwaarden</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">GDPR</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2025 BivaroX. Alle rechten voorbehouden.
          </p>
          <p className="text-primary-foreground/60 text-sm">
            Made with ❤️ in België
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
