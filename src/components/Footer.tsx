import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="font-display text-xl font-bold text-primary-foreground">V</span>
              </div>
              <span className="font-display text-xl font-semibold text-foreground">
                VaisselleSeconde
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              La marketplace de vaisselle d'occasion. Achetez et vendez à petits prix, 
              réduisez le gaspillage.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold text-foreground">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/catalogue" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link to="/comment-ca-marche" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/vendre" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Vendre ma vaisselle
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold text-foreground">Informations légales</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/conditions-generales" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold text-foreground">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@vaisselleseconde.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} VaisselleSeconde. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
