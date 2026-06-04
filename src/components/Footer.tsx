import { Link } from "react-router-dom";
import { Code } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border py-6 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms & Privacy
          </Link>
          <span>•</span>
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span>Liberty Place © 2026</span>
          <a
            href="https://github.com/rafat-souza/liberty-place"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors ml-2"
            title="Open Source Repository"
          >
            <Code className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
