import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Code,
  Eye,
  Type,
  BookOpen,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Table,
  Code2,
  FileText,
  Palette
} from 'lucide-react';

interface WYSIWYGEditorProps {
  content: string;
  onChange: (content: string) => void;
  contentType: 'html' | 'markdown' | 'plain';
  placeholder?: string;
  disabled?: boolean;
  sectionType?: 'text' | 'image' | 'table' | 'code' | 'mixed';
}

const WYSIWYGEditor = ({
  content,
  onChange,
  contentType,
  placeholder = "Commencez à rédiger...",
  disabled = false,
  sectionType = 'text'
}: WYSIWYGEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const execCommand = (command: string, value?: string) => {
    if (disabled) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Fonction pour insérer du HTML à la position du curseur
  const insertHTML = (html: string) => {
    if (disabled) return;
    execCommand('insertHTML', html);
  };

  const handleHTMLChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = e.target as HTMLDivElement;
    onChange(target.innerHTML);
  };

  const handleContentChange = () => {
    if (disabled || !editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const markdownToHTML = (markdown: string): string => {
    let html = markdown;

    // Titres
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Gras et italique
    html = html.replace(/\*\*\*(.*)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/g, '<em>$1</em>');

    // Listes
    html = html.replace(/^\* (.+)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Liens
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Code inline
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Retours à la ligne
    //html = html.replace(/\n/g, '<br>');

    return html;
  };

  const getTemplate = () => {
    switch (sectionType) {
      case 'code':
        return contentType === 'html'
          ? '<pre><code class="language-javascript">// Votre code ici\nfunction exemple() {\n  console.log("Hello World");\n}</code></pre>'
          : contentType === 'markdown'
          ? '```javascript\n// Votre code ici\nfunction exemple() {\n  console.log("Hello World");\n}\n```'
          : '// Votre code ici\nfunction exemple() {\n  console.log("Hello World");\n}';

      case 'table':
        return contentType === 'html'
          ? '<table border="1"><thead><tr><th>Colonne 1</th><th>Colonne 2</th><th>Colonne 3</th></tr></thead><tbody><tr><td>Donnée 1</td><td>Donnée 2</td><td>Donnée 3</td></tr></tbody></table>'
          : contentType === 'markdown'
          ? '| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|----------|\n| Donnée 1  | Donnée 2  | Donnée 3  |'
          : 'Colonne 1\tColonne 2\tColonne 3\nDonnée 1\tDonnée 2\tDonnée 3';

      case 'image':
        return contentType === 'html'
          ? '<figure><img src="https://via.placeholder.com/400x300" alt="Description de l\'image"><figcaption>Légende de l\'image</figcaption></figure>'
          : contentType === 'markdown'
          ? '![Description de l\'image](https://via.placeholder.com/400x300)\n*Légende de l\'image*'
          : '[Image: Description]\nLégende: ...';

      default:
        return '';
    }
  };

  const getSectionStyles = () => {
    switch (sectionType) {
      case 'code':
        return 'font-mono bg-gray-900 text-gray-100 p-4 rounded-lg';
      case 'table':
        return 'overflow-x-auto';
      case 'image':
        return 'flex flex-col items-center';
      default:
        return '';
    }
  };

  const getSectionTypeIcon = () => {
    const iconClass = "w-3 h-3 mr-1";
    switch (sectionType) {
      case 'code':
        return (
          <Badge variant="secondary" className="text-xs">
            <Code2 className={iconClass} />
            Code
          </Badge>
        );
      case 'table':
        return (
          <Badge variant="secondary" className="text-xs">
            <Table className={iconClass} />
            Tableau
          </Badge>
        );
      case 'image':
        return (
          <Badge variant="secondary" className="text-xs">
            <ImageIcon className={iconClass} />
            Image
          </Badge>
        );
      case 'mixed':
        return (
          <Badge variant="secondary" className="text-xs">
            <Palette className={iconClass} />
            Mixte
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            <Type className={iconClass} />
            Texte
          </Badge>
        );
    }
  };

  if (contentType === 'html') {
    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Barre d'outils pour HTML */}
        {!disabled && (
          <div className="border-b p-2 bg-gray-50 flex items-center gap-1 flex-wrap">
            <div className="flex items-center gap-1 pr-2 border-r">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('bold')}
                className="h-8 w-8 p-0"
                title="Gras"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('italic')}
                className="h-8 w-8 p-0"
                title="Italique"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('underline')}
                className="h-8 w-8 p-0"
                title="Souligné"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 px-2 border-r">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('formatBlock', 'h1')}
                className="h-8 w-8 p-0"
                title="Titre 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('formatBlock', 'h2')}
                className="h-8 w-8 p-0"
                title="Titre 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('formatBlock', 'blockquote')}
                className="h-8 w-8 p-0"
                title="Citation"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 px-2 border-r">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('insertUnorderedList')}
                className="h-8 w-8 p-0"
                title="Liste à puces"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('insertOrderedList')}
                className="h-8 w-8 p-0"
                title="Liste numérotée"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 px-2 border-r">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const url = prompt('URL du lien:');
                  if (url) execCommand('createLink', url);
                }}
                className="h-8 w-8 p-0"
                title="Insérer un lien"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertHTML(getTemplate())}
                className="h-8 px-2"
                title="Insérer un template"
              >
                <FileText className="h-4 w-4 mr-1" />
                Template
              </Button>
            </div>

            <div className="flex items-center gap-1 px-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('undo')}
                className="h-8 w-8 p-0"
                title="Annuler"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand('redo')}
                className="h-8 w-8 p-0"
                title="Refaire"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline" className="text-xs">
                <Code className="w-3 h-3 mr-1" />
                HTML
              </Badge>
              {getSectionTypeIcon()}
            </div>
          </div>
        )}

        <div style={{ isolation: 'isolate', contain: 'style' }}>
          <div
            ref={editorRef}
            contentEditable={!disabled}
            dir="ltr"
            className={`min-h-[300px] p-4 ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'}`}
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={handleContentChange}
            onBlur={handleContentChange}
            onPaste={handleContentChange}
            suppressContentEditableWarning={true}
            style={{
              minHeight: '300px',
              direction: 'ltr !important' as any,
              textAlign: 'left !important' as any,
              unicodeBidi: 'normal !important' as any,
              writingMode: 'horizontal-tb !important' as any,
              transform: 'none !important' as any,
              textOrientation: 'mixed !important' as any,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              color: 'inherit'
            }}
          />
        </div>
      </div>
    );
  }

  if (contentType === 'markdown') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>Format Markdown</span>
            {getSectionTypeIcon()}
          </div>
          {!disabled && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Éditeur' : 'Aperçu'}
            </Button>
          )}
        </div>

        {showPreview ? (
          <div className="border rounded-lg p-4 prose max-w-none min-h-[300px] bg-gray-50">
            <div dangerouslySetInnerHTML={{ __html: markdownToHTML(content) }} />
          </div>
        ) : (
          <div className="relative">
            <textarea
              dir="ltr"
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder={disabled ? "" : `${placeholder}\n\n# Titre principal\n## Sous-titre\n- Liste à puces\n**Texte en gras**\n*Texte en italique*\n[Lien](url)\n\`code inline\`\n\n\`\`\`javascript\ncode block\n\`\`\``}
              className={`min-h-[300px] font-mono text-sm w-full p-4 border rounded-lg ${disabled ? 'bg-gray-50' : ''} ${getSectionStyles()}`}
              disabled={disabled}
              style={{ textAlign: 'left', direction: 'ltr' }}
            />
            {!disabled && sectionType !== 'text' && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onChange(getTemplate())}
                className="absolute top-2 right-2 gap-2"
              >
                <FileText className="h-4 w-4" />
                Template {sectionType}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Texte brut
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Type className="w-4 h-4" />
        <span>Texte brut</span>
        {getSectionTypeIcon()}
      </div>
      <div className="relative">
        <textarea
          dir="ltr"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={disabled ? "" : placeholder}
          className={`min-h-[300px] w-full p-4 border rounded-lg ${disabled ? 'bg-gray-50' : ''} ${getSectionStyles()}`}
          disabled={disabled}
          style={{ textAlign: 'left', direction: 'ltr' }}
        />
        {!disabled && sectionType !== 'text' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange(getTemplate())}
            className="absolute top-2 right-2 gap-2"
          >
            <FileText className="h-4 w-4" />
            Template {sectionType}
          </Button>
        )}
      </div>
    </div>
  );
};

export default WYSIWYGEditor;
