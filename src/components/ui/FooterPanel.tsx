import { Github, Linkedin, Instagram, Mail } from 'lucide-react';

interface SocialLink {
  icon: 'github' | 'linkedin' | 'instagram' | 'mail';
  href: string;
  label?: string;
}

interface FooterPanelProps {
  year?: number;
  socialLinks?: SocialLink[];
  className?: string;
}

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  mail: Mail,
};

export const FooterPanel = ({
  year = new Date().getFullYear(),
  socialLinks = [], // Default to empty array, will be populated by server
  className = ""
}: FooterPanelProps) => {
  return (
    <div className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 ${className}`}>
      <div className="flex items-center space-x-6">
        <div className="text-white/60 text-sm">© {year}</div>
        <div className="flex space-x-4">
          {socialLinks.map((link, index) => {
            const Icon = iconMap[link.icon];
            return (
              <a 
                key={index}
                href={link.href} 
                className="text-white/60 hover:text-white transition-colors"
                aria-label={link.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon size={18} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 