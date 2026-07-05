import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface SafeHTMLProps {
  content: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

export const SafeHTML = ({ 
  content, 
  className,
  allowedTags = ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a', 'blockquote'],
  allowedAttributes = ['href', 'src', 'alt', 'title', 'target', 'rel']
}: SafeHTMLProps) => {
  const sanitizedHTML = useMemo(() => {
    if (!content) return '';
    
    const config = {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      ALLOW_DATA_ATTR: false,
      FORBID_SCRIPT_TYPE: true,
      SAFE_FOR_TEMPLATES: true,
      // Ensure all links open in new tab and have rel="noopener noreferrer"
      HOOKS: {
        afterSanitizeAttributes: function (node: Element) {
          if (node.tagName === 'A') {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');
          }
          if (node.tagName === 'IMG') {
            // Ensure images have proper loading attributes
            node.setAttribute('loading', 'lazy');
          }
        }
      }
    };
    
    return DOMPurify.sanitize(content, config);
  }, [content, allowedTags, allowedAttributes]);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};