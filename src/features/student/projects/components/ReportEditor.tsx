import React, { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import axios from 'axios';

import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaHeading, FaListUl, FaListOl, FaQuoteRight, FaCode,
  FaLink, FaImage, FaMinus, FaHighlighter,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaParagraph
} from 'react-icons/fa';

interface ReportEditorProps {
  report: any | null;
  setReport: (data: any) => void;
}

const ReportEditor: React.FC<ReportEditorProps> = ({ report, setReport }) => {
  const [mode, setMode] = useState<'upload' | 'edit'>('edit');
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight,
      Link,
      Image,
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem,
    ],
    content: report?.content || '<p>Commencez votre rapport ici...</p>',
  });

  const groupId = '63eda8a5-6a99-4d5e-8a4b-5b8c1e832751'; // à rendre dynamique
  const projectId = '191eda93-a5d8-42af-af8c-d4f42a0f7d85'; // à rendre dynamique

  const handleSave = async () => {
    const content = editor?.getHTML();
    if (!content) return;

    try {
      if (report?.id) {
        await axios.put(`http://localhost:3000/api/reports/${report.id}`, { content });
      } else {
        const res = await axios.post(
          `http://localhost:3000/api/projects/${projectId}/groups/${groupId}/report`,
          { content }
        );
        setReport(res.data.data);
      }

      alert('Rapport sauvegardé avec succès !');
    } catch (err) {
      console.error('Erreur de sauvegarde du rapport :', err);
      alert('Erreur lors de la sauvegarde.');
    }
  };

  const handlePrint = () => {
    const content = editor?.getHTML();
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Export Rapport</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 2rem;
              color: #000;
            }
            h1, h2, h3 {
              font-weight: bold;
              margin-top: 1rem;
            }
            ul, ol {
              padding-left: 1.5rem;
            }
            blockquote {
              border-left: 4px solid #ccc;
              padding-left: 1rem;
              color: #555;
              font-style: italic;
              margin: 1rem 0;
            }
            code {
              background-color: #f5f5f5;
              padding: 0.2rem 0.4rem;
              border-radius: 4px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const toolbarButton = (
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    label: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`p-2 rounded text-lg ${
        active ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      {icon}
    </button>
  );

  const applyFontSize = (size: string) => {
    editor?.chain().focus().setMark('textStyle', { fontSize: size }).run();
  };

  const applyColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };

  return (
    <div className="mt-4 mb-16 w-full px-0">
      <h2 className="text-3xl font-bold text-black mb-6">&gt; Rapport</h2>

      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setMode('upload')}
          className={`px-4 py-2 rounded font-semibold transition ${
            mode === 'upload' ? 'bg-red-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'
          }`}
        >
          Envoyer un PDF
        </button>
        <button
          onClick={() => setMode('edit')}
          className={`px-4 py-2 rounded font-semibold transition ${
            mode === 'edit' ? 'bg-red-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'
          }`}
        >
          Écrire sur l'application
        </button>
      </div>

      {mode === 'upload' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-800 font-medium mb-2">Déposez votre rapport au format PDF :</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file?.type === 'application/pdf') {
                setFileName(file.name);
              } else {
                setFileName(null);
                alert('Seuls les fichiers PDF sont autorisés.');
              }
            }}
            className="block w-full text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500
              file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
              file:text-white file:bg-gradient-to-r file:from-red-600 file:to-pink-600
              hover:file:brightness-110 transition"
          />
          {fileName && (
            <p className="mt-2 text-green-700 font-semibold text-sm">
              Fichier sélectionné : {fileName}
            </p>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {editor && (
            <>
              <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
                {toolbarButton(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <FaBold />, 'Gras')}
                {toolbarButton(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <FaItalic />, 'Italique')}
                {toolbarButton(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <FaUnderline />, 'Souligné')}
                {toolbarButton(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), <FaStrikethrough />, 'Barré')}
                {toolbarButton(editor.isActive('paragraph'), () => editor.chain().focus().setParagraph().run(), <FaParagraph />, 'Paragraphe')}
                {toolbarButton(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <FaHeading />, 'Titre H1')}
                {toolbarButton(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <FaHeading className="text-sm" />, 'Titre H2')}
                {toolbarButton(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <FaListUl />, 'Liste à puces')}
                {toolbarButton(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <FaListOl />, 'Liste ordonnée')}
                {toolbarButton(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), <FaQuoteRight />, 'Citation')}
                {toolbarButton(editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run(), <FaCode />, 'Code')}
                {toolbarButton(editor.isActive('highlight'), () => editor.chain().focus().toggleHighlight().run(), <FaHighlighter />, 'Surlignage')}
                {toolbarButton(false, () => {
                  const url = prompt("URL de l'image :");
                  if (url) editor.chain().focus().setImage({ src: url }).run();
                }, <FaImage />, 'Image')}
                {toolbarButton(false, () => editor.chain().focus().setHorizontalRule().run(), <FaMinus />, 'Ligne')}
                {toolbarButton(false, () => {
                  const url = prompt('URL du lien :');
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                }, <FaLink />, 'Lien')}
                {toolbarButton(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), <FaAlignLeft />, 'Gauche')}
                {toolbarButton(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), <FaAlignCenter />, 'Centre')}
                {toolbarButton(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), <FaAlignRight />, 'Droite')}
              </div>

              <div className="flex gap-4 mb-4">
                <select
                  onChange={(e) => applyFontSize(e.target.value + 'px')}
                  className="p-2 rounded border text-black"
                >
                  <option value="">Taille</option>
                  <option value="12">12</option>
                  <option value="14">14</option>
                  <option value="16">16</option>
                  <option value="20">20</option>
                  <option value="24">24</option>
                  <option value="32">32</option>
                </select>

                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    applyColor(e.target.value);
                  }}
                  className="w-10 h-10 rounded border cursor-pointer"
                  title="Choisir une couleur"
                />
              </div>
            </>
          )}

          <div id="report-content" className="border border-gray-300 rounded-md p-4 bg-white text-black min-h-[200px]">
            <EditorContent editor={editor} />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => editor?.commands.clearContent()}
              className="bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Annuler
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Sauvegarder
              </button>
              <button
                onClick={handlePrint}
                className="bg-gray-800 text-white font-semibold px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Exporter en PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportEditor;