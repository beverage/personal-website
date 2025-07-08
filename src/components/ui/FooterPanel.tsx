import { Github, Linkedin, Mail } from 'lucide-react';

interface SocialLink {
  icon: 'github' | 'linkedin' | 'mail';
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
  mail: Mail,
};

export const FooterPanel = ({
  year = new Date().getFullYear(),
  socialLinks = [
    { icon: 'github', href: '#', label: 'GitHub' },
    { icon: 'linkedin', href: '#', label: 'LinkedIn' },
    { icon: 'mail', href: '#', label: 'Email' },
  ],
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